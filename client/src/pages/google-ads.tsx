import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Loader2, ChevronRight, Copy, RefreshCw, CheckCircle2,
  AlertCircle, Sparkles, Target, Zap, Star, List,
  Link2, Tag, Phone, MapPin, ShoppingBag,
  Monitor, Smartphone, ExternalLink, TrendingUp,
  BarChart2, ChevronDown,
} from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

const campaignTypes = [
  { id: "search", label: "🔍 Google Search", desc: "Muncul di hasil pencarian Google" },
  { id: "performance_max", label: "⚡ Performance Max", desc: "Otomatis di semua channel Google" },
  { id: "display", label: "🖼️ Google Display", desc: "Banner di jutaan website partner" },
  { id: "shopping", label: "🛒 Google Shopping", desc: "Tampilkan produk di pencarian" },
];

const objectives = [
  { id: "sales", label: "💰 Penjualan / Sales" },
  { id: "leads", label: "📋 Generate Leads" },
  { id: "traffic", label: "🌐 Website Traffic" },
  { id: "awareness", label: "📢 Brand Awareness" },
  { id: "app", label: "📱 App Downloads" },
];

const matchTypes = [
  { id: "broad", label: "Broad Match", icon: "🔵", desc: "Jangkauan luas" },
  { id: "phrase", label: "Phrase Match", icon: "🟡", desc: "Lebih relevan" },
  { id: "exact", label: "Exact Match", icon: "🟢", desc: "Paling presisi" },
];

interface Headline {
  teks: string;
  karakter: number;
  pinned?: string;
  qsTip: string;
}

interface Description {
  teks: string;
  karakter: number;
  qsTip: string;
}

interface Extension {
  type: string;
  items: string[];
}

interface AdGroup {
  nama: string;
  keywords: { keyword: string; matchType: string; estimasiBid: string }[];
  headlines: Headline[];
  descriptions: Description[];
}

interface GoogleAdsResult {
  judulKampanye: string;
  campaignType: string;
  tujuan: string;
  qualityScore: { score: number; label: string; tips: string[] };
  adGroups: AdGroup[];
  extensions: Extension[];
  negativeKeywords: string[];
  budgetStrategy: string;
  biddingStrategy: string;
  tips: string[];
}

const charLimit = { headline: 30, description: 90 };

function CharBar({ text, max }: { text: string; max: number }) {
  const len = text.length;
  const pct = Math.min((len / max) * 100, 100);
  const color = pct > 90 ? "bg-red-500" : pct > 75 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="flex items-center gap-2 mt-0.5">
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div className={`h-1 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs tabular-nums ${pct > 90 ? "text-red-500" : "text-muted-foreground"}`}>{len}/{max}</span>
    </div>
  );
}

