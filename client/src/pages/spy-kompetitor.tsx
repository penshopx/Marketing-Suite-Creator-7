import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye, Loader2, ChevronRight, Copy,
  RefreshCw, TrendingUp, Target, Zap, Shield,
  ShoppingCart, DollarSign, AlertCircle, CheckCircle2,
  Crosshair, BarChart2, Star, ArrowUp, ArrowDown,
  Minus, Lightbulb, Trophy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const marketplaces = [
  { id: "shopee", label: "Shopee", emoji: "🛒" },
  { id: "tokopedia", label: "Tokopedia", emoji: "🟢" },
  { id: "tiktokshop", label: "TikTok Shop", emoji: "🎵" },
  { id: "instagram", label: "Instagram/FB", emoji: "📸" },
  { id: "umum", label: "Umum/Offline", emoji: "🏪" },
];

const categories = [
  "Fashion & Pakaian", "Kecantikan & Skincare", "Elektronik & Gadget",
  "Rumah & Dapur", "Makanan & Minuman", "Olahraga & Outdoor",
  "Ibu & Bayi", "Otomotif", "Produk Digital",
  "Jasa & Layanan", "Kesehatan & Medis", "Lainnya",
];

interface StrengthWeakness {
  poin: string;
  detail: string;
}

interface PricePosition {
  label: string;
  rentang: string;
  rekomendasi: string;
}

interface Differentiator {
  angle: string;
  taktik: string;
  alasan: string;
  effort: "rendah" | "sedang" | "tinggi";
}

interface KeywordSpy {
  keyword: string;
  context: string;
}

interface SpyResult {
  ringkasan: string;
  positioningKompetitor: string;
  kekuatan: StrengthWeakness[];
  kelemahan: StrengthWeakness[];
  pricePositioning: PricePosition;
  differentiators: Differentiator[];
  targetMarketInsight: string;
  keywordKompetitor: KeywordSpy[];
  rekomendasi: string[];
  quickWins: string[];
  warningFlags: string[];
}

