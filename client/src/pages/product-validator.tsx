import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2, Loader2, Sparkles, ChevronRight,
  TrendingUp, AlertTriangle, XCircle, Star,
  Users, DollarSign, BarChart2, Lightbulb,
  ThumbsUp, ThumbsDown, Target, RefreshCw, Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const platformOptions = [
  "WhatsApp / Telegram",
  "Lynk.id / Saweria",
  "Gumroad / Lemon Squeezy",
  "Instagram / TikTok",
  "Tokopedia / Shopee",
  "Website / Landing Page",
  "Belum tahu",
];

const budgetOptions = [
  "Bootstrap (nyaris nol)",
  "Rp 50rb – 200rb (iklan minimal)",
  "Rp 200rb – 500rb",
  "Rp 500rb – 2jt",
  "Rp 2jt+",
];

interface ValidationScore {
  label: string;
  score: number;
  color: string;
}

interface ValidationResult {
  productName: string;
  overallScore: number;
  verdict: "go" | "cautious" | "pivot" | "no_go";
  verdictLabel: string;
  verdictReason: string;
  scores: {
    marketDemand: ValidationScore;
    competition: ValidationScore;
    monetization: ValidationScore;
    productionEase: ValidationScore;
    targetClarity: ValidationScore;
  };
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  risks: string[];
  pricingRecommendation: string;
  targetMarketBreakdown: string;
  pivotSuggestion: string;
  actionPlan: { step: number; action: string; timeline: string }[];
  similarProducts: string;
}

const verdictConfig = {
  go: {
    label: "GO! Lanjut Buat",
    color: "text-green-700 dark:text-green-300",
    bg: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-700",
    icon: CheckCircle2,
    iconColor: "text-green-600",
  },
  cautious: {
    label: "Bisa Jalan, Tapi Perlu Perbaikan",
    color: "text-yellow-700 dark:text-yellow-300",
    bg: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-700",
    icon: AlertTriangle,
    iconColor: "text-yellow-600",
  },
  pivot: {
    label: "Pivot Dulu — Ada Yang Lebih Bagus",
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-700",
    icon: RefreshCw,
    iconColor: "text-orange-600",
  },
  no_go: {
    label: "Jangan Dulu — Risiko Tinggi",
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-700",
    icon: XCircle,
    iconColor: "text-red-600",
  },
};

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const width = `${Math.max(5, score)}%`;
  const barColor =
    score >= 75 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : score >= 30 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium">{label}</span>
        <span className={`text-xs font-bold ${color}`}>{score}/100</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width }} />
      </div>
    </div>
  );
}

