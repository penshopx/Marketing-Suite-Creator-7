import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  KeySquare, Loader2, Sparkles, ChevronRight, Copy,
  RefreshCw, TrendingUp, Target, Zap, BarChart2,
  ShoppingCart, DollarSign, AlertCircle, CheckCircle2,
  List, ChevronDown, ChevronUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const marketplaces = [
  { id: "shopee", label: "Shopee", emoji: "🛒", color: "border-orange-400 bg-orange-50 dark:bg-orange-950/20" },
  { id: "tokopedia", label: "Tokopedia", emoji: "🟢", color: "border-green-400 bg-green-50 dark:bg-green-950/20" },
  { id: "both", label: "Shopee + Tokopedia", emoji: "⚡", color: "border-blue-400 bg-blue-50 dark:bg-blue-950/20" },
];

const categories = [
  "Fashion & Pakaian", "Kecantikan & Skincare", "Elektronik & Gadget",
  "Rumah & Dapur", "Makanan & Minuman", "Olahraga & Outdoor",
  "Ibu & Bayi", "Otomotif", "Buku & Alat Tulis",
  "Kesehatan & Medis", "Hewan Peliharaan", "Hobi & Kolektibel",
  "Produk Digital", "Jasa", "Lainnya",
];

const matchTypes = [
  { id: "broad", label: "Broad Match", desc: "Jangkau lebih banyak pencarian" },
  { id: "phrase", label: "Phrase Match", desc: "Lebih relevan, lebih tertarget" },
  { id: "exact", label: "Exact Match", desc: "Presisi tinggi, volume lebih kecil" },
];

interface KeywordItem {
  keyword: string;
  tier: "high" | "medium" | "low";
  volume: string;
  competition: string;
  bidRange: string;
  intent: string;
  matchType: string;
}

interface KeywordGroup {
  label: string;
  keywords: KeywordItem[];
}

interface KeywordResult {
  produk: string;
  marketplace: string;
  kategori: string;
  summary: {
    totalKeyword: number;
    estimasiBudgetMin: string;
    estimasiBudgetMax: string;
    strategi: string;
  };
  groups: KeywordGroup[];
  longTail: string[];
  negative: string[];
  bidStrategy: string;
  tips: string[];
}

const tierConfig = {
  high: { label: "🔴 Kompetisi Tinggi", badge: "bg-red-500", text: "Butuh budget besar, hasil cepat" },
  medium: { label: "🟡 Kompetisi Sedang", badge: "bg-yellow-500", text: "Sweet spot ROI terbaik" },
  low: { label: "🟢 Kompetisi Rendah", badge: "bg-green-500", text: "Budget hemat, niche tertarget" },
};

