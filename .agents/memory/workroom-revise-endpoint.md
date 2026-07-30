---
name: Workroom Revise Endpoint
description: Details on the AI revision endpoint for Workroom deliverables — model choice, request/response shape, and client wiring.
---

POST /api/workroom/deliverables/:id/revise

**Request:** `{ revisionInstructions: string }`
**Response:** full `WorkroomDeliverable` row (same shape as the DB select)

Uses **gpt-4o** (not gpt-4o-mini, not gpt-5) — quality matches original Workroom generation without the 43 s streaming wait. max_completion_tokens: 4000.

Loads deliverable + its project from DB for context. Appends bpCtx to system prompt.

**Client wiring:** DeliverableCard.handleRevise calls the endpoint, then `onUpdate?.(updated)`. Parent workroom.tsx at onUpdate prop maps updated into `deliverables` state → card re-renders with new content inline (no refresh needed).

**Why gpt-4o:** gpt-4o-mini produced noticeably weaker revision output; gpt-5 requires streaming (~43 s) which is too slow for a modal revision flow.
