import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { streamSSE } from "@/lib/stream-sse";
import {
  Search, Target, Palette, Radio, BarChart3, Users, FileText,
  ChevronDown, ChevronRight, Send, Sparkles, Zap, CheckCircle2,
  Loader2, RefreshCw, Bot, Network, Crown,
} from "lucide-react";

// ─── Agent definitions ────────────────────────────────────────────────────────

const OPENCLAW_AGENTS = [
  {
    id: "research",
    name: "OpenClaw-Research",
    role: "Riset & Intelijen Pasar",
    icon: Search,
    color: "blue",
    colorClass: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-600 dark:text-blue-400",
      dot: "bg-blue-500",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
      header: "from-blue-500/20 to-blue-500/5",
    },
    subAgents: ["Audience Analyst", "Competitor Scout", "Trend Watcher", "Keyword Hunter"],
    emoji: "🔬",
  },
  {
    id: "strategy",
    name: "OpenClaw-Strategy",
    role: "Strategi Marketing",
    icon: Target,
    color: "violet",
    colorClass: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/30",
      text: "text-violet-600 dark:text-violet-400",
      dot: "bg-violet-500",
      badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
      header: "from-violet-500/20 to-violet-500/5",
    },
    subAgents: ["Campaign Strategist", "Funnel Architect", "Budget Optimizer", "A/B Test Designer"],
    emoji: "🎯",
  },
  {
    id: "creative",
    name: "OpenClaw-Creative",
    role: "Kreasi Konten & Iklan",
    icon: Palette,
    color: "pink",
    colorClass: {
      bg: "bg-pink-500/10",
      border: "border-pink-500/30",
      text: "text-pink-600 dark:text-pink-400",
      dot: "bg-pink-500",
      badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
      header: "from-pink-500/20 to-pink-500/5",
    },
    subAgents: ["Copywriter Pro", "Visual Director", "Video Scripter", "Hook Specialist"],
    emoji: "🎨",
  },
  {
    id: "media",
    name: "OpenClaw-Media",
    role: "Media Planning & Buying",
    icon: Radio,
    color: "orange",
    colorClass: {
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      text: "text-orange-600 dark:text-orange-400",
      dot: "bg-orange-500",
      badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
      header: "from-orange-500/20 to-orange-500/5",
    },
    subAgents: ["Meta Ads Specialist", "Google Ads Expert", "TikTok Strategist", "Influencer Coordinator"],
    emoji: "📡",
  },
  {
    id: "analytics",
    name: "OpenClaw-Analytics",
    role: "Analitik & Performa",
    icon: BarChart3,
    color: "green",
    colorClass: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-600 dark:text-green-400",
      dot: "bg-green-500",
      badge: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
      header: "from-green-500/20 to-green-500/5",
    },
    subAgents: ["Data Scientist", "ROI Tracker", "Conversion Analyst", "Reporting Specialist"],
    emoji: "📊",
  },
  {
    id: "crm",
    name: "OpenClaw-CRM",
    role: "Customer Relationship",
    icon: Users,
    color: "teal",
    colorClass: {
      bg: "bg-teal-500/10",
      border: "border-teal-500/30",
      text: "text-teal-600 dark:text-teal-400",
      dot: "bg-teal-500",
      badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
      header: "from-teal-500/20 to-teal-500/5",
    },
    subAgents: ["Retention Specialist", "Email Marketer", "Community Manager", "Loyalty Designer"],
    emoji: "🤝",
  },
  {
    id: "content",
    name: "OpenClaw-Content",
    role: "SEO & Konten Organik",
    icon: FileText,
    color: "amber",
    colorClass: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      header: "from-amber-500/20 to-amber-500/5",
    },
    subAgents: ["SEO Specialist", "Blog Writer", "Social Media Manager", "Content Planner"],
    emoji: "📝",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentStatus = "idle" | "active" | "done" | "error";
type SessionPhase = "idle" | "intro" | "agents" | "synthesis" | "done";

