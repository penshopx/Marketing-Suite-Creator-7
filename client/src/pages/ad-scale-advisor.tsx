import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp, Loader2, Copy, Sparkles, ChevronRight,
  AlertTriangle, XCircle, ArrowUpCircle, Settings,
  BarChart2, DollarSign, RefreshCw, Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const platforms = [
  { id: "meta", label: "Meta Ads (FB/IG)" },
  { id: "tiktok", label: "TikTok Ads" },
  { id: "google", label: "Google Ads" },
];

const adObjectives = [
  "Konversi / Pembelian",
  "Leads / Prospek",
  "Traffic Website",
  "Brand Awareness",
  "Engagement",
  "Install Aplikasi",
];

const campaignStatuses = [
  { id: "learning", label: "🔵 Masih Learning Phase" },
  { id: "active_stable", label: "🟢 Aktif & Stabil" },
  { id: "declining", label: "🟡 Performa Menurun" },
  { id: "winning", label: "🏆 Winning (ROAS Tinggi)" },
  { id: "new", label: "🆕 Baru Diluncurkan" },
];

type Recommendation = "scale_up" | "scale_out" | "optimize" | "kill" | "wait";

const recommendationConfig: Record<Recommendation, { label: string; color: string; bgColor: string; icon: React.ElementType; desc: string }> = {
  scale_up: {
    label: "Scale Up",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
    icon: ArrowUpCircle,
    desc: "Naikkan budget campaign yang sudah winning",
  },
  scale_out: {
    label: "Scale Out",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    icon: TrendingUp,
    desc: "Duplikasi ad set ke audience/creative baru",
  },
  optimize: {
    label: "Optimasi",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
    icon: Settings,
    desc: "Perbaiki creative/audience/bid sebelum scale",
  },
  kill: {
    label: "Kill Campaign",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    icon: XCircle,
    desc: "Hentikan - buang anggaran yang tidak efisien",
  },
  wait: {
    label: "Tunggu Dulu",
    color: "text-yellow-700 dark:text-yellow-300",
    bgColor: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
    icon: AlertTriangle,
    desc: "Beri waktu lebih untuk optimasi platform",
  },
};

interface ScaleAnalysis {
  recommendation: Recommendation;
  confidence: number;
  summary: string;
  reasons: string[];
  actions: { priority: "high" | "medium" | "low"; action: string; detail: string }[];
  scalingPlan: string;
  warningFlags: string[];
}

