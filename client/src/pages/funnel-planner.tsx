import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  GitBranch, Loader2, Copy, Sparkles, ChevronRight,
  ArrowDown, Target, Eye, MousePointer, ShoppingCart,
  Heart, RefreshCw, Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const productTypes = [
  { id: "digital", label: "Produk Digital", examples: "Ebook, course, template, preset" },
  { id: "physical", label: "Produk Fisik", examples: "Skincare, suplemen, fashion, FMCG" },
  { id: "service", label: "Jasa / Layanan", examples: "Konsultasi, coaching, freelance, agency" },
  { id: "saas", label: "SaaS / Subscription", examples: "Aplikasi, tools, membership" },
];

const funnelModels = [
  { id: "ads_lp_wa", label: "Ads → LP → WhatsApp", desc: "Paling umum untuk produk digital Indonesia" },
  { id: "ads_lp_direct", label: "Ads → LP → Checkout Langsung", desc: "Produk murah, keputusan cepat" },
  { id: "ads_wa_direct", label: "Ads → WhatsApp Langsung", desc: "Short form funnel, produk mudah dijelaskan" },
  { id: "content_bio_lp", label: "Konten → Bio Link → LP", desc: "Funnel organik dari konten creator" },
  { id: "email_funnel", label: "Lead Magnet → Email → Offer", desc: "Nurturing jangka panjang" },
  { id: "webinar", label: "Ads → Webinar/Live → Penawaran", desc: "High-ticket, butuh edukasi lebih dalam" },
];

const trafficSources = [
  "Meta Ads (FB/IG)", "TikTok Ads", "Google Ads",
  "Instagram Organik", "TikTok Organik", "YouTube",
  "Email Marketing", "Referral / Afiliasi",
];

const funnelStageIcons: Record<string, React.ElementType> = {
  awareness: Eye,
  interest: Target,
  consideration: MousePointer,
  conversion: ShoppingCart,
  retention: Heart,
};

const funnelStageColors: Record<string, string> = {
  awareness: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
  interest: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800",
  consideration: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
  conversion: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
  retention: "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800",
};

const funnelStageTextColors: Record<string, string> = {
  awareness: "text-blue-700 dark:text-blue-300",
  interest: "text-purple-700 dark:text-purple-300",
  consideration: "text-orange-700 dark:text-orange-300",
  conversion: "text-green-700 dark:text-green-300",
  retention: "text-pink-700 dark:text-pink-300",
};

interface FunnelStage {
  stage: string;
  label: string;
  goal: string;
  platform: string;
  message: string;
  copyExample: string;
  metrics: string;
  tips: string;
}

interface GeneratedFunnel {
  id: string;
  productName: string;
  model: string;
  stages: FunnelStage[];
  summary: string;
  createdAt: Date;
}

