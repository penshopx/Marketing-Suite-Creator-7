---
name: AI Auto-Fill Pattern
description: How the AI auto-fill feature works — hook, component, server endpoint, and how to add it to new tool pages.
---

# AI Auto-Fill Pattern

## Rule
Every tool form should get an "AI Isi Otomatis" button that pre-fills fields via AI before the user generates.

**Why:** The desired model is AI pre-generates, human gates — not human types everything manually.

## Architecture
- `client/src/lib/use-ai-autofill.ts` — React hook (`useAIAutoFill`) that calls `/api/ai-autofill`, tracks which fields were AI-filled (`aiFilledFields: Set<string>`), and exposes `markManualEdit(field)` to remove the highlight when user edits.
- `client/src/components/ai-autofill-button.tsx` — Drop-in `<AIAutoFillButton>` (standard and `compact` variants) that opens a dialog for brief input, reads active campaign context from `useCampaignStore`, then fires the hook.
- `server/routes.ts` — `POST /api/ai-autofill` endpoint: takes `{ toolName, userBrief, campaignContext }`, looks up tool config (field list + description), asks GPT-4o-mini to return `{ fields: {...} }` JSON.
- Export `AI_FIELD_CLASS` from the button component — apply to any Input/Textarea that should show the purple ring when AI-filled.

## How to apply to a new tool page
1. Import: `useAIAutoFill` from `@/lib/use-ai-autofill`; `AIAutoFillButton, AI_FIELD_CLASS` from `@/components/ai-autofill-button`; `cn` from `@/lib/utils`.
2. Init hook: `const { isAutoFilling, aiFilledFields, triggerAutoFill, markManualEdit } = useAIAutoFill();`
3. Add `handleAutoFill(fields)` callback that maps returned field names to state setters.
4. Add `<AIAutoFillButton toolName="..." onFill={handleAutoFill} isAutoFilling={isAutoFilling} triggerAutoFill={triggerAutoFill} />` (use `compact` for tight spaces).
5. On each input: `className={cn("existing", aiFilledFields.has("fieldName") && AI_FIELD_CLASS)}`; add `markManualEdit("fieldName")` to onChange.
6. Add the tool's field config to the `TOOL_CONFIGS` map in `/api/ai-autofill` in server/routes.ts.

## Pages already implemented
- campaign-wizard, audience-builder, ad-creator, wa-broadcast, cs-bot-script

## AI field visual
Purple ring: `ring-2 ring-purple-400/50 border-purple-400 focus:ring-purple-400` — disappears automatically when user edits the field.
