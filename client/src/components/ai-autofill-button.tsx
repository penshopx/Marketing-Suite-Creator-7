import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Wand2, Loader2, Sparkles } from "lucide-react";
import { useCampaignStore } from "@/hooks/use-campaign-store";

interface AIAutoFillButtonProps {
  toolName: string;
  onFill: (fields: Record<string, string>) => void;
  isAutoFilling: boolean;
  triggerAutoFill: (
    toolName: string,
    userBrief: string,
    campaignContext?: Record<string, string>,
  ) => Promise<Record<string, string> | null>;
  /** Optional compact variant — renders as a small badge-like button */
  compact?: boolean;
}

/**
 * Drop-in button that opens a brief-input dialog and fires the AI Auto-Fill flow.
 * Place it near the top of any tool form.
 */
export function AIAutoFillButton({
  toolName,
  onFill,
  isAutoFilling,
  triggerAutoFill,
  compact = false,
}: AIAutoFillButtonProps) {
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState("");
  const { campaign, isActive } = useCampaignStore();

  const campaignContext: Record<string, string> = {};
  if (isActive) {
    if (campaign.produk) campaignContext.produk = campaign.produk;
    if (campaign.harga) campaignContext.harga = campaign.harga;
    if (campaign.niche) campaignContext.niche = campaign.niche;
    if (campaign.target) campaignContext.target = campaign.target;
    if (campaign.usp) campaignContext.usp = campaign.usp;
    if (campaign.kompetitor) campaignContext.kompetitor = campaign.kompetitor;
    if (campaign.savedInterests?.length)
      campaignContext.interests = campaign.savedInterests.join(", ");
  }

  const hasCampaign = isActive && Object.keys(campaignContext).length > 0;

  const handleFill = async () => {
    setOpen(false);
    const fields = await triggerAutoFill(toolName, brief, hasCampaign ? campaignContext : undefined);
    if (fields) {
      onFill(fields);
      setBrief("");
    }
  };

  if (compact) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1 border-purple-300 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
            disabled={isAutoFilling}
            data-testid={`btn-ai-autofill-${toolName}`}
          >
            {isAutoFilling ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Wand2 className="h-3 w-3" />
            )}
            AI Isi Otomatis
          </Button>
        </DialogTrigger>
        <AIAutoFillDialogContent
          hasCampaign={hasCampaign}
          campaignContext={campaignContext}
          brief={brief}
          setBrief={setBrief}
          isAutoFilling={isAutoFilling}
          onFill={handleFill}
          onCancel={() => setOpen(false)}
        />
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-purple-300 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-400"
          disabled={isAutoFilling}
          data-testid={`btn-ai-autofill-${toolName}`}
        >
          {isAutoFilling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          {isAutoFilling ? "AI sedang mengisi..." : "✨ AI Isi Otomatis"}
        </Button>
      </DialogTrigger>
      <AIAutoFillDialogContent
        hasCampaign={hasCampaign}
        campaignContext={campaignContext}
        brief={brief}
        setBrief={setBrief}
        isAutoFilling={isAutoFilling}
        onFill={handleFill}
        onCancel={() => setOpen(false)}
      />
    </Dialog>
  );
}

interface DialogContentProps {
  hasCampaign: boolean;
  campaignContext: Record<string, string>;
  brief: string;
  setBrief: (v: string) => void;
  isAutoFilling: boolean;
  onFill: () => void;
  onCancel: () => void;
}

function AIAutoFillDialogContent({
  hasCampaign,
  campaignContext,
  brief,
  setBrief,
  isAutoFilling,
  onFill,
  onCancel,
}: DialogContentProps) {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Isi Otomatis
        </DialogTitle>
        <DialogDescription>
          AI akan mengisi semua field form berdasarkan konteks bisnis Anda. Anda bisa edit sebelum generate.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {hasCampaign && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
            <p className="text-xs font-semibold text-primary">📦 Konteks Campaign Aktif</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(campaignContext).map(([k, v]) => (
                <Badge key={k} variant="secondary" className="text-xs max-w-[200px] truncate">
                  <span className="text-muted-foreground mr-1">{k}:</span>
                  {v}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {hasCampaign ? "Brief tambahan (opsional)" : "Brief produk/bisnis Anda *"}
          </label>
          <Textarea
            placeholder={
              hasCampaign
                ? "Contoh: Fokus ke audience ibu muda, budget iklan Rp 50rb/hari..."
                : "Contoh: Saya jual serum vitamin C untuk wanita 25-35 tahun, harga Rp 149rb, keunggulannya hasil terasa dalam 7 hari..."
            }
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={4}
            className="resize-none"
            data-testid="input-autofill-brief"
          />
          {!hasCampaign && (
            <p className="text-xs text-muted-foreground">
              💡 Semakin detail brief = semakin relevan isian AI
            </p>
          )}
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Batal
        </Button>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={onFill}
          disabled={isAutoFilling || (!hasCampaign && !brief.trim())}
          data-testid="btn-confirm-autofill"
        >
          {isAutoFilling ? (
            <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Mengisi Form...</>
          ) : (
            <><Wand2 className="h-3.5 w-3.5 mr-1.5" />Isi Sekarang</>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

/** CSS class to apply to AI-filled inputs/textareas */
export const AI_FIELD_CLASS =
  "ring-2 ring-purple-400/50 border-purple-400 focus:ring-purple-400";