export default function FunnelPlanner() {
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("digital");
  const [productPrice, setProductPrice] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [productBenefit, setProductBenefit] = useState("");
  const [funnelModel, setFunnelModel] = useState("ads_lp_wa");
  const [trafficSource, setTrafficSource] = useState("Meta Ads (FB/IG)");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedFunnel | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!productName.trim() || !targetMarket.trim()) {
      toast({ title: "Lengkapi form", description: "Nama produk dan target market wajib diisi", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, productType, productPrice, targetMarket, productBenefit, funnelModel, trafficSource }),
      });
      if (!response.ok) throw new Error("Gagal generate funnel");
      const data = await response.json();
      const newResult: GeneratedFunnel = {
        id: Date.now().toString(),
        productName,
        model: funnelModel,
        stages: data.stages,
        summary: data.summary,
        createdAt: new Date(),
      };
      setResult(newResult);
      setActiveStage(0);
    } catch {
      toast({ title: "Error", description: "Gagal generate funnel. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAll = () => {
    if (!result) return;
    const text = [
      `FUNNEL PLAN: ${result.productName}`,
      `Model: ${funnelModels.find((f) => f.id === result.model)?.label}`,
      "",
      result.summary,
      "",
      ...result.stages.map((s) =>
        `\n===== ${s.label.toUpperCase()} =====\nGoal: ${s.goal}\nPlatform: ${s.platform}\nPesan: ${s.message}\nContoh Copy:\n${s.copyExample}\nMetrics: ${s.metrics}\nTips: ${s.tips}`
      ),
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: "Seluruh funnel plan berhasil disalin" });
  };

  const downloadFunnel = () => {
    if (!result) return;
    const text = [
      `FUNNEL PLAN: ${result.productName}`,
      `Dibuat: ${new Date(result.createdAt).toLocaleString("id-ID")}`,
      `Model: ${funnelModels.find((f) => f.id === result.model)?.label}`,
      "",
      "=== RINGKASAN ===",
      result.summary,
      "",
      ...result.stages.map((s) =>
        `\n===== ${s.label.toUpperCase()} =====\nTujuan: ${s.goal}\nPlatform/Channel: ${s.platform}\nPesan Kunci: ${s.message}\n\nContoh Copy:\n${s.copyExample}\n\nMetrics Utama: ${s.metrics}\n\nTips & Action: ${s.tips}`
      ),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `funnel-${result.productName.toLowerCase().replace(/\s+/g, "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-primary" />
              Funnel Planner
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Rancang funnel penjualan produk digital dari awareness hingga repeat buyer
            </p>
          </div>
          <Badge variant="secondary" className="hidden md:flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Funnel Builder
          </Badge>
        </div>

        {/* Funnel Model Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {funnelModels.map((f) => (
            <button
              key={f.id}
              onClick={() => setFunnelModel(f.id)}
              data-testid={`button-funnel-model-${f.id}`}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                funnelModel === f.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              }`}
            >
              <div className={`text-xs font-semibold mb-1 ${funnelModel === f.id ? "text-primary" : ""}`}>{f.label}</div>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          {/* Form */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Detail Produk & Target
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Nama Produk *</Label>
                  <Input
                    placeholder="contoh: Kelas Meta Ads Mastery"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    data-testid="input-funnel-product"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Jenis Produk</Label>
                  <Select value={productType} onValueChange={setProductType}>
                    <SelectTrigger data-testid="select-funnel-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          <div>
                            <span className="font-medium">{t.label}</span>
                            <span className="text-muted-foreground text-xs ml-2">{t.examples}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Harga Produk</Label>
                  <Input
                    placeholder="contoh: Rp 97.000"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    data-testid="input-funnel-price"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Target Market *</Label>
                  <Input
                    placeholder="contoh: Wirausahawan muda 20-35 tahun yang ingin mulai jual produk digital"
                    value={targetMarket}
                    onChange={(e) => setTargetMarket(e.target.value)}
                    data-testid="input-funnel-target"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Manfaat Utama Produk</Label>
                  <Textarea
                    placeholder="Apa transformasi/hasil yang didapat pembeli?"
                    value={productBenefit}
                    onChange={(e) => setProductBenefit(e.target.value)}
                    className="min-h-[60px] resize-none"
                    data-testid="input-funnel-benefit"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Sumber Traffic Utama</Label>
                  <Select value={trafficSource} onValueChange={setTrafficSource}>
                    <SelectTrigger data-testid="select-traffic">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {trafficSources.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !productName.trim() || !targetMarket.trim()}
              className="w-full"
              size="lg"
              data-testid="button-generate-funnel"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sedang Merancang Funnel...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Generate Funnel Plan<ChevronRight className="ml-2 h-4 w-4" /></>
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
                    <p className="text-sm font-medium">AI sedang merancang funnel Anda...</p>
                    <p className="text-xs text-muted-foreground">Membangun strategi 5 tahap funnel</p>
                  </div>
                </CardContent>
              </Card>
            ) : result ? (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Funnel: {result.productName}</CardTitle>
                        <CardDescription className="text-xs">
                          {funnelModels.find((f) => f.id === result.model)?.label} • {trafficSource}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleGenerate} data-testid="button-regen-funnel">
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={copyAll} data-testid="button-copy-funnel">
                          <Copy className="h-3.5 w-3.5 mr-1" />Copy
                        </Button>
                        <Button size="sm" variant="outline" onClick={downloadFunnel} data-testid="button-download-funnel">
                          <Download className="h-3.5 w-3.5 mr-1" />Save
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
                  </CardContent>
                </Card>

                {/* Funnel Visual Flow */}
                <div className="space-y-2">
                  {result.stages.map((s, idx) => {
                    const Icon = funnelStageIcons[s.stage] || Target;
                    const colorClass = funnelStageColors[s.stage] || "bg-muted border-border";
                    const textColor = funnelStageTextColors[s.stage] || "text-foreground";
                    const isActive = activeStage === idx;

                    return (
                      <div key={s.stage}>
                        <button
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isActive ? `${colorClass} shadow-sm` : "border-border hover:border-primary/30 bg-background"
                          }`}
                          onClick={() => setActiveStage(isActive ? -1 : idx)}
                          data-testid={`button-stage-${s.stage}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isActive ? colorClass : "bg-muted border-border"}`}>
                                <Icon className={`h-4 w-4 ${isActive ? textColor : "text-muted-foreground"}`} />
                              </div>
                              <div>
                                <div className={`text-sm font-semibold ${isActive ? textColor : ""}`}>{s.label}</div>
                                <div className="text-xs text-muted-foreground">{s.goal}</div>
                              </div>
                            </div>
                            <Badge variant="outline" className={`text-xs ${isActive ? colorClass : ""}`}>
                              {s.platform}
                            </Badge>
                          </div>

                          {isActive && (
                            <div className="mt-4 space-y-3 text-left">
                              <Separator />
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Pesan Kunci</p>
                                <p className="text-sm">{s.message}</p>
                              </div>
                              <div className="bg-background rounded-lg p-3 border">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contoh Copy</p>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 text-xs"
                                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(s.copyExample); toast({ title: "Disalin!" }); }}
                                    data-testid={`copy-stage-${s.stage}`}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />Copy
                                  </Button>
                                </div>
                                <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed text-foreground/80">{s.copyExample}</pre>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-muted/50 rounded-lg p-2.5">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">📊 Metrics</p>
                                  <p className="text-xs">{s.metrics}</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-2.5">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">💡 Tips</p>
                                  <p className="text-xs">{s.tips}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </button>
                        {idx < result.stages.length - 1 && (
                          <div className="flex justify-center py-1">
                            <ArrowDown className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="h-[580px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <GitBranch className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Funnel plan belum dibuat</p>
                      <p className="text-xs text-muted-foreground mt-1">Isi detail produk & target, lalu generate</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-w-[220px] mx-auto text-left">
                      {[
                        { icon: Eye, label: "Awareness — Tarik perhatian" },
                        { icon: Target, label: "Interest — Bangun minat" },
                        { icon: MousePointer, label: "Consideration — Yakinkan" },
                        { icon: ShoppingCart, label: "Conversion — Closing" },
                        { icon: Heart, label: "Retention — Repeat buyer" },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Icon className="h-3.5 w-3.5 text-primary" />
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
