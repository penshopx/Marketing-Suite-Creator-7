import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user - supports both Replit Auth and simple email login
  app.get("/api/auth/user", async (req: any, res) => {
    // Check for simple session-based login first
    if (req.session?.simpleUser) {
      req.user = req.session.simpleUser;
      return res.json(req.session.simpleUser);
    }
    
    // Check for Replit Auth
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
  
  // Simple email login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      const displayName = name || email.split("@")[0];
      const nameParts = displayName.split(" ");
      const userId = email.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) + Date.now().toString().slice(-5);
      
      const user = {
        id: userId,
        email: email.toLowerCase(),
        firstName: nameParts[0] || displayName,
        lastName: nameParts.slice(1).join(" ") || "",
        profileImageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Store in session
      req.session.simpleUser = user;
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        res.json(user);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  // Simple logout
  app.post("/api/auth/simple-logout", (req: any, res) => {
    req.session.simpleUser = null;
    req.session.save(() => {
      res.json({ success: true });
    });
  });
}