const effortColor: Record<string, string> = {
  rendah: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  sedang: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  tinggi: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export default function SpyKompetitor() {
  const [marketplace, setMarketplace] = useState("shopee");
  const [produkKamu, setProdukKamu] = useState("");
  const [kategori, setKategori] = useState("Fashion & Pakaian");
  const [infoKompetitor, setInfoKompetitor] = useState("");
  const [keunggulanKamu, setKeunggulanKamu] = useState("");
  const [hargaKamu, setHargaKamu] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SpyResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!produkKamu.trim() || !infoKompetitor.trim()) {
      toast({ title: "Lengkapi form", description: "Produkmu dan info kompetitor wajib diisi", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/spy-kompetitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketplace, produkKamu, kategori, infoKompetitor, keunggulanKamu, hargaKamu }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setResult(data);
    } catch {
      toast({ title: "Error", description: "Gagal analisis. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyReport = () => {
    if (!result) return;
    const text = [
      `LAPORAN KOMPETITOR ANALYSIS`,
      `\nRINGKASAN: ${result.ringkasan}`,
      `POSITIONING: ${result.positioningKompetitor}`,
      `\nKEKUATAN KOMPETITOR:`,
      ...result.kekuatan.map((k) => `• ${k.poin}: ${k.detail}`),
      `\nKELEMAHAN KOMPETITOR:`,
      ...result.kelemahan.map((k) => `• ${k.poin}: ${k.detail}`),
      `\nPRICING: ${result.pricePositioning.rekomendasi}`,
      `\nDIFFERENTIATOR REKOMENDASI:`,
      ...result.differentiators.map((d, i) => `${i + 1}. ${d.angle}: ${d.taktik}`),
      `\nQUICK WINS:`,
      ...result.quickWins.map((q) => `• ${q}`),
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Laporan disalin!" });
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              Spy Kompetitor
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Analisis kelemahan kompetitor, temukan celah pasar, dan susun strategi diferensiasi yang tepat
            </p>
          </div>
          <Badge className="hidden md:flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-0">
            <Crosshair className="h-3 w-3" />
            Competitive Intel
          </Badge>
        </div>

        {/* Marketplace */}
        <div className="flex flex-wrap gap-2">
          {marketplaces.map((m) => (
            <button
              key={m.id}
              onClick={() => setMarketplace(m.id)}
              data-testid={`btn-spy-mp-${m.id}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                marketplace === m.id ? "border-primary bg-primary/5 font-semibold text-primary" : "border-border hover:border-primary/30"
              }`}
            >
              <span>{m.emoji}</span>{m.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          {/* Form */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  Produkmu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Produk / Bisnis Kamu *</Label>
                  <Input
                    placeholder="contoh: Kaos oversize lokal brand X, skincare serum vitamin C..."
                    value={produkKamu}
                    onChange={(e) => setProdukKamu(e.target.value)}
                    data-testid="input-spy-produk"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    data-testid="select-spy-kat"
                  >
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Harga Produkmu (opsional)</Label>
                  <Input
                    placeholder="contoh: Rp 85.000, Rp 150.000 - 250.000..."
                    value={hargaKamu}
                    onChange={(e) => setHargaKamu(e.target.value)}
                    data-testid="input-spy-harga"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Keunggulan / USP Produkmu (opsional)</Label>
                  <Input
                    placeholder="contoh: 100% cotton premium, free ongkir, garansi 30 hari..."
                    value={keunggulanKamu}
                    onChange={(e) => setKeunggulanKamu(e.target.value)}
                    data-testid="input-spy-usp"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  Info Kompetitor *
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Textarea
                    placeholder={`Deskripsikan kompetitor yang ingin dianalisis:\n\n• Nama toko / brand (misal: Toko X, Brand Y)\n• Produk unggulannya apa?\n• Harga yang ditawarkan\n• Strategi promosi yang terlihat\n• Rating/ulasan dari pembeli\n• Apa yang mereka tonjolkan di judul/deskripsi\n\nSemakin detail info yang kamu berikan, semakin akurat analisanya.`}
                    value={infoKompetitor}
                    onChange={(e) => setInfoKompetitor(e.target.value)}
                    className="min-h-[160px] text-sm"
                    data-testid="input-spy-kompetitor"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Isi berdasarkan observasimu di marketplace. Semakin detail = analisis makin tajam.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !produkKamu.trim() || !infoKompetitor.trim()}
              className="w-full"
              size="lg"
              data-testid="button-analyze-spy"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menganalisis Kompetitor...</>
              ) : (
                <><Eye className="mr-2 h-4 w-4" />Analisis Kompetitor<ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>

          {/* Output */}
          <div className="xl:col-span-3">
            {isLoading ? (
              <Card className="h-full min-h-[500px] flex items-center justify-center">
                <CardContent className="text-center space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                  <div>
                    <p className="font-medium">Sedang menganalisis kompetitor...</p>
                    <p className="text-sm text-muted-foreground mt-1">Memetakan kekuatan, kelemahan, dan peluang</p>
                  </div>
                </CardContent>
              </Card>
            ) : result ? (
              <Card className="h-full">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Analisis Selesai
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{result.ringkasan}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleAnalyze} data-testid="btn-regen-spy">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={copyReport} data-testid="btn-copy-report">
                        <Copy className="h-3.5 w-3.5 mr-1" />Copy
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="swot">
                    <div className="px-4 pt-2 border-b">
                      <TabsList className="h-8 bg-transparent gap-0.5 flex-wrap">
                        {[
                          { id: "swot", label: "⚔️ SWOT" },
                          { id: "pricing", label: "💰 Pricing" },
                          { id: "diff", label: "🎯 Differensiasi" },
                          { id: "quick", label: "⚡ Quick Wins" },
                          { id: "keyword", label: "🔑 Keywords" },
                        ].map((t) => (
                          <TabsTrigger
                            key={t.id}
                            value={t.id}
                            data-testid={`tab-spy-${t.id}`}
                            className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            {t.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    {/* SWOT */}
                    <TabsContent value="swot" className="p-4 mt-0">
                      <ScrollArea className="h-[450px]">
                        <div className="space-y-4">
                          <div className="p-3 bg-muted/40 rounded-lg">
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Positioning Kompetitor</p>
                            <p className="text-sm">{result.positioningKompetitor}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                              <ArrowUp className="h-4 w-4 text-green-500" />
                              Kekuatan Kompetitor ({result.kekuatan.length})
                            </p>
                            <div className="space-y-2">
                              {result.kekuatan.map((k, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium">{k.poin}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{k.detail}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                              <ArrowDown className="h-4 w-4 text-red-500" />
                              Kelemahan Kompetitor — Peluang Kamu! ({result.kelemahan.length})
                            </p>
                            <div className="space-y-2">
                              {result.kelemahan.map((k, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium">{k.poin}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{k.detail}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {result.warningFlags.length > 0 && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                              <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2">⚠️ Warning Flags</p>
                              <ul className="space-y-1">
                                {result.warningFlags.map((w, i) => (
                                  <li key={i} className="text-xs text-yellow-700 dark:text-yellow-400">• {w}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Pricing */}
                    <TabsContent value="pricing" className="p-4 mt-0">
                      <div className="space-y-4">
                        <Card className="border-primary/30 bg-primary/5">
                          <CardContent className="pt-4 pb-4">
                            <p className="text-xs font-semibold text-primary uppercase mb-1">{result.pricePositioning.label}</p>
                            <p className="text-lg font-bold">{result.pricePositioning.rentang}</p>
                            <p className="text-sm mt-2">{result.pricePositioning.rekomendasi}</p>
                          </CardContent>
                        </Card>
                        <div className="p-3 bg-muted/40 rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Target Market Insight</p>
                          <p className="text-sm">{result.targetMarketInsight}</p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Differensiasi */}
                    <TabsContent value="diff" className="p-4 mt-0">
                      <ScrollArea className="h-[450px]">
                        <div className="space-y-3 pr-1">
                          <p className="text-xs text-muted-foreground">Strategi diferensiasi yang bisa kamu terapkan untuk menang dari kompetitor</p>
                          {result.differentiators.map((d, i) => (
                            <div key={i} className="p-3 rounded-lg border">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-3 flex-1">
                                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold">{d.angle}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{d.taktik}</p>
                                    <p className="text-xs text-muted-foreground mt-1 italic">{d.alasan}</p>
                                  </div>
                                </div>
                                <Badge className={`${effortColor[d.effort]} border-0 text-xs flex-shrink-0`}>
                                  Effort: {d.effort}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Quick Wins */}
                    <TabsContent value="quick" className="p-4 mt-0">
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400">⚡ Langkah cepat yang bisa dikerjakan minggu ini</p>
                        </div>
                        {result.quickWins.map((qw, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                            <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{qw}</p>
                          </div>
                        ))}
                        <div>
                          <p className="text-sm font-semibold mb-2 mt-2 flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-primary" />
                            Rekomendasi Jangka Panjang
                          </p>
                          {result.rekomendasi.map((r, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border mb-2">
                              <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <p className="text-sm">{r}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Keywords */}
                    <TabsContent value="keyword" className="p-4 mt-0">
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">Keyword yang kemungkinan digunakan kompetitor berdasarkan analisis produk mereka</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => { navigator.clipboard.writeText(result.keywordKompetitor.map((k) => k.keyword).join("\n")); toast({ title: "Disalin!" }); }}
                          data-testid="copy-spy-kw"
                        >
                          <Copy className="h-3.5 w-3.5 mr-2" />Copy Semua Keyword
                        </Button>
                        <div className="space-y-2">
                          {result.keywordKompetitor.map((kw, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{kw.keyword}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{kw.context}</p>
                              </div>
                              <button
                                onClick={() => { navigator.clipboard.writeText(kw.keyword); toast({ title: "Disalin!", description: kw.keyword }); }}
                                className="p-1 hover:bg-muted rounded flex-shrink-0"
                                data-testid={`copy-spy-kw-${i}`}
                              >
                                <Copy className="h-3 w-3" />
                              </button>
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
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Eye className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Competitive Intelligence Tool</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Masukkan info kompetitormu, AI akan analisis kekuatan & kelemahan mereka lalu carikan celah untuk kamu masuk
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-left max-w-xs mx-auto">
                      {[
                        { icon: ArrowDown, label: "Peta kelemahan kompetitor" },
                        { icon: DollarSign, label: "Strategi pricing yang tepat" },
                        { icon: Target, label: "Angle diferensiasi yang unik" },
                        { icon: Zap, label: "Quick wins minggu ini" },
                        { icon: BarChart2, label: "Keyword yang mereka pakai" },
                        { icon: Shield, label: "Warning flags & risiko" },
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