export default function AdScaleAdvisor() {
  const [platform, setPlatform] = useState("meta");
  const [objective, setObjective] = useState("Konversi / Pembelian");
  const [status, setStatus] = useState("active_stable");
  const [dailyBudget, setDailyBudget] = useState("");
  const [daysRunning, setDaysRunning] = useState("");
  const [cpm, setCpm] = useState("");
  const [cpc, setCpc] = useState("");
  const [ctr, setCtr] = useState("");
  const [cpa, setCpa] = useState("");
  const [roas, setRoas] = useState("");
  const [conversionRate, setConversionRate] = useState("");
  const [totalSpend, setTotalSpend] = useState("");
  const [totalConversions, setTotalConversions] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScaleAnalysis | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!dailyBudget || !daysRunning) {
      toast({ title: "Lengkapi data", description: "Budget harian dan durasi iklan wajib diisi", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/ad-scale-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform, objective, status, dailyBudget, daysRunning,
          cpm, cpc, ctr, cpa, roas, conversionRate,
          totalSpend, totalConversions, productPrice, additionalContext,
        }),
      });
      if (!response.ok) throw new Error("Gagal analisis");
      const data = await response.json();
      setResult(data);
    } catch {
      toast({ title: "Error", description: "Gagal analisis. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    const text = [
      `AD SCALE ANALYSIS`,
      `Rekomendasi: ${recommendationConfig[result.recommendation]?.label}`,
      `Confidence: ${result.confidence}%`,
      ``,
      `RINGKASAN:`,
      result.summary,
      ``,
      `ALASAN:`,
      result.reasons.map((r) => `• ${r}`).join("\n"),
      ``,
      `ACTION PLAN:`,
      result.actions.map((a) => `[${a.priority.toUpperCase()}] ${a.action}\n   ${a.detail}`).join("\n"),
      ``,
      `RENCANA SCALING:`,
      result.scalingPlan,
      result.warningFlags.length > 0 ? `\nWARNING:\n${result.warningFlags.map((w) => `⚠️ ${w}`).join("\n")}` : "",
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: "Hasil analisis berhasil disalin" });
  };

  const metricFields = [
    { label: "CPM (Rp)", value: cpm, setter: setCpm, placeholder: "contoh: 15000", hint: "Cost per 1000 impressions" },
    { label: "CPC (Rp)", value: cpc, setter: setCpc, placeholder: "contoh: 800", hint: "Cost per click" },
    { label: "CTR (%)", value: ctr, setter: setCtr, placeholder: "contoh: 1.5", hint: "Click-through rate" },
    { label: "CPA (Rp)", value: cpa, setter: setCpa, placeholder: "contoh: 45000", hint: "Cost per acquisition/konversi" },
    { label: "ROAS (x)", value: roas, setter: setRoas, placeholder: "contoh: 3.5", hint: "Return on ad spend" },
    { label: "Conv. Rate (%)", value: conversionRate, setter: setConversionRate, placeholder: "contoh: 2.3", hint: "Landing page conversion rate" },
    { label: "Total Spend (Rp)", value: totalSpend, setter: setTotalSpend, placeholder: "contoh: 500000", hint: "Total pengeluaran iklan" },
    { label: "Total Konversi", value: totalConversions, setter: setTotalConversions, placeholder: "contoh: 12", hint: "Jumlah penjualan/lead" },
  ];

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Ad Scale Advisor
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Analisis metrics iklan dan dapatkan saran kapan harus scale up, scale out, optimasi, atau kill
            </p>
          </div>
          <Badge variant="secondary" className="hidden md:flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Scale Advisor
          </Badge>
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          {/* Form */}
          <div className="xl:col-span-2 space-y-4">
            {/* Platform & Campaign Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  Info Campaign
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Platform Iklan</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {platforms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPlatform(p.id)}
                        data-testid={`button-platform-${p.id}`}
                        className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                          platform === p.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Tujuan Campaign</Label>
                  <Select value={objective} onValueChange={setObjective}>
                    <SelectTrigger data-testid="select-objective">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {adObjectives.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status Campaign Saat Ini</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignStatuses.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Budget Harian (Rp) *</Label>
                    <Input
                      placeholder="50000"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                      type="number"
                      data-testid="input-budget"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Sudah Jalan (Hari) *</Label>
                    <Input
                      placeholder="7"
                      value={daysRunning}
                      onChange={(e) => setDaysRunning(e.target.value)}
                      type="number"
                      data-testid="input-days"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Harga Produk (Rp)</Label>
                  <Input
                    placeholder="97000"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    type="number"
                    data-testid="input-product-price"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Metrics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Metrics Iklan
                </CardTitle>
                <CardDescription className="text-xs flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Isi sebanyak yang kamu punya. Semakin lengkap, semakin akurat analisis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {metricFields.map(({ label, value, setter, placeholder, hint }) => (
                    <div key={label} className="space-y-1">
                      <Label className="text-xs">{label}</Label>
                      <Input
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        type="number"
                        className="h-8 text-sm"
                        data-testid={`input-metric-${label.toLowerCase().replace(/[^a-z]/g, "")}`}
                      />
                      <p className="text-xs text-muted-foreground">{hint}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-1.5">
                  <Label>Konteks Tambahan (opsional)</Label>
                  <Textarea
                    placeholder="contoh: Ini produk digital harga 97k, sudah split test 3 creative, yang paling bagus CTR 2.1%..."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                    data-testid="input-context"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !dailyBudget || !daysRunning}
              className="w-full"
              size="lg"
              data-testid="button-analyze-scale"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menganalisis...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Analisis & Beri Saran<ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>

          {/* Result */}
          <div className="xl:col-span-3 space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="h-[580px] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                    <p className="text-sm font-medium">AI sedang analisis performa iklan...</p>
                    <p className="text-xs text-muted-foreground">Memproses metrics & menyiapkan rekomendasi</p>
                  </div>
                </CardContent>
              </Card>
            ) : result ? (
              <>
                {/* Main Recommendation */}
                {(() => {
                  const config = recommendationConfig[result.recommendation];
                  const Icon = config.icon;
                  return (
                    <Card className={`border-2 ${config.bgColor}`}>
                      <CardContent className="pt-5 pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.bgColor} border-2`}>
                              <Icon className={`h-6 w-6 ${config.color}`} />
                            </div>
                            <div>
                              <div className={`text-xl font-bold ${config.color}`}>{config.label}</div>
                              <div className="text-xs text-muted-foreground">{config.desc}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{result.confidence}%</div>
                            <div className="text-xs text-muted-foreground">confidence</div>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed">{result.summary}</p>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Warning Flags */}
                {result.warningFlags.length > 0 && (
                  <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-900">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Warning</span>
                      </div>
                      <ul className="space-y-1">
                        {result.warningFlags.map((w, i) => (
                          <li key={i} className="text-xs text-yellow-700 dark:text-yellow-400 flex items-start gap-2">
                            <span>⚠️</span><span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Reasons */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Alasan Rekomendasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">{i + 1}</span>
                          </div>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Action Plan */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Action Plan</CardTitle>
                    <CardDescription className="text-xs">Urutkan berdasarkan prioritas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.actions.map((a, i) => {
                      const priorityColor = a.priority === "high"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : a.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
                      return (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                          <Badge className={`text-xs h-5 flex-shrink-0 ${priorityColor}`}>
                            {a.priority === "high" ? "🔴" : a.priority === "medium" ? "🟡" : "🔵"} {a.priority}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">{a.action}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{a.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Scaling Plan */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Rencana Scaling Detail
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-foreground/90">{result.scalingPlan}</pre>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button className="flex-1" variant="outline" onClick={copyResult} data-testid="button-copy-analysis">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Analisis
                  </Button>
                  <Button className="flex-1" variant="outline" onClick={handleAnalyze} data-testid="button-reanalyze">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Analisis Ulang
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="h-[580px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Belum ada analisis</p>
                      <p className="text-xs text-muted-foreground mt-1">Isi metrics iklan & klik Analisis</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-w-[280px] mx-auto text-left">
                      {Object.entries(recommendationConfig).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <div key={key} className={`p-2 rounded-lg border text-xs ${config.bgColor}`}>
                            <div className={`flex items-center gap-1 font-semibold mb-0.5 ${config.color}`}>
                              <Icon className="h-3 w-3" />
                              {config.label}
                            </div>
                            <span className="text-muted-foreground">{config.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
