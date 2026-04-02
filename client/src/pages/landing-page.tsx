import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Globe, Loader2, Copy, Download, Sparkles, Eye, Code,
  BookOpen, Package, Wrench, Target, Zap, Star, Clock,
  DollarSign, Users, ChevronRight, LayoutTemplate,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const productTypes = [
  { id: "digital", label: "Produk Digital", icon: BookOpen, desc: "Ebook, course, template, software" },
  { id: "physical", label: "Produk Fisik", icon: Package, desc: "Barang, merchandise, FMCG" },
  { id: "service", label: "Jasa / Layanan", icon: Wrench, desc: "Konsultasi, freelance, agency" },
  { id: "general", label: "Umum", icon: LayoutTemplate, desc: "SaaS, membership, komunitas" },
];

const targetMarkets = [
  "Ibu Rumah Tangga", "Mahasiswa / Pelajar", "Karyawan / Pekerja", "Freelancer / Remote Worker",
  "Wirausahawan / UMKM", "Digital Marketer", "Content Creator", "Agency Owner",
  "Pengusaha E-commerce", "Profesional (Dokter, Pengacara, dll)", "Investor / Trader",
  "Penggemar Kesehatan & Fitness", "Pemula yang ingin belajar", "Gen Z (18-25 tahun)",
  "Millenial (26-40 tahun)", "Orang tua dengan anak kecil", "Pengusaha SaaS / Tech",
  "Reseller / Dropshipper", "Petani / Agribisnis", "Komunitas Hobi",
];

const productCategories: Record<string, string[]> = {
  digital: [
    "Ebook / Buku Digital", "Online Course / Kelas Online", "Template Canva / Figma",
    "Preset Lightroom / Filter", "Script / Plugin", "Membership / Komunitas",
    "Software / Aplikasi", "Digital Planner / Worksheet", "Foto / Ilustrasi Stok",
    "Audio / Music Pack", "Newsletter Premium", "Database / Spreadsheet",
  ],
  physical: [
    "Fashion & Pakaian", "Makanan & Minuman", "Skincare & Kecantikan", "Suplemen & Kesehatan",
    "Elektronik & Gadget", "Perlengkapan Rumah", "Mainan & Hobi", "Olahraga & Outdoor",
    "Buku & Stationery", "Produk Bayi & Anak", "Aksesori & Perhiasan", "Produk Pertanian",
  ],
  service: [
    "Konsultasi Marketing / Bisnis", "Desain Grafis / Branding", "Jasa Iklan (Meta/Google)",
    "Pembuatan Website", "Foto & Video Komersial", "Copywriting / Content Writing",
    "SEO & Digital Marketing", "Pelatihan / Coaching", "Akuntansi & Pajak",
    "Arsitek & Interior", "Jasa Pengiriman / Logistik", "Legal & Notaris",
  ],
  general: [
    "SaaS / Platform Digital", "Marketplace", "Komunitas Online", "Aplikasi Mobile",
    "Program Afiliasi", "Webinar / Event Online", "Subscription Box", "Franchise",
  ],
};

const copywritingFrameworks = [
  { id: "AIDA", label: "AIDA", desc: "Attention → Interest → Desire → Action" },
  { id: "PAS", label: "PAS", desc: "Problem → Agitate → Solution" },
  { id: "BAB", label: "BAB", desc: "Before → After → Bridge" },
  { id: "FAB", label: "FAB", desc: "Features → Advantages → Benefits" },
  { id: "PASTOR", label: "PASTOR", desc: "Problem → Amplify → Story → Transformation → Offer → Response" },
  { id: "4U", label: "4U Formula", desc: "Useful → Urgent → Unique → Ultra-specific" },
  { id: "SPIN", label: "SPIN Selling", desc: "Situation → Problem → Implication → Need-payoff" },
  { id: "storytelling", label: "Storytelling", desc: "Narasi emosional yang membangun koneksi" },
  { id: "social_proof", label: "Social Proof First", desc: "Dimulai dengan bukti nyata & testimoni" },
];

const lpObjectives = [
  "Penjualan Langsung (Direct Sales)", "Kumpulkan Lead / Email",
  "Booking Konsultasi Gratis", "Pendaftaran Webinar / Event",
  "Download Freebie / Lead Magnet", "Daftar Waiting List",
  "Upsell dari Produk Gratis", "Awareness & Brand Building",
];