export default function ProductValidator() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [platform, setPlatform] = useState("WhatsApp / Telegram");
  const [adBudget, setAdBudget] = useState("Rp 50rb – 200rb (iklan minimal)");
  const [competitorInfo, setCompetitorInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  const handleValidate = async () => {
    if (!productName.trim() || !productDescription.trim()) {
      toast({ title: "Lengkapi form", description: "Nama dan deskripsi produk wajib diisi", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/validate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, productDescription, targetMarket, platform, adBudget, competitorInfo }),
      });
      if (!response.ok) throw new Error("Gagal validasi");
      const data = await response.json();
      setResult(data);
    } catch {
      toast({ title: "Error", description: "Gagal validasi produk. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    const text = [
      `VALIDASI IDE PRODUK: ${result.productName}`,
      `Skor Total: ${result.overallScore}/100`,
      `Verdict: ${result.verdictLabel}`,
      ``,
      result.verdictReason,
      ``,
      `KEKUATAN:`,
      result.strengths.map((s) => `✅ ${s}`).join("\n"),
      ``,
      `KELEMAHAN:`,
      result.weaknesses.map((w) => `⚠️ ${w}`).join("\n"),
      ``,
      `REKOMENDASI HARGA: ${result.pricingRecommendation}`,
      ``,
      `ACTION PLAN:`,
      result.actionPlan.map((a) => `${a.step}. ${a.action} (${a.timeline})`).join("\n"),
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: "Hasil validasi berhasil disalin" });
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              Validasi Ide Produk
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Skor dan analisis kelayakan ide produk digital sebelum investasi waktu & uang
            </p>
          </div>
          <Badge variant="secondary" className="hidden md:flex items-center gap-1">
            <Star className="h-3 w-3" />
            AI Product Scorer
          </Badge>
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          {/* Form */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Describe Your Idea
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Nama Produk *</Label>
                  <Input
                    placeholder="contoh: Template Notion Keuangan Bulanan"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    data-testid="input-val-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Deskripsi Produk *</Label>
                  <Textarea
                    placeholder="Ceritakan produkmu: apa itu, untuk siapa, masalah apa yang diselesaikan, isi/fiturnya apa saja..."
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    className="min-h-[100px] resize-none"
                    data-testid="input-val-description"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Target Market</Label>
                  <Input
                    placeholder="contoh: Mahasiswa & fresh graduate yang boros tapi mau nabung"
                    value={targetMarket}
                    onChange={(e) => setTargetMarket(e.target.value)}
                    data-testid="input-val-target"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Platform Jual</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger data-testid="select-val-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platformOptions.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Budget Iklan yang Siap Dipakai</Label>
                  <Select value={adBudget} onValueChange={setAdBudget}>
                    <SelectTrigger data-testid="select-val-budget">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetOptions.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Info Kompetitor (opsional)</Label>
                  <Textarea
                    placeholder="Ada produk serupa? Sebutkan nama/harga/kelebihan kompetitor..."
                    value={competitorInfo}
                    onChange={(e) => setCompetitorInfo(e.target.value)}
                    className="min-h-[60px] resize-none"
                    data-testid="input-val-competitor"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleValidate}
              disabled={isLoading || !productName.trim() || !productDescription.trim()}
              className="w-full"
              size="lg"
              data-testid="button-validate"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sedang Menganalisis...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Validasi Ide Produk<ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>

          {/* Result */}
          <div className="xl:col-span-3 space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="h-[560px] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                    <p className="text-sm font-medium">AI sedang analisis kelayakan produk...</p>
                    <p className="text-xs text-muted-foreground">Menilai demand, kompetisi, potensi profit</p>
                  </div>
                </CardContent>
              </Card>
            ) : result ? (
              <>
                {/* Verdict Card */}
                {(() => {
                  const cfg = verdictConfig[result.verdict];
                  const Icon = cfg.icon;
                  return (
                    <Card className={`border-2 ${cfg.bg}`}>
                      <CardContent className="pt-5 pb-4">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg} border-2`}>
                            <Icon className={`h-8 w-8 ${cfg.iconColor}`} />
                          </div>
                          <div className="flex-1">
                            <div className={`text-xl font-bold ${cfg.color}`}>{result.verdictLabel}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    result.overallScore >= 75 ? "bg-green-500" :
                                    result.overallScore >= 50 ? "bg-yellow-500" :
                                    result.overallScore >= 30 ? "bg-orange-500" : "bg-red-500"
                                  }`}
                                  style={{ width: `${result.overallScore}%` }}
                                />
                              </div>
                              <span className="font-bold text-sm w-12 text-right">{result.overallScore}/100</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed">{result.verdictReason}</p>
                      </CardContent>
                    </Card>
                  );
                })()}

                {/* Score Breakdown */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-primary" />
                      Breakdown Skor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ScoreBar label="Market Demand" score={result.scores.marketDemand.score} color={result.scores.marketDemand.color} />
                    <ScoreBar label="Tingkat Kompetisi (makin rendah makin bagus)" score={100 - result.scores.competition.score} color={result.scores.competition.color} />
                    <ScoreBar label="Potensi Monetisasi" score={result.scores.monetization.score} color={result.scores.monetization.color} />
                    <ScoreBar label="Kemudahan Produksi" score={result.scores.productionEase.score} color={result.scores.productionEase.color} />
                    <ScoreBar label="Kejelasan Target Market" score={result.scores.targetClarity.score} color={result.scores.targetClarity.color} />
                  </CardContent>
                </Card>

                {/* SWOT-lite */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-green-200 dark:border-green-800">
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5">
                        <ThumbsUp className="h-3.5 w-3.5" />KEKUATAN
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <ul className="space-y-1.5">
                        {result.strengths.map((s, i) => (
                          <li key={i} className="text-xs flex items-start gap-1.5">
                            <span className="text-green-500 flex-shrink-0 mt-0.5">✅</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 dark:border-red-800">
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-xs text-red-700 dark:text-red-400 flex items-center gap-1.5">
                        <ThumbsDown className="h-3.5 w-3.5" />KELEMAHAN
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <ul className="space-y-1.5">
                        {result.weaknesses.map((w, i) => (
                          <li key={i} className="text-xs flex items-start gap-1.5">
                            <span className="text-red-500 flex-shrink-0 mt-0.5">⚠️</span>
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" />PELUANG
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <ul className="space-y-1.5">
                        {result.opportunities.map((o, i) => (
                          <li key={i} className="text-xs flex items-start gap-1.5">
                            <span className="text-blue-500 flex-shrink-0 mt-0.5">🚀</span>
                            <span>{o}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-orange-200 dark:border-orange-800">
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-xs text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />RISIKO
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <ul className="space-y-1.5">
                        {result.risks.map((r, i) => (
                          <li key={i} className="text-xs flex items-start gap-1.5">
                            <span className="text-orange-500 flex-shrink-0 mt-0.5">⚡</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Pricing & Target */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-2">
                        <DollarSign className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Rekomendasi Harga</p>
                          <p className="text-sm font-bold text-primary">{result.pricingRecommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Target Market Spesifik</p>
                          <p className="text-xs leading-relaxed">{result.targetMarketBreakdown}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Pivot Suggestion if needed */}
                {result.pivotSuggestion && result.verdict !== "go" && (
                  <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-2">
                        <RefreshCw className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">💡 Saran Pivot / Perbaikan</p>
                          <p className="text-xs text-purple-700/80 dark:text-purple-400/80">{result.pivotSuggestion}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Plan */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Action Plan — Mulai dari Mana?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.actionPlan.map((a) => (
                      <div key={a.step} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {a.step}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{a.action}</p>
                          <Badge variant="outline" className="mt-1 text-xs">{a.timeline}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button className="flex-1" variant="outline" onClick={copyResult} data-testid="button-copy-validation">
                    <Copy className="h-4 w-4 mr-2" />Salin Hasil Validasi
                  </Button>
                  <Button className="flex-1" variant="outline" onClick={handleValidate} data-testid="button-revalidate">
                    <RefreshCw className="h-4 w-4 mr-2" />Validasi Ulang
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="h-[560px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Belum ada hasil validasi</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                        Deskripsikan ide produkmu dan dapatkan analisis kelayakan lengkap
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-w-[280px] mx-auto text-left">
                      {[
                        { icon: BarChart2, label: "Skor demand & kompetisi" },
                        { icon: DollarSign, label: "Rekomendasi harga" },
                        { icon: ThumbsUp, label: "Kekuatan & kelemahan" },
                        { icon: Target, label: "Action plan konkret" },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
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
