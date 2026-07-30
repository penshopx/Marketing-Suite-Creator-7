---
name: Simple Auth Session Cookie
description: Why session cookies are missing in smoke tests and how to fix it; also covers the req.user sync middleware for dev mode.
---

# Simple Auth Session Cookie Behavior

## The Rule
The session cookie is set with `secure: true` in production and `secure: false` in development (`NODE_ENV !== "production"`). This is required so that HTTP smoke tests (localhost:5000, no TLS) receive the session cookie.

**Why:** `secure: true` tells the browser (and Express's session middleware) to only send the Set-Cookie header over HTTPS. In the Replit preview, requests pass through Replit's HTTPS proxy, so prod works. But smoke tests connect directly to localhost:5000 over HTTP — no cookie is sent at all, causing all auth-required endpoints to return 401.

**How to apply:** The fix lives in `server/replit_integrations/auth/replitAuth.ts` inside `getSession()`:
```typescript
cookie: {
  secure: process.env.NODE_ENV === "production",
  ...
}
```

## req.user Sync Middleware
Simple auth stores the logged-in user in `req.session.simpleUser` (not in `req.session.passport.user`). Passport's `passport.session()` only deserializes from `req.session.passport.user`, so `req.user` is always undefined for simple auth requests.

A sync middleware was added at the top of `registerRoutes` (server/routes.ts) that copies `session.simpleUser → req.user` when `req.user` is not yet set:
```typescript
app.use((req, _res, next) => {
  if (!req.user && req.session?.simpleUser) {
    req.user = req.session.simpleUser;
  }
  next();
});
```

All userId extractions in business-profile routes use the fallback pattern:
```typescript
const userId = (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
```
- Replit OIDC auth: `claims.sub` is used
- Simple auth (dev): `user.id` (from simpleUser) is used
