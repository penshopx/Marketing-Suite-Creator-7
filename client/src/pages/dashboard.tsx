import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  MessageSquare, Image, FileText, Volume2, Megaphone,
  BookOpen, Sparkles, ArrowRight, TrendingUp, Users,
  Target, BarChart3, Trophy, Rocket, Zap, Globe,
  Calendar, Package, GraduationCap, Play, Mic,
  Palette, Video, BookMarked, Search, ChevronRight,
  LayoutDashboard, Star, CheckCircle2, Link2,
  Layers, Send, Bot, Map, Repeat2, FlaskConical,
  Clapperboard, Hash, BarChart2, GitBranch,
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useAuth } from "@/hooks/use-auth";
import { useMarketingContext } from "@/hooks/use-marketing-context";
import { useCampaignStore } from "@/hooks/use-campaign-store";

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Riset & Targeting",
    desc: "Temukan audience & interest tersembunyi",
    icon: Target,
    color: "from-blue-500 to-blue-600",
    tools: [
      { label: "Interest Finder AI", href: "/interest-finder" },
      { label: "Audience Overlap", href: "/audience-overlap" },
      { label: "Campaign Wizard", href: "/campaign-wizard" },
      { label: "Audience Builder", href: "/audience-builder" },
    ],
  },
  {
    step: 2,
    title: "Konten & Creative",
    desc: "Buat copy, gambar, dan materi iklan",
    icon: Sparkles,
    color: "from-purple-500 to-purple-600",
    tools: [
      { label: "Ad Creator", href: "/ad-creator" },
      { label: "Story Telling", href: "/story-telling" },
      { label: "Image Creator", href: "/ai-images" },
      { label: "LP HTML Builder", href: "/lp-html-generator" },
    ],
  },
  {
    step: 3,
    title: "Sistem Sales",
    desc: "Follow-up, CS Bot & journey customer",
    icon: Send,
    color: "from-green-500 to-green-600",
    tools: [
      { label: "WA Broadcast Sequence", href: "/wa-broadcast" },
      { label: "CS Bot Script Builder", href: "/cs-bot-script" },
      { label: "Customer Journey Map", href: "/customer-journey" },
      { label: "CS Closing Script", href: "/cs-closing" },
    ],
  },
  {
    step: 4,
    title: "Analisa & Scale",
    desc: "Ukur hasil, otomasi, dan optimalkan",
    icon: BarChart3,
    color: "from-orange-500 to-orange-600",
    tools: [
      { label: "Ad Analyzer", href: "/campaign-analyzer" },
      { label: "Auto Rule Builder", href: "/auto-rule" },
      { label: "Laporan Kampanye", href: "/campaign-report" },
      { label: "Profit Lab", href: "/profit-lab" },
    ],
  },
];

