---
name: Workroom Prefill Pattern
description: sessionStorage-based pre-fill from Workroom deliverables into individual tool pages.
---

**Key:** `sessionStorage["workroom_prefill"]`
**Shape:** `{ deliverableType: string, content: string, projectName: string, title: string }`

Written in `workroom.tsx` `handleUseInTool` when user clicks "Gunakan di [Tool]".
Read + immediately removed on mount useEffect in the target tool page.
A purple banner `workroomBanner` state shows "Pre-filled dari Workroom: [projectName] — [title]".

**Covered tool pages (12 total):**
- audience-builder (audience_persona) — fills productDescription, interests, ageRange
- interest-finder (interest_list) — fills interests
- ad-creator (ad_copy) — fills productName, productDescription
- hook-generator (hook) — fills topic, keyMessage
- video-script (video_script) — fills topik, produk
- wa-broadcast (wa_broadcast) — fills produk, usp
- cs-bot-script (cs_bot_script) — fills produk, deskripsiProduk
- campaign-launcher (budget_allocation / campaign_brief) — fills productName, productBenefit
- campaign-analyzer (kpi_framework) — fills adCopy
- campaign-report (tracking_setup) — fills namaBisnis
- cs-closing (cs_closing) — fills productName, productBenefit
- customer-journey (customer_journey) — fills produk, kompetitor

**Why sessionStorage (not URL params):** avoids exposing long content in the URL bar; cleared immediately on read so no stale state across navigations.
