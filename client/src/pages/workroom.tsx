import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { streamSSE } from "@/lib/stream-sse";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Search, Target, Palette, Radio, BarChart3, Users, FileText,
  ChevronDown, ChevronRight, Send, Sparkles, Zap, CheckCircle2,
  Loader2, RefreshCw, Bot, Network, Crown, Plus, Trash2, ArrowRight,
  ArrowLeft, Copy, ExternalLink, Clock, FolderOpen, Rocket, TrendingUp,
  Check, XCircle, AlertCircle, Eye, ChevronUp, DollarSign, Download, Share2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkroomProject {
  id: number;
  name: string;
  brief: string;
  currentPhase: number;
  status: string;
  shareToken?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Revision snapshot (Task #28)
interface WorkroomRevision {
  id: number;
  deliverableId: number;
  content: string;
  revisionInstructions: string | null;
  versionNumber: number;
  createdAt: string;
}

interface WorkroomDeliverable {
  id: number;
  projectId: number;
  phase: number;
  agentId: string;
  agentName: string;
  deliverableType: string;
  title: string;
  content: string;
  status: "draft" | "under_review" | "approved" | "exported";
  targetTool: string | null;
  targetToolName: string | null;
  createdAt: string;
  updatedAt: string;
}

type AgentStatus = "idle" | "active" | "done" | "error";
type SessionPhase = "idle" | "intro" | "agents" | "synthesis" | "done";
type WorkroomTab = "projects" | "quick_session";
type ProjectDetailTab = 1 | 2 | 3 | 4;

// ─── Phase configuration (client-side) ────────────────────────────────────────

const PHASES = [
  { num: 1 as const, name: "Riset", fullName: "Riset & Intelijen", icon: Search, color: "blue",
    agents: ["OpenClaw-Research"], description: "Audience persona, interest list & keyword targeting" },
  { num: 2 as const, name: "Kreatif", fullName: "Kreasi Konten", icon: Palette, color: "pink",
    agents: ["OpenClaw-Creative", "OpenClaw-CRM"], description: "Ad copy, hook, video script, WA broadcast" },
  { num: 3 as const, name: "Launch", fullName: "Campaign Launch", icon: Rocket, color: "orange",
    agents: ["OpenClaw-Media", "OpenClaw-Execution"], description: "Media plan, budget, launch checklist" },
  { num: 4 as const, name: "Analitik", fullName: "Analitik & Konversi", icon: TrendingUp, color: "green",
    agents: ["OpenClaw-Analytics", "OpenClaw-Conversion"], description: "KPI framework, tracking, closing script" },
];

const PHASE_COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string; dot: string }> = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-950/20",   border: "border-blue-200 dark:border-blue-800",   text: "text-blue-700 dark:text-blue-300",   badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",   dot: "bg-blue-500" },
  pink:   { bg: "bg-pink-50 dark:bg-pink-950/20",   border: "border-pink-200 dark:border-pink-800",   text: "text-pink-700 dark:text-pink-300",   badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",   dot: "bg-pink-500" },
  orange: { bg: "bg-orange-50 dark:bg-orange-950/20", border: "border-orange-200 dark:border-orange-800", text: "text-orange-700 dark:text-orange-300", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300", dot: "bg-orange-500" },
  green:  { bg: "bg-green-50 dark:bg-green-950/20",  border: "border-green-200 dark:border-green-800",  text: "text-green-700 dark:text-green-300",  badge: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",  dot: "bg-green-500" },
};

const STATUS_CONFIG = {
  draft:        { label: "Draft",        color: "bg-muted text-muted-foreground",          icon: Clock },
  under_review: { label: "Under Review", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300", icon: Eye },
  approved:     { label: "Approved",     color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",     icon: Check },
  exported:     { label: "Exported",     color: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300", icon: ExternalLink },
};

const DELIVERABLE_TYPE_TITLES: Record<string, string> = {
  audience_persona: "👥 Audience Persona",
  interest_list:    "🎯 Interest & Keyword List",
  ad_copy:          "✍️ Ad Copy",
  hook:             "🪝 Hook Pembuka",
  video_script:     "🎬 Video Script",
  wa_broadcast:     "💬 WA Broadcast Sequence",
  cs_bot_script:    "🤖 CS Bot Script",
  media_plan:       "📡 Media Plan",
  budget_allocation:"💰 Budget Allocation",
  launch_checklist: "✅ Launch Checklist",
  campaign_brief:   "📋 Campaign Brief",
  kpi_framework:    "📊 KPI Framework",
  tracking_setup:   "🔍 Tracking Setup",
  cs_closing:       "💬 CS Closing Script",
  customer_journey: "🗺️ Customer Journey",
};

// ─── Quick Session agent definitions (kept from original) ─────────────────────

const OPENCLAW_AGENTS = [
  { id: "research",  name: "OpenClaw-Research",   role: "Riset & Intelijen Pasar",      icon: Search,    color: "blue",   emoji: "🔬",
    colorClass: { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-600 dark:text-blue-400",   dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",   header: "from-blue-500/20 to-blue-500/5" },
    subAgents: ["Audience Analyst", "Competitor Scout", "Trend Watcher", "Keyword Hunter"] },
  { id: "strategy",  name: "OpenClaw-Strategy",   role: "Strategi Marketing",            icon: Target,    color: "violet", emoji: "🎯",
    colorClass: { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-600 dark:text-violet-400", dot: "bg-violet-500", badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300", header: "from-violet-500/20 to-violet-500/5" },
    subAgents: ["Campaign Strategist", "Funnel Architect", "Budget Optimizer", "A/B Test Designer"] },
  { id: "creative",  name: "OpenClaw-Creative",   role: "Kreasi Konten & Iklan",         icon: Palette,   color: "pink",   emoji: "🎨",
    colorClass: { bg: "bg-pink-500/10",   border: "border-pink-500/30",   text: "text-pink-600 dark:text-pink-400",   dot: "bg-pink-500",   badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",   header: "from-pink-500/20 to-pink-500/5" },
    subAgents: ["Copywriter Pro", "Visual Director", "Video Scripter", "Hook Specialist"] },
  { id: "media",     name: "OpenClaw-Media",      role: "Media Planning & Buying",       icon: Radio,     color: "orange", emoji: "📡",
    colorClass: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300", header: "from-orange-500/20 to-orange-500/5" },
    subAgents: ["Meta Ads Specialist", "Google Ads Expert", "TikTok Strategist", "Influencer Coordinator"] },
  { id: "analytics", name: "OpenClaw-Analytics",  role: "Analitik & Performa",           icon: BarChart3, color: "green",  emoji: "📊",
    colorClass: { bg: "bg-green-500/10",  border: "border-green-500/30",  text: "text-green-600 dark:text-green-400",  dot: "bg-green-500",  badge: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",  header: "from-green-500/20 to-green-500/5" },
    subAgents: ["Data Scientist", "ROI Tracker", "Conversion Analyst", "Reporting Specialist"] },
  { id: "crm",       name: "OpenClaw-CRM",        role: "Customer Relationship",         icon: Users,     color: "teal",   emoji: "🤝",
    colorClass: { bg: "bg-teal-500/10",   border: "border-teal-500/30",   text: "text-teal-600 dark:text-teal-400",   dot: "bg-teal-500",   badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",   header: "from-teal-500/20 to-teal-500/5" },
    subAgents: ["Retention Specialist", "Email Marketer", "Community Manager", "Loyalty Designer"] },
  { id: "content",   name: "OpenClaw-Content",    role: "SEO & Konten Organik",          icon: FileText,  color: "amber",  emoji: "📝",
    colorClass: { bg: "bg-amber-500/10",  border: "border-amber-500/30",  text: "text-amber-600 dark:text-amber-400",  dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",  header: "from-amber-500/20 to-amber-500/5" },
    subAgents: ["SEO Specialist", "Blog Writer", "Social Media Manager", "Content Planner"] },
  { id: "execution", name: "OpenClaw-Execution",  role: "Campaign Launch Specialist",    icon: Rocket,    color: "orange", emoji: "🚀",
    colorClass: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300", header: "from-orange-500/20 to-orange-500/5" },
    subAgents: ["Launch Coordinator", "Ad Setup Specialist", "Creative QC", "Go-Live Monitor"] },
  { id: "conversion",name: "OpenClaw-Conversion", role: "CS & Closing Specialist",       icon: DollarSign,color: "green",  emoji: "💰",
    colorClass: { bg: "bg-green-500/10",  border: "border-green-500/30",  text: "text-green-600 dark:text-green-400",  dot: "bg-green-500",  badge: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",  header: "from-green-500/20 to-green-500/5" },
    subAgents: ["Sales Closer", "Objection Handler", "Follow-Up Specialist", "Loyalty Builder"] },
];

// ─── Helper Components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WorkroomDeliverable["status"] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full", cfg.color)}>
      <Icon className="w-2.5 h-2.5" /> {cfg.label}
    </span>
  );
}

function PhaseStepIndicator({ phases, currentPhase, activeTab, onTabChange }: {
  phases: typeof PHASES; currentPhase: number; activeTab: ProjectDetailTab;
  onTabChange: (n: ProjectDetailTab) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {phases.map((p, i) => {
        const done = currentPhase >= p.num;
        const active = activeTab === p.num;
        const Icon = p.icon;
        const colors = PHASE_COLOR_MAP[p.color];
        return (
          <div key={p.num} className="flex items-center">
            <button
              onClick={() => onTabChange(p.num)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                active && cn(colors.bg, colors.border, "border", colors.text),
                !active && done && "text-green-600 dark:text-green-400 hover:bg-accent",
                !active && !done && "text-muted-foreground hover:bg-accent",
              )}
            >
              {done && !active
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                : <Icon className="w-3.5 h-3.5" />}
              <span>{p.name}</span>
            </button>
            {i < phases.length - 1 && (
              <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DeliverableCard({
  deliverable,
  onStatusChange,
  onUseInTool,
  onUpdate,
}: {
  deliverable: WorkroomDeliverable;
  onStatusChange: (id: number, status: WorkroomDeliverable["status"]) => void;
  onUseInTool: (deliverable: WorkroomDeliverable) => void;
  onUpdate?: (updated: WorkroomDeliverable) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showRevise, setShowRevise] = useState(false);
  const [revisionText, setRevisionText] = useState("");
  const [isRevising, setIsRevising] = useState(false);
  // Task #28 — revision history
  const [showHistory, setShowHistory] = useState(false);
  const [revisions, setRevisions] = useState<WorkroomRevision[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { toast } = useToast();

  const handleRevise = async () => {
    if (!revisionText.trim()) return;
    setIsRevising(true);
    try {
      const res = await fetch(`/api/workroom/deliverables/${deliverable.id}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ revisionInstructions: revisionText }),
      });
      if (!res.ok) throw new Error();
      const updated: WorkroomDeliverable = await res.json();
      onUpdate?.(updated);
      setShowRevise(false);
      setRevisionText("");
      toast({ title: "Deliverable direvisi ✓", description: "AI telah memperbarui konten sesuai instruksi." });
    } catch {
      toast({ title: "Revisi gagal", description: "Coba lagi sebentar.", variant: "destructive" });
    } finally {
      setIsRevising(false);
    }
  };

  const typeLabel = DELIVERABLE_TYPE_TITLES[deliverable.deliverableType] ?? deliverable.title;

  const copyContent = () => {
    navigator.clipboard.writeText(deliverable.content).then(() => {
      toast({ title: "Disalin!", description: "Konten berhasil disalin ke clipboard." });
    });
  };

  const statusFlow: WorkroomDeliverable["status"][] = ["draft", "under_review", "approved", "exported"];
  const currentIdx = statusFlow.indexOf(deliverable.status);

  return (
    <div className={cn(
      "rounded-xl border transition-all duration-200",
      deliverable.status === "approved" && "border-green-300 dark:border-green-700 bg-green-50/30 dark:bg-green-950/10",
      deliverable.status === "exported" && "border-purple-300 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-950/10",
      deliverable.status === "under_review" && "border-yellow-300 dark:border-yellow-700 bg-yellow-50/30 dark:bg-yellow-950/10",
      deliverable.status === "draft" && "border-border bg-card",
    )}>
      {/* Header */}
      <div className="flex items-start gap-2 p-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
            <span className="text-xs font-bold">{typeLabel}</span>
            <StatusBadge status={deliverable.status} />
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{deliverable.title}</p>
        </div>
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex-shrink-0 p-1 rounded hover:bg-accent transition-colors"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          <ScrollArea className="max-h-56 rounded-lg border bg-muted/40 p-3">
            <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans">{deliverable.content}</pre>
          </ScrollArea>

          {/* Action row */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Status progression */}
            <div className="flex items-center gap-1">
              {currentIdx < statusFlow.length - 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => onStatusChange(deliverable.id, statusFlow[currentIdx + 1])}
                >
                  <ArrowRight className="w-3 h-3" />
                  {currentIdx === 0 && "Review"}
                  {currentIdx === 1 && "Approve"}
                  {currentIdx === 2 && "Export"}
                </Button>
              )}
              {currentIdx > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1 text-muted-foreground"
                  onClick={() => onStatusChange(deliverable.id, statusFlow[currentIdx - 1])}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Kembali
                </Button>
              )}
            </div>

            <div className="flex-1" />

            {/* Copy */}
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={copyContent}>
              <Copy className="w-3 h-3" /> Salin
            </Button>

            {/* Revise with AI */}
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => setShowRevise((p) => !p)}
              disabled={isRevising}
            >
              <Sparkles className="w-3 h-3" />
              Revisi AI
            </Button>

            {/* Revision history — Task #28 */}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1"
              onClick={async () => {
                if (!showHistory) {
                  setLoadingHistory(true);
                  try {
                    const r = await fetch(`/api/workroom/deliverables/${deliverable.id}/revisions`, { credentials: "include" });
                    if (r.ok) setRevisions(await r.json());
                  } finally {
                    setLoadingHistory(false);
                  }
                }
                setShowHistory((p) => !p);
              }}
            >
              {loadingHistory ? <Loader2 className="w-3 h-3 animate-spin" /> : <Clock className="w-3 h-3" />}
              Riwayat
            </Button>

            {/* Use in tool */}
            {deliverable.targetTool && (
              <Button
                size="sm"
                className="h-7 text-xs gap-1 bg-primary/90 hover:bg-primary"
                onClick={() => onUseInTool(deliverable)}
              >
                <ExternalLink className="w-3 h-3" />
                Gunakan di {deliverable.targetToolName}
              </Button>
            )}
          </div>

          {/* Inline revision form */}
          {showRevise && (
            <div className="space-y-2 pt-1 border-t mt-1">
              <p className="text-[11px] text-muted-foreground font-medium">Instruksi revisi untuk AI:</p>
              <Textarea
                rows={2}
                placeholder="e.g. Buat lebih spesifik untuk ibu muda usia 28-35 yang tinggal di Jakarta..."
                value={revisionText}
                onChange={(e) => setRevisionText(e.target.value)}
                className="text-xs resize-none"
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setShowRevise(false); setRevisionText(""); }}>
                  Batal
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleRevise}
                  disabled={isRevising || !revisionText.trim()}
                >
                  {isRevising ? <><Loader2 className="w-3 h-3 animate-spin" /> Merevisi...</> : <><Send className="w-3 h-3" /> Revisi</>}
                </Button>
              </div>
            </div>
          )}

          {/* Revision history panel — Task #28 */}
          {showHistory && (
            <div className="space-y-2 pt-1 border-t mt-1">
              <p className="text-[11px] text-muted-foreground font-medium">
                Riwayat Revisi ({revisions.length} snapshot tersimpan):
              </p>
              {revisions.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Belum ada riwayat. Riwayat otomatis tersimpan setiap kali revisi AI dijalankan.</p>
              ) : (
                <div className="space-y-2">
                  {revisions.map((rev) => (
                    <div key={rev.id} className="border rounded-lg p-2.5 bg-muted/30 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground">
                          v{rev.versionNumber} ·{" "}
                          {new Date(rev.createdAt).toLocaleString("id-ID", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] gap-1 px-2"
                          onClick={async () => {
                            const r = await fetch(
                              `/api/workroom/deliverables/${deliverable.id}/revert/${rev.id}`,
                              { method: "POST", credentials: "include" }
                            );
                            if (r.ok) {
                              const updated = await r.json();
                              onUpdate?.(updated);
                              setShowHistory(false);
                              toast({ title: `Dipulihkan ke v${rev.versionNumber} ✓`, duration: 2000 });
                            } else {
                              toast({ title: "Gagal memulihkan", variant: "destructive" });
                            }
                          }}
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Pulihkan
                        </Button>
                      </div>
                      {rev.revisionInstructions && (
                        <p className="text-[10px] text-muted-foreground italic line-clamp-1">
                          &ldquo;{rev.revisionInstructions}&rdquo;
                        </p>
                      )}
                      <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-3">
                        {rev.content.slice(0, 200)}{rev.content.length > 200 ? "…" : ""}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AgentSection({
  agentId,
  agentName,
  deliverables,
  generatingAgents,
  onStatusChange,
  onUseInTool,
  onUpdate,
}: {
  agentId: string;
  agentName: string;
  deliverables: WorkroomDeliverable[];
  generatingAgents: Set<string>;
  onStatusChange: (id: number, status: WorkroomDeliverable["status"]) => void;
  onUseInTool: (d: WorkroomDeliverable) => void;
  onUpdate?: (updated: WorkroomDeliverable) => void;
}) {
  const isGenerating = generatingAgents.has(agentId);
  const agentDef = OPENCLAW_AGENTS.find((a) => a.id === agentId);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">{agentDef?.emoji ?? "🤖"}</span>
        <span className="text-xs font-bold">{agentName}</span>
        {isGenerating && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
        {!isGenerating && deliverables.length > 0 && (
          <span className="text-[10px] text-muted-foreground">{deliverables.length} deliverable</span>
        )}
      </div>
      {isGenerating && deliverables.length === 0 && (
        <div className="rounded-lg border border-dashed p-4 text-center">
          <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">AI sedang menyusun deliverable...</p>
        </div>
      )}
      {deliverables.map((d) => (
        <DeliverableCard
          key={d.id}
          deliverable={d}
          onStatusChange={onStatusChange}
          onUseInTool={onUseInTool}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

// ─── Quick Session sub-components (from original workroom) ────────────────────

function StatusDot({ status }: { status: "idle" | "active" | "done" | "error" }) {
  if (status === "idle") return <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/30" />;
  if (status === "active") return <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />;
  if (status === "done") return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
  return <span className="inline-block w-2 h-2 rounded-full bg-destructive" />;
}

function QuickAgentCard({ agent, state }: { agent: typeof OPENCLAW_AGENTS[0]; state: { status: AgentStatus; report: string } }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = agent.icon;
  useEffect(() => { if (state.status === "active") setExpanded(true); }, [state.status]);
  return (
    <div className={cn("rounded-xl border transition-all duration-300", agent.colorClass.border, agent.colorClass.bg,
      state.status === "active" && "shadow-md ring-1 ring-inset ring-primary/20")}>
      <button onClick={() => setExpanded((p) => !p)}
        className={cn("w-full flex items-center gap-2 px-3 py-2.5 rounded-t-xl bg-gradient-to-r", agent.colorClass.header)}>
        <Icon className={cn("w-4 h-4 flex-shrink-0", agent.colorClass.text)} />
        <div className="flex-1 min-w-0 text-left">
          <p className={cn("text-xs font-bold truncate", agent.colorClass.text)}>{agent.emoji} {agent.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{agent.role}</p>
        </div>
        <StatusDot status={state.status} />
        {expanded ? <ChevronUp className="w-3 h-3 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
      </button>
      {!expanded && (
        <div className="px-3 py-1.5 flex flex-wrap gap-1">
          {agent.subAgents.map((sa) => (
            <span key={sa} className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", agent.colorClass.badge)}>{sa}</span>
          ))}
        </div>
      )}
      {expanded && (
        <div className="px-3 pb-3">
          {state.status === "idle" && <p className="text-xs text-muted-foreground italic py-2">Menunggu instruksi dari MultiClaw...</p>}
          {state.status === "active" && state.report === "" && (
            <div className="flex items-center gap-2 py-2"><Loader2 className="w-3 h-3 animate-spin text-primary" /><span className="text-xs text-muted-foreground">Menganalisis brief...</span></div>
          )}
          {(state.status === "active" || state.status === "done") && state.report && (
            <ScrollArea className="max-h-60 mt-1">
              <div className="text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap pr-2">{state.report}</div>
            </ScrollArea>
          )}
          {state.status === "error" && <p className="text-xs text-destructive py-2">⚠ Agen mengalami error.</p>}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Workroom() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Tab state
  const [tab, setTab] = useState<WorkroomTab>("projects");

  // ── Project Hub state ──
  const [projects, setProjects] = useState<WorkroomProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<WorkroomProject | null>(null);
  const [deliverables, setDeliverables] = useState<WorkroomDeliverable[]>([]);
  const [projectDetailLoading, setProjectDetailLoading] = useState(false);
  const [activePhaseTab, setActivePhaseTab] = useState<ProjectDetailTab>(1);
  const [generatingPhase, setGeneratingPhase] = useState<number | null>(null);
  const [generatingAgents, setGeneratingAgents] = useState<Set<string>>(new Set());

  // New project dialog
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [exportApprovedOnly, setExportApprovedOnly] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectBrief, setNewProjectBrief] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  // Delete confirm
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);

  // ── Quick Session state ──
  const [qsInput, setQsInput] = useState("");
  const [qsIsLoading, setQsIsLoading] = useState(false);
  const [qsSessionPhase, setQsSessionPhase] = useState<SessionPhase>("idle");
  const [qsView, setQsView] = useState<"team" | "session">("team");
  const [qsUserBrief, setQsUserBrief] = useState("");
  const [qsMulticlawIntro, setQsMulticlawIntro] = useState("");
  const [qsMulticlawSynthesis, setQsMulticlawSynthesis] = useState("");
  const [qsAgentStates, setQsAgentStates] = useState<Record<string, { status: AgentStatus; report: string }>>(
    Object.fromEntries(OPENCLAW_AGENTS.map((a) => [a.id, { status: "idle" as AgentStatus, report: "" }]))
  );

  // ── Load projects on mount ──
  useEffect(() => {
    if (tab === "projects") loadProjects();
  }, [tab]);

  const loadProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await fetch("/api/workroom/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Gagal memuat proyek", variant: "destructive" });
    } finally {
      setProjectsLoading(false);
    }
  };

  const loadProjectDetail = async (projectId: number) => {
    setProjectDetailLoading(true);
    try {
      const res = await fetch(`/api/workroom/projects/${projectId}`);
      const data = await res.json();
      setSelectedProject(data.project);
      setDeliverables(data.deliverables ?? []);
    } catch {
      toast({ title: "Gagal memuat proyek", variant: "destructive" });
    } finally {
      setProjectDetailLoading(false);
    }
  };

  const openProject = (project: WorkroomProject) => {
    setSelectedProject(project);
    setActivePhaseTab(Math.max(1, project.currentPhase) as ProjectDetailTab);
    loadProjectDetail(project.id);
  };

  const createProject = async () => {
    if (!newProjectName.trim() || !newProjectBrief.trim()) return;
    setCreatingProject(true);
    try {
      const res = await fetch("/api/workroom/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim(), brief: newProjectBrief.trim() }),
      });
      const project = await res.json();
      setShowNewProjectDialog(false);
      setNewProjectName("");
      setNewProjectBrief("");
      await loadProjects();
      openProject(project);
      setActivePhaseTab(1);
    } catch {
      toast({ title: "Gagal membuat proyek", variant: "destructive" });
    } finally {
      setCreatingProject(false);
    }
  };

  const deleteProject = async (id: number) => {
    try {
      await fetch(`/api/workroom/projects/${id}`, { method: "DELETE" });
      setDeletingProjectId(null);
      if (selectedProject?.id === id) setSelectedProject(null);
      loadProjects();
      toast({ title: "Proyek dihapus" });
    } catch {
      toast({ title: "Gagal menghapus proyek", variant: "destructive" });
    }
  };

  const generatePhase = async (phaseNum: number) => {
    if (!selectedProject || generatingPhase !== null) return;
    setGeneratingPhase(phaseNum);

    // Find agents for this phase
    const phaseConfig = PHASES.find((p) => p.num === phaseNum);
    const agentIds = phaseConfig ? phaseConfig.agents.map((n) => n.toLowerCase().replace("openclaw-", "")) : [];
    const newGenerating = new Set(agentIds);
    setGeneratingAgents(newGenerating);

    try {
      await streamSSE(
        `/api/workroom/projects/${selectedProject.id}/generate-phase`,
        { phase: phaseNum },
        (data) => {
          if (data.type === "agent_start") {
            // already set
          } else if (data.type === "agent_done") {
            setGeneratingAgents((prev) => {
              const next = new Set(prev);
              next.delete(data.agentId as string);
              return next;
            });
            if (Array.isArray(data.deliverables)) {
              setDeliverables((prev) => {
                const newIds = new Set((data.deliverables as WorkroomDeliverable[]).map((d: WorkroomDeliverable) => d.id));
                return [...prev.filter((d) => !newIds.has(d.id)), ...(data.deliverables as WorkroomDeliverable[])];
              });
            }
          } else if (data.type === "agent_error") {
            setGeneratingAgents((prev) => {
              const next = new Set(prev);
              next.delete(data.agentId as string);
              return next;
            });
            toast({ title: `${data.agentId} gagal`, description: "Coba generate ulang.", variant: "destructive" });
          } else if (data.type === "done") {
            setGeneratingPhase(null);
            setGeneratingAgents(new Set());
            // Refresh project to get updated currentPhase
            loadProjectDetail(selectedProject.id);
          }
        }
      );
    } catch {
      toast({ title: "Generasi gagal", description: "Coba lagi.", variant: "destructive" });
    } finally {
      setGeneratingPhase(null);
      setGeneratingAgents(new Set());
    }
  };

  const updateDeliverableStatus = async (id: number, status: WorkroomDeliverable["status"]) => {
    try {
      const res = await fetch(`/api/workroom/deliverables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      setDeliverables((prev) => prev.map((d) => d.id === id ? { ...d, ...updated } : d));
    } catch {
      toast({ title: "Gagal memperbarui status", variant: "destructive" });
    }
  };

  const exportBrief = () => {
    if (!selectedProject) return;
    const project = selectedProject;
    const allDelivs = exportApprovedOnly
      ? deliverables.filter(d => d.status === "approved" || d.status === "exported")
      : deliverables;
    const exportDate = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    const phaseColors: Record<number, string> = { 1: "#3b82f6", 2: "#ec4899", 3: "#f97316", 4: "#22c55e" };
    const statusLabel: Record<string, string> = { draft: "Draft", under_review: "Under Review", approved: "Approved ✓", exported: "Exported" };
    const statusBg: Record<string, string> = { draft: "#f1f5f9", under_review: "#fef9c3", approved: "#dcfce7", exported: "#f3e8ff" };
    const statusColor: Record<string, string> = { draft: "#64748b", under_review: "#854d0e", approved: "#166534", exported: "#6b21a8" };

    const renderDeliverables = (phase: number) => {
      const phaseDelivs = allDelivs.filter((d) => d.phase === phase);
      if (phaseDelivs.length === 0) return "<p style='color:#94a3b8;font-style:italic;margin:0'>Belum ada deliverable</p>";
      return phaseDelivs.map((d) => {
        const typeLabel = DELIVERABLE_TYPE_TITLES[d.deliverableType] ?? d.deliverableType;
        const st = d.status as string;
        return `
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;background:#fff">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px">
            <div>
              <span style="font-size:13px;font-weight:700;color:#1e293b">${typeLabel}</span>
              <p style="font-size:12px;color:#64748b;margin:2px 0 0">${d.title}</p>
            </div>
            <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:12px;white-space:nowrap;background:${statusBg[st] ?? "#f1f5f9"};color:${statusColor[st] ?? "#64748b"}">${statusLabel[st] ?? st}</span>
          </div>
          <pre style="font-family:inherit;font-size:12px;line-height:1.7;color:#334155;white-space:pre-wrap;word-break:break-word;margin:0;background:#f8fafc;border-radius:6px;padding:12px;border:1px solid #e2e8f0">${d.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
        </div>`;
      }).join("");
    };

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Campaign Brief — ${project.name}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;background:#f8fafc;padding:0}
  @media print{body{background:#fff}.no-print{display:none}}
</style>
</head>
<body>
<div style="max-width:860px;margin:0 auto;padding:40px 32px">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #e2e8f0">
    <div>
      <div style="font-size:11px;font-weight:700;color:#7c3aed;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">🦂 MultiClaw Campaign Brief</div>
      <h1 style="font-size:28px;font-weight:800;color:#0f172a;line-height:1.2;margin-bottom:8px">${project.name}</h1>
      <p style="font-size:14px;color:#475569;line-height:1.6;max-width:540px">${project.brief}</p>
    </div>
    <div style="text-align:right;flex-shrink:0">
      <p style="font-size:11px;color:#94a3b8">Diekspor ${exportDate}</p>
      <p style="font-size:11px;color:#94a3b8;margin-top:2px">Fase ${project.currentPhase}/4 selesai</p>
      <p style="font-size:11px;color:#94a3b8;margin-top:2px">${allDelivs.length} deliverable</p>
    </div>
  </div>

  <!-- Phase Summary -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:40px">
    ${PHASES.map((p) => {
      const done = project.currentPhase >= p.num;
      const count = allDelivs.filter((d) => d.phase === p.num).length;
      const bg = done ? phaseColors[p.num] : "#e2e8f0";
      const fg = done ? "#fff" : "#94a3b8";
      return `<div style="border-radius:10px;padding:14px;background:${done ? phaseColors[p.num] + "15" : "#f8fafc"};border:1px solid ${done ? phaseColors[p.num] + "40" : "#e2e8f0"}">
        <div style="width:28px;height:28px;border-radius:50%;background:${bg};color:${fg};font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-bottom:8px">${p.num}</div>
        <p style="font-size:12px;font-weight:700;color:${done ? phaseColors[p.num] : "#94a3b8"}">${p.name}</p>
        <p style="font-size:11px;color:#94a3b8;margin-top:2px">${p.fullName}</p>
        <p style="font-size:11px;font-weight:600;color:${done ? phaseColors[p.num] : "#cbd5e1"};margin-top:6px">${count} deliverable</p>
      </div>`;
    }).join("")}
  </div>

  <!-- Deliverables per Phase -->
  ${PHASES.map((p) => {
    const phaseDelivs = allDelivs.filter((d) => d.phase === p.num);
    if (phaseDelivs.length === 0) return "";
    return `
  <div style="margin-bottom:40px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid ${phaseColors[p.num]}30">
      <div style="width:8px;height:8px;border-radius:50%;background:${phaseColors[p.num]};flex-shrink:0"></div>
      <h2 style="font-size:16px;font-weight:700;color:${phaseColors[p.num]}">Fase ${p.num}: ${p.fullName}</h2>
      <span style="font-size:11px;color:#94a3b8">${p.description}</span>
    </div>
    ${renderDeliverables(p.num)}
  </div>`;
  }).join("")}

  <!-- Footer -->
  <div style="margin-top:48px;padding-top:20px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">
    <p style="font-size:11px;color:#94a3b8">Dibuat dengan AI Marketing Tools · MultiClaw Campaign Hub</p>
    <p style="font-size:11px;color:#94a3b8">${exportDate}</p>
  </div>

</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Campaign Brief — ${project.name.replace(/[^a-zA-Z0-9 ]/g, "")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Brief berhasil diekspor ✓", description: "File HTML siap dibuka di browser atau dicetak sebagai PDF." });
  };

  // Task #30 — generate + copy shareable brief link
  const handleShareBrief = async () => {
    if (!selectedProject) return;
    try {
      const r = await fetch(`/api/workroom/projects/${selectedProject.id}/share`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) throw new Error("Share failed");
      const { token, shareUrl } = await r.json() as { token: string; shareUrl: string };
      const fullUrl = window.location.origin + shareUrl;
      await navigator.clipboard.writeText(fullUrl);
      // Task #47: update local state so "Cabut Link" button appears immediately
      setSelectedProject((p) => p ? { ...p, shareToken: token } : p);
      toast({
        title: "Link disalin ke clipboard ✓",
        description: "Siapa saja dengan link ini bisa melihat campaign brief (read-only).",
        duration: 4000,
      });
    } catch {
      toast({ title: "Gagal membuat link berbagi", variant: "destructive" });
    }
  };

  // Task #47 — revoke the share link
  const handleRevokeBrief = async () => {
    if (!selectedProject) return;
    try {
      const r = await fetch(`/api/workroom/projects/${selectedProject.id}/share`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error("Revoke failed");
      setSelectedProject((p) => p ? { ...p, shareToken: null } : p);
      toast({ title: "Link berbagi dicabut ✓", description: "Link lama tidak lagi bisa diakses.", duration: 3000 });
    } catch {
      toast({ title: "Gagal mencabut link berbagi", variant: "destructive" });
    }
  };

  const handleUseInTool = (deliverable: WorkroomDeliverable) => {
    if (!deliverable.targetTool) return;
    // Store prefill data in sessionStorage for the target tool to read
    sessionStorage.setItem("workroom_prefill", JSON.stringify({
      deliverableType: deliverable.deliverableType,
      title: deliverable.title,
      content: deliverable.content,
      projectName: selectedProject?.name ?? "",
    }));
    // Update status to exported
    updateDeliverableStatus(deliverable.id, "exported");
    navigate(deliverable.targetTool);
    toast({ title: `Membuka ${deliverable.targetToolName}`, description: "Konten siap digunakan." });
  };

  // ── Quick session logic ──
  const resetQs = () => {
    setQsSessionPhase("idle");
    setQsUserBrief("");
    setQsMulticlawIntro("");
    setQsMulticlawSynthesis("");
    setQsAgentStates(Object.fromEntries(OPENCLAW_AGENTS.map((a) => [a.id, { status: "idle" as AgentStatus, report: "" }])));
  };

  const startQs = async () => {
    const brief = qsInput.trim();
    if (!brief || qsIsLoading) return;
    resetQs();
    setQsView("session");
    setQsInput("");
    setQsIsLoading(true);
    setQsUserBrief(brief);
    setQsSessionPhase("intro");
    try {
      await streamSSE("/api/workroom/session", { message: brief }, (data) => {
        if (data.done) { setQsSessionPhase("done"); return; }
        if (data.error) { setQsSessionPhase("done"); return; }
        if (data.agent === "multiclaw") {
          if (data.phase === "intro") setQsMulticlawIntro((p) => p + (data.content as string));
          else if (data.phase === "synthesis") { setQsSessionPhase("synthesis"); setQsMulticlawSynthesis((p) => p + (data.content as string)); }
        } else {
          const agentId = data.agent as string;
          if (data.phase === "report") {
            setQsSessionPhase("agents");
            setQsAgentStates((prev) => ({ ...prev, [agentId]: { status: "active", report: (prev[agentId]?.report ?? "") + (data.content as string) } }));
          } else if (data.phase === "done") {
            setQsAgentStates((prev) => ({ ...prev, [agentId]: { ...prev[agentId], status: "done" } }));
          } else if (data.phase === "error") {
            setQsAgentStates((prev) => ({ ...prev, [agentId]: { ...prev[agentId], status: "error" } }));
          }
        }
      });
    } catch { setQsSessionPhase("done"); }
    finally { setQsIsLoading(false); }
  };

  const qsDoneCount = Object.values(qsAgentStates).filter((s) => s.status === "done").length;
  const qsActiveCount = Object.values(qsAgentStates).filter((s) => s.status === "active").length;

  // ── Phase deliverables helpers ──
  const getPhaseDeliverables = (phase: number) => deliverables.filter((d) => d.phase === phase);
  const getPhaseAgents = (phase: number): string[] => {
    const phaseConfig = PHASES.find((p) => p.num === phase);
    return phaseConfig?.agents.map((n) => n.toLowerCase().replace("openclaw-", "")) ?? [];
  };
  const isPhaseGenerated = (phase: number) => getPhaseDeliverables(phase).length > 0;
  const isPhaseAllApproved = (phase: number) => {
    const phaseDelivs = getPhaseDeliverables(phase);
    return phaseDelivs.length > 0 && phaseDelivs.every((d) => d.status === "approved" || d.status === "exported");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const showProjectDetail = selectedProject !== null;

  return (
    <div className="flex flex-col h-full bg-background">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b bg-gradient-to-r from-primary/10 via-background to-background px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {showProjectDetail && tab === "projects" && (
              <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={() => setSelectedProject(null)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md text-xl flex-shrink-0">🦂</div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold">
                  {showProjectDetail && tab === "projects" ? selectedProject!.name : "MultiClaw Workroom"}
                </h1>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                  {tab === "projects" ? "Campaign Hub" : "AI Team"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {showProjectDetail && tab === "projects"
                  ? `Fase ${selectedProject!.currentPhase}/4 · ${deliverables.length} deliverable`
                  : "1 Master Orchestrator · 9 OpenClaw · Sistem Agentic AI Marketing"}
              </p>
            </div>
          </div>

          {/* Export Brief button — visible only in project detail */}
          {showProjectDetail && tab === "projects" && deliverables.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={exportApprovedOnly}
                  onChange={e => setExportApprovedOnly(e.target.checked)}
                  className="rounded"
                />
                Hanya approved
              </label>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={exportBrief}
              >
                <Download className="w-3.5 h-3.5" />
                Export Brief
              </Button>
              {selectedProject?.shareToken ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-destructive border-destructive/40 hover:bg-destructive/5"
                  onClick={handleRevokeBrief}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Cabut Link
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={handleShareBrief}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Bagikan Link
                </Button>
              )}
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => { setTab("projects"); setQsView("team"); }}
              className={cn("text-xs px-3 py-1.5 rounded-md font-medium transition-colors",
                tab === "projects" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              <FolderOpen className="w-3 h-3 inline mr-1" />Proyek
            </button>
            <button
              onClick={() => setTab("quick_session")}
              className={cn("text-xs px-3 py-1.5 rounded-md font-medium transition-colors",
                tab === "quick_session" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              <Zap className="w-3 h-3 inline mr-1" />Sesi Cepat
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}

      {/* ══ TAB: Projects ═══════════════════════════════════════════════ */}
      {tab === "projects" && !showProjectDetail && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

            {/* Intro banner */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-5">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🦂</div>
                <div>
                  <h2 className="text-base font-bold mb-1">Campaign Project Hub</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Buat proyek kampanye, MultiClaw akan mengerjakan 4 fase secara berurutan —
                    Riset → Kreatif → Launch → Analitik. Kamu yang approve setiap deliverable sebelum lanjut ke fase berikutnya.
                  </p>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    {PHASES.map((p) => {
                      const Icon = p.icon;
                      const colors = PHASE_COLOR_MAP[p.color];
                      return (
                        <div key={p.num} className={cn("flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium", colors.bg, colors.border, colors.text)}>
                          <Icon className="w-3 h-3" /> {p.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Proyek Saya ({projects.length})</h3>
              <Button onClick={() => setShowNewProjectDialog(true)} className="gap-2 text-sm">
                <Plus className="w-4 h-4" /> Buat Proyek Baru
              </Button>
            </div>

            {/* Projects list */}
            {projectsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-xl border border-dashed p-12 text-center">
                <div className="text-4xl mb-3">🦂</div>
                <p className="font-semibold mb-1">Belum ada proyek kampanye</p>
                <p className="text-sm text-muted-foreground mb-4">Buat proyek pertamamu dan biarkan MultiClaw yang bekerja.</p>
                <Button onClick={() => setShowNewProjectDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" /> Buat Proyek Pertama
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="rounded-xl border bg-card hover:border-primary/30 transition-colors p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{project.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{project.brief}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => setDeletingProjectId(project.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Phase progress */}
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {PHASES.map((p) => {
                          const done = project.currentPhase >= p.num;
                          const colors = PHASE_COLOR_MAP[p.color];
                          return (
                            <div key={p.num} className={cn("flex-1 h-1.5 rounded-full transition-all",
                              done ? colors.dot : "bg-muted")} />
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {project.currentPhase === 0 ? "Belum dimulai" : `Fase ${project.currentPhase}/4 selesai`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(project.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <Button size="sm" className="h-7 text-xs gap-1" onClick={() => openProject(project)}>
                        <FolderOpen className="w-3 h-3" /> Buka
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ TAB: Projects → Detail ═══════════════════════════════════════ */}
      {tab === "projects" && showProjectDetail && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Phase tab nav */}
          <div className="flex-shrink-0 border-b px-4 py-2 flex items-center justify-between gap-4">
            <PhaseStepIndicator
              phases={PHASES}
              currentPhase={selectedProject!.currentPhase}
              activeTab={activePhaseTab}
              onTabChange={setActivePhaseTab}
            />
            {isPhaseGenerated(activePhaseTab) && !generatingPhase && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 flex-shrink-0"
                onClick={() => generatePhase(activePhaseTab)}
              >
                <RefreshCw className="w-3 h-3" /> Generate Ulang
              </Button>
            )}
          </div>

          {/* Phase content */}
          <div className="flex-1 overflow-y-auto">
            {projectDetailLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              (() => {
                const phase = PHASES.find((p) => p.num === activePhaseTab)!;
                const phaseDelivs = getPhaseDeliverables(activePhaseTab);
                const phaseAgents = getPhaseAgents(activePhaseTab);
                const isGenerating = generatingPhase === activePhaseTab;
                const allApproved = isPhaseAllApproved(activePhaseTab);
                const isGenerated = isPhaseGenerated(activePhaseTab);
                const colors = PHASE_COLOR_MAP[phase.color];
                const PhaseIcon = phase.icon;

                return (
                  <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">
                    {/* Phase header */}
                    <div className={cn("rounded-xl border p-4", colors.bg, colors.border)}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", colors.bg, colors.border, "border")}>
                            <PhaseIcon className={cn("w-5 h-5", colors.text)} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={cn("font-bold text-sm", colors.text)}>Fase {phase.num}: {phase.fullName}</h3>
                              {allApproved && <Badge className="text-[10px] bg-green-100 text-green-700 border-0 gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Approved</Badge>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{phase.description}</p>
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {phase.agents.map((a) => (
                                <span key={a} className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", colors.badge)}>{a}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Generate / Approve button */}
                        <div className="flex-shrink-0">
                          {!isGenerated && !isGenerating && (
                            <Button
                              onClick={() => generatePhase(activePhaseTab)}
                              className="gap-2 text-sm"
                              disabled={activePhaseTab > 1 && !isPhaseAllApproved(activePhaseTab - 1)}
                            >
                              <Sparkles className="w-4 h-4" />
                              Mulai Fase {phase.num}
                            </Button>
                          )}
                          {isGenerating && (
                            <Button disabled className="gap-2 text-sm">
                              <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                            </Button>
                          )}
                          {isGenerated && !isGenerating && !allApproved && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Review & approve semua deliverable
                            </div>
                          )}
                          {allApproved && activePhaseTab < 4 && (
                            <Button
                              onClick={() => {
                                setActivePhaseTab((activePhaseTab + 1) as ProjectDetailTab);
                              }}
                              className="gap-2 text-sm"
                            >
                              Lanjut Fase {activePhaseTab + 1} <ArrowRight className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Gate warning */}
                      {activePhaseTab > 1 && !isPhaseAllApproved(activePhaseTab - 1) && !isGenerated && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-background/60 rounded-lg p-2.5 border">
                          <XCircle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          Approve semua deliverable di Fase {activePhaseTab - 1} terlebih dahulu untuk membuka fase ini.
                        </div>
                      )}
                    </div>

                    {/* Agent sections */}
                    {(isGenerated || isGenerating) && (
                      <div className="space-y-6">
                        {phaseAgents.map((agentId) => {
                          const agentDef = OPENCLAW_AGENTS.find((a) => a.id === agentId);
                          const agentName = agentDef?.name ?? `OpenClaw-${agentId}`;
                          const agentDelivs = phaseDelivs.filter((d) => d.agentId === agentId);
                          return (
                            <AgentSection
                              key={agentId}
                              agentId={agentId}
                              agentName={agentName}
                              deliverables={agentDelivs}
                              generatingAgents={generatingAgents}
                              onStatusChange={updateDeliverableStatus}
                              onUseInTool={handleUseInTool}
                              onUpdate={(updated) => setDeliverables((prev) => prev.map((d) => d.id === updated.id ? updated : d))}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Empty state */}
                    {!isGenerated && !isGenerating && (
                      <div className="rounded-xl border border-dashed p-10 text-center">
                        <PhaseIcon className={cn("w-8 h-8 mx-auto mb-3 opacity-40", colors.text)} />
                        <p className="font-semibold text-sm mb-1">{phase.fullName} belum dimulai</p>
                        <p className="text-xs text-muted-foreground">
                          {activePhaseTab > 1 && !isPhaseAllApproved(activePhaseTab - 1)
                            ? `Selesaikan dan approve Fase ${activePhaseTab - 1} terlebih dahulu.`
                            : `Klik "Mulai Fase ${phase.num}" untuk generate deliverable.`}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* ══ TAB: Quick Session ═══════════════════════════════════════════ */}
      {tab === "quick_session" && (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-52 flex-shrink-0 border-r overflow-y-auto p-3 hidden md:block">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Tim Agen (9)</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-primary/10 border border-primary/20">
                <span className="text-base">🦂</span>
                <div>
                  <p className="text-xs font-bold text-primary">MultiClaw</p>
                  <p className="text-[10px] text-muted-foreground">Master Orchestrator</p>
                </div>
              </div>
              <div className="ml-3 border-l border-border pl-3 space-y-0.5">
                {OPENCLAW_AGENTS.map((a) => (
                  <div key={a.id} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md text-left text-xs", a.colorClass.bg)}>
                    <span className="text-xs">{a.emoji}</span>
                    <div className="min-w-0">
                      <p className={cn("text-[11px] font-semibold truncate", a.colorClass.text)}>{a.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick session main */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {qsView === "team" && (
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                  <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">🦂</div>
                      <div>
                        <h2 className="text-lg font-bold mb-1">Sesi Cepat MultiClaw</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Kirim brief, MultiClaw akan membuka rapat koordinasi dan mendelegasikan ke 9 divisi OpenClaw secara paralel —
                          menghasilkan strategi komprehensif dalam satu sesi.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border bg-card p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Kirim Brief ke MultiClaw</span>
                    </div>
                    <Textarea
                      value={qsInput}
                      onChange={(e) => setQsInput(e.target.value)}
                      placeholder="Contoh: Saya mau launch produk skincare untuk wanita 25-35 tahun dengan budget iklan Rp 10 juta/bulan..."
                      className="min-h-[100px] resize-y text-sm"
                      onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) startQs(); }}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Ctrl+Enter untuk memulai</p>
                      <Button onClick={startQs} disabled={!qsInput.trim() || qsIsLoading} className="gap-2 text-sm">
                        <Zap className="w-4 h-4" /> Buka Workroom
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {OPENCLAW_AGENTS.map((agent) => {
                      const Icon = agent.icon;
                      return (
                        <div key={agent.id} className={cn("rounded-xl border p-3 space-y-2", agent.colorClass.border, agent.colorClass.bg)}>
                          <div className="flex items-center gap-2">
                            <Icon className={cn("w-4 h-4", agent.colorClass.text)} />
                            <div>
                              <p className={cn("text-xs font-bold", agent.colorClass.text)}>{agent.emoji} {agent.name}</p>
                              <p className="text-[10px] text-muted-foreground">{agent.role}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {agent.subAgents.map((sa) => (
                              <span key={sa} className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", agent.colorClass.badge)}>{sa}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {qsView === "session" && (
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
                  <div className="flex justify-end">
                    <div className="max-w-xl rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-3 text-sm leading-relaxed shadow-sm">{qsUserBrief}</div>
                  </div>
                  {(qsMulticlawIntro || qsSessionPhase === "intro") && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg">🦂</div>
                      <div className="flex-1 rounded-2xl rounded-tl-sm border border-primary/20 bg-primary/5 px-4 py-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-primary">MultiClaw</span>
                          <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/30 text-primary">Master Orchestrator</Badge>
                          {qsSessionPhase === "intro" && qsIsLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                        </div>
                        {qsMulticlawIntro ? (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{qsMulticlawIntro}</p>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Membuka rapat koordinasi...</div>
                        )}
                      </div>
                    </div>
                  )}
                  {(qsSessionPhase === "agents" || qsSessionPhase === "synthesis" || qsSessionPhase === "done") && (
                    <div className="flex items-center gap-3 px-1">
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="flex-1 flex items-center gap-1">
                        {OPENCLAW_AGENTS.map((a) => {
                          const s = qsAgentStates[a.id]?.status ?? "idle";
                          return (
                            <div key={a.id} title={a.name} className={cn("flex-1 h-1.5 rounded-full transition-all duration-500",
                              s === "idle" && "bg-muted", s === "active" && "bg-primary animate-pulse",
                              s === "done" && "bg-green-500", s === "error" && "bg-destructive")} />
                          );
                        })}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{qsDoneCount}/9</span>
                    </div>
                  )}
                  {(qsSessionPhase === "agents" || qsSessionPhase === "synthesis" || qsSessionPhase === "done") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {OPENCLAW_AGENTS.map((agent) => (
                        <QuickAgentCard key={agent.id} agent={agent} state={qsAgentStates[agent.id] ?? { status: "idle", report: "" }} />
                      ))}
                    </div>
                  )}
                  {(qsMulticlawSynthesis || qsSessionPhase === "synthesis") && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg">🦂</div>
                      <div className="flex-1 rounded-2xl rounded-tl-sm border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-primary">MultiClaw — Sintesis Final</span>
                          <Badge className="text-[9px] px-1.5 py-0 bg-primary/20 text-primary border-0">Master Action Plan</Badge>
                          {qsSessionPhase === "synthesis" && qsIsLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                        </div>
                        {qsMulticlawSynthesis
                          ? <div className="text-sm leading-relaxed whitespace-pre-wrap">{qsMulticlawSynthesis}</div>
                          : <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Mensintesis laporan...</div>}
                      </div>
                    </div>
                  )}
                  <div className="h-4" />
                </div>
              </div>
            )}

            {/* Quick session input */}
            <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur px-4 py-3">
              <div className="max-w-5xl mx-auto flex gap-2 items-end">
                {qsView === "session" && (
                  <Button variant="outline" size="icon" className="flex-shrink-0 h-[44px] w-[44px]" onClick={() => { resetQs(); setQsView("team"); }}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
                <Textarea
                  value={qsInput}
                  onChange={(e) => setQsInput(e.target.value)}
                  placeholder="Kirim brief ke MultiClaw… (Ctrl+Enter)"
                  className="min-h-[44px] max-h-32 resize-none text-sm"
                  rows={1}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) startQs(); }}
                />
                <Button onClick={startQs} disabled={!qsInput.trim() || qsIsLoading} size="icon" className="flex-shrink-0 h-[44px] w-[44px]">
                  {qsIsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New Project Dialog ──────────────────────────────────────────── */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">🦂</span> Buat Proyek Kampanye Baru
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Nama Proyek</label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Contoh: Launch Skincare Q3 2026"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Brief Kampanye</label>
              <Textarea
                value={newProjectBrief}
                onChange={(e) => setNewProjectBrief(e.target.value)}
                placeholder="Ceritakan detail kampanye: produk, target audience, budget, tujuan, timeline, tantangan utama..."
                className="min-h-[120px] resize-none text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Semakin detail brief kamu, semakin konkret deliverable yang akan dihasilkan MultiClaw.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>Batal</Button>
            <Button
              onClick={createProject}
              disabled={!newProjectName.trim() || !newProjectBrief.trim() || creatingProject}
              className="gap-2"
            >
              {creatingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              Buat & Mulai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ───────────────────────────────────────── */}
      <Dialog open={deletingProjectId !== null} onOpenChange={() => setDeletingProjectId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Proyek?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Semua deliverable di proyek ini akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingProjectId(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => deletingProjectId && deleteProject(deletingProjectId)}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