interface AgentState {
  status: AgentStatus;
  report: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusDot({ status }: { status: AgentStatus }) {
  if (status === "idle") return <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/30" />;
  if (status === "active") return (
    <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
  );
  if (status === "done") return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
  return <span className="inline-block w-2 h-2 rounded-full bg-destructive" />;
}

function TeamTreeView() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-1">
      {/* MultiClaw root */}
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-primary/10 border border-primary/20">
        <span className="text-base">🦂</span>
        <div>
          <p className="text-xs font-bold text-primary">MultiClaw</p>
          <p className="text-[10px] text-muted-foreground">Master Orchestrator</p>
        </div>
      </div>
      <div className="ml-3 border-l border-border pl-3 space-y-1">
        {OPENCLAW_AGENTS.map((agent) => (
          <div key={agent.id}>
            <button
              onClick={() => toggle(agent.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1 rounded-md text-left transition-colors hover:bg-accent",
                agent.colorClass.bg
              )}
            >
              {expanded[agent.id]
                ? <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                : <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
              <span className="text-xs">{agent.emoji}</span>
              <div className="min-w-0">
                <p className={cn("text-[11px] font-semibold truncate", agent.colorClass.text)}>
                  {agent.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{agent.role}</p>
              </div>
            </button>
            {expanded[agent.id] && (
              <div className="ml-5 border-l border-border pl-2 mt-0.5 space-y-0.5">
                {agent.subAgents.map((sa) => (
                  <div key={sa} className="flex items-center gap-1.5 py-0.5">
                    <Bot className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground">{sa}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  state,
}: {
  agent: typeof OPENCLAW_AGENTS[0];
  state: AgentState;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = agent.icon;

  // Auto-expand when reporting starts
  useEffect(() => {
    if (state.status === "active") setExpanded(true);
  }, [state.status]);

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-300",
        agent.colorClass.border,
        agent.colorClass.bg,
        state.status === "active" && "shadow-md ring-1 ring-inset ring-primary/20",
      )}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(p => !p)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5 rounded-t-xl bg-gradient-to-r",
          agent.colorClass.header,
        )}
      >
        <Icon className={cn("w-4 h-4 flex-shrink-0", agent.colorClass.text)} />
        <div className="flex-1 min-w-0 text-left">
          <p className={cn("text-xs font-bold truncate", agent.colorClass.text)}>
            {agent.emoji} {agent.name}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">{agent.role}</p>
        </div>
        <StatusDot status={state.status} />
        {expanded
          ? <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          : <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
      </button>

      {/* Sub-agents row */}
      {!expanded && (
        <div className="px-3 py-1.5 flex flex-wrap gap-1">
          {agent.subAgents.map((sa) => (
            <span
              key={sa}
              className={cn(
                "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
                agent.colorClass.badge
              )}
            >
              {sa}
            </span>
          ))}
        </div>
      )}

      {/* Report content */}
      {expanded && (
        <div className="px-3 pb-3">
          {state.status === "idle" && (
            <p className="text-xs text-muted-foreground italic py-2">
              Menunggu instruksi dari MultiClaw...
            </p>
          )}
          {state.status === "active" && state.report === "" && (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Menganalisis brief...</span>
            </div>
          )}
          {(state.status === "active" || state.status === "done") && state.report && (
            <ScrollArea className="max-h-60 mt-1">
              <div className="text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap pr-2">
                {state.report}
              </div>
            </ScrollArea>
          )}
          {state.status === "error" && (
            <p className="text-xs text-destructive py-2">⚠ Agen mengalami error.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Workroom() {
  const [view, setView] = useState<"team" | "session">("team");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>("idle");
  const [userBrief, setUserBrief] = useState("");
  const [multiclawIntro, setMulticlawIntro] = useState("");
  const [multiclawSynthesis, setMulticlawSynthesis] = useState("");
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>(
    Object.fromEntries(OPENCLAW_AGENTS.map((a) => [a.id, { status: "idle", report: "" }]))
  );

  const synthRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);

  // Scroll synthesis into view when it starts
  useEffect(() => {
    if (sessionPhase === "synthesis" && synthRef.current) {
      synthRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [sessionPhase]);

  const resetSession = () => {
    setSessionPhase("idle");
    setUserBrief("");
    setMulticlawIntro("");
    setMulticlawSynthesis("");
    setAgentStates(
      Object.fromEntries(OPENCLAW_AGENTS.map((a) => [a.id, { status: "idle", report: "" }]))
    );
  };

  const startSession = async () => {
    const brief = input.trim();
    if (!brief || isLoading) return;

    resetSession();
    setView("session");
    setInput("");
    setIsLoading(true);
    setUserBrief(brief);
    setSessionPhase("intro");

    try {
      await streamSSE("/api/workroom/session", { message: brief }, (data) => {
        if (data.done) {
          setSessionPhase("done");
          return;
        }
        if (data.error) {
          setSessionPhase("done");
          return;
        }

        if (data.agent === "multiclaw") {
          if (data.phase === "intro") {
            setMulticlawIntro((p) => p + (data.content as string));
          } else if (data.phase === "synthesis") {
            setSessionPhase("synthesis");
            setMulticlawSynthesis((p) => p + (data.content as string));
          }
        } else {
          const agentId = data.agent as string;
          if (data.phase === "report") {
            setSessionPhase("agents");
            setAgentStates((prev) => ({
              ...prev,
              [agentId]: {
                status: "active",
                report: (prev[agentId]?.report ?? "") + (data.content as string),
              },
            }));
          } else if (data.phase === "done") {
            setAgentStates((prev) => ({
              ...prev,
              [agentId]: { ...prev[agentId], status: "done" },
            }));
          } else if (data.phase === "error") {
            setAgentStates((prev) => ({
              ...prev,
              [agentId]: { ...prev[agentId], status: "error" },
            }));
          }
        }
      });
    } catch {
      setSessionPhase("done");
    } finally {
      setIsLoading(false);
    }
  };

  const doneCount = Object.values(agentStates).filter((s) => s.status === "done").length;
  const activeCount = Object.values(agentStates).filter((s) => s.status === "active").length;

  return (
    <div className="flex flex-col h-full bg-background">

      {/* ── Command Header ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b bg-gradient-to-r from-primary/10 via-background to-background px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md text-xl">
              🦂
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold">MultiClaw Workroom</h1>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                  AI Team
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                1 Master Orchestrator · 7 OpenClaw · 28 Sub-agen Spesialis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Phase indicator */}
            {isLoading && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                {sessionPhase === "intro" && "MultiClaw membuka rapat..."}
                {sessionPhase === "agents" && `${activeCount > 0 ? `${activeCount} agen aktif` : `${doneCount}/7 agen selesai`}`}
                {sessionPhase === "synthesis" && "MultiClaw mensintesis..."}
              </div>
            )}
            {sessionPhase === "done" && (
              <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0 gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Selesai
              </Badge>
            )}

            {view === "session" && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => { resetSession(); setView("team"); }}
              >
                <RefreshCw className="w-3 h-3" />
                Tim Baru
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar: team tree */}
        <div className="w-52 flex-shrink-0 border-r overflow-y-auto p-3 hidden md:block">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            Struktur Tim
          </p>
          <TeamTreeView />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── TEAM VIEW (before session) ──────────────────────────── */}
          {view === "team" && (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

                {/* Welcome banner */}
                <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🦂</div>
                    <div>
                      <h2 className="text-lg font-bold mb-1">Selamat datang di MultiClaw Workroom</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Tim monitoring marketing agentic AI terlengkap. Ceritakan tantangan marketing kamu,
                        MultiClaw akan membuka rapat koordinasi dan mendelegasikan ke 7 divisi OpenClaw yang
                        bekerja secara paralel — menghasilkan strategi marketing komprehensif dari riset
                        hingga analitik dalam satu sesi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input area */}
                <div className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Kirim Brief ke MultiClaw</span>
                  </div>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Contoh: Saya mau launch produk skincare untuk wanita 25-35 tahun dengan budget iklan Rp 10 juta/bulan. Bagaimana strategi terbaik untuk mendapatkan 500 customer pertama dalam 30 hari?"
                    className="min-h-[100px] resize-y text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) startSession();
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Ctrl+Enter untuk memulai · Semua 7 divisi akan aktif secara paralel</p>
                    <Button
                      onClick={startSession}
                      disabled={!input.trim() || isLoading}
                      className="gap-2 text-sm"
                    >
                      <Zap className="w-4 h-4" />
                      Buka Workroom
                    </Button>
                  </div>
                </div>

                {/* OpenClaw agent grid */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Network className="w-4 h-4 text-primary" />
                    7 Divisi OpenClaw — 28 Sub-agen Aktif
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {OPENCLAW_AGENTS.map((agent) => {
                      const Icon = agent.icon;
                      return (
                        <div
                          key={agent.id}
                          className={cn(
                            "rounded-xl border p-3 space-y-2",
                            agent.colorClass.border,
                            agent.colorClass.bg,
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={cn("w-4 h-4", agent.colorClass.text)} />
                            <div>
                              <p className={cn("text-xs font-bold", agent.colorClass.text)}>
                                {agent.emoji} {agent.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{agent.role}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {agent.subAgents.map((sa) => (
                              <span
                                key={sa}
                                className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", agent.colorClass.badge)}
                              >
                                {sa}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SESSION VIEW ────────────────────────────────────────── */}
          {view === "session" && (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">

                {/* User brief bubble */}
                <div className="flex justify-end">
                  <div className="max-w-xl rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-3 text-sm leading-relaxed shadow-sm">
                    {userBrief}
                  </div>
                </div>

                {/* MultiClaw intro */}
                {(multiclawIntro || sessionPhase === "intro") && (
                  <div className="flex gap-3" ref={introRef}>
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg">
                      🦂
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-sm border border-primary/20 bg-primary/5 px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-primary">MultiClaw</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/30 text-primary">
                          Master Orchestrator
                        </Badge>
                        {sessionPhase === "intro" && isLoading && (
                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        )}
                      </div>
                      {multiclawIntro ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{multiclawIntro}</p>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Membuka rapat koordinasi...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress bar for agents */}
                {(sessionPhase === "agents" || sessionPhase === "synthesis" || sessionPhase === "done") && (
                  <div className="flex items-center gap-3 px-1">
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 flex items-center gap-1">
                      {OPENCLAW_AGENTS.map((a) => {
                        const s = agentStates[a.id]?.status ?? "idle";
                        return (
                          <div
                            key={a.id}
                            title={a.name}
                            className={cn(
                              "flex-1 h-1.5 rounded-full transition-all duration-500",
                              s === "idle" && "bg-muted",
                              s === "active" && "bg-primary animate-pulse",
                              s === "done" && "bg-green-500",
                              s === "error" && "bg-destructive",
                            )}
                          />
                        );
                      })}
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {doneCount}/7 divisi
                    </span>
                  </div>
                )}

                {/* OpenClaw agent cards grid */}
                {(sessionPhase === "agents" || sessionPhase === "synthesis" || sessionPhase === "done") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {OPENCLAW_AGENTS.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        state={agentStates[agent.id] ?? { status: "idle", report: "" }}
                      />
                    ))}
                  </div>
                )}

                {/* MultiClaw synthesis */}
                {(multiclawSynthesis || sessionPhase === "synthesis") && (
                  <div className="flex gap-3" ref={synthRef}>
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg">
                      🦂
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-sm border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-primary">MultiClaw — Sintesis Final</span>
                        <Badge className="text-[9px] px-1.5 py-0 bg-primary/20 text-primary border-0">
                          Master Action Plan
                        </Badge>
                        {sessionPhase === "synthesis" && isLoading && (
                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        )}
                      </div>
                      {multiclawSynthesis ? (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{multiclawSynthesis}</div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Mensintesis laporan dari semua divisi...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom spacer */}
                <div className="h-4" />
              </div>
            </div>
          )}

          {/* ── Input area (visible in session view) ───────────────── */}
          {view === "session" && (
            <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur px-4 py-3">
              <div className="max-w-5xl mx-auto flex gap-2 items-end">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Kirim brief baru atau pertanyaan ke MultiClaw… (Ctrl+Enter)"
                  className="min-h-[44px] max-h-32 resize-none text-sm"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) startSession();
                  }}
                />
                <Button
                  onClick={startSession}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="flex-shrink-0 h-[44px] w-[44px]"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
