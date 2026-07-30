---
name: Business Profile Context Injection
description: Middleware sets (req as any).bpCtx on every request; schema fields and middleware must stay in sync — they diverged once already.
---

**Per-request middleware** (app.use near top of registerRoutes) + **getBusinessProfileContext()** standalone function both build the same block. Keep them in sync.

**Fields injected (in order):** businessName, businessType, industry, productsServices, targetAudience, valueProposition, tone, monthlyBudget, goals, competitors, additionalContext.

Each field is only added when non-empty (falsy guard). Entire block is skipped if lines.length === 0 — so no empty context is injected.

**Bug history:** original code read productCategory, usp, mainPlatforms — none of which exist in the schema. Those were always undefined/falsy so bpCtx was effectively just businessName + targetAudience + monthlyBudget. Fixed to use the actual schema columns.

**Why:** Task #8 merged a schema with different column names than the middleware assumed. Any future schema column rename must also update both bpCtx locations.
