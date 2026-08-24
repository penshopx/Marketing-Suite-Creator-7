---
name: SSE Streaming Utility
description: Shared fetch+SSE streaming helper used by all AI tool pages; location and usage contract.
---

# SSE Streaming Utility

All AI chat interfaces, including the floating chatbot, stream responses via `client/src/lib/stream-sse.ts` → `streamSSE(url, body, onChunk)`.

The function owns all fetch/decode/buffer/parse mechanics. Callers only supply the endpoint, request body, and an `onChunk` callback that receives each parsed SSE payload object.

**Why:** The original per-page inline loops had drifted. In particular, the floating chatbot parsed a `text` field although the guide endpoint streams `content`, leaving users with an empty answer despite a successful server response. Centralizing buffering and error handling avoids that class of mismatch.

**How to apply:** Any new chat or page that streams SSE from a POST endpoint should import and use `streamSSE` rather than writing an inline reader loop. Match the callback field to the endpoint contract (the guide endpoint emits `content`). The function throws on non-OK responses, so callers wrap it in try/catch and set `isLoading(false)` in a `finally` block.

Interfaces currently using it include ai-articles, ai-chat, ai-expert, guide-chatbot, the floating chatbot, and story-telling.
