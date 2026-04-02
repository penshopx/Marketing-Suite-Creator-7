import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, Loader2, ChevronRight, Copy,
  RefreshCw, TrendingUp, TrendingDown, Minus,
  CheckCircle2, AlertCircle, Download, Zap,
  DollarSign, Target, Eye, MousePointer, ShoppingCart,
  ArrowUp, ArrowDown, Calendar, FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const platforms = [
  { id: "meta", label: "Meta Ads (FB/IG)", emoji: "📘" },
  { id: "google", label: "Google Ads", emoji: "🔵" },
  { id: "tiktok", label: "TikTok Ads", emoji: "🎵" },
  { id: "shopee", label: "Shopee Ads", emoji: "🛒" },
  { id: "multi", label: "Multi-Platform", emoji: "⚡" },
];

const periods = [
  { id: "7days", label: "7 Hari" },
  { id: "14days", label: "14 Hari" },
  { id: "30days", label: "30 Hari" },
  { id: "90days", label: "90 Hari (Q)" },
  { id: "custom", label: "Custom" },
];

interface MetricStatus {
  nilai: string;
  perubahan: string;
  trend: "up" | "down" | "flat";
  status: "good" | "warning" | "bad";
}

interface KPICard {
  label: string;
  nilai: string;
  target?: string;
  perubahan: string;
  trend: "up" | "down" | "flat";
  status: "good" | "warning" | "bad";
  insight: string;
}

interface Recommendation {
  prioritas: "high" | "medium" | "low";
  kategori: string;
  tindakan: string;
  dampak: string;
  cara: string;
}

interface ReportResult {
  judul: string;
  platform: string;
  periode: string;
  ringkasan: string;
  skor: { total: number; label: string; keterangan: string };
  kpis: KPICard[];
  highlights: { tipe: "positive" | "negative" | "neutral"; poin: string }[];
  recommendations: Recommendation[];
  budgetAnalysis: { total: string; efisiensi: string; alokasi: string; rekomendasi: string };
  nextSteps: string[];
  benchmarks: { metric: string; nilaiKamu: string; benchmark: string; status: "above" | "below" | "on" }[];
}

