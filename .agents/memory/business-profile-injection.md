---
name: Business Profile Context Injection
description: How the business profile is stored and injected into all AI system prompts
---

# Business Profile Context Injection

## The rule
Every AI route in server/routes.ts appends `(req as any).bpCtx || ""` to its system message content. Routes that had no system message get a new system message inserted conditionally using the spread pattern.

**Why:** Users save a business profile once; AI reads it on every call without needing to re-describe their product each session.

## How to apply
- `app.use(...)` middleware near the top of `registerRoutes` fetches the default profile for the logged-in user and sets `(req as any).bpCtx` as a formatted context block.
- Streaming routes: append bpCtx to the existing system `content` string.
- User-only routes (no system message): add `...((req as any).bpCtx ? [{ role: "system" as const, content: \`...\${(req as any).bpCtx}\` }] : [])` spread before the user message.
- The `getBusinessProfileContext(req)` helper function at the top of routes.ts is also available for one-off use (e.g., workroom, ai-autofill).

## DB
- Table: `business_profiles` in `shared/schema.ts`
- API: GET/POST `/api/business-profiles`, PUT/DELETE `/api/business-profiles/:id`, POST `/api/business-profiles/:id/set-default`, GET `/api/business-profile` (active)
- Client: `client/src/hooks/use-business-profile.ts`, page at `client/src/pages/business-profile.tsx`
- Sidebar: added "Profil Bisnis" to mainItems in app-sidebar.tsx
- Router: `/business-profile` route added to App.tsx

## Key quirk
If `isDefault` is being set to true, the route must first unset all other defaults for the same userId before inserting/updating.
