import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import bcrypt from "bcryptjs";

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", async (req: any, res) => {
    if (req.session?.simpleUser) {
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
  
  app.post("/api/auth/simple-logout", (req: any, res) => {
    req.session.simpleUser = null;
    req.session.save(() => {
      res.json({ success: true });
    });
  });
}