export default function GoogleAds() {
  const [campaignType, setCampaignType] = useState("search");
  const [objective, setObjective] = useState("sales");
  const [produk, setProduk] = useState("");
  const [url, setUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [usp, setUsp] = useState("");
  const [budget, setBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GoogleAdsResult | null>(null);
  const [activeGroup, setActiveGroup] = useState(0);
  const [serpView, setSerpView] = useState<"desktop" | "mobile">("desktop");
  const [serpH, setSerpH] = useState([0, 1, 2]);
  const [serpD, setSerpD] = useState([0, 1]);
  const { toast } = useToast();

  const getAdStrength = (group: typeof result extends null ? never : NonNullable<typeof result>["adGroups"][0]) => {
    if (!group) return 0;
    const hCount = group.headlines.length;
    const dCount = group.descriptions.length;
    const hasKeywordInH = group.headlines.some((h) => keywords && h.teks.toLowerCase().includes(keywords.split(",")[0]?.trim().toLowerCase().split(" ")[0] || "___"));
    const avgHLen = group.headlines.reduce((s, h) => s + h.karakter, 0) / Math.max(hCount, 1);
    const avgDLen = group.descriptions.reduce((s, d) => s + d.karakter, 0) / Math.max(dCount, 1);
    let score = 0;
    score += Math.min(hCount / 15, 1) * 35;
    score += Math.min(dCount / 4, 1) * 20;
    score += Math.min(avgHLen / 25, 1) * 20;
    score += Math.min(avgDLen / 75, 1) * 15;
    score += hasKeywordInH ? 10 : 0;
    return Math.round(score);
  };

  const adStrengthLabel = (s: number) =>
    s >= 80 ? { label: "Excellent", color: "text-green-600" } :
    s >= 60 ? { label: "Good", color: "text-blue-600" } :
    s >= 40 ? { label: "Average", color: "text-yellow-600" } :
    { label: "Poor", color: "text-red-600" };

  const handleGenerate = async () => {
    if (!produk.trim()) {
      toast({ title: "Isi produk/bisnis dulu", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/generate-google-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignType, objective, produk, url, keywords, targetAudience, usp, budget }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setResult(data);
      setActiveGroup(0);
    } catch {
      toast({ title: "Error", description: "Gagal generate. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAdGroup = (group: AdGroup) => {
    const text = [
      `=== ${group.nama} ===`,
      `\nHEADLINES (${group.headlines.length}/15):`,
      ...group.headlines.map((h, i) => `${i + 1}. ${h.teks} [${h.karakter} char]`),
      `\nDESCRIPTIONS (${group.descriptions.length}/4):`,
      ...group.descriptions.map((d, i) => `${i + 1}. ${d.teks} [${d.karakter} char]`),
      `\nKEYWORDS:`,
      ...group.keywords.map((k) => `• [${k.matchType}] ${k.keyword} — ${k.estimasiBid}`),
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Ad group disalin!" });
  };

  const copyAll = () => {
    if (!result) return;
    const text = result.adGroups.map((g) => [
      `=== ${g.nama} ===`,
      "\nHEADLINES:",
      ...g.headlines.map((h, i) => `${i + 1}. ${h.teks}`),
      "\nDESCRIPTIONS:",
      ...g.descriptions.map((d, i) => `${i + 1}. ${d.teks}`),
    ].join("\n")).join("\n\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Semua ad group disalin!" });
  };

  const activeGroupData = result?.adGroups[activeGroup];

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <SiGoogle className="h-6 w-6 text-blue-500" />
              Google Ads Creator
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Generate RSA headlines, descriptions, keywords, dan ad extensions — siap upload ke Google Ads
            </p>
          </div>
          <Badge className="hidden md:flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0">
            <Star className="h-3 w-3" />
            RSA Format
          </Badge>
        </div>

        {/* Campaign Type */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {campaignTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setCampaignType(t.id)}
              data-testid={`btn-gtype-${t.id}`}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                campaignType === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
            >
              <p className={`text-sm font-semibold ${campaignType === t.id ? "text-primary" : ""}`}>{t.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
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
                  Detail Kampanye
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Produk / Bisnis / Jasa *</Label>
                  <Input
                    placeholder="contoh: Kursus Digital Marketing, Jasa Pembuatan Website..."
                    value={produk}
                    onChange={(e) => setProduk(e.target.value)}
                    data-testid="input-ga-produk"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Landing Page URL (opsional)</Label>
                  <Input
                    placeholder="https://websitekamu.com/promo"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    data-testid="input-ga-url"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tujuan Kampanye</Label>
                  <Select value={objective} onValueChange={setObjective}>
                    <SelectTrigger data-testid="select-ga-obj">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {objectives.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Keyword Utama (pisah dengan koma)</Label>
                  <Textarea
                    placeholder="kursus digital marketing, belajar google ads, training marketing online..."
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="min-h-[70px] text-sm"
                    data-testid="input-ga-kw"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>USP / Keunggulan</Label>
                  <Input
                    placeholder="contoh: Garansi sertifikat, mentor berpengalaman 10 tahun..."
                    value={usp}
                    onChange={(e) => setUsp(e.target.value)}
                    data-testid="input-ga-usp"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Target Audiens</Label>
                  <Input
                    placeholder="contoh: Pebisnis online, fresh graduate, UKM..."
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    data-testid="input-ga-audience"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Budget Harian (Rp)</Label>
                  <Input
                    placeholder="contoh: 100.000, 500.000..."
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    data-testid="input-ga-budget"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !produk.trim()}
              className="w-full"
              size="lg"
              data-testid="button-generate-ga"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Google Ads...</>
              ) : (
                <><SiGoogle className="mr-2 h-4 w-4" />Generate Kampanye<ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>

          {/* Output */}
          <div className="xl:col-span-3">
            {isLoading ? (
              <Card className="h-full min-h-[500px] flex items-center justify-center">
                <CardContent className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                  <p className="font-medium text-sm">Generating Google Ads RSA...</p>
                  <p className="text-xs text-muted-foreground">Membuat headlines, descriptions & extensions</p>
                </CardContent>
              </Card>
            ) : result ? (
              <Card className="h-full">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <p className="font-semibold text-sm truncate">{result.judulKampanye}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Quality Score:</span>
                          <Badge className={`text-xs ${result.qualityScore.score >= 8 ? "bg-green-500" : result.qualityScore.score >= 6 ? "bg-yellow-500" : "bg-red-500"} text-white`}>
                            {result.qualityScore.score}/10 — {result.qualityScore.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <Button size="sm" variant="outline" onClick={handleGenerate} data-testid="btn-regen-ga">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={copyAll} data-testid="btn-copy-all-ga">
                        <Copy className="h-3.5 w-3.5 mr-1" />All
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <Tabs defaultValue="rsa">
                    <div className="px-4 pt-2 border-b">
                      <TabsList className="h-8 bg-transparent gap-0.5 flex-wrap">
                        {[
                          { id: "rsa", label: "📝 RSA" },
                          { id: "serp", label: "🔍 SERP Preview" },
                          { id: "keywords", label: "🔑 Keywords" },
                          { id: "extensions", label: "🔗 Extensions" },
                          { id: "strategy", label: "💡 Strategi" },
                        ].map((t) => (
                          <TabsTrigger key={t.id} value={t.id} data-testid={`tab-ga-${t.id}`}
                            className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                            {t.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    {/* RSA Tab */}
                    <TabsContent value="rsa" className="p-4 mt-0">
                      {/* Ad Group Switcher */}
                      {result.adGroups.length > 1 && (
                        <div className="flex gap-2 mb-3 flex-wrap">
                          {result.adGroups.map((g, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveGroup(i)}
                              data-testid={`btn-adgroup-${i}`}
                              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                                activeGroup === i ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/30"
                              }`}
                            >
                              {g.nama}
                            </button>
                          ))}
                        </div>
                      )}

                      {activeGroupData && (
                        <ScrollArea className="h-[420px]">
                          <div className="space-y-4 pr-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold">Ad Group: {activeGroupData.nama}</p>
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => copyAdGroup(activeGroupData)} data-testid="btn-copy-group">
                                <Copy className="h-3 w-3 mr-1" />Copy Group
                              </Button>
                            </div>

                            {/* Headlines */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-xs font-semibold uppercase text-muted-foreground">Headlines ({activeGroupData.headlines.length}/15 max)</p>
                                <Badge variant="outline" className="text-xs">max 30 char</Badge>
                              </div>
                              <div className="space-y-2">
                                {activeGroupData.headlines.map((h, i) => (
                                  <div key={i} className={`p-2 rounded-lg border ${h.karakter > 30 ? "border-red-300 bg-red-50/50 dark:bg-red-950/20" : "border-border"}`}>
                                    <div className="flex items-start gap-2">
                                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm font-medium">{h.teks}</p>
                                          {h.pinned && <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0 text-xs">{h.pinned}</Badge>}
                                          {h.karakter > 30 && <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
                                        </div>
                                        <CharBar text={h.teks} max={30} />
                                        <p className="text-xs text-muted-foreground mt-0.5 italic">{h.qsTip}</p>
                                      </div>
                                      <button onClick={() => { navigator.clipboard.writeText(h.teks); toast({ title: "Disalin!", description: h.teks }); }} className="p-1 hover:bg-muted rounded flex-shrink-0">
                                        <Copy className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Descriptions */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-xs font-semibold uppercase text-muted-foreground">Descriptions ({activeGroupData.descriptions.length}/4 max)</p>
                                <Badge variant="outline" className="text-xs">max 90 char</Badge>
                              </div>
                              <div className="space-y-2">
                                {activeGroupData.descriptions.map((d, i) => (
                                  <div key={i} className={`p-2 rounded-lg border ${d.karakter > 90 ? "border-red-300 bg-red-50/50 dark:bg-red-950/20" : "border-border"}`}>
                                    <div className="flex items-start gap-2">
                                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                      <div className="flex-1">
                                        <p className="text-sm">{d.teks}</p>
                                        <CharBar text={d.teks} max={90} />
                                        <p className="text-xs text-muted-foreground mt-0.5 italic">{d.qsTip}</p>
                                      </div>
                                      <button onClick={() => { navigator.clipboard.writeText(d.teks); toast({ title: "Disalin!" }); }} className="p-1 hover:bg-muted rounded flex-shrink-0">
                                        <Copy className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* QS Tips */}
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">💡 Quality Score Tips</p>
                              <ul className="space-y-1">
                                {result.qualityScore.tips.map((t, i) => (
                                  <li key={i} className="text-xs text-blue-700 dark:text-blue-400">• {t}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>

                    {/* SERP Preview Tab */}
                    <TabsContent value="serp" className="p-4 mt-0">
                      {activeGroupData && (() => {
                        const strength = getAdStrength(activeGroupData);
                        const sl = adStrengthLabel(strength);
                        const h1 = activeGroupData.headlines[serpH[0]]?.teks || "";
                        const h2 = activeGroupData.headlines[serpH[1]]?.teks || "";
                        const h3 = activeGroupData.headlines[serpH[2]]?.teks || "";
                        const d1 = activeGroupData.descriptions[serpD[0]]?.teks || "";
                        const d2 = activeGroupData.descriptions[serpD[1]]?.teks || "";
                        const displayUrl = (url || "websitekamu.com").replace(/https?:\/\//, "").replace(/\/$/, "");
                        const fullDesc = `${d1} ${d2}`.trim();

                        return (
                          <div className="space-y-4">
                            {/* Ad Strength Meter */}
                            <div className="p-3 rounded-xl border bg-gradient-to-r from-muted/30 to-muted/10">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <BarChart2 className="h-4 w-4 text-primary" />
                                  <p className="text-sm font-semibold">Ad Strength</p>
                                </div>
                                <span className={`text-sm font-bold ${sl.color}`}>{strength}% — {sl.label}</span>
                              </div>
                              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-2.5 rounded-full transition-all duration-700 ${strength >= 80 ? "bg-green-500" : strength >= 60 ? "bg-blue-500" : strength >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                                  style={{ width: `${strength}%` }}
                                />
                              </div>
                              <div className="flex justify-between mt-1">
                                {["Poor", "Average", "Good", "Excellent"].map((l) => (
                                  <span key={l} className="text-xs text-muted-foreground">{l}</span>
                                ))}
                              </div>
                            </div>

                            {/* Desktop/Mobile Toggle */}
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-muted-foreground uppercase">Preview Tampilan</p>
                              <div className="flex border rounded-lg overflow-hidden">
                                <button onClick={() => setSerpView("desktop")} data-testid="btn-serp-desktop"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${serpView === "desktop" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                                  <Monitor className="h-3.5 w-3.5" />Desktop
                                </button>
                                <button onClick={() => setSerpView("mobile")} data-testid="btn-serp-mobile"
                                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${serpView === "mobile" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                                  <Smartphone className="h-3.5 w-3.5" />Mobile
                                </button>
                              </div>
                            </div>

                            {/* SERP Preview Card */}
                            <div className={`${serpView === "mobile" ? "max-w-[360px]" : "w-full"} bg-white dark:bg-zinc-950 border rounded-xl p-4 shadow-md`}>
                              {/* Google Search Bar (decorative) */}
                              <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                                <SiGoogle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                <div className="flex-1 border rounded-full px-3 py-1.5 bg-muted/30 text-xs text-muted-foreground">
                                  {keywords ? keywords.split(",")[0].trim() : `${produk} terbaik`}
                                </div>
                              </div>

                              {/* Ad Result */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs border border-[#006621] text-[#006621] dark:border-green-500 dark:text-green-500 px-1 rounded font-medium">Ad</span>
                                  <span className="text-xs text-[#006621] dark:text-green-500 font-medium truncate">{displayUrl}</span>
                                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <div className={`${serpView === "mobile" ? "text-base" : "text-lg"} text-[#1a0dab] dark:text-blue-400 font-medium leading-tight hover:underline cursor-pointer`}>
                                  {[h1, h2, h3].filter(Boolean).join(" | ")}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                                  {fullDesc || "Deskripsi akan muncul di sini. Pastikan mengandung keyword dan call-to-action yang jelas."}
                                </p>

                                {/* Sitelinks */}
                                {result?.extensions?.[0]?.items && (
                                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5">
                                    {result.extensions[0].items.slice(0, 4).map((item, i) => (
                                      <span key={i} className="text-xs text-[#1a0dab] dark:text-blue-400 hover:underline cursor-pointer">
                                        {item.split("|")[0].trim()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 pt-2 border-t flex items-center justify-between">
                                <p className="text-xs text-muted-foreground italic">Preview estimasi — tampilan aktual mungkin berbeda</p>
                                <button
                                  onClick={() => {
                                    const t = `${[h1, h2, h3].filter(Boolean).join(" | ")}\n${fullDesc}`;
                                    navigator.clipboard.writeText(t);
                                    toast({ title: "Ad copy disalin!" });
                                  }}
                                  data-testid="btn-copy-serp"
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  <Copy className="h-3 w-3" />Copy
                                </button>
                              </div>
                            </div>

                            {/* Headline Combination Picker */}
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Pilih Kombinasi Headline (3 posisi)</p>
                              <div className="grid grid-cols-3 gap-2">
                                {[0, 1, 2].map((pos) => (
                                  <div key={pos}>
                                    <p className="text-xs text-muted-foreground mb-1">Posisi {pos + 1}</p>
                                    <div className="space-y-1 max-h-32 overflow-y-auto rounded border p-1">
                                      {activeGroupData.headlines.map((h, i) => (
                                        <button
                                          key={i}
                                          onClick={() => {
                                            const newH = [...serpH];
                                            newH[pos] = i;
                                            setSerpH(newH);
                                          }}
                                          data-testid={`btn-serp-h${pos}-${i}`}
                                          className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${serpH[pos] === i ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                                        >
                                          {h.teks.slice(0, 20)}{h.teks.length > 20 ? "…" : ""}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Description Picker */}
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Pilih Description (2 posisi)</p>
                              <div className="grid grid-cols-2 gap-2">
                                {[0, 1].map((pos) => (
                                  <div key={pos}>
                                    <p className="text-xs text-muted-foreground mb-1">Desc {pos + 1}</p>
                                    <div className="space-y-1 max-h-24 overflow-y-auto rounded border p-1">
                                      {activeGroupData.descriptions.map((d, i) => (
                                        <button
                                          key={i}
                                          onClick={() => {
                                            const newD = [...serpD];
                                            newD[pos] = i;
                                            setSerpD(newD);
                                          }}
                                          data-testid={`btn-serp-d${pos}-${i}`}
                                          className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${serpD[pos] === i ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                                        >
                                          {d.teks.slice(0, 35)}{d.teks.length > 35 ? "…" : ""}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </TabsContent>

                    {/* Keywords Tab */}
                    <TabsContent value="keywords" className="p-4 mt-0">
                      <ScrollArea className="h-[420px]">
                        <div className="space-y-4 pr-1">
                          {result.adGroups.map((g, gi) => (
                            <div key={gi}>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{g.nama}</p>
                              <div className="space-y-1.5">
                                {g.keywords.map((kw, ki) => (
                                  <div key={ki} className="flex items-center gap-3 p-2 rounded border">
                                    <Badge variant="outline" className={`text-xs flex-shrink-0 ${
                                      kw.matchType === "Broad" ? "border-blue-300 text-blue-600" :
                                      kw.matchType === "Phrase" ? "border-yellow-300 text-yellow-600" :
                                      "border-green-300 text-green-600"
                                    }`}>{kw.matchType}</Badge>
                                    <span className="text-sm flex-1">{kw.keyword}</span>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">{kw.estimasiBid}</span>
                                    <button onClick={() => { navigator.clipboard.writeText(kw.keyword); toast({ title: "Disalin!", description: kw.keyword }); }} className="p-1 hover:bg-muted rounded">
                                      <Copy className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          {result.negativeKeywords.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">❌ Negative Keywords</p>
                              <div className="flex flex-wrap gap-1.5">
                                {result.negativeKeywords.map((kw, i) => (
                                  <button key={i} onClick={() => { navigator.clipboard.writeText(kw); toast({ title: "Disalin!" }); }}
                                    className="px-2 py-0.5 rounded-full border border-red-200 text-red-600 dark:border-red-800 dark:text-red-400 text-xs hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                    data-testid={`neg-ga-${i}`}>
                                    -{kw}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Extensions Tab */}
                    <TabsContent value="extensions" className="p-4 mt-0">
                      <div className="space-y-4">
                        <p className="text-xs text-muted-foreground">Ad extensions meningkatkan visibilitas dan CTR secara signifikan</p>
                        {result.extensions.map((ext, i) => {
                          const icons: Record<string, typeof Link2> = { sitelinks: Link2, callouts: Tag, phone: Phone, location: MapPin, promotions: ShoppingBag };
                          const Icon = icons[ext.type.toLowerCase()] || Tag;
                          return (
                            <Card key={i}>
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-primary" />
                                    {ext.type}
                                  </CardTitle>
                                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => { navigator.clipboard.writeText(ext.items.join("\n")); toast({ title: "Disalin!" }); }} data-testid={`copy-ext-${i}`}>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-3">
                                <ul className="space-y-1">
                                  {ext.items.map((item, j) => (
                                    <li key={j} className="text-sm flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </TabsContent>

                    {/* Strategy Tab */}
                    <TabsContent value="strategy" className="p-4 mt-0">
                      <div className="space-y-3">
                        <Card className="border-primary/30">
                          <CardContent className="pt-3 pb-3 space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Bidding Strategy</p>
                              <p className="text-sm">{result.biddingStrategy}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Budget Strategy</p>
                              <p className="text-sm">{result.budgetStrategy}</p>
                            </div>
                          </CardContent>
                        </Card>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Tips Optimasi Google Ads</p>
                          {result.tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                              <p className="text-sm">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full min-h-[500px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-5 max-w-sm">
                    <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                      <SiGoogle className="h-10 w-10 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Google Ads RSA Creator</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Generate kampanye Google Ads yang siap upload — format RSA lengkap dengan extensions
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-left max-w-xs mx-auto">
                      {[
                        { icon: Sparkles, label: "15 headlines (max 30 char)" },
                        { icon: List, label: "4 descriptions (max 90 char)" },
                        { icon: Tag, label: "Ad extensions lengkap" },
                        { icon: Star, label: "Quality Score estimasi & tips" },
                        { icon: Target, label: "Keyword dengan match type" },
                        { icon: Zap, label: "Bidding & budget strategy" },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2 text-sm">
                          <Icon className="h-4 w-4 text-blue-500 flex-shrink-0" />
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
