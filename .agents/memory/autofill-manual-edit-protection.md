---
name: AI AutoFill Manual-Edit Protection
description: How use-ai-autofill.ts prevents AI auto-fill from overwriting fields the user has manually typed.
---

**File:** `client/src/lib/use-ai-autofill.ts`

Uses a `useRef<Set<string>>` (not useState — no re-render needed) called `manuallyEditedRef`.

`markManualEdit(key)`:
- Adds key to `manuallyEditedRef.current`
- Removes key from `aiFilledFields` Set (removes purple highlight)

`triggerAutoFill(...)`:
1. Snapshots `manuallyEditedRef.current` into `protected_`
2. Resets `manuallyEditedRef.current = new Set()` (fresh cycle for next edit round)
3. After server returns fields, filters: `Object.entries(rawFields).filter(([k, v]) => v && !protected_.has(k))`
4. Only non-protected fields get the purple highlight + are returned to the page

**Why useRef not useState:** the protected set mutates on every keystroke; triggering re-renders on each onChange would be wasteful. The ref is read only when triggerAutoFill fires.

**Behavior:** manual edits between two auto-fills are protected. When user explicitly triggers a new fill, protection resets (they're asking for a fresh fill).