export default function KeywordMarketplace() {
  const [marketplace, setMarketplace] = useState("shopee");
  const [produk, setProduk] = useState("");
  const [kategori, setKategori] = useState("Fashion & Pakaian");
  const [targetBuyer, setTargetBuyer] = useState("");
  const [budget, setBudget] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<KeywordResult | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(0);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!produk.trim()) {
      toast({ title: "Isi nama produk dulu", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/riset-keyword-marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketplace, produk, kategori, targetBuyer, budget }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setResult(data);
      setExpandedGroup(0);
    } catch {
      toast({ title: "Error", description: "Gagal generate keyword. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyKeywords = (keywords: KeywordItem[]) => {
    const text = keywords.map((k) => k.keyword).join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: `${keywords.length} keyword berhasil disalin` });
  };

  const copyAll = () => {
    if (!result) return;
    const all = result.groups.flatMap((g) => g.keywords.map((k) => k.keyword));
    navigator.clipboard.writeText(all.join("\n"));
    toast({ title: "Semua Disalin!", description: `${all.length} keyword disalin` });
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <KeySquare className="h-6 w-6 text-primary" />
              Riset Keyword Marketplace
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Temukan keyword optimal untuk iklan Shopee & Tokopedia — dengan tier kompetisi, estimasi bid, dan strategi
            </p>
          </div>
          <Badge className="hidden md:flex items-center gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-0">
            <ShoppingCart className="h-3 w-3" />
            Shopee & Tokopedia
          </Badge>
        </div>

        {/* Marketplace Selector */}
        <div className="grid grid-cols-3 gap-3">
          {marketplaces.map((m) => (
            <button
              key={m.id}
              onClick={() => setMarketplace(m.id)}
              data-testid={`button-mp-${m.id}`}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                marketplace === m.id ? m.color + " border-primary" : "border-border hover:border-primary/30"
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className={`text-sm font-semibold ${marketplace === m.id ? "text-primary" : ""}`}>{m.label}</span>
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
                  Detail Produk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Nama / Deskripsi Produk *</Label>
                  <Input
                    placeholder="contoh: Kaos Polos Oversize, Serum Vitamin C, Vacuum Cleaner Mini..."
                    value={produk}
                    onChange={(e) => setProduk(e.target.value)}
                    data-testid="input-kw-produk"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Select value={kategori} onValueChange={setKategori}>
                    <SelectTrigger data-testid="select-kw-kategori">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Target Pembeli (opsional)</Label>
                  <Input
                    placeholder="contoh: Mahasiswa, ibu muda, pria 25-40 tahun..."
                    value={targetBuyer}
                    onChange={(e) => setTargetBuyer(e.target.value)}
                    data-testid="input-kw-target"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Budget Iklan</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "low", label: "💰 Hemat", desc: "<Rp 50rb/hari" },
                      { id: "medium", label: "💳 Sedang", desc: "Rp 50-200rb" },
                      { id: "high", label: "🚀 Besar", desc: ">Rp 200rb/hari" },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBudget(b.id)}
                        data-testid={`button-budget-${b.id}`}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          budget === b.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        }`}
                      >
                        <p className={`text-xs font-semibold ${budget === b.id ? "text-primary" : ""}`}>{b.label}</p>
                        <p className="text-xs text-muted-foreground">{b.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info box */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-3 pb-3 space-y-2">
                <p className="text-xs font-semibold text-primary">3 Tier Keyword</p>
                {Object.entries(tierConfig).map(([tier, cfg]) => (
                  <div key={tier} className="flex items-start gap-2">
                    <span className="text-xs mt-0.5">{cfg.label.split(" ")[0]}</span>
                    <div>
                      <p className="text-xs font-medium">{cfg.label.split(" ").slice(1).join(" ")}</p>
                      <p className="text-xs text-muted-foreground">{cfg.text}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !produk.trim()}
              className="w-full"
              size="lg"
              data-testid="button-generate-kw"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analisis Keyword...</>
              ) : (
                <><KeySquare className="mr-2 h-4 w-4" />Riset Keyword<ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>

          {/* Output */}
          <div className="xl:col-span-3">
            {isLoading ? (
              <Card className="h-full min-h-[500px] flex items-center justify-center">
                <CardContent className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">Menganalisis keyword untuk {produk}...</p>
                  <p className="text-xs text-muted-foreground">Ini membutuhkan beberapa detik</p>
                </CardContent>
              </Card>
            ) : result ? (
              <div className="space-y-4">
                {/* Summary bar */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="border-primary/20">
                    <CardContent className="pt-3 pb-3 text-center">
                      <p className="text-xl font-bold text-primary">{result.summary.totalKeyword}</p>
                      <p className="text-xs text-muted-foreground">Total Keyword</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-3 pb-3 text-center">
                      <p className="text-sm font-bold">{result.summary.estimasiBudgetMin}</p>
                      <p className="text-xs text-muted-foreground">Est. Budget Min/hari</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-3 pb-3 text-center">
                      <p className="text-sm font-bold">{result.summary.estimasiBudgetMax}</p>
                      <p className="text-xs text-muted-foreground">Est. Budget Max/hari</p>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="keywords">
                  <TabsList className="h-8 bg-muted gap-1 w-full">
                    {[
                      { id: "keywords", label: "📋 Keyword Groups" },
                      { id: "longtail", label: "🎯 Long-tail" },
                      { id: "negative", label: "❌ Negative" },
                      { id: "strategy", label: "💡 Strategi" },
                    ].map((t) => (
                      <TabsTrigger key={t.id} value={t.id} className="text-xs flex-1 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        {t.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Keywords Tab */}
                  <TabsContent value="keywords" className="mt-3">
                    <div className="flex justify-end mb-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleGenerate} data-testid="btn-regen-kw">
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={copyAll} data-testid="btn-copy-all-kw">
                          <Copy className="h-3.5 w-3.5 mr-1" />Copy All
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3 pr-1">
                        {result.groups.map((group, gi) => {
                          const isOpen = expandedGroup === gi;
                          return (
                            <Card key={gi}>
                              <button
                                className="w-full"
                                onClick={() => setExpandedGroup(isOpen ? null : gi)}
                                data-testid={`toggle-group-${gi}`}
                              >
                                <CardHeader className="py-3 px-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold">{group.label}</span>
                                      <Badge variant="outline" className="text-xs">{group.keywords.length} keyword</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-xs"
                                        onClick={(e) => { e.stopPropagation(); copyKeywords(group.keywords); }}
                                        data-testid={`copy-group-${gi}`}
                                      >
                                        <Copy className="h-3 w-3 mr-1" />Copy
                                      </Button>
                                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </div>
                                  </div>
                                </CardHeader>
                              </button>
                              {isOpen && (
                                <CardContent className="pb-3 pt-0 px-4">
                                  <div className="space-y-2">
                                    {group.keywords.map((kw, ki) => {
                                      const tierCfg = tierConfig[kw.tier];
                                      return (
                                        <div key={ki} className="flex items-start gap-3 p-2 rounded-lg border bg-muted/30">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className="text-sm font-medium">{kw.keyword}</span>
                                              <Badge className={`${tierCfg.badge} text-white text-xs`}>{kw.competition}</Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                              <span>📊 {kw.volume}</span>
                                              <span>💰 {kw.bidRange}</span>
                                              <span>🎯 {kw.intent}</span>
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => { navigator.clipboard.writeText(kw.keyword); toast({ title: "Disalin!", description: kw.keyword }); }}
                                            className="flex-shrink-0 p-1 hover:bg-muted rounded"
                                            data-testid={`copy-kw-${gi}-${ki}`}
                                          >
                                            <Copy className="h-3 w-3" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </CardContent>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Long-tail Tab */}
                  <TabsContent value="longtail" className="mt-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Target className="h-4 w-4 text-green-500" />
                              Keyword Long-tail ({result.longTail.length})
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">Kompetisi rendah, intent beli tinggi, konversi lebih baik</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(result.longTail.join("\n")); toast({ title: "Disalin!" }); }} data-testid="copy-longtail">
                            <Copy className="h-3.5 w-3.5 mr-1" />Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-1.5">
                          {result.longTail.map((kw, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded border hover:bg-muted/50 group">
                              <span className="text-sm">{kw}</span>
                              <button
                                onClick={() => { navigator.clipboard.writeText(kw); toast({ title: "Disalin!", description: kw }); }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity"
                                data-testid={`copy-lt-${i}`}
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Negative Tab */}
                  <TabsContent value="negative" className="mt-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              Negative Keyword ({result.negative.length})
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">Tambahkan ke kampanye untuk buang traffic yang tidak relevan</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(result.negative.join("\n")); toast({ title: "Disalin!" }); }} data-testid="copy-negative">
                            <Copy className="h-3.5 w-3.5 mr-1" />Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex flex-wrap gap-2">
                          {result.negative.map((kw, i) => (
                            <button
                              key={i}
                              onClick={() => { navigator.clipboard.writeText(kw); toast({ title: "Disalin!", description: kw }); }}
                              className="px-2.5 py-1 rounded-full border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              data-testid={`neg-kw-${i}`}
                            >
                              -{kw}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-700 dark:text-yellow-400">
                          💡 Gunakan negative keyword untuk menghindari klik dari pembeli yang tidak tertarget, sehingga budget iklan lebih efisien.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Strategy Tab */}
                  <TabsContent value="strategy" className="mt-3">
                    <div className="space-y-3">
                      <Card className="border-primary/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            Bid Strategy
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="text-sm leading-relaxed">{result.bidStrategy}</p>
                          <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                            <p className="text-xs font-semibold text-primary">Ringkasan Strategi</p>
                            <p className="text-xs text-muted-foreground mt-1">{result.summary.strategi}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <List className="h-4 w-4 text-primary" />
                            Tips Optimasi Iklan
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3 space-y-2">
                          {result.tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-2 rounded border">
                              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                              <p className="text-sm">{tip}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card className="h-full min-h-[500px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-5 max-w-sm">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <KeySquare className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Riset Keyword Iklan Marketplace</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Temukan keyword yang tepat untuk iklan Shopee dan Tokopedia, bukan coba-coba
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-left max-w-xs mx-auto">
                      {[
                        { icon: BarChart2, label: "Keyword tier kompetisi (tinggi/sedang/rendah)" },
                        { icon: DollarSign, label: "Estimasi bid range per keyword" },
                        { icon: Target, label: "Long-tail keyword konversi tinggi" },
                        { icon: AlertCircle, label: "Negative keyword untuk hemat budget" },
                        { icon: TrendingUp, label: "Bid strategy & tips optimasi" },
                        { icon: Zap, label: "Support Shopee & Tokopedia" },
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
