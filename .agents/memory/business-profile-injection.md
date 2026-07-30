---
name: Business Profile Context Injection
description: How bpCtx is built and injected; actual DB schema; common mistake history; isDefault workaround.
---

# Business Profile Context Injection

## Rule
The `businessProfiles` table in the actual database has DIFFERENT columns than what a naive read of `shared/schema.ts` might suggest. Always verify against the DB before editing bpCtx reads.

**Actual DB columns (verified 2026-07-30):**
- `business_name`, `business_type`, `industry`, `products_services`
- `target_audience`, `value_proposition`, `tone`, `location`
- `monthly_budget`, `goals`, `competitors`, `additional_context`
- `created_at`, `updated_at`

**NOT in DB:** `profile_name`, `product_category`, `usp`, `main_platforms`, `is_default`

The shared/schema.ts was updated to match the actual DB columns. Both now use: `businessName`, `businessType`, `industry`, `productsServices`, `targetAudience`, `valueProposition`, `tone`, `location`, `monthlyBudget`, `goals`, `competitors`, `additionalContext`.

## isDefault workaround
The DB has no `is_default` column. "Active profile" = most-recently-updated row (ORDER BY updated_at DESC LIMIT 1). Both GET /api/business-profile and GET /api/business-profiles add a virtual `isDefault` field server-side. The "Aktifkan" button (set-default endpoint) just touches `updatedAt` to make the profile sort first.

## bpCtx injection
Two places in `server/routes.ts` build the context string:
1. `getBusinessProfileContext()` function (~line 44) — used by some AI tool routes
2. Middleware (~line 108) — runs on every request, attaches `(req as any).bpCtx`

Both query: `WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`

Context string format:
```
[KONTEKS BISNIS PENGGUNA]
Nama Bisnis/Produk: X
Tipe Bisnis: X
Industri: X
...
[/KONTEKS]
Gunakan informasi bisnis di atas untuk mempersonalisasi...
```

## Why
The schema mismatch (old simplified schema vs actual DB) caused ALL business profile reads/writes to silently fail with SQL column-not-found errors for months. The catch blocks returned null/[] so users saw empty profiles but no error messages. Fixed 2026-07-30 by aligning schema.ts with the actual DB columns.

## How to apply
- Before any edit touching business profile fields: check `shared/schema.ts` businessProfiles definition AND run a quick SQL query to confirm columns exist
- Never add new bpCtx fields without verifying the column exists in the actual DB (not just schema.ts)
- The `workroom_projects` table has NO `userId` column — do not filter by userId there until the migration is done (follow-up task proposed)
