import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Loader2, Sparkles, ChevronRight, TrendingUp,
  DollarSign, Users, BarChart2, Lightbulb, Copy,
  RefreshCw, Star, Zap, Globe, ShoppingBag,
  BookOpen, FileSpreadsheet, Image, Video, Code,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const niches = [
  { id: "bisnis_online", label: "🛒 Bisnis Online & E-Commerce", hot: true },
  { id: "meta_ads", label: "📱 Meta Ads & Digital Marketing", hot: true },
  { id: "desain_grafis", label: "🎨 Desain Grafis & Kreatif", hot: true },
  { id: "keuangan_pribadi", label: "💰 Keuangan Pribadi & Investasi", hot: false },
  { id: "produktivitas", label: "⚡ Produktivitas & Karir", hot: false },
  { id: "parenting", label: "👶 Parenting & Keluarga", hot: true },
  { id: "kesehatan", label: "🏃 Kesehatan & Fitness", hot: false },
  { id: "memasak", label: "🍳 Resep & Kuliner", hot: false },
  { id: "konten_kreator", label: "📸 Content Creator & Influencer", hot: true },
  { id: "self_improvement", label: "🧠 Self Improvement & Mindset", hot: false },
  { id: "fashion", label: "👗 Fashion & Gaya Hidup", hot: false },
  { id: "edukasi_anak", label: "📚 Edukasi & Belajar Anak", hot: false },
  { id: "hobi", label: "🎯 Hobi (Fotografi/Musik/Gaming)", hot: false },
  { id: "hukum_pajak", label: "⚖️ Hukum & Perpajakan UMKM", hot: false },
  { id: "properti", label: "🏠 Properti & Real Estate", hot: false },
  { id: "wedding", label: "💍 Pernikahan & Event", hot: true },
  { id: "travel", label: "✈️ Travel & Wisata", hot: false },
  { id: "teknologi", label: "💻 Teknologi & Programming", hot: false },
  { id: "pertanian", label: "🌱 Pertanian & Agribisnis", hot: false },
  { id: "kuliner_bisnis", label: "🍜 Bisnis Kuliner & F&B", hot: true },
];

const formats = [
  { id: "all", label: "Semua Format" },
  { id: "ebook", label: "📖 E-Book / PDF Guide" },
  { id: "template", label: "📋 Template (Canva/Notion/Excel)" },
  { id: "preset", label: "🎞️ Preset / Filter / Aset" },
  { id: "course", label: "🎓 Mini Course / Video" },
  { id: "toolkit", label: "🧰 Toolkit / Bundle" },
  { id: "spreadsheet", label: "📊 Spreadsheet / Kalkulator" },
  { id: "prompt", label: "🤖 AI Prompt Pack" },
];

const priceRanges = [
  { id: "low", label: "Rp 10rb – 49rb (entry level)" },
  { id: "mid", label: "Rp 50rb – 149rb (mainstream)" },
  { id: "high", label: "Rp 150rb – 499rb (premium)" },
  { id: "any", label: "Semua range harga" },
];

const formatIcons: Record<string, React.ElementType> = {
  ebook: BookOpen,
  template: FileSpreadsheet,
  preset: Image,
  course: Video,
  toolkit: ShoppingBag,
  spreadsheet: FileSpreadsheet,
  prompt: Code,
};