function TrendIcon({ trend, status }: { trend: "up" | "down" | "flat"; status: "good" | "warning" | "bad" }) {
  const colorMap = { good: "text-green-500", warning: "text-yellow-500", bad: "text-red-500" };
  const cls = colorMap[status];
  if (trend === "up") return <ArrowUp className={`h-4 w-4 ${cls}`} />;
  if (trend === "down") return <ArrowDown className={`h-4 w-4 ${cls}`} />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function StatusBadge({ status }: { status: "good" | "warning" | "bad" }) {
  const cfg = { good: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400", warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400", bad: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" };
  const lbl = { good: "Baik", warning: "Perlu Perhatian", bad: "Kritis" };
  return <Badge className={`${cfg[status]} border-0 text-xs`}>{lbl[status]}</Badge>;
}

export default function CampaignReport() {
  const [platform, setPlatform] = useState("meta");
  const [period, setPeriod] = useState("30days");
  const [namaBisnis, setNamaBisnis] = useState("");
  const [spend, setSpend] = useState("");
  const [revenue, setRevenue] = useState("");
  const [impressions, setImpressions] = useState("");
  const [clicks, setClicks] = useState("");
  const [conversions, setConversions] = useState("");
  const [ctr, setCtr] = useState("");
  const [cpc, setCpc] = useState("");
  const [cpa, setCpa] = useState("");
  const [roas, setRoas] = useState("");
  const [targetRoas, setTargetRoas] = useState("");
  const [prevSpend, setPrevSpend] = useState("");
  const [prevRevenue, setPrevRevenue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!spend.trim() && !revenue.trim()) {
      toast({ title: "Isi minimal spend atau revenue", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/generate-campaign-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform, period, namaBisnis, spend, revenue, impressions, clicks,
          conversions, ctr, cpc, cpa, roas, targetRoas, prevSpend, prevRevenue,
        }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setResult(data);
    } catch {
      toast({ title: "Error", description: "Gagal generate laporan. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const text = [
      `LAPORAN PERFORMA KAMPANYE`,
      `${result.judul}`,
      `Platform: ${result.platform} | Periode: ${result.periode}`,
      `Dibuat: ${new Date().toLocaleString("id-ID")}`,
      `\n${"=".repeat(60)}`,
      `\nRINGKASAN EKSEKUTIF`,
      result.ringkasan,
      `\nSKOR PERFORMA: ${result.skor.total}/100 — ${result.skor.label}`,
      result.skor.keterangan,
      `\n${"=".repeat(60)}`,
      `\nKPI UTAMA`,
      ...result.kpis.map((k) => `• ${k.label}: ${k.nilai} (${k.perubahan}) — ${k.insight}`),
      `\n${"=".repeat(60)}`,
      `\nHIGHLIGHTS`,
      ...result.highlights.map((h) => `${h.tipe === "positive" ? "✅" : h.tipe === "negative" ? "❌" : "ℹ️"} ${h.poin}`),
      `\n${"=".repeat(60)}`,
      `\nREKOMENDASI OPTIMASI`,
      ...result.recommendations.map((r, i) => [
        `\n${i + 1}. [${r.prioritas.toUpperCase()}] ${r.kategori}: ${r.tindakan}`,
        `   Dampak: ${r.dampak}`,
        `   Cara: ${r.cara}`,
      ].join("\n")),
      `\n${"=".repeat(60)}`,
      `\nLANGKAH SELANJUTNYA`,
      ...result.nextSteps.map((s, i) => `${i + 1}. ${s}`),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-kampanye-${new Date().toLocaleDateString("id-ID").replace(/\//g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Laporan diunduh!" });
  };

  const prioConfig = {
    high: { color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", label: "🔴 Prioritas Tinggi" },
    medium: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400", label: "🟡 Prioritas Sedang" },
    low: { color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400", label: "🟢 Prioritas Rendah" },
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Laporan Performa Kampanye
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Input metrik kampanye → AI generate laporan analitis lengkap dengan rekomendasi optimasi
            </p>
          </div>
          <Badge className="hidden md:flex items-center gap-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-0">
            <FileText className="h-3 w-3" />
            AI Analytics
          </Badge>
        </div>

        {/* Platform + Period */}
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => (
            <button key={p.id} onClick={() => setPlatform(p.id)} data-testid={`btn-rp-${p.id}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                platform === p.id ? "border-primary bg-primary/5 font-semibold text-primary" : "border-border hover:border-primary/30"
              }`}>
              <span>{p.emoji}</span>{p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {periods.map((p) => (
            <button key={p.id} onClick={() => setPeriod(p.id)} data-testid={`btn-rp-period-${p.id}`}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                period === p.id ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:border-primary/30"
              }`}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          {/* Form */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Metrik Kampanye
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Nama Bisnis / Kampanye</Label>
                  <Input placeholder="contoh: Toko Baju X, Brand Skincare Y..." value={namaBisnis} onChange={(e) => setNamaBisnis(e.target.value)} data-testid="input-rp-nama" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label>Total Spend (Rp) *</Label>
                    <Input placeholder="2.500.000" value={spend} onChange={(e) => setSpend(e.target.value)} data-testid="input-rp-spend" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Total Revenue (Rp)</Label>
                    <Input placeholder="10.000.000" value={revenue} onChange={(e) => setRevenue(e.target.value)} data-testid="input-rp-revenue" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label>Impressions</Label>
                    <Input placeholder="150.000" value={impressions} onChange={(e) => setImpressions(e.target.value)} data-testid="input-rp-impr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Clicks</Label>
                    <Input placeholder="3.500" value={clicks} onChange={(e) => setClicks(e.target.value)} data-testid="input-rp-clicks" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label>Conversions</Label>
                    <Input placeholder="85" value={conversions} onChange={(e) => setConversions(e.target.value)} data-testid="input-rp-conv" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>ROAS (x)</Label>
                    <Input placeholder="4.2" value={roas} onChange={(e) => setRoas(e.target.value)} data-testid="input-rp-roas" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label>CTR (%)</Label>
                    <Input placeholder="2.3" value={ctr} onChange={(e) => setCtr(e.target.value)} data-testid="input-rp-ctr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CPC (Rp)</Label>
                    <Input placeholder="700" value={cpc} onChange={(e) => setCpc(e.target.value)} data-testid="input-rp-cpc" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label>CPA (Rp)</Label>
                    <Input placeholder="29.400" value={cpa} onChange={(e) => setCpa(e.target.value)} data-testid="input-rp-cpa" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Target ROAS (x)</Label>
                    <Input placeholder="5.0" value={targetRoas} onChange={(e) => setTargetRoas(e.target.value)} data-testid="input-rp-troas" />
                  </div>
                </div>

                <div className="border-t pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Perbandingan periode sebelumnya (opsional)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label>Spend Sebelumnya</Label>
                      <Input placeholder="2.000.000" value={prevSpend} onChange={(e) => setPrevSpend(e.target.value)} data-testid="input-rp-pspend" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Revenue Sebelumnya</Label>
                      <Input placeholder="8.000.000" value={prevRevenue} onChange={(e) => setPrevRevenue(e.target.value)} data-testid="input-rp-prevrev" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleGenerate} disabled={isLoading || (!spend.trim() && !revenue.trim())} className="w-full" size="lg" data-testid="button-gen-report">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Laporan...</>
              ) : (
                <><BarChart3 className="mr-2 h-4 w-4" />Generate Laporan<ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>

          {/* Output */}
          <div className="xl:col-span-3">
            {isLoading ? (
              <Card className="h-full min-h-[500px] flex items-center justify-center">
                <CardContent className="text-center space-y-4">
                  <BarChart3 className="h-10 w-10 text-primary mx-auto animate-pulse" />
                  <div>
                    <p className="font-medium">Menganalisis performa kampanye...</p>
                    <p className="text-sm text-muted-foreground mt-1">Membandingkan dengan benchmark industri</p>
                  </div>
                </CardContent>
              </Card>
            ) : result ? (
              <Card className="h-full">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm truncate">{result.judul}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{result.platform} · {result.periode}</p>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <Button size="sm" variant="outline" onClick={handleGenerate} data-testid="btn-regen-rp">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadReport} data-testid="btn-dl-report">
                        <Download className="h-3.5 w-3.5 mr-1" />Download
                      </Button>
                    </div>
                  </div>
                  {/* Score */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Skor Performa Keseluruhan</span>
                      <span className={`text-sm font-bold ${result.skor.total >= 75 ? "text-green-500" : result.skor.total >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                        {result.skor.total}/100 — {result.skor.label}
                      </span>
                    </div>
                    <Progress value={result.skor.total} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{result.skor.keterangan}</p>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <Tabs defaultValue="overview">
                    <div className="px-4 pt-2 border-b">
                      <TabsList className="h-8 bg-transparent gap-0.5 flex-wrap">
                        {[
                          { id: "overview", label: "📊 Overview" },
                          { id: "recs", label: "⚡ Rekomendasi" },
                          { id: "benchmark", label: "📈 Benchmark" },
                          { id: "nextsteps", label: "🎯 Next Steps" },
                        ].map((t) => (
                          <TabsTrigger key={t.id} value={t.id} data-testid={`tab-rp-${t.id}`}
                            className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            {t.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    {/* Overview */}
                    <TabsContent value="overview" className="p-4 mt-0">
                      <ScrollArea className="h-[440px]">
                        <div className="space-y-4 pr-1">
                          {/* Ringkasan */}
                          <div className="p-3 bg-muted/50 rounded-lg border">
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Ringkasan Eksekutif</p>
                            <p className="text-sm leading-relaxed">{result.ringkasan}</p>
                          </div>

                          {/* KPIs */}
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">KPI Utama</p>
                            <div className="grid grid-cols-2 gap-2">
                              {result.kpis.map((kpi, i) => (
                                <div key={i} className={`p-3 rounded-lg border ${
                                  kpi.status === "good" ? "border-green-200 dark:border-green-800" :
                                  kpi.status === "warning" ? "border-yellow-200 dark:border-yellow-800" :
                                  "border-red-200 dark:border-red-800"
                                }`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                                    <TrendIcon trend={kpi.trend} status={kpi.status} />
                                  </div>
                                  <p className="text-base font-bold">{kpi.nilai}</p>
                                  {kpi.target && <p className="text-xs text-muted-foreground">Target: {kpi.target}</p>}
                                  <p className={`text-xs mt-0.5 font-medium ${
                                    kpi.trend === "up" && kpi.status === "good" ? "text-green-600" :
                                    kpi.trend === "down" && kpi.status === "bad" ? "text-red-600" :
                                    "text-muted-foreground"
                                  }`}>{kpi.perubahan}</p>
                                  <p className="text-xs text-muted-foreground mt-1 italic">{kpi.insight}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Highlights */}
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Highlights</p>
                            <div className="space-y-1.5">
                              {result.highlights.map((h, i) => (
                                <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${
                                  h.tipe === "positive" ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20" :
                                  h.tipe === "negative" ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20" :
                                  "border-border bg-muted/30"
                                }`}>
                                  <span className="flex-shrink-0 mt-0.5">{h.tipe === "positive" ? "✅" : h.tipe === "negative" ? "❌" : "ℹ️"}</span>
                                  <p className="text-sm">{h.poin}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Budget */}
                          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <p className="text-xs font-semibold text-primary uppercase mb-2">Analisis Budget</p>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-muted-foreground">Total spend:</span> {result.budgetAnalysis.total}</p>
                              <p><span className="text-muted-foreground">Efisiensi:</span> {result.budgetAnalysis.efisiensi}</p>
                              <p><span className="text-muted-foreground">Alokasi:</span> {result.budgetAnalysis.alokasi}</p>
                            </div>
                            <p className="text-xs text-primary mt-2">{result.budgetAnalysis.rekomendasi}</p>
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Recommendations */}
                    <TabsContent value="recs" className="p-4 mt-0">
                      <ScrollArea className="h-[440px]">
                        <div className="space-y-3 pr-1">
                          {result.recommendations.map((rec, i) => {
                            const cfg = prioConfig[rec.prioritas];
                            return (
                              <div key={i} className="p-3 rounded-lg border">
                                <div className="flex items-start gap-3">
                                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <Badge className={`${cfg.color} border-0 text-xs`}>{cfg.label}</Badge>
                                      <Badge variant="outline" className="text-xs">{rec.kategori}</Badge>
                                    </div>
                                    <p className="text-sm font-semibold">{rec.tindakan}</p>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">💡 Dampak: {rec.dampak}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Cara: {rec.cara}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Benchmark */}
                    <TabsContent value="benchmark" className="p-4 mt-0">
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">Perbandingan metrik kamu vs benchmark industri {result.platform}</p>
                        {result.benchmarks.map((b, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{b.metric}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs"><span className="text-muted-foreground">Kamu: </span><span className="font-semibold">{b.nilaiKamu}</span></span>
                                <span className="text-xs"><span className="text-muted-foreground">Benchmark: </span><span className="font-semibold">{b.benchmark}</span></span>
                              </div>
                            </div>
                            <Badge className={`text-xs border-0 flex-shrink-0 ${
                              b.status === "above" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" :
                              b.status === "below" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" :
                              "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                            }`}>
                              {b.status === "above" ? "▲ Di Atas" : b.status === "below" ? "▼ Di Bawah" : "= Sesuai"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Next Steps */}
                    <TabsContent value="nextsteps" className="p-4 mt-0">
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">Langkah konkret untuk periode iklan berikutnya</p>
                        {result.nextSteps.map((step, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                            <p className="text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full min-h-[500px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-5 max-w-sm">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">AI Campaign Report Generator</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Masukkan metrik kampanye → dapat laporan profesional dengan analisis mendalam dan rekomendasi actionable
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-left max-w-xs mx-auto">
                      {[
                        { icon: TrendingUp, label: "Skor performa keseluruhan" },
                        { icon: Target, label: "Analisis KPI vs target" },
                        { icon: AlertCircle, label: "Rekomendasi prioritas tinggi" },
                        { icon: BarChart3, label: "Benchmark vs industri" },
                        { icon: Zap, label: "Next steps yang actionable" },
                        { icon: Download, label: "Export laporan .txt" },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2 text-sm">
                          <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{label}</span>
                        </div>
                      ))}
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