const ctaTypes = [
  "Beli Sekarang", "Dapatkan Akses Sekarang", "Daftar Gratis", "Coba Gratis 7 Hari",
  "Hubungi Kami", "Booking Konsultasi", "Download Gratis", "Gabung Sekarang",
  "Mulai Hari Ini", "Claim Bonus Sekarang", "Order Sekarang", "Pesan Sekarang",
];

const pricingModels = [
  "Sekali Bayar (One-time Payment)", "Langganan Bulanan", "Langganan Tahunan",
  "Bayar Sesuai Pakai (Pay-per-use)", "Freemium (Gratis + Upgrade)",
  "Bundling / Paket Hemat", "Cicilan / Installment", "Early Bird / Pre-order",
  "Harga Normal vs Diskon", "Berikan Harga di WhatsApp",
];

const socialProofTypes = [
  "Testimoni pelanggan (teks)", "Review bintang", "Foto before & after",
  "Screenshot hasil nyata", "Jumlah pengguna / pelanggan", "Media yang meliput",
  "Sertifikasi & Penghargaan", "Case Study detail", "Video testimoni",
  "Endorsement dari tokoh", "Statistik hasil riset",
];

const urgencyTypes = [
  "Batas waktu penawaran", "Stok terbatas", "Bonus eksklusif (terbatas)",
  "Harga early bird naik", "Kuota peserta terbatas", "Garansi uang kembali",
  "Gratis konsultasi untuk X pendaftar pertama", "Flash sale 24 jam",
  "Bundling hanya tersedia bulan ini", "Tidak ada urgensi (evergreen)",
];

const uiThemes = [
  { id: "bold_modern", label: "Bold Modern", desc: "Warna kuat, typografi besar, dynamic" },
  { id: "clean_minimal", label: "Clean Minimal", desc: "Putih bersih, tipis, elegan" },
  { id: "dark_premium", label: "Dark Premium", desc: "Background gelap, aksen gold/neon" },
  { id: "warm_earthy", label: "Warm Earthy", desc: "Nuansa hangat, organik, natural" },
  { id: "tech_startup", label: "Tech Startup", desc: "Gradient, glassmorphism, futuristik" },
  { id: "trust_corporate", label: "Trust & Corporate", desc: "Biru, profesional, struktural" },
];

interface GeneratedLP {
  id: string;
  title: string;
  productType: string;
  html: string;
  createdAt: Date;
}

