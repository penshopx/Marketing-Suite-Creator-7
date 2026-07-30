---
name: Business Profile Context Injection
description: Middleware sets (req as any).bpCtx on every request using the ACTUAL schema columns — do not change field names without checking shared/schema.ts first.
---

**Per-request middleware** (app.use near top of registerRoutes) + **getBusinessProfileContext()** standalone function both build the same block. Keep them in sync.

**Actual schema columns in business_profiles table (shared/schema.ts):**
businessName, productCategory, usp, targetAudience, monthlyBudget, mainPlatforms (jsonb array), isDefault.

**Fields injected into bpCtx (in order):**
- businessName → "Nama Bisnis/Produk"
- productCategory → "Kategori"
- usp → "USP/Keunggulan"
- targetAudience → "Target Audience"
- monthlyBudget → "Budget Bulanan"
- mainPlatforms → "Platform Utama" (joined array)

Each field is only added when non-empty (falsy guard). Entire block is skipped if lines.length === 0.

**Critical mistake to avoid:** An earlier session incorrectly "fixed" these to read businessType, valueProposition, industry, productsServices, tone, goals, competitors, additionalContext — none of which exist in the schema. This made bpCtx always empty. Always check shared/schema.ts before changing field reads here.

**Why:** Task #8 merged a schema with simple columns. Any future schema column additions must be reflected in BOTH bpCtx locations and the GET /api/business-profile + POST/PUT /api/business-profiles endpoints simultaneously.
