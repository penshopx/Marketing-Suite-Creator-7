import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import bcrypt from "bcryptjs";
import { db } from "../../db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", async (req: any, res) => {
    if (req.session?.simpleUser) {
      try {
        const freshUser = await authStorage.getUser(req.session.simpleUser.id);
        if (freshUser) {
          const sessionUser = {
            id: freshUser.id,
            email: freshUser.email,
            firstName: freshUser.firstName,
            lastName: freshUser.lastName,
            profileImageUrl: freshUser.profileImageUrl,
            plan: freshUser.plan || "free",
            createdAt: freshUser.createdAt,
            updatedAt: freshUser.updatedAt,
          };
          req.session.simpleUser = sessionUser;
          req.user = sessionUser;
          return res.json(sessionUser);
        }
      } catch (e) {
        // fallback to session data
      }
      req.user = req.session.simpleUser;
      return res.json(req.session.simpleUser);
    }
    
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user?.expires_at) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, name, password } = req.body;
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email diperlukan" });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Format email tidak valid" });
      }
      
      if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ error: "Password minimal 6 karakter" });
      }
      
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Nama diperlukan" });
      }

      const existingUser = await authStorage.getUserByEmail(email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({ error: "Email sudah terdaftar. Silakan login." });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const nameParts = name.trim().split(" ");
      const userId = email.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) + Date.now().toString().slice(-5);
      
      const user = await authStorage.upsertUser({
        id: userId,
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: nameParts[0] || name.trim(),
        lastName: nameParts.slice(1).join(" ") || "",
      });
      
      const sessionUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        plan: user.plan || "free",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      req.session.simpleUser = sessionUser;
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Gagal menyimpan sesi" });
        }
        res.json(sessionUser);
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Registrasi gagal" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email diperlukan" });
      }
      
      if (!password || typeof password !== "string") {
        return res.status(400).json({ error: "Password diperlukan" });
      }
      
      const user = await authStorage.getUserByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: "Email atau password salah" });
      }
      
      if (!user.password) {
        return res.status(401).json({ error: "Akun ini belum memiliki password. Silakan hubungi admin." });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Email atau password salah" });
      }
      
      const sessionUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        plan: user.plan || "free",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      req.session.simpleUser = sessionUser;
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Gagal menyimpan sesi" });
        }
        res.json(sessionUser);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login gagal" });
    }
  });

  // ── Forgot / Reset Password (no-email, token shown on screen) ──────────────
  // In-memory store: email → { tokenHash, expiry }. Cleared on restart (tokens live 15 min).
  const resetTokens = new Map<string, { tokenHash: string; expiry: Date }>();

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body as { email?: string };
      if (!email) return res.status(400).json({ error: "Email diperlukan" });
      const user = await authStorage.getUserByEmail(email.toLowerCase().trim());
      if (!user) {
        // Return the same response to avoid email enumeration
        return res.json({ success: true });
      }
      const token = require("crypto").randomBytes(3).toString("hex").toUpperCase(); // 6-char e.g. "A3F9C2"
      const tokenHash = await bcrypt.hash(token, 8);
      resetTokens.set(email.toLowerCase().trim(), {
        tokenHash,
        expiry: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      });
      // Return token directly (no email service — displayed on screen)
      res.json({ success: true, token });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Terjadi kesalahan" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, token, newPassword } = req.body as {
        email?: string; token?: string; newPassword?: string;
      };
      if (!email || !token || !newPassword) {
        return res.status(400).json({ error: "Data tidak lengkap" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password minimal 6 karakter" });
      }
      const key = email.toLowerCase().trim();
      const stored = resetTokens.get(key);
      if (!stored) {
        return res.status(400).json({ error: "Kode reset tidak ditemukan atau sudah kadaluwarsa" });
      }
      if (new Date() > stored.expiry) {
        resetTokens.delete(key);
        return res.status(400).json({ error: "Kode reset sudah kadaluwarsa. Minta kode baru." });
      }
      const isValid = await bcrypt.compare(token.toUpperCase(), stored.tokenHash);
      if (!isValid) {
        return res.status(400).json({ error: "Kode reset salah" });
      }
      const user = await authStorage.getUserByEmail(key);
      if (!user) return res.status(404).json({ error: "Akun tidak ditemukan" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.update(users).set({ password: hashedPassword } as any).where(eq(users.id, user.id));
      resetTokens.delete(key);
      res.json({ success: true });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Terjadi kesalahan" });
    }
  });

  app.post("/api/auth/upgrade-plan", async (req: any, res) => {
    try {
      const sessionUser = req.session?.simpleUser;
      if (!sessionUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { plan } = req.body;
      if (!["free", "pro", "enterprise"].includes(plan)) {
        return res.status(400).json({ error: "Paket tidak valid" });
      }

      const updatedUser = await authStorage.upsertUser({
        id: sessionUser.id,
        email: sessionUser.email,
        firstName: sessionUser.firstName,
        lastName: sessionUser.lastName,
        profileImageUrl: sessionUser.profileImageUrl,
        plan,
      });

      const updatedSession = {
        ...sessionUser,
        plan: updatedUser.plan || "free",
        updatedAt: updatedUser.updatedAt,
      };

      req.session.simpleUser = updatedSession;
      req.session.save((err: any) => {
        if (err) {
          return res.status(500).json({ error: "Gagal menyimpan sesi" });
        }
        res.json({ success: true, plan: updatedUser.plan });
      });
    } catch (error) {
      console.error("Upgrade plan error:", error);
      res.status(500).json({ error: "Gagal upgrade paket" });
    }
  });

  app.post("/api/auth/simple-logout", (req: any, res) => {
    req.session.simpleUser = null;
    req.session.save(() => {
      res.json({ success: true });
    });
  });
}
