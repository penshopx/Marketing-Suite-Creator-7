---
name: SSE Streaming Utility
description: Shared fetch+SSE streaming helper used by all AI tool pages; location and usage contract.
---

# SSE Streaming Utility

All AI tool pages stream responses via `client/src/lib/stream-sse.ts` → `streamSSE(url, body, onChunk)`.

The function owns all fetch/decode/buffer/parse mechanics. Callers only supply the endpoint, request body, and an `onChunk` callback that receives each parsed SSE payload object.

**Why:** The original per-page inline loops were identical but had already drifted (guide-chatbot used a local accumulator; others used functional state). A regression in the buffer logic would have been fixed in one place and missed in four others.

**How to apply:** Any new page that streams SSE from a POST endpoint should import and use `streamSSE` rather than writing a new inline loop. The function throws on non-OK responses, so callers wrap it in try/catch and set `isLoading(false)` in a `finally` block.

Pages currently using it: ai-articles, ai-chat, ai-expert, guide-chatbot, story-telling.