export default function LandingPageCreator() {
  const [productType, setProductType] = useState("digital");
  const [productName, setProductName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [benefits, setBenefits] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [category, setCategory] = useState("");
  const [framework, setFramework] = useState("PAS");
  const [objective, setObjective] = useState("Penjualan Langsung (Direct Sales)");
  const [ctaType, setCtaType] = useState("Beli Sekarang");
  const [pricingModel, setPricingModel] = useState("Sekali Bayar (One-time Payment)");
  const [productPrice, setProductPrice] = useState("");
  const [socialProof, setSocialProof] = useState("Testimoni pelanggan (teks)");
  const [urgency, setUrgency] = useState("Batas waktu penawaran");
  const [uiTheme, setUiTheme] = useState("bold_modern");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLP, setGeneratedLP] = useState<GeneratedLP | null>(null);
  const [lpHistory, setLpHistory] = useState<GeneratedLP[]>([]);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [activeTab, setActiveTab] = useState("create");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!productName.trim() || !tagline.trim()) {
      toast({ title: "Lengkapi form", description: "Nama produk dan tagline wajib diisi", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          tagline,
          description,
          benefits,
          productType,
          targetMarket,
          category,
          framework,
          objective,
          ctaType,
          pricingModel,
          productPrice,
          socialProof,
          urgency,
          uiTheme,
        }),
      });

      if (!response.ok) throw new Error("Gagal generate landing page");
      const data = await response.json();

      const newLP: GeneratedLP = {
        id: Date.now().toString(),
        title: productName,
        productType,
        html: data.html,
        createdAt: new Date(),
      };

      setGeneratedLP(newLP);
      setLpHistory((prev) => [newLP, ...prev]);
      setActiveTab("create");
      toast({ title: "Berhasil!", description: "Landing page berhasil di-generate." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Gagal generate. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedLP) {
      navigator.clipboard.writeText(generatedLP.html);
      toast({ title: "Disalin!", description: "HTML siap di-paste ke platform Anda" });
    }
  };

  const handleDownload = () => {
    if (generatedLP) {
      const blob = new Blob([generatedLP.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${generatedLP.title.toLowerCase().replace(/\s+/g, "-")}-landing-page.html`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const typeIcon = productTypes.find((t) => t.id === productType)?.icon || Globe;
  const TypeIcon = typeIcon;

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              AI Landing Page Creator
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Generate landing page high-converting berdasarkan jenis produk & strategi copywriting
            </p>
          </div>
          <Badge variant="secondary" className="hidden md:flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            4-in-1 LP Generator
          </Badge>
        </div>

        {/* Product Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {productTypes.map((type) => {
            const Icon = type.icon;
            const isActive = productType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => { setProductType(type.id); setCategory(""); }}
                data-testid={`button-type-${type.id}`}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-semibold ${isActive ? "text-primary" : ""}`}>{type.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{type.desc}</p>
              </button>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="create" data-testid="tab-create">
              <Sparkles className="h-4 w-4 mr-1" /> Generate
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              Riwayat ({lpHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-5">
              {/* Form Panel */}
              <div className="xl:col-span-2 space-y-4">
                {/* Core Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TypeIcon className="h-4 w-4 text-primary" />
                      Info Produk
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="productName">Nama Produk / Layanan *</Label>
                      <Input
                        id="productName"
                        placeholder="contoh: Kelas Online Copywriting Masterclass"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        data-testid="input-product-name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="tagline">Tagline / Hook Utama *</Label>
                      <Input
                        id="tagline"
                        placeholder="contoh: Kuasai Copywriting dalam 30 Hari"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        data-testid="input-tagline"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="description">Deskripsi Singkat</Label>
                      <Textarea
                        id="description"
                        placeholder="Jelaskan produk Anda secara singkat..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[70px] resize-none"
                        data-testid="input-description"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="benefits">Manfaat / Keunggulan Utama (1 per baris)</Label>
                      <Textarea
                        id="benefits"
                        placeholder={"Hemat 80% waktu produksi konten\nHasil iklan lebih converting\nBisa langsung digunakan tanpa coding"}
                        value={benefits}
                        onChange={(e) => setBenefits(e.target.value)}
                        className="min-h-[80px] resize-none"
                        data-testid="input-benefits"
                      />
                    </div>
                    {productPrice && (
                      <div className="space-y-1.5">
                        <Label htmlFor="price">Harga Produk</Label>
                        <Input
                          id="price"
                          placeholder="contoh: Rp 299.000"
                          value={productPrice}
                          onChange={(e) => setProductPrice(e.target.value)}
                          data-testid="input-price"
                        />
                      </div>
                    )}
                    {!productPrice && (
                      <button
                        type="button"
                        onClick={() => setProductPrice("Rp ")}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <DollarSign className="h-3 w-3" /> + Tambah harga produk
                      </button>
                    )}
                  </CardContent>
                </Card>

                {/* Target & Category */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Target & Kategori
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Target Market</Label>
                      <Select value={targetMarket} onValueChange={setTargetMarket}>
                        <SelectTrigger data-testid="select-target-market">
                          <SelectValue placeholder="Pilih target audiens..." />
                        </SelectTrigger>
                        <SelectContent>
                          {targetMarkets.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Kategori Produk</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Pilih kategori..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(productCategories[productType] || []).map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tujuan Landing Page</Label>
                      <Select value={objective} onValueChange={setObjective}>
                        <SelectTrigger data-testid="select-objective">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {lpObjectives.map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Copywriting Strategy */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Strategi Copywriting
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Framework Copywriting</Label>
                      <Select value={framework} onValueChange={setFramework}>
                        <SelectTrigger data-testid="select-framework">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {copywritingFrameworks.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              <div>
                                <span className="font-medium">{f.label}</span>
                                <span className="text-muted-foreground text-xs ml-2">{f.desc}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {copywritingFrameworks.find((f) => f.id === framework)?.desc}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tipe CTA</Label>
                      <Select value={ctaType} onValueChange={setCtaType}>
                        <SelectTrigger data-testid="select-cta">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ctaTypes.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Conversion Elements */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      Elemen Konversi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Model Harga</Label>
                      <Select value={pricingModel} onValueChange={setPricingModel}>
                        <SelectTrigger data-testid="select-pricing">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {pricingModels.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Social Proof</Label>
                      <Select value={socialProof} onValueChange={setSocialProof}>
                        <SelectTrigger data-testid="select-social-proof">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {socialProofTypes.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Elemen Urgensi</Label>
                      <Select value={urgency} onValueChange={setUrgency}>
                        <SelectTrigger data-testid="select-urgency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {urgencyTypes.map((u) => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Visual Theme */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Tema Visual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {uiThemes.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setUiTheme(theme.id)}
                          data-testid={`button-theme-${theme.id}`}
                          className={`p-2.5 rounded-lg border text-left transition-all text-sm ${
                            uiTheme === theme.id
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="font-medium text-xs">{theme.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{theme.desc}</div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !productName.trim() || !tagline.trim()}
                  className="w-full"
                  size="lg"
                  data-testid="button-generate-lp"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sedang Generate...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Landing Page
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {/* Preview Panel */}
              <Card className="xl:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                  <div>
                    <CardTitle className="text-base">
                      {generatedLP ? generatedLP.title : "Preview"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {generatedLP
                        ? `${productTypes.find((t) => t.id === generatedLP.productType)?.label} • ${new Date(generatedLP.createdAt).toLocaleTimeString("id-ID")}`
                        : "Hasil landing page akan tampil di sini"}
                    </CardDescription>
                  </div>
                  {generatedLP && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant={viewMode === "preview" ? "default" : "outline"}
                        onClick={() => setViewMode("preview")}
                        data-testid="button-view-preview"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant={viewMode === "code" ? "default" : "outline"}
                        onClick={() => setViewMode("code")}
                        data-testid="button-view-code"
                      >
                        <Code className="h-3.5 w-3.5" />
                      </Button>
                      <Separator orientation="vertical" className="h-8" />
                      <Button size="sm" variant="outline" onClick={handleCopy} data-testid="button-copy-html">
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy HTML
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleDownload} data-testid="button-download-html">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[620px] flex items-center justify-center bg-muted/30 rounded-lg">
                      <div className="text-center space-y-3">
                        <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        </div>
                        <p className="text-sm font-medium">AI sedang menyusun landing page...</p>
                        <p className="text-xs text-muted-foreground">Menggunakan framework {framework} • Tema {uiThemes.find(t => t.id === uiTheme)?.label}</p>
                      </div>
                    </div>
                  ) : generatedLP ? (
                    <div className="h-[620px] border rounded-lg overflow-hidden">
                      {viewMode === "preview" ? (
                        <iframe
                          srcDoc={generatedLP.html}
                          className="w-full h-full border-0"
                          title="Landing Page Preview"
                          sandbox="allow-scripts"
                        />
                      ) : (
                        <ScrollArea className="h-full">
                          <pre className="text-xs p-4 font-mono whitespace-pre-wrap break-all leading-relaxed">{generatedLP.html}</pre>
                        </ScrollArea>
                      )}
                    </div>
                  ) : (
                    <div className="h-[620px] flex items-center justify-center bg-muted/30 rounded-lg">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                          <Globe className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Belum ada landing page</p>
                          <p className="text-xs text-muted-foreground mt-1">Isi form di kiri dan klik Generate</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 max-w-[300px] mx-auto">
                          {[
                            { icon: BookOpen, label: "Produk Digital" },
                            { icon: Package, label: "Produk Fisik" },
                            { icon: Wrench, label: "Jasa" },
                          ].map(({ icon: Icon, label }) => (
                            <div key={label} className="p-2 bg-background rounded-lg border text-center">
                              <Icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                              <p className="text-xs">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {lpHistory.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Belum ada riwayat</p>
                  <p className="text-sm mt-1">Landing page yang berhasil di-generate akan muncul di sini</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {lpHistory.map((lp) => (
                  <Card
                    key={lp.id}
                    className="hover:shadow-md cursor-pointer transition-shadow"
                    onClick={() => { setGeneratedLP(lp); setActiveTab("create"); }}
                    data-testid={`card-lp-history-${lp.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm">{lp.title}</CardTitle>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {productTypes.find((t) => t.id === lp.productType)?.label}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {new Date(lp.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
                        <iframe
                          srcDoc={lp.html}
                          className="w-full h-full border-0 pointer-events-none scale-[0.5] origin-top-left"
                          style={{ width: "200%", height: "200%" }}
                          title={lp.title}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