const ALL_TOOLS = [
  {
    category: "Winning Campaign",
    emoji: "🏆",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200/60 dark:border-blue-800/60",
    items: [
      { title: "Roadmap Winning", desc: "Peta jalan kampanye winning", href: "/winning-dashboard", icon: Trophy, badge: "Mulai di sini", badgeColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
      { title: "Interest Finder AI", desc: "80+ hidden interest FB/IG per niche", href: "/interest-finder", icon: Search, badge: "Adsumo", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
      { title: "Audience Overlap", desc: "Analisis overlap interest & struktur adset", href: "/audience-overlap", icon: Layers, badge: "Adsumo", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
      { title: "Campaign Wizard", desc: "5 langkah bangun strategi kampanye", href: "/campaign-wizard", icon: Target, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Audience Builder", desc: "Buat buyer persona detail dengan AI", href: "/audience-builder", icon: Users, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Ad Analyzer", desc: "Scoring dan analisis copy iklan", href: "/campaign-analyzer", icon: BarChart3, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Laporan Kampanye", desc: "AI report performa + share WA", href: "/campaign-report", icon: BarChart2, badge: null, badgeColor: "" },
      { title: "Panduan Praktis", desc: "8 prinsip iklan yang efektif", href: "/winning-guide", icon: GraduationCap, badge: null, badgeColor: "" },
      { title: "Sistem 14 Hari", desc: "Tracker harian dari riset ke penjualan", href: "/execution-plan", icon: Calendar, badge: "Interaktif", badgeColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
      { title: "Simulasi Beriklan", desc: "Latihan iklan tanpa biaya nyata", href: "/ad-simulation", icon: Play, badge: null, badgeColor: "" },
    ],
  },
  {
    category: "Sistem Sales",
    emoji: "💬",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200/60 dark:border-green-800/60",
    items: [
      { title: "WA Broadcast Sequence", desc: "Sequence follow-up 7–30 hari per segmen", href: "/wa-broadcast", icon: Send, badge: "Cekat.AI", badgeColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
      { title: "CS Bot Script Builder", desc: "Knowledge base Q&A + alur percakapan CS", href: "/cs-bot-script", icon: Bot, badge: "Cekat.AI", badgeColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
      { title: "Customer Journey Map", desc: "Petakan perjalanan customer 6 tahap", href: "/customer-journey", icon: Map, badge: "Cekat.AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "CS Closing Script", desc: "Script closing sales WhatsApp", href: "/cs-closing", icon: MessageSquare, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Funnel Planner", desc: "Rancang funnel marketing lengkap", href: "/funnel-planner", icon: GitBranch, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Ad Scale Advisor", desc: "Rekomendasi kapan scale budget iklan", href: "/ad-scale-advisor", icon: TrendingUp, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
    ],
  },
  {
    category: "Otomasi AI",
    emoji: "⚡",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    borderColor: "border-purple-200/60 dark:border-purple-800/60",
    items: [
      { title: "Auto Rule Builder", desc: "5 aturan otomatis Meta Ads Manager", href: "/auto-rule", icon: Zap, badge: "Adsumo", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
      { title: "Campaign Launcher", desc: "Workflow otomatis launch campaign", href: "/campaign-launcher", icon: Rocket, badge: null, badgeColor: "" },
      { title: "Content Repurposer", desc: "Transform konten ke berbagai format", href: "/content-repurposer", icon: Repeat2, badge: null, badgeColor: "" },
      { title: "Profit Lab", desc: "Analisis profit dan proyeksi keuangan", href: "/profit-lab", icon: FlaskConical, badge: null, badgeColor: "" },
      { title: "Video Script", desc: "Script video marketing berkualitas", href: "/video-script", icon: Clapperboard, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Hashtag Generator", desc: "Hashtag optimal untuk semua platform", href: "/hashtag-generator", icon: Hash, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
    ],
  },
  {
    category: "AI Creator",
    emoji: "✨",
    bgColor: "bg-pink-50 dark:bg-pink-950",
    borderColor: "border-pink-200/60 dark:border-pink-800/60",
    items: [
      { title: "Ad Creator", desc: "Generate copy iklan semua platform", href: "/ad-creator", icon: Megaphone, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "LP HTML Builder", desc: "Landing page HTML siap deploy", href: "/lp-html-generator", icon: Globe, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Story Telling", desc: "Narasi promosi yang engaging", href: "/story-telling", icon: BookOpen, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Image Creator", desc: "Generate gambar marketing dengan AI", href: "/ai-images", icon: Image, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Article Creator", desc: "Artikel SEO-optimized otomatis", href: "/ai-articles", icon: FileText, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Banner Creator", desc: "Desain banner dan visual promosi", href: "/ai-banners", icon: Palette, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Video Creator", desc: "Script dan konsep video marketing", href: "/ai-video", icon: Video, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Landing Page", desc: "Generator halaman penjualan", href: "/landing-page", icon: Globe, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
    ],
  },
  {
    category: "Produk Digital & Monetisasi",
    emoji: "💰",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    borderColor: "border-emerald-200/60 dark:border-emerald-800/60",
    items: [
      { title: "Katalog Produk Digital", desc: "Copywriting, platform jual, kalkulator profit", href: "/digital-products", icon: Package, badge: "Lengkap", badgeColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
      { title: "Riset Produk Digital", desc: "Riset niche produk digital terbaik", href: "/product-research", icon: Search, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "TikTok Ads", desc: "Strategi & formula konten TikTok", href: "/tiktok-ads", icon: SiTiktok, badge: "Viral", badgeColor: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
      { title: "Meta Ads Advanced", desc: "Facebook & Instagram Ads dari setup ke scale", href: "/meta-ads", icon: BarChart3, badge: "Advanced", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
      { title: "Affiliate Content", desc: "6 template + kalender 30 hari + kalkulator", href: "/affiliate-content", icon: Link2, badge: "Sistem", badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
    ],
  },
  {
    category: "AI Assistant & Template",
    emoji: "🤖",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    borderColor: "border-orange-200/60 dark:border-orange-800/60",
    items: [
      { title: "AI Chat", desc: "Konsultasi marketing general dengan AI", href: "/ai-chat", icon: MessageSquare, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "AI Expert Chat", desc: "Pilih persona expert: SEO, Copywriting, dll", href: "/ai-expert", icon: Sparkles, badge: "AI", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
      { title: "Prompt Framework", desc: "15 prompt + RISEN builder + cheat sheet", href: "/prompt-framework", icon: Zap, badge: "15 Prompts", badgeColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
      { title: "AI Templates", desc: "Library template marketing siap pakai", href: "/ai-templates", icon: BookMarked, badge: null, badgeColor: "" },
      { title: "Text to Speech", desc: "Konversi teks ke suara untuk voiceover", href: "/ai-tts", icon: Volume2, badge: null, badgeColor: "" },
      { title: "Speech to Text", desc: "Transkripsi audio ke teks otomatis", href: "/ai-stt", icon: Mic, badge: null, badgeColor: "" },
    ],
  },
];

const BEGINNER_PATH = [
  { step: 1, label: "Baca Roadmap", href: "/winning-dashboard", desc: "Pahami gambaran besarnya dulu" },
  { step: 2, label: "Ikuti Sistem 14 Hari", href: "/execution-plan", desc: "Panduan harian dari nol ke penjualan" },
  { step: 3, label: "Bangun Audience Persona", href: "/audience-builder", desc: "Kenali siapa yang akan membeli" },
  { step: 4, label: "Buat Konten Pertama", href: "/ad-creator", desc: "Generate copy iklan untuk platform kamu" },
];

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const { context } = useMarketingContext();
  const { campaign, isActive } = useCampaignStore();

  const userName = user?.firstName || "Marketer";
  const planProgress = (context.daysCompleted / 14) * 100;

  const filteredCategories = ALL_TOOLS.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Halo, {userName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Marketing Tools AI — semua yang kamu butuhkan untuk jual produk digital
            </p>
          </div>
          <Button asChild data-testid="button-start-plan">
            <Link href="/execution-plan">
              <Calendar className="mr-2 h-4 w-4" />
              Sistem 14 Hari
            </Link>
          </Button>
        </div>

        {/* Campaign Store Widget */}
        {isActive && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Layers className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-green-700 dark:text-green-400">
                      Sinkronisasi Aktif — {campaign?.produk || "Campaign"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.usedTools.length} tool digunakan · {campaign?.niche ? `Niche: ${campaign.niche}` : ""}{campaign?.target ? ` · Target: ${campaign.target}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button asChild size="sm" variant="outline" className="text-xs border-green-500/30 hover:bg-green-500/10" data-testid="button-continue-interest-finder">
                    <Link href="/interest-finder">Interest Finder →</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="text-xs border-green-500/30 hover:bg-green-500/10" data-testid="button-continue-wa-broadcast">
                    <Link href="/wa-broadcast">WA Broadcast →</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Execution Plan Progress */}
        {context.daysCompleted > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Sistem 14 Hari — Sedang Berjalan</p>
                    <p className="text-xs text-muted-foreground">
                      {context.daysCompleted} dari 14 hari selesai · {context.completedTasksCount} total task
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <Progress value={planProgress} className="flex-1 h-2" />
                  <span className="text-sm font-bold text-primary">{Math.round(planProgress)}%</span>
                  <Button asChild size="sm" variant="outline" data-testid="button-continue-plan">
                    <Link href="/execution-plan">Lanjut →</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflow Journey */}
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            Alur Kerja Marketing yang Terintegrasi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {WORKFLOW_STEPS.map((ws, i) => (
              <Card key={i} className="relative overflow-hidden group hover:shadow-md transition-all">
                <div className={`h-1.5 w-full bg-gradient-to-r ${ws.color}`} />
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${ws.color} text-white flex-shrink-0`}>
                      <ws.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground font-medium">Step {ws.step}</span>
                      </div>
                      <p className="font-semibold text-sm">{ws.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ws.desc}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {ws.tools.map((t, ti) => (
                      <Link key={ti} href={t.href}>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-0.5 cursor-pointer" data-testid={`link-workflow-${i}-${ti}`}>
                          <ChevronRight className="h-3 w-3 flex-shrink-0" />
                          {t.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Untuk Pemula Banner */}
        {context.daysCompleted === 0 && (
          <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-yellow-500/20">
            <CardContent className="py-4">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">Baru mulai? Ikuti jalur ini:</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {BEGINNER_PATH.map((p, i) => (
                      <Link key={i} href={p.href}>
                        <div className="flex items-center gap-1.5 text-xs bg-background border rounded-full px-3 py-1.5 hover:border-primary/50 transition-colors cursor-pointer" data-testid={`link-beginner-${i}`}>
                          <span className="font-bold text-primary">{p.step}.</span>
                          <span>{p.label}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search + All Tools */}
        <div>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-primary" />
              Semua Tools ({ALL_TOOLS.reduce((s, c) => s + c.items.length, 0)} fitur)
            </h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari fitur..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 text-sm"
                data-testid="input-search-tools"
              />
            </div>
          </div>

          <div className="space-y-5">
            {filteredCategories.map((cat, ci) => (
              <div key={ci}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{cat.emoji}</span>
                  <h3 className="font-semibold text-sm text-muted-foreground">{cat.category}</h3>
                  <Badge variant="outline" className="text-xs">{cat.items.length} tools</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {cat.items.map((tool, ti) => (
                    <Link key={ti} href={tool.href}>
                      <Card className={`h-full cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all group ${cat.borderColor}`} data-testid={`card-tool-${ci}-${ti}`}>
                        <CardContent className="pt-3 pb-3 px-3">
                          <div className="flex items-start gap-2.5">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-md ${cat.bgColor} flex-shrink-0`}>
                              <tool.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 flex-wrap">
                                <p className="text-xs font-semibold group-hover:text-primary transition-colors leading-tight">{tool.title}</p>
                                {tool.badge && (
                                  <Badge className={`text-xs px-1 py-0 ${tool.badgeColor}`} variant="secondary">
                                    {tool.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">{tool.desc}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Performance (tetap ada) */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Platform Iklan — ROI Potensial
              </CardTitle>
              <CardDescription className="text-xs">Estimasi performa berdasarkan benchmark industri Indonesia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Meta Ads (FB + IG)", value: 85, href: "/meta-ads", color: "bg-blue-500" },
                  { name: "TikTok Ads", value: 78, href: "/tiktok-ads", color: "bg-pink-500" },
                  { name: "Google Ads", value: 72, href: "/ad-creator", color: "bg-green-500" },
                  { name: "Organic (Konten)", value: 65, href: "/affiliate-content", color: "bg-orange-500" },
                ].map((p, i) => (
                  <Link key={i} href={p.href}>
                    <div className="flex items-center gap-3 group cursor-pointer py-1">
                      <span className="text-xs w-32 text-muted-foreground group-hover:text-primary transition-colors">{p.name}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${p.color} transition-all`} style={{ width: `${p.value}%` }} />
                      </div>
                      <span className="text-xs font-bold w-8 text-right">{p.value}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Status Fitur
              </CardTitle>
              <CardDescription className="text-xs">Ringkasan semua tools yang tersedia untukmu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {[
                  { cat: "Strategi & Riset", count: 7, active: true, href: "/winning-dashboard", color: "bg-blue-500" },
                  { cat: "AI Creator", count: 7, active: true, href: "/ad-creator", color: "bg-purple-500" },
                  { cat: "Produk Digital & Monetisasi", count: 4, active: true, href: "/digital-products", color: "bg-green-500" },
                  { cat: "AI Assistant & Template", count: 6, active: true, href: "/ai-chat", color: "bg-orange-500" },
                ].map((s, i) => (
                  <Link key={i} href={s.href}>
                    <div className="flex items-center gap-3 cursor-pointer group py-0.5">
                      <div className={`h-2 w-2 rounded-full ${s.color} flex-shrink-0`} />
                      <span className="text-xs flex-1 group-hover:text-primary transition-colors">{s.cat}</span>
                      <Badge variant="secondary" className="text-xs">{s.count} tools</Badge>
                      <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Aktif</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer quick links */}
        <div className="flex flex-wrap gap-2 justify-center pb-4">
          {[
            { label: "Panduan Fitur", href: "/guide-chatbot" },
            { label: "Prompt Framework", href: "/prompt-framework" },
            { label: "AI Templates", href: "/ai-templates" },
            { label: "Ad Analyzer", href: "/campaign-analyzer" },
          ].map((l, i) => (
            <Link key={i} href={l.href}>
              <Button variant="ghost" size="sm" className="text-xs" data-testid={`button-footer-link-${i}`}>
                {l.label} <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
