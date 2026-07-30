import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Loader2, Sparkles, Building2, FolderOpen } from "lucide-react";
import { useCampaignStore } from "@/hooks/use-campaign-store";
import { useAuth } from "@/hooks/use-auth";

interface WorkroomProject {
  id: number;
  name: string;
  status: string;
  currentPhase: number;
  updatedAt: string;
}

interface AIAutoFillButtonProps {
  toolName: string;
  onFill: (fields: Record<string, string>) => void;
  isAutoFilling: boolean;
  triggerAutoFill: (
    toolName: string,
    userBrief: string,
    campaignContext?: Record<string, string>,
    workroomProjectId?: number,
  ) => Promise<Record<string, string> | null>;
  /** Optional compact variant — renders as a small badge-like button */
  compact?: boolean;
}

/**
 * Drop-in button that opens a brief-input dialog and fires the AI Auto-Fill flow.
 * Place it near the top of any tool form.
 *
 * Task #14: supports optional Workroom project context selector. When a project is
 * selected its deliverables are sent to the server and injected into the AI prompt.
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
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const { campaign, isActive } = useCampaignStore();
  const { user } = useAuth();

  const { data: businessProfile } = useQuery<{ businessName?: string; businessType?: string; industry?: string }>({
    queryKey: ["/api/business-profile"],
    enabled: !!user,
    staleTime: 60_000,
  });

  const { data: workroomProjects = [] } = useQuery<WorkroomProject[]>({
    queryKey: ["/api/workroom/projects"],
    enabled: !!user,
    staleTime: 30_000,
  });

  const hasProfile = !!(businessProfile?.businessName);

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

  const selectedProject = workroomProjects.find((p) => p.id === selectedProjectId);

  const handleFill = async () => {
    setOpen(false);
    const fields = await triggerAutoFill(
      toolName,
      brief,
      hasCampaign ? campaignContext : undefined,
      selectedProjectId,
    );
    if (fields) {
      onFill(fields);
      setBrief("");
    }
  };

  const dialogProps = {
    hasCampaign,
    campaignContext,
    hasProfile,
    businessProfile,
    workroomProjects,
    selectedProjectId,
    selectedProject,
    onSelectProject: setSelectedProjectId,
    brief,
    setBrief,
    isAutoFilling,
    onFill: handleFill,
    onCancel: () => setOpen(false),
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
            {isAutoFilling ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
            AI Isi Otomatis
            {selectedProject && (
              <span className="ml-1 text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-1 rounded">
                {selectedProject.name}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <AIAutoFillDialogContent {...dialogProps} />
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
          {isAutoFilling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {isAutoFilling ? "AI sedang mengisi..." : "✨ AI Isi Otomatis"}
          {selectedProject && !isAutoFilling && (
            <Badge variant="secondary" className="ml-1 text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-0">
              Dari Workroom: {selectedProject.name}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <AIAutoFillDialogContent {...dialogProps} />
    </Dialog>
  );
}

interface DialogContentProps {
  hasCampaign: boolean;
  campaignContext: Record<string, string>;
  hasProfile: boolean;
  businessProfile?: { businessName?: string; businessType?: string; industry?: string };
  workroomProjects: WorkroomProject[];
  selectedProjectId: number | undefined;
  selectedProject: WorkroomProject | undefined;
  onSelectProject: (id: number | undefined) => void;
  brief: string;
  setBrief: (v: string) => void;
  isAutoFilling: boolean;
  onFill: () => void;
  onCancel: () => void;
}

function AIAutoFillDialogContent({
  hasCampaign,
  campaignContext,
  hasProfile,
  businessProfile,
  workroomProjects,
  selectedProjectId,
  selectedProject,
  onSelectProject,
  brief,
  setBrief,
  isAutoFilling,
  onFill,
  onCancel,
}: DialogContentProps) {
  const hasContext = hasCampaign || hasProfile || !!selectedProjectId;
  const canSubmit = hasContext || brief.trim().length > 0;

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

      <div className="space-y-3 py-2">
        {/* Business profile context — shown automatically when profile exists */}
        {hasProfile && businessProfile?.businessName && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800 p-3 space-y-1">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Profil Bisnis Aktif — AI akan otomatis pakai konteks ini
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              {businessProfile.businessName}
              {businessProfile.businessType && (
                <span className="text-muted-foreground font-normal"> · {businessProfile.businessType}</span>
              )}
            </p>
          </div>
        )}

        {/* Active campaign context */}
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

        {/* Workroom project selector */}
        {workroomProjects.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" />
              Konteks dari Workroom (opsional)
            </label>
            <Select
              value={selectedProjectId !== undefined ? String(selectedProjectId) : "none"}
              onValueChange={(v) => onSelectProject(v === "none" ? undefined : parseInt(v))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Pilih proyek Workroom..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-xs text-muted-foreground">
                  — Tidak pakai konteks Workroom —
                </SelectItem>
                {workroomProjects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                    {p.name}
                    {p.currentPhase > 0 && (
                      <span className="ml-1.5 text-muted-foreground">· Fase {p.currentPhase}</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProject && (
              <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                AI akan membaca deliverable proyek ini sebagai referensi
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {hasContext ? "Brief tambahan (opsional)" : "Brief produk/bisnis Anda *"}
          </label>
          <Textarea
            placeholder={
              hasContext
                ? "Contoh: Fokus ke audience ibu muda, budget iklan Rp 50rb/hari, atau detail spesifik lainnya..."
                : "Contoh: Saya jual serum vitamin C untuk wanita 25-35 tahun, harga Rp 149rb, keunggulannya hasil terasa dalam 7 hari..."
            }
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            className="resize-none"
            data-testid="input-autofill-brief"
          />
          {!hasContext && (
            <p className="text-xs text-muted-foreground">
              💡 Semakin detail brief = semakin relevan isian AI. Atau isi{" "}
              <a href="/settings" className="underline text-purple-600 dark:text-purple-400">Profil Bisnis</a>{" "}
              agar tidak perlu tulis brief setiap saat.
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
          disabled={isAutoFilling || !canSubmit}
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
