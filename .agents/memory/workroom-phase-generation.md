---
name: Workroom Phase Generation
description: Critical fix history and behavior notes for the Workroom campaign hub phase generation endpoint.
---

# Workroom Phase Generation

## Rules

### Model token budget
`gpt-5` is a reasoning model — it consumes thinking tokens before writing visible content.
- `max_completion_tokens: 3000` → model often exhausts budget on thinking, produces 0 visible tokens
- `max_completion_tokens: 8000` → reliable output (~43 seconds per phase, 2-5 deliverables)
- **Never go below 4000** for any workroom agent call

### Streaming is required for long calls
The generate-phase endpoint must use `stream: true` even though it collects the full response.
- A non-streaming call to `gpt-5` with 8000 tokens would block the SSE connection for 90+ seconds with no data → client shows stalled UI
- With streaming + `agent_progress` SSE events, the client sees activity throughout

### Deliverable JSON parsing
The model sometimes wraps JSON in markdown fences (` ```json ... ``` `).
Strip these before parsing:
```javascript
const stripped = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
const jsonMatch = stripped.match(/\[[\s\S]*\]/);
```
If still empty after stripping, fall back to one deliverable per `agent.deliverables` entry using raw text as content.

## Timing expectations
- Phase 1 (1 agent, 2 deliverables): ~43 seconds
- Phase 2 (2 agents parallel, 5 deliverables): ~60–80 seconds
- Phase 3 (2 agents parallel, 4 deliverables): ~60–80 seconds
- Phase 4 (2 agents parallel, 4 deliverables): ~60–80 seconds

**Why:** Inform users and set test timeouts accordingly. Tests must wait at least 90 seconds for phase completion.

## Server restart required
`server/routes.ts` changes require a workflow restart — Vite HMR only handles frontend files.
Without restart, the old route (no `/api/workroom/*` routes) falls through to Vite's HTML catch-all, returning 200 OK with HTML.
