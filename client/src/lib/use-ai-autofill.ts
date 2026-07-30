import { useState, useCallback } from "react";

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
 *   // On manual edit
 *   onChange={(e) => { setProductName(e.target.value); markManualEdit("productName"); }}
 */
export function useAIAutoFill(): UseAIAutoFillResult {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [aiFilledFields, setAIFilledFields] = useState<AIFilledFields>(new Set());

  const triggerAutoFill = useCallback(
    async (
      toolName: string,
      userBrief: string,
      campaignContext?: Record<string, string>,
    ): Promise<Record<string, string> | null> => {
      setIsAutoFilling(true);
      try {
        const response = await fetch("/api/ai-autofill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolName, userBrief, campaignContext }),
        });
        if (!response.ok) throw new Error("Auto-fill failed");
        const data = await response.json();
        const fields: Record<string, string> = data.fields ?? {};
        // Track which fields were AI-filled
        setAIFilledFields(new Set(Object.keys(fields).filter((k) => fields[k])));
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
    setAIFilledFields((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  const clearAIFields = useCallback(() => {
    setAIFilledFields(new Set());
  }, []);

  return { isAutoFilling, aiFilledFields, triggerAutoFill, markManualEdit, clearAIFields };
}
