import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Rocket, Loader2, Sparkles, ChevronRight, Copy,
  CheckCircle2, Megaphone, Globe, MessageCircle,
  Send, RefreshCw, Download, Play,
  BarChart2, Users, Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const targetMarkets = [
  "Ibu Rumah Tangga (IRT) 25-40 tahun",
  "Mahasiswa & Fresh Graduate",
  "Karyawan yang ingin side income",
  "Wirausahawan / UMKM",
  "Freelancer & Content Creator",
  "Digital Marketer & Advertiser",
  "Pemula bisnis online",
  "Pemilik toko online",
  "Reseller & Dropshipper",
  "Profesional yang ingin upgrade skill",
];

const productTypes = [
  "Produk Digital (ebook/course/template)",
  "Produk Fisik",
  "Jasa / Layanan",
  "SaaS / Aplikasi",
];

const objectives = [
  "Penjualan Langsung",
  "Generate Leads (WA/Email)",
  "Brand Awareness",
  "Webinar / Event",
];

interface CampaignPackage {
  productName: string;
  metaAds: { variation: number; hook: string; body: string; cta: string }[];
  landingPage: { headline: string; subheadline: string; bullets: string[]; ctaText: string; urgency: string };
  whatsappBroadcast: { cold: string; warm: string; urgency: string };
  closingScript: string;
  funnelSummary: string;
  campaignTips: string[];
}

interface GenerationProgress {
  metaAds: "idle" | "loading" | "done";
  landingPage: "idle" | "loading" | "done";
  whatsapp: "idle" | "loading" | "done";
  closing: "idle" | "loading" | "done";
}

const packageTabs = [
  { id: "metaAds", label: "📱 Meta Ads", icon: Megaphone },
  { id: "landingPage", label: "🌐 Landing Page", icon: Globe },
  { id: "whatsapp", label: "💬 WA Broadcast", icon: MessageCircle },
  { id: "closing", label: "🔥 Closing Script", icon: Send },
  { id: "summary", label: "🗺️ Funnel Map", icon: BarChart2 },
];

