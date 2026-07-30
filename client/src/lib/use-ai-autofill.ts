import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export type AIFilledFields = Set<string>;

export interface UseAIAutoFillResult {
  isAutoFilling: boolean;
  aiFilledFields: AIFilledFields;
  /** Fields the AI returned but skipped because the user had manually edited them. (Task #40) */
  skippedFields: string[];
  triggerAutoFill: (
    toolName: string,
    userBrief: string,
    campaignContext?: Record<string, string>,
    workroomProjectId?: number,
  ) => Promise<Record<string, string> | null>;
  markManualEdit: (field: string) => void;
  /** Mark Workroom-prefilled fields as protected so AI Auto-Fill won't overwrite them. (Task #41) */
  protectWorkroomFields: (fields: string[]) => void;
  clearAIFields: () => void;
}

/**
 * Shared hook for the AI Auto-Fill feature.
 *
 * Usage:
 *   const { isAutoFilling, aiFilledFields, triggerAutoFill, markManualEdit, protectWorkroomFields } = useAIAutoFill();
 *
 *   // On button click
 *   const values = await triggerAutoFill("ad-creator", userBrief, campaignCtx, workroomProjectId);
 *   if (values) { setProductName(values.productName ?? ""); ... }
 *
 *   // In the input's className
 *   className={cn("...", aiFilledFields.has("productName") && "ring-2 ring-purple-400/60 border-purple-400")}
 *
 *   // On manual edit — marks field as user-owned so auto-fill won't overwrite it next time
 *   onChange={(e) => { setProductName(e.target.value); markManualEdit("productName"); }}
 *
 *   // After Workroom prefill (Task #41) — protects pre-filled fields from auto-fill overwrite
 *   protectWorkroomFields(["productName", "productDescription"]);
 *
 * Task #15 protection: fields the user has manually edited are tracked in manuallyEditedFields.
 * triggerAutoFill filters out those keys from the returned fields so handleAutoFill won't
 * overwrite them. The protection resets every time the user explicitly triggers a fresh fill.
 *
 * Task #40: skippedFields shows users which fields were protected and not updated by AI.
 *           A toast is automatically shown when fields are skipped.
 * Task #41: protectWorkroomFields marks Workroom-prefilled fields as protected so they are
 *           treated the same as manually-edited fields.
 *
 * Task #14: accepts optional workroomProjectId to inject Workroom deliverable history as
 * additional context into the AI auto-fill prompt.
 */
export function useAIAutoFill(): UseAIAutoFillResult {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [aiFilledFields, setAIFilledFields] = useState<AIFilledFields>(new Set());
  const [skippedFields, setSkippedFields] = useState<string[]>([]);
  const { toast } = useToast();

  // Tracks fields the user has manually edited (or Workroom-prefilled) since the last auto-fill.
  // Using a ref so mutations don't trigger re-renders.
  const manuallyEditedRef = useRef<Set<string>>(new Set());

  const triggerAutoFill = useCallback(
    async (
      toolName: string,
      userBrief: string,
      campaignContext?: Record<string, string>,
      workroomProjectId?: number,
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
          body: JSON.stringify({ toolName, userBrief, campaignContext, workroomProjectId }),
        });
        if (!response.ok) throw new Error("Auto-fill failed");
        const data = await response.json();
        const rawFields: Record<string, string> = data.fields ?? {};

        // Separate protected fields (skip) from fields to apply
        const skipped = Object.entries(rawFields)
          .filter(([k, v]) => v && protected_.has(k))
          .map(([k]) => k);

        // Filter out fields the user manually edited (or Workroom-prefilled) before this trigger
        const fields: Record<string, string> = Object.fromEntries(
          Object.entries(rawFields).filter(([k, v]) => v && !protected_.has(k)),
        );

        // Track which fields were AI-filled (for purple highlight)
        setAIFilledFields(new Set(Object.keys(fields)));
        setSkippedFields(skipped);

        // Task #40: notify user which fields were protected from overwrite
        if (skipped.length > 0) {
          toast({
            title: "Beberapa field dilindungi ✓",
            description: `AI tidak menimpa ${skipped.length} field yang sudah kamu isi: ${skipped.join(", ")}`,
            duration: 4000,
          });
        }

        return fields;
      } catch (err) {
        console.error("AI auto-fill error:", err);
        return null;
      } finally {
        setIsAutoFilling(false);
      }
    },
    [toast],
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

  // Task #41: protect Workroom-prefilled fields from being overwritten by AI Auto-Fill.
  // Unlike markManualEdit, this does NOT touch aiFilledFields (fields aren't AI-filled).
  const protectWorkroomFields = useCallback((fields: string[]) => {
    fields.forEach((f) => manuallyEditedRef.current.add(f));
  }, []);

  const clearAIFields = useCallback(() => {
    setAIFilledFields(new Set());
    setSkippedFields([]);
    manuallyEditedRef.current = new Set();
  }, []);

  return { isAutoFilling, aiFilledFields, skippedFields, triggerAutoFill, markManualEdit, protectWorkroomFields, clearAIFields };
}
