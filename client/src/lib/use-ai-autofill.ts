import { useState, useCallback, useRef } from "react";

export type AIFilledFields = Set<string>;

export interface UseAIAutoFillResult {
  isAutoFilling: boolean;
  aiFilledFields: AIFilledFields;
  triggerAutoFill: (
    toolName: string,
    userBrief: string,
    campaignContext?: Record<string, string>,
  ) => Promise<Record<string, string> | null>;
  markManualEdit: (field: string) => void;
  clearAIFields: () => void;
}

/**
 * Shared hook for the AI Auto-Fill feature.
 *
 * Usage:
 *   const { isAutoFilling, aiFilledFields, triggerAutoFill, markManualEdit } = useAIAutoFill();
 *
 *   // On button click
 *   const values = await triggerAutoFill("ad-creator", userBrief, campaignCtx);
 *   if (values) { setProductName(values.productName ?? ""); ... }
 *
 *   // In the input's className
 *   className={cn("...", aiFilledFields.has("productName") && "ring-2 ring-purple-400/60 border-purple-400")}
 *
 *   // On manual edit — marks field as user-owned so auto-fill won't overwrite it next time
 *   onChange={(e) => { setProductName(e.target.value); markManualEdit("productName"); }}
 *
 * Task #15 protection: fields the user has manually edited are tracked in manuallyEditedFields.
 * triggerAutoFill filters out those keys from the returned fields so handleAutoFill won't
 * overwrite them. The protection resets every time the user explicitly triggers a fresh fill.
 */
export function useAIAutoFill(): UseAIAutoFillResult {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [aiFilledFields, setAIFilledFields] = useState<AIFilledFields>(new Set());

  // Tracks fields the user has manually edited since the last auto-fill.
  // Using a ref so mutations don't trigger re-renders.
  const manuallyEditedRef = useRef<Set<string>>(new Set());

  const triggerAutoFill = useCallback(
    async (
      toolName: string,
      userBrief: string,
      campaignContext?: Record<string, string>,
    ): Promise<Record<string, string> | null> => {
      // Capture and reset the protected set before the fill so this fill
      // respects edits from a *previous* auto-fill session, then clears for
      // the next cycle. (User explicitly asked for a new fill → fresh start.)
      const protected_ = new Set(manuallyEditedRef.current);
      manuallyEditedRef.current = new Set();

      setIsAutoFilling(true);
      try {
        const response = await fetch("/api/ai-autofill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolName, userBrief, campaignContext }),
        });
        if (!response.ok) throw new Error("Auto-fill failed");
        const data = await response.json();
        const rawFields: Record<string, string> = data.fields ?? {};

        // Filter out fields the user manually edited before this trigger
        const fields: Record<string, string> = Object.fromEntries(
          Object.entries(rawFields).filter(([k, v]) => v && !protected_.has(k)),
        );

        // Track which fields were AI-filled (for purple highlight)
        setAIFilledFields(new Set(Object.keys(fields)));
        return fields;
      } catch (err) {
        console.error("AI auto-fill error:", err);
        return null;
      } finally {
        setIsAutoFilling(false);
      }
    },
    [],
  );

  const markManualEdit = useCallback((field: string) => {
    // Add to protection set (no re-render needed)
    manuallyEditedRef.current.add(field);
    // Remove purple highlight
    setAIFilledFields((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  const clearAIFields = useCallback(() => {
    setAIFilledFields(new Set());
    manuallyEditedRef.current = new Set();
  }, []);

  return { isAutoFilling, aiFilledFields, triggerAutoFill, markManualEdit, clearAIFields };
}
