import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package, Wand2, ChevronDown, ChevronUp, X, CheckCircle2,
} from "lucide-react";
import { useCampaignStore, CampaignData } from "@/hooks/use-campaign-store";
import { useToast } from "@/hooks/use-toast";

interface CampaignContextBarProps {
  toolId: string;
  onAutoFill?: (campaign: CampaignData) => void;
  currentValues?: Partial<CampaignData>;
  onSave?: () => void;
}

export function CampaignContextBar({
  toolId,
  onAutoFill,
  currentValues,
  onSave,
}: CampaignContextBarProps) {
  const { campaign, isActive, save, markToolUsed } = useCampaignStore();
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const handleAutoFill = () => {
    if (onAutoFill && isActive) {
      onAutoFill(campaign);
      markToolUsed(toolId);
      toast({
        title: "Data campaign di-apply!",
        description: `Produk: ${campaign.produk}${campaign.harga ? ` • ${campaign.harga}` : ""}`,
      });
    }
  };

  const handleSave = () => {
    if (currentValues && onSave) {
      const toSave: Partial<CampaignData> = {};
      if (currentValues.produk) toSave.produk = currentValues.produk;
      if (currentValues.harga) toSave.harga = currentValues.harga;
      if (currentValues.niche) toSave.niche = currentValues.niche;
      if (currentValues.target) toSave.target = currentValues.target;
      if (currentValues.usp) toSave.usp = currentValues.usp;
      if (currentValues.kompetitor) toSave.kompetitor = currentValues.kompetitor;
      save({ ...toSave, usedTools: [...new Set([...campaign.usedTools, toolId])] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast({ title: "Disimpan ke Campaign Aktif!", description: `Campaign: ${currentValues.produk || campaign.produk}` });
      onSave();
    }
  };

  if (!isActive && !currentValues?.produk) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Package className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          {isActive ? (
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-xs font-semibold text-primary truncate">{campaign.produk}</span>
              {campaign.harga && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 border-primary/30 text-primary">
                  {campaign.harga}
                </Badge>
              )}
              {campaign.savedInterests?.length > 0 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 border-blue-300 text-blue-600 dark:text-blue-400">
                  {campaign.savedInterests.length} interest
                </Badge>
              )}
              {campaign.usedTools?.length > 0 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 border-green-300 text-green-600 dark:text-green-400">
                  {campaign.usedTools.length} tools
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Belum ada campaign aktif</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isActive && onAutoFill && (
            <Button
              size="sm"
              variant="default"
              className="h-6 text-xs px-2 py-0"
              onClick={handleAutoFill}
              data-testid={`btn-autofill-${toolId}`}
            >
              <Wand2 className="h-3 w-3 mr-1" />
              Isi Otomatis
            </Button>
          )}
          {currentValues?.produk && onSave && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-xs px-2 py-0 border-primary/30"
              onClick={handleSave}
              data-testid={`btn-save-campaign-${toolId}`}
            >
              {saved ? (
                <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <Package className="h-3 w-3 mr-1" />
              )}
              {saved ? "Tersimpan!" : "Simpan"}
            </Button>
          )}
          {isActive && (
            <button
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setExpanded(!expanded)}
              data-testid={`btn-expand-campaign-${toolId}`}
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
      {expanded && isActive && (
        <div className="border-t border-primary/10 px-3 py-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
          {campaign.target && (
            <div className="col-span-2 sm:col-span-3">
              <span className="text-xs text-muted-foreground">Target: </span>
              <span className="text-xs">{campaign.target}</span>
            </div>
          )}
          {campaign.niche && (
            <div>
              <span className="text-xs text-muted-foreground">Niche: </span>
              <span className="text-xs">{campaign.niche}</span>
            </div>
          )}
          {campaign.usp && (
            <div className="col-span-2">
              <span className="text-xs text-muted-foreground">USP: </span>
              <span className="text-xs">{campaign.usp}</span>
            </div>
          )}
          {campaign.kompetitor && (
            <div>
              <span className="text-xs text-muted-foreground">Kompetitor: </span>
              <span className="text-xs">{campaign.kompetitor}</span>
            </div>
          )}
          {campaign.savedInterests?.length > 0 && (
            <div className="col-span-2 sm:col-span-3">
              <span className="text-xs text-muted-foreground">Interests tersimpan: </span>
              <span className="text-xs">{campaign.savedInterests.slice(0, 8).join(", ")}{campaign.savedInterests.length > 8 ? ` +${campaign.savedInterests.length - 8}` : ""}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