const competitionColors: Record<string, string> = {
  Rendah: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Sedang: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Tinggi: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const demandColors: Record<string, string> = {
  "Sangat Tinggi": "text-green-600 dark:text-green-400",
  Tinggi: "text-blue-600 dark:text-blue-400",
  Sedang: "text-yellow-600 dark:text-yellow-400",
  Rendah: "text-red-600 dark:text-red-400",
};

interface ProductIdea {
  name: string;
  format: string;
  formatType: string;
  price: string;
  targetMarket: string;
  painPoint: string;
  uniqueAngle: string;
  competition: string;
  demand: string;
  profitPotential: string;
  quickWin: string;
  etsyInsight: string;
}

interface ResearchResult {
  niche: string;
  overview: string;
  products: ProductIdea[];
  topRecommendation: number;
}

export default function ProductResearch() {
  const [niche, setNiche] = useState("");
  const [format, setFormat] = useState("all");
  const [priceRange, setPriceRange] = useState("any");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const { toast } = useToast();

  const handleResearch = async () => {
    if (!niche) {
      toast({ title: "Pilih niche dulu", description: "Kategori produk wajib dipilih", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/research-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, format, priceRange }),
      });
      if (!response.ok) throw new Error("Gagal riset");
      const data = await response.json();
      setResult(data);
      setExpandedCard(data.topRecommendation ?? 0);
    } catch {
      toast({ title: "Error", description: "Gagal melakukan riset. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyProduct = (p: ProductIdea) => {
    const text = [
      `PRODUK: ${p.name}`,
      `Format: ${p.format}`,
      `Harga: ${p.price}`,
      `Target Market: ${p.targetMarket}`,
      `Pain Point: ${p.painPoint}`,
      `Angle Unik: ${p.uniqueAngle}`,
      `Kompetisi: ${p.competition} | Demand: ${p.demand}`,
      `Potensi Profit: ${p.profitPotential}`,
      `Quick Win: ${p.quickWin}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: `Ide produk "${p.name}" berhasil disalin` });
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Riset Produk Digital
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Temukan ide produk digital yang terbukti laku — diinspirasi dari tren Etsy & pasar Indonesia
            </p>
          </div>
          <Badge className="hidden md:flex items-center gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-0">
            <TrendingUp className="h-3 w-3" />
            Etsy-Inspired Research
          </Badge>
        </div>

        {/* Filter Section */}
        <Card>
          <CardContent className="pt-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 font-semibold">
                  <Globe className="h-4 w-4 text-primary" />
                  Pilih Niche *
                </Label>
                <Select value={niche} onValueChange={setNiche}>
                  <SelectTrigger data-testid="select-niche" className="h-10">
                    <SelectValue placeholder="— Pilih kategori niche —" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {niches.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        <span>{n.label}</span>
                        {n.hot && <Badge className="ml-2 h-4 text-[10px] bg-red-100 text-red-600 border-0">🔥 Hot</Badge>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 font-semibold">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  Format Produk
                </Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger data-testid="select-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 font-semibold">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Range Harga Target
                </Label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger data-testid="select-price-range">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleResearch}
              disabled={isLoading || !niche}
              className="w-full mt-4"
              size="lg"
              data-testid="button-research"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />AI Sedang Riset Produk...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Riset Produk Winning Sekarang<ChevronRight className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-16 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">
                  {result.products.length} Ide Produk Winning
                  <span className="text-muted-foreground font-normal text-sm ml-2">— {niches.find((n) => n.id === niche)?.label}</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">{result.overview}</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleResearch} data-testid="button-re-research">
                <RefreshCw className="h-3.5 w-3.5 mr-1" />Riset Ulang
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {result.products.map((p, idx) => {
                const isExpanded = expandedCard === idx;
                const isTop = idx === result.topRecommendation;
                const FmtIcon = formatIcons[p.formatType] || ShoppingBag;
                return (
                  <Card
                    key={idx}
                    className={`transition-all cursor-pointer hover:shadow-md ${
                      isTop ? "border-primary/50 ring-1 ring-primary/30" : ""
                    } ${isExpanded ? "md:col-span-2 lg:col-span-1" : ""}`}
                    onClick={() => setExpandedCard(isExpanded ? null : idx)}
                    data-testid={`card-product-${idx}`}
                  >
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FmtIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-sm leading-tight">{p.name}</CardTitle>
                              {isTop && (
                                <Badge className="h-4 text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-0 flex items-center gap-0.5">
                                  <Star className="h-2.5 w-2.5" />TOP PICK
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{p.format}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-primary">{p.price}</div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-4 pb-4 space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className={`text-xs ${competitionColors[p.competition] || ""}`}>
                          Kompetisi: {p.competition}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${demandColors[p.demand] || ""}`}>
                          Demand: {p.demand}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">{p.painPoint}</p>

                      {isExpanded && (
                        <div className="space-y-3 border-t pt-3 mt-1">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Target Market</p>
                            <p className="text-xs flex items-start gap-1.5"><Users className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />{p.targetMarket}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Angle Unik / Differensiasi</p>
                            <p className="text-xs flex items-start gap-1.5"><Zap className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />{p.uniqueAngle}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Potensi Profit</p>
                            <p className="text-xs flex items-start gap-1.5"><BarChart2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />{p.profitPotential}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">💡 Insight dari Etsy/Market</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{p.etsyInsight}</p>
                          </div>
                          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2.5 border border-green-200 dark:border-green-800">
                            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">⚡ Quick Win — Bisa dimulai minggu ini</p>
                            <p className="text-xs text-green-700/80 dark:text-green-400/80">{p.quickWin}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={(e) => { e.stopPropagation(); copyProduct(p); }}
                            data-testid={`copy-product-${idx}`}
                          >
                            <Copy className="h-3 w-3 mr-1" />Salin Ide Produk Ini
                          </Button>
                        </div>
                      )}

                      {!isExpanded && (
                        <div className="flex items-center text-xs text-primary font-medium mt-1">
                          <Lightbulb className="h-3 w-3 mr-1" />
                          Klik untuk lihat detail lengkap
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Langkah Selanjutnya</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sudah punya ide produk? Validasi kelayakannya di <strong>Validasi Ide Produk</strong> sebelum mulai bikin.
                      Setelah yakin, buat landing page-nya dengan <strong>Landing Page Creator</strong>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && (
          <div className="text-center py-16 space-y-5">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Search className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <div>
              <p className="font-semibold text-lg">Temukan produk digital yang proven laku</p>
              <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
                Pilih niche dan klik Riset. AI akan analisis tren pasar dan beri 6 ide produk yang siap dijual di Indonesia.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {niches.filter((n) => n.hot).map((n) => (
                <button
                  key={n.id}
                  onClick={() => setNiche(n.id)}
                  className="text-xs px-3 py-1.5 rounded-full border hover:border-primary hover:bg-primary/5 transition-all"
                  data-testid={`quick-niche-${n.id}`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