export default function CampaignLauncher() {
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("Produk Digital (ebook/course/template)");
  const [productPrice, setProductPrice] = useState("");
  const [targetMarket, setTargetMarket] = useState("Mahasiswa & Fresh Graduate");
  const [productBenefit, setProductBenefit] = useState("");
  const [objective, setObjective] = useState("Penjualan Langsung");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [result, setResult] = useState<CampaignPackage | null>(null);
  const [activeTab, setActiveTab] = useState("metaAds");
  const { toast } = useToast();

  const handleLaunch = async () => {
    if (!productName.trim() || !productBenefit.trim()) {
      toast({ title: "Lengkapi form", description: "Nama produk dan manfaat utama wajib diisi", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setProgress(10);
    setProgressLabel("Menyiapkan campaign strategy...");

    try {
      setProgress(30);
      setProgressLabel("AI sedang generate Meta Ads...");

      await new Promise((r) => setTimeout(r, 500));
      setProgress(55);
      setProgressLabel("Membuat Landing Page content...");

      await new Promise((r) => setTimeout(r, 400));
      setProgress(75);
      setProgressLabel("Menyusun WhatsApp Broadcast...");

      await new Promise((r) => setTimeout(r, 300));
      setProgress(90);
      setProgressLabel("Generate closing script & funnel map...");

      const response = await fetch("/api/launch-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, productType, productPrice, targetMarket, productBenefit, objective }),
      });

      if (!response.ok) throw new Error("Gagal generate campaign");
      const data = await response.json();

      setProgress(100);
      setProgressLabel("Campaign package siap! 🚀");
      await new Promise((r) => setTimeout(r, 400));

      setResult(data);
      setActiveTab("metaAds");
    } catch {
      toast({ title: "Error", description: "Gagal generate. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copySection = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: `${label} berhasil disalin` });
  };

  const downloadAll = () => {
    if (!result) return;
    const text = [
      `===== CAMPAIGN PACKAGE: ${result.productName} =====\n`,
      `--- META ADS (${result.metaAds.length} Variasi) ---`,
      ...result.metaAds.map((ad) => `\n[Variasi ${ad.variation}]\nHook: ${ad.hook}\n\n${ad.body}\n\nCTA: ${ad.cta}`),
      `\n--- LANDING PAGE ---`,
      `Headline: ${result.landingPage.headline}`,
      `Sub-headline: ${result.landingPage.subheadline}`,
      `Bullets:\n${result.landingPage.bullets.map((b) => `• ${b}`).join("\n")}`,
      `CTA: ${result.landingPage.ctaText}`,
      `Urgency: ${result.landingPage.urgency}`,
      `\n--- WHATSAPP BROADCAST ---`,
      `[Cold]\n${result.whatsappBroadcast.cold}`,
      `\n[Warm]\n${result.whatsappBroadcast.warm}`,
      `\n[Urgency]\n${result.whatsappBroadcast.urgency}`,
      `\n--- CLOSING SCRIPT ---\n${result.closingScript}`,
      `\n--- FUNNEL MAP ---\n${result.funnelSummary}`,
      `\n--- TIPS CAMPAIGN ---\n${result.campaignTips.map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${productName.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              Campaign Launcher
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Input produk sekali — AI generate seluruh paket campaign marketing sekaligus
            </p>
          </div>
          <Badge className="hidden md:flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-0">
            <Zap className="h-3 w-3" />
            1-Click Full Package
          </Badge>
        </div>

        {/* What's included */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { icon: Megaphone, label: "3 Meta Ads", desc: "Variasi copy FB/IG" },
            { icon: Globe, label: "Landing Page", desc: "Headline & bullets" },
            { icon: MessageCircle, label: "WA Broadcast", desc: "Cold + warm + urgency" },
            { icon: Send, label: "Closing Script", desc: "Script CS yang convert" },
            { icon: BarChart2, label: "Funnel Map", desc: "Alur & tips campaign" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          {/* Form */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" />
                  Info Produk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Nama Produk *</Label>
                  <Input
                    placeholder="contoh: Kelas Meta Ads 100K ke 1 Miliar"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    data-testid="input-launch-product"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Jenis Produk</Label>
                  <Select value={productType} onValueChange={setProductType}>
                    <SelectTrigger data-testid="select-launch-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Harga Produk</Label>
                  <Input
                    placeholder="contoh: Rp 97.000"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    data-testid="input-launch-price"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Target Market</Label>
                  <Select value={targetMarket} onValueChange={setTargetMarket}>
                    <SelectTrigger data-testid="select-launch-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {targetMarkets.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Manfaat / Hasil Utama *</Label>
                  <Textarea
                    placeholder="Apa yang didapat pembeli? contoh: Bisa mulai ngiklan dari 100k, dapat script iklan winning, strategi scale sampai 1 miliar..."
                    value={productBenefit}
                    onChange={(e) => setProductBenefit(e.target.value)}
                    className="min-h-[80px] resize-none"
                    data-testid="input-launch-benefit"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tujuan Campaign</Label>
                  <Select value={objective} onValueChange={setObjective}>
                    <SelectTrigger data-testid="select-launch-objective">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {objectives.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleLaunch}
              disabled={isLoading || !productName.trim() || !productBenefit.trim()}
              className="w-full"
              size="lg"
              data-testid="button-launch-campaign"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />AI Sedang Generate...</>
              ) : (
                <><Rocket className="mr-2 h-4 w-4" />Launch Campaign Package<ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>

            {isLoading && (
              <Card>
                <CardContent className="pt-4 pb-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{progressLabel}</span>
                    <span className="font-bold text-primary">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {[
                      { key: "metaAds", label: "Meta Ads", done: progress >= 50 },
                      { key: "landingPage", label: "Landing Page", done: progress >= 65 },
                      { key: "whatsapp", label: "WA Broadcast", done: progress >= 80 },
                      { key: "closing", label: "Closing Script", done: progress >= 95 },
                    ].map(({ label, done }) => (
                      <div key={label} className="flex items-center gap-1.5 text-xs">
                        {done
                          ? <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          : <Loader2 className="h-3 w-3 text-primary animate-spin flex-shrink-0" />
                        }
                        <span className={done ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>{label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results */}
          <div className="xl:col-span-3">
            {result ? (
              <Card className="h-full">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Campaign Package Siap
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{result.productName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleLaunch} data-testid="button-relaunch">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadAll} data-testid="button-download-campaign">
                        <Download className="h-3.5 w-3.5 mr-1" />Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="border-b px-4 pt-2">
                      <TabsList className="h-8 bg-transparent gap-0.5 flex-wrap">
                        {packageTabs.map((t) => (
                          <TabsTrigger
                            key={t.id}
                            value={t.id}
                            className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            data-testid={`tab-${t.id}`}
                          >
                            {t.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    {/* Meta Ads */}
                    <TabsContent value="metaAds" className="p-4 space-y-4 mt-0">
                      {result.metaAds.map((ad) => (
                        <Card key={ad.variation} className="border">
                          <CardHeader className="pb-2 pt-3 px-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">Variasi {ad.variation}</Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs"
                                onClick={() => copySection(`${ad.hook}\n\n${ad.body}\n\n${ad.cta}`, `Meta Ads Variasi ${ad.variation}`)}
                                data-testid={`copy-ad-${ad.variation}`}
                              >
                                <Copy className="h-3 w-3 mr-1" />Copy
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="px-4 pb-3">
                            <div className="space-y-2">
                              <div className="bg-blue-50 dark:bg-blue-950/30 rounded px-3 py-1.5 border-l-4 border-blue-400">
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-0.5">HOOK</p>
                                <p className="text-sm font-medium">{ad.hook}</p>
                              </div>
                              <div className="px-1">
                                <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed text-foreground/80">{ad.body}</pre>
                              </div>
                              <div className="bg-green-50 dark:bg-green-950/30 rounded px-3 py-1.5 border-l-4 border-green-400">
                                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-0.5">CTA</p>
                                <p className="text-sm">{ad.cta}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    {/* Landing Page */}
                    <TabsContent value="landingPage" className="p-4 mt-0">
                      <ScrollArea className="h-[460px]">
                        <div className="space-y-4">
                          <Card className="border-primary/30 bg-primary/5">
                            <CardContent className="pt-4 pb-3">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">HEADLINE UTAMA</p>
                              <p className="text-xl font-bold leading-snug">{result.landingPage.headline}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4 pb-3">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">SUB-HEADLINE</p>
                              <p className="text-sm">{result.landingPage.subheadline}</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4 pb-3">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">BULLET POINTS</p>
                              <ul className="space-y-2">
                                {result.landingPage.bullets.map((b, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                          <div className="grid grid-cols-2 gap-3">
                            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
                              <CardContent className="pt-3 pb-3">
                                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">CTA BUTTON</p>
                                <p className="text-sm font-bold">{result.landingPage.ctaText}</p>
                              </CardContent>
                            </Card>
                            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
                              <CardContent className="pt-3 pb-3">
                                <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">URGENCY</p>
                                <p className="text-sm">{result.landingPage.urgency}</p>
                              </CardContent>
                            </Card>
                          </div>
                          <Button variant="outline" className="w-full text-sm" onClick={() => {
                            const text = `HEADLINE: ${result.landingPage.headline}\n\nSUB: ${result.landingPage.subheadline}\n\nBULLETS:\n${result.landingPage.bullets.map((b) => `• ${b}`).join("\n")}\n\nCTA: ${result.landingPage.ctaText}\nURGENCY: ${result.landingPage.urgency}`;
                            copySection(text, "Landing Page Content");
                          }} data-testid="copy-lp">
                            <Copy className="h-4 w-4 mr-2" />Copy Semua LP Content
                          </Button>
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* WA Broadcast */}
                    <TabsContent value="whatsapp" className="p-4 mt-0">
                      <ScrollArea className="h-[460px]">
                        <div className="space-y-4">
                          {[
                            { key: "cold", label: "❄️ Cold Prospect", sub: "Belum kenal produk", color: "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20", content: result.whatsappBroadcast.cold },
                            { key: "warm", label: "🌡️ Warm Prospect", sub: "Sudah pernah interaksi", color: "border-orange-200 bg-orange-50/50 dark:bg-orange-950/20", content: result.whatsappBroadcast.warm },
                            { key: "urgency", label: "🔥 Urgency Blast", sub: "Untuk follow-up & closing", color: "border-red-200 bg-red-50/50 dark:bg-red-950/20", content: result.whatsappBroadcast.urgency },
                          ].map(({ key, label, sub, color, content }) => (
                            <Card key={key} className={`border ${color}`}>
                              <CardHeader className="pb-2 pt-3 px-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold">{label}</p>
                                    <p className="text-xs text-muted-foreground">{sub}</p>
                                  </div>
                                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => copySection(content, label)} data-testid={`copy-wa-${key}`}>
                                    <Copy className="h-3 w-3 mr-1" />Copy
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="px-4 pb-3">
                                <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">{content}</pre>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Closing Script */}
                    <TabsContent value="closing" className="p-4 mt-0">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium">CS Closing Script</p>
                        <Button size="sm" variant="outline" onClick={() => copySection(result.closingScript, "Closing Script")} data-testid="copy-closing">
                          <Copy className="h-3.5 w-3.5 mr-1" />Copy
                        </Button>
                      </div>
                      <ScrollArea className="h-[430px]">
                        <div className="bg-muted/50 rounded-lg p-4 border">
                          <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{result.closingScript}</pre>
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Funnel Summary */}
                    <TabsContent value="summary" className="p-4 mt-0">
                      <ScrollArea className="h-[460px]">
                        <div className="space-y-4">
                          <div className="bg-muted/50 rounded-lg p-4 border">
                            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <BarChart2 className="h-4 w-4 text-primary" />Funnel & Strategi Campaign
                            </p>
                            <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{result.funnelSummary}</pre>
                          </div>
                          <Card>
                            <CardHeader className="pb-2 pt-3">
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" />Tips Optimasi Campaign
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-4">
                              <ul className="space-y-2">
                                {result.campaignTips.map((tip, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full min-h-[500px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-6 max-w-sm">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Rocket className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">1-Click Full Campaign Package</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Isi form produk di kiri, klik Launch, dan dapatkan seluruh materi campaign dalam satu klik
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-left">
                      {[
                        { icon: Megaphone, label: "3 variasi Meta Ads copy (FB/IG)" },
                        { icon: Globe, label: "Landing Page headline & bullets" },
                        { icon: MessageCircle, label: "3 WA Broadcast (cold/warm/urgency)" },
                        { icon: Send, label: "CS Closing script siap pakai" },
                        { icon: BarChart2, label: "Funnel map & tips optimasi" },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-3 text-sm">
                          <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Biasanya butuh 5 halaman berbeda — sekarang cukup 1 klik.</p>
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
