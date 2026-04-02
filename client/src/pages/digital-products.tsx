import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Package, Star, TrendingUp, Users, CheckCircle2, Copy, 
  ArrowRight, DollarSign, Zap, Globe, BookOpen, Calculator,
  MessageSquare, AlertTriangle, ShoppingCart, Target, Lightbulb,
  ChevronDown, ChevronUp, Shield, Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const products = [
  {
    id: "1",
    name: "Blueprint Penghasilan Digital",
    category: "E-Book & Guide",
    icon: BookOpen,
    iconBg: "bg-blue-100 dark:bg-blue-900",
    iconColor: "text-blue-600 dark:text-blue-400",
    price: "Rp 97.000",
    priceNum: 97000,
    suggestedPrice: "Rp 150.000 - Rp 297.000",
    suggestedPriceNum: [150000, 297000],
    commission: "100%",
    badgeText: "Best Seller",
    badgeColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    description: "Panduan lengkap membangun penghasilan digital dari nol. Cocok untuk pemula yang ingin memulai bisnis online.",
    features: [
      "Framework 14 hari mulai dari nol sampai penjualan pertama",
      "4 model bisnis digital yang sudah terbukti menghasilkan uang",
      "Template konten siap pakai untuk semua platform",
      "Checklist harian + tracking progress",
      "Panduan memilih niche yang profitable",
      "Strategi pricing produk digital yang optimal",
      "Bonus: Daftar 50+ tools gratis untuk bisnis digital",
    ],
    targetMarket: "Pemula yang ingin mulai bisnis online, fresh graduate, ibu rumah tangga, karyawan yang mau side income",
    salesAngle: "Cara realistis dapat penghasilan pertama dari internet dalam 14 hari",
    painPoints: ["Gak tau mau mulai dari mana", "Takut rugi karena belum punya pengalaman", "Bingung mau jual apa", "Tidak punya waktu banyak karena masih kerja"],
    objections: [
      { q: "Apakah saya bisa berhasil meski pemula total?", a: "Blueprint ini dirancang khusus untuk pemula. Setiap langkah dijelaskan dari nol, tidak ada yang diasumsikan sudah kamu tahu." },
      { q: "Berapa lama waktu yang dibutuhkan per hari?", a: "Hanya 1-2 jam per hari. Blueprint ini dirancang untuk orang sibuk yang tetap punya pekerjaan atau kegiatan lain." },
      { q: "Bagaimana jika tidak berhasil dalam 14 hari?", a: "Hasil tergantung eksekusi. Tapi setidaknya setelah 14 hari, kamu sudah paham seluk beluk bisnis digital dan punya fondasi yang kuat untuk scale up." },
    ],
    platforms: ["Lynk.id", "Gumroad", "Tokopedia Digital", "Shopee", "WhatsApp/Telegram"],
    hak: "Hak Jual Kembali (Resell Rights) - 100% keuntungan untuk kamu",
    waScript: `Halo kak [nama]! 

Boleh tanya, kak lagi cari cara tambah penghasilan dari internet tapi bingung mau mulai dari mana?

Saya punya Blueprint Penghasilan Digital yang bisa bantu kak mulai dari nol sampai penjualan pertama dalam 14 hari.

Ini bukan teori doang — ada checklist harian yang bisa langsung dipraktikkan, tanpa perlu pengalaman atau modal besar.

Harganya cuma Rp [harga]. Mau saya kirimkan detail lengkapnya kak? 😊`,
  },
  {
    id: "2",
    name: "Masterclass TikTok Ads untuk Pemula",
    category: "Video Course",
    icon: TrendingUp,
    iconBg: "bg-red-100 dark:bg-red-900",
    iconColor: "text-red-600 dark:text-red-400",
    price: "Rp 197.000",
    priceNum: 197000,
    suggestedPrice: "Rp 297.000 - Rp 497.000",
    suggestedPriceNum: [297000, 497000],
    commission: "100%",
    badgeText: "Hot 🔥",
    badgeColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    description: "Kursus video komprehensif tentang cara menggunakan TikTok Ads untuk dropship dan produk digital dengan budget minimal.",
    features: [
      "Modul 1: Setup akun TikTok Ads Manager step-by-step",
      "Modul 2: Riset produk winning dengan TikTok Creative Center",
      "Modul 3: Membuat konten iklan yang convert (template included)",
      "Modul 4: Strategi bidding dengan budget di bawah Rp 100.000/hari",
      "Modul 5: Optimasi dan scale campaign yang profitable",
      "Modul 6: Studi kasus nyata dengan ROAS 3-5x",
      "Bonus: Template creative brief untuk iklan TikTok",
      "Bonus: List 50 produk winning yang cocok untuk TikTok Ads",
    ],
    targetMarket: "Dropshipper, reseller, penjual produk digital, marketer yang mau belajar TikTok Ads",
    salesAngle: "Cara dapat purchase jutaan dari TikTok Ads dengan modal ratusan ribu",
    painPoints: ["Budget iklan habis tapi tidak ada penjualan", "Konten iklan tidak menarik perhatian", "Tidak tahu cara scale campaign yang sudah profitable", "Takut salah setting iklan"],
    objections: [
      { q: "Apakah perlu follower banyak dulu di TikTok?", a: "Tidak! TikTok Ads berjalan terpisah dari akun organik. Bahkan akun baru dengan 0 follower bisa langsung beriklan dan dapat purchase." },
      { q: "Budget minimal berapa untuk mulai?", a: "Bisa mulai dari Rp 50.000/hari. Di kursus ini diajarkan cara maksimalkan hasil dengan budget minimal." },
      { q: "Produk apa yang cocok untuk TikTok Ads?", a: "Kursus ini mencakup panduan memilih produk yang cocok + daftar 50 produk winning yang sudah terbukti laku di TikTok Ads." },
    ],
    platforms: ["Lynk.id", "Gumroad", "Facebook Group", "Komunitas Dropshipper", "WhatsApp"],
    hak: "Hak Jual Kembali (Resell Rights) - 100% keuntungan untuk kamu",
    waScript: `Halo kak [nama]!

Kalau kak lagi belajar TikTok Ads atau sudah coba tapi belum dapat hasil, saya punya rekomendasi yang worth it banget.

Masterclass TikTok Ads untuk Pemula — dari setup sampai scale, semuanya ada di sini.

Yang bikin beda: ada studi kasus nyata dengan ROAS 3-5x dan list 50 produk winning yang bisa langsung dicoba.

Harganya Rp [harga]. Mau saya share link-nya kak? 😊`,
  },
  {
    id: "3",
    name: "AI Command Framework: Hack ChatGPT",
    category: "Template & Tools",
    icon: Zap,
    iconBg: "bg-purple-100 dark:bg-purple-900",
    iconColor: "text-purple-600 dark:text-purple-400",
    price: "Rp 77.000",
    priceNum: 77000,
    suggestedPrice: "Rp 99.000 - Rp 199.000",
    suggestedPriceNum: [99000, 199000],
    commission: "100%",
    badgeText: "Trending",
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    description: "Koleksi 100+ prompt ChatGPT yang sudah terbukti untuk marketing, copywriting, riset, dan otomasi bisnis online.",
    features: [
      "100+ prompt ChatGPT siap pakai untuk berbagai kebutuhan marketing",
      "Framework RISEN untuk membuat prompt yang sempurna sendiri",
      "Template prompt untuk buat konten viral di semua platform",
      "Prompt khusus riset produk & analisis kompetitor",
      "Prompt membuat sales page, email marketing, dan iklan",
      "Prompt untuk customer service dan follow-up otomatis",
      "Update bulanan prompt terbaru mengikuti perkembangan AI",
      "Bonus: Cheat sheet 20 kata trigger AI untuk hasil terbaik",
    ],
    targetMarket: "Marketer, content creator, pengusaha online, freelancer, siapapun yang mau kerja lebih efisien dengan AI",
    salesAngle: "Hemat 10 jam kerja per minggu dengan prompt AI yang tepat — langsung hasil profesional dari ChatGPT",
    painPoints: ["ChatGPT sering kasih jawaban yang generik dan tidak berguna", "Bingung cara minta ChatGPT untuk tugas spesifik", "Hasil AI harus diedit berjam-jam sebelum bisa dipakai", "Tidak tau prompt seperti apa yang menghasilkan output terbaik"],
    objections: [
      { q: "Saya sudah bisa pakai ChatGPT sendiri, apa bedanya?", a: "Bisa pakai ChatGPT ≠ bisa maksimalkan hasilnya. Framework RISEN di sini akan mengubah cara kamu berinteraksi dengan AI dan menghasilkan output 10x lebih baik." },
      { q: "Apakah prompt ini hanya untuk ChatGPT?", a: "Prompt ini bisa digunakan di ChatGPT, Claude, Gemini, dan AI tools lainnya. Prinsipnya universal." },
      { q: "Seberapa sering diupdate?", a: "Update bulanan untuk memastikan prompt tetap relevan dengan versi AI terbaru dan tren marketing." },
    ],
    platforms: ["Lynk.id", "Gumroad", "Tokopedia Digital", "Komunitas Marketer", "Facebook Group AI"],
    hak: "Hak Jual Kembali (Resell Rights) - 100% keuntungan untuk kamu",
    waScript: `Halo kak [nama]! 

Kak pakai ChatGPT kan? Tapi sering frustrasi karena hasilnya generik atau perlu diedit lama?

Saya punya koleksi 100+ prompt yang udah tested dan langsung kasih hasil profesional — dari bikin iklan, konten, sampai riset kompetitor.

Harganya cuma Rp [harga], dan ada update bulanan. Mau saya kirimkan link-nya? 😊`,
  },
  {
    id: "4",
    name: "Affiliate Content System",
    category: "Sistem & Framework",
    icon: Globe,
    iconBg: "bg-green-100 dark:bg-green-900",
    iconColor: "text-green-600 dark:text-green-400",
    price: "Rp 127.000",
    priceNum: 127000,
    suggestedPrice: "Rp 197.000 - Rp 397.000",
    suggestedPriceNum: [197000, 397000],
    commission: "100%",
    badgeText: "Baru",
    badgeColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    description: "Sistem konten lengkap untuk affiliate marketer. Dari riset produk, buat konten, sampai closing otomatis.",
    features: [
      "Sistem konten 30 hari affiliate yang terbukti menghasilkan",
      "Template caption untuk Instagram, TikTok, Facebook, WhatsApp",
      "Framework review produk yang membangun trust dan convert",
      "Strategi bangun trust audience sebelum jualan",
      "Panduan memilih produk affiliate yang paling profitable",
      "Funnel sederhana tanpa website — hanya pakai link bio dan WA",
      "Script DM untuk follow-up leads yang belum beli",
      "Panduan negosiasi komisi dengan seller/brand",
    ],
    targetMarket: "Affiliate marketer pemula, influencer yang mau monetisasi, content creator, siapapun yang punya followers atau komunitas",
    salesAngle: "Sistem konten 30 hari yang otomatis menghasilkan komisi affiliate tanpa modal besar",
    painPoints: ["Sudah posting tapi tidak ada yang beli dari link affiliate", "Followers banyak tapi engagement dan penjualan rendah", "Bingung konten apa yang bikin orang mau klik dan beli", "Merasa seperti jualan terus tapi tidak ada hasilnya"],
    objections: [
      { q: "Saya tidak punya banyak followers, apakah bisa?", a: "Bisa! Sistem ini bekerja bahkan dengan 500-1000 followers yang tepat. Kualitas audience lebih penting dari kuantitas." },
      { q: "Butuh website atau modal besar?", a: "Tidak. Sistem ini dirancang tanpa website — hanya menggunakan link bio, WhatsApp, dan media sosial yang sudah kamu punya." },
      { q: "Bagaimana cara memilih produk yang mau saya review?", a: "Ada panduan lengkap di dalam sistem tentang cara memilih produk affiliate yang cocok dengan niche dan audience kamu." },
    ],
    platforms: ["Instagram", "TikTok", "WhatsApp", "Facebook", "Telegram", "Twitter/X"],
    hak: "Hak Jual Kembali (Resell Rights) - 100% keuntungan untuk kamu",
    waScript: `Halo kak [nama]!

Kak ada postingan affiliate tapi sepi pembelinya? Atau mau mulai tapi bingung sistemnya?

Saya punya Affiliate Content System — sistem konten 30 hari yang lengkap dari riset sampai closing, tanpa modal website.

Harganya Rp [harga] dan sudah banyak yang dapat komisi pertamanya pakai sistem ini.

Boleh saya share detail lengkapnya? 😊`,
  },
];

const copywritingAngles = [
  {
    angle: "Pain Point",
    color: "border-red-200 dark:border-red-800",
    bgColor: "bg-red-50 dark:bg-red-950",
    template: "Capek [masalah]? Ini solusinya: [nama produk] - [benefit utama] dalam [waktu/langkah]",
    example: "Capek konten sepi? Ini solusinya: AI Command Framework - ratusan konten viral dalam hitungan menit",
    whenToUse: "Gunakan ketika target market sangat relate dengan masalah yang diangkat",
  },
  {
    angle: "Curiosity",
    color: "border-blue-200 dark:border-blue-800",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    template: "Cara [hasil yang diinginkan] tanpa [hambatan umum] yang selama ini bikin kamu nyerah",
    example: "Cara dapat Rp 5 juta pertama tanpa modal besar yang selama ini bikin kamu nyerah",
    whenToUse: "Efektif untuk audience yang skeptis — framing 'tanpa [hambatan]' menghilangkan objeksi di awal",
  },
  {
    angle: "Social Proof",
    color: "border-green-200 dark:border-green-800",
    bgColor: "bg-green-50 dark:bg-green-950",
    template: "[Jumlah] orang sudah [hasil]. Sekarang giliran kamu dengan [nama produk] — [CTA singkat]",
    example: "500+ orang sudah pecah telor dari produk digital. Sekarang giliran kamu dengan Blueprint Digital — ambil sebelum harga naik!",
    whenToUse: "Paling efektif ketika produk sudah punya track record. Gunakan angka spesifik, bukan 'banyak orang'",
  },
  {
    angle: "Scarcity / Urgency",
    color: "border-orange-200 dark:border-orange-800",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    template: "[Nama produk] hanya Rp [harga] sampai [waktu spesifik]. Setelah itu NAIK jadi Rp [harga lebih tinggi] — tanpa nego",
    example: "AI Command Framework hanya Rp 77.000 sampai Jumat jam 23:59. Setelah itu NAIK jadi Rp 149.000 — tanpa nego",
    whenToUse: "Gunakan saat ada alasan nyata untuk harga naik. Jangan palsu — akan merusak kepercayaan",
  },
  {
    angle: "Transformation Story",
    color: "border-purple-200 dark:border-purple-800",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    template: "Dulu saya [situasi awal yang relate]. Sekarang [hasil yang dicapai] — semuanya berubah setelah saya temukan [nama produk]",
    example: "Dulu saya kerja dari jam 9-5 tapi gaji tidak pernah cukup. Sekarang bisa side income Rp 3-5 juta/bulan — semuanya berubah setelah saya temukan Blueprint Digital",
    whenToUse: "Sangat powerful untuk audience yang merasa stuck. Pastikan ceritanya authentic dan relatable",
  },
  {
    angle: "Authority / Expertise",
    color: "border-yellow-200 dark:border-yellow-800",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    template: "Saya sudah [pengalaman/pencapaian]. Inilah [insight/produk] yang saya pakai — sekarang bisa kamu manfaatkan juga",
    example: "Saya sudah 3 tahun di bidang digital marketing dengan omzet Rp 50 juta/bulan. Inilah framework prompting AI yang saya pakai — sekarang bisa kamu manfaatkan juga",
    whenToUse: "Efektif jika kamu sendiri sudah punya kredibilitas di bidangnya. Jangan berlebihan dan tidak jujur",
  },
  {
    angle: "Question Hook",
    color: "border-teal-200 dark:border-teal-800",
    bgColor: "bg-teal-50 dark:bg-teal-950",
    template: "Apakah kamu [situasi yang relate]? Kalau iya, [nama produk] ini dibuat untuk kamu — [benefit utama]",
    example: "Apakah kamu sudah coba beriklan tapi ROAS di bawah 1x terus? Kalau iya, Masterclass TikTok Ads ini dibuat untuk kamu — panduan dari nol sampai ROAS 3x",
    whenToUse: "Self-selection yang kuat — hanya yang relate yang akan merespon, sehingga kualitas lead lebih tinggi",
  },
  {
    angle: "Contrast / Before-After",
    color: "border-indigo-200 dark:border-indigo-800",
    bgColor: "bg-indigo-50 dark:bg-indigo-950",
    template: "❌ Tanpa [nama produk]: [situasi buruk]\n✅ Dengan [nama produk]: [situasi yang diinginkan]",
    example: "❌ Tanpa sistem affiliate: Posting setiap hari tapi tidak ada yang beli\n✅ Dengan Affiliate Content System: Konten 30 menit bisa menghasilkan passive income berhari-hari",
    whenToUse: "Format visual yang mudah dibaca, sangat efektif untuk Story dan carousel di Instagram",
  },
];

const sellingPlatforms = [
  {
    name: "Lynk.id",
    bestFor: "Produk digital Indonesia, mudah disetup, bayar via transfer",
    commission: "3-5% per transaksi",
    setup: "15 menit",
    tips: "Buat deskripsi yang detail dan tambahkan testimoni. Gunakan foto produk yang menarik.",
  },
  {
    name: "WhatsApp / Telegram",
    bestFor: "Audience yang sudah kenal kamu, tingkat konversi tertinggi",
    commission: "0% (semua untuk kamu)",
    setup: "Langsung",
    tips: "Bangun dulu kepercayaan sebelum jualan. Buat broadcast list, bukan spam ke grup.",
  },
  {
    name: "Gumroad",
    bestFor: "Pasar internasional, sudah terbukti untuk produk digital",
    commission: "10% per transaksi",
    setup: "30 menit",
    tips: "Harga bisa dalam USD untuk menjangkau pasar lebih luas dengan margin lebih besar.",
  },
  {
    name: "Tokopedia Digital",
    bestFor: "Jangkauan luas, kepercayaan tinggi karena platform besar",
    commission: "2.5-5% + biaya layanan",
    setup: "1-2 hari (verifikasi toko)",
    tips: "Optimalkan judul produk dengan keyword yang sering dicari. Minta review dari pembeli.",
  },
  {
    name: "Instagram / TikTok Shop",
    bestFor: "Audience yang aktif di media sosial, discovery organic tinggi",
    commission: "2-5% per transaksi",
    setup: "1-3 hari",
    tips: "Konten video demo produk sangat efektif. Manfaatkan fitur live untuk boost penjualan.",
  },
];

export default function DigitalProducts() {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [expandedObjId, setExpandedObjId] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState("");
  const [unitTarget, setUnitTarget] = useState("");
  const { toast } = useToast();

  const copyText = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: label ? `${label} berhasil disalin.` : "Teks berhasil disalin ke clipboard." });
  };

  const calcProfit = () => {
    if (!selectedProduct || !sellPrice) return null;
    const sell = parseInt(sellPrice.replace(/\D/g, ""));
    const modal = selectedProduct.priceNum;
    const units = parseInt(unitTarget) || 1;
    if (isNaN(sell) || sell <= 0) return null;
    const profitPerUnit = sell - modal;
    const totalProfit = profitPerUnit * units;
    const roi = ((profitPerUnit / modal) * 100).toFixed(0);
    return { profitPerUnit, totalProfit, roi };
  };

  const calc = calcProfit();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Katalog Produk Digital</h1>
          <p className="text-muted-foreground">4 produk winning dengan hak jual kembali — 100% keuntungan untuk kamu</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Shield, label: "Hak Jual Kembali", value: "100% Profit", color: "text-green-500" },
          { icon: Package, label: "Jumlah Produk", value: "4 Produk", color: "text-blue-500" },
          { icon: ShoppingCart, label: "Platform Jual", value: "5+ Platform", color: "text-purple-500" },
          { icon: Award, label: "Modal Awal", value: "Mulai Rp 77rb", color: "text-orange-500" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-4">
              <s.icon className={`h-5 w-5 ${s.color} mb-1`} />
              <p className="font-bold text-base">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="katalog" data-testid="tabs-products">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="katalog" data-testid="tab-katalog">Katalog Produk</TabsTrigger>
          <TabsTrigger value="copywriting" data-testid="tab-copywriting">Template Copywriting</TabsTrigger>
          <TabsTrigger value="platform" data-testid="tab-platform">Platform Jualan</TabsTrigger>
        </TabsList>

        <TabsContent value="katalog" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(product => (
              <Card key={product.id} className="hover:border-primary/40 transition-colors" data-testid={`card-product-${product.id}`}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${product.iconBg}`}>
                      <product.icon className={`h-5 w-5 ${product.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge className={`text-xs mb-1 ${product.badgeColor}`}>{product.badgeText}</Badge>
                      <CardTitle className="text-base leading-tight">{product.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                    </div>
                  </div>
                  <CardDescription className="text-sm">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <p className="text-xs text-muted-foreground">Modal</p>
                      <p className="font-bold text-primary">{product.price}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Harga Jual</p>
                      <p className="font-medium text-sm">{product.suggestedPrice}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">{product.hak}</span>
                  </div>
                  <Button className="w-full" onClick={() => { setSelectedProduct(product); setSellPrice(""); setUnitTarget(""); }} data-testid={`button-detail-${product.id}`}>
                    Lihat Detail Lengkap <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="copywriting" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm">
            <strong>Cara pakai:</strong> Ganti teks dalam [kurung siku] dengan detail produk spesifik kamu. 
            Template ini cocok untuk caption Instagram, TikTok, Facebook Ads, dan WhatsApp broadcast.
          </div>
          {copywritingAngles.map((item, i) => (
            <div key={i} className={`p-4 rounded-lg border-2 ${item.color} ${item.bgColor} space-y-3`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Badge variant="outline" className="font-semibold">{item.angle}</Badge>
                <Button variant="ghost" size="sm" onClick={() => copyText(item.template, item.angle)} data-testid={`button-copy-angle-${i}`}>
                  <Copy className="h-3.5 w-3.5 mr-1" /> Salin Template
                </Button>
              </div>
              <p className="text-sm font-mono bg-background/70 p-3 rounded border whitespace-pre-line">{item.template}</p>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contoh:</p>
                <p className="text-sm italic text-muted-foreground whitespace-pre-line">{item.example}</p>
              </div>
              <div className="flex items-start gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{item.whenToUse}</p>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="platform" className="space-y-4 mt-4">
          {sellingPlatforms.map((platform, i) => (
            <Card key={i} data-testid={`card-platform-${i}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base">{platform.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">Komisi: {platform.commission}</Badge>
                    <Badge variant="secondary" className="text-xs">Setup: {platform.setup}</Badge>
                  </div>
                </div>
                <CardDescription>{platform.bestFor}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 p-3 rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{platform.tips}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${selectedProduct.iconBg}`}>
                    <selectedProduct.icon className={`h-5 w-5 ${selectedProduct.iconColor}`} />
                  </div>
                  <div>
                    <DialogTitle>{selectedProduct.name}</DialogTitle>
                    <DialogDescription>{selectedProduct.category}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="fitur" className="mt-2">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="fitur">Isi Produk</TabsTrigger>
                  <TabsTrigger value="strategi">Strategi Jual</TabsTrigger>
                  <TabsTrigger value="objeksi">Handle Objeksi</TabsTrigger>
                  <TabsTrigger value="kalkulator">Kalkulator</TabsTrigger>
                </TabsList>

                <TabsContent value="fitur" className="space-y-4 mt-3">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> Yang Ada di Dalam Produk
                    </h4>
                    <ul className="space-y-2">
                      {selectedProduct.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm p-2 rounded hover:bg-muted transition-colors">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold mb-2 text-sm flex items-center gap-2 text-red-700 dark:text-red-300">
                      <Target className="h-4 w-4" /> Pain Point Target Market
                    </h4>
                    <ul className="space-y-1">
                      {selectedProduct.painPoints.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-red-500 font-bold mt-0.5">✕</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold mb-1 text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <Users className="h-4 w-4" /> Target Market
                    </h4>
                    <p className="text-sm text-muted-foreground">{selectedProduct.targetMarket}</p>
                  </div>
                </TabsContent>

                <TabsContent value="strategi" className="space-y-4 mt-3">
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold mb-1 text-sm flex items-center gap-2 text-purple-700 dark:text-purple-300">
                      <TrendingUp className="h-4 w-4" /> Sales Angle Utama
                    </h4>
                    <p className="text-sm italic">"{selectedProduct.salesAngle}"</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => copyText(selectedProduct.salesAngle, "Sales angle")} data-testid="button-copy-sales-angle">
                      <Copy className="h-3.5 w-3.5 mr-1" /> Salin untuk Caption
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" /> Platform yang Disarankan
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.platforms.map((p, i) => (
                        <Badge key={i} variant="secondary">{p}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-500" /> Script WhatsApp / DM
                    </h4>
                    <div className="relative">
                      <pre className="text-xs bg-muted p-3 rounded whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">{selectedProduct.waScript}</pre>
                      <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => copyText(selectedProduct.waScript, "Script WhatsApp")} data-testid="button-copy-wa-script">
                        <Copy className="h-3.5 w-3.5 mr-1" /> Salin Script WA
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="objeksi" className="space-y-3 mt-3">
                  <p className="text-sm text-muted-foreground">Jawaban untuk pertanyaan dan keberatan yang sering muncul dari calon pembeli:</p>
                  {selectedProduct.objections.map((obj, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden">
                      <button
                        className="w-full text-left p-3 flex items-center justify-between hover:bg-muted transition-colors"
                        onClick={() => setExpandedObjId(expandedObjId === `${selectedProduct.id}-${i}` ? null : `${selectedProduct.id}-${i}`)}
                        data-testid={`button-objection-${i}`}
                      >
                        <span className="font-medium text-sm flex items-start gap-2">
                          <span className="text-primary font-bold">Q:</span> {obj.q}
                        </span>
                        {expandedObjId === `${selectedProduct.id}-${i}` ? (
                          <ChevronUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        )}
                      </button>
                      {expandedObjId === `${selectedProduct.id}-${i}` && (
                        <div className="px-3 pb-3 bg-green-50 dark:bg-green-950 border-t">
                          <p className="text-sm text-muted-foreground pt-2 flex items-start gap-2">
                            <span className="text-green-600 font-bold flex-shrink-0">A:</span> {obj.a}
                          </p>
                          <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs" onClick={() => copyText(`Q: ${obj.q}\nA: ${obj.a}`, "Jawaban objeksi")} data-testid={`button-copy-objection-${i}`}>
                            <Copy className="h-3 w-3 mr-1" /> Salin Q&A
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="kalkulator" className="space-y-4 mt-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Calculator className="h-4 w-4" /> Kalkulator Potensi Profit
                    </p>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Modal (harga beli produk)</Label>
                        <p className="font-bold text-primary">{selectedProduct.price}</p>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="sell-price" className="text-xs">Harga Jual yang Kamu Tentukan</Label>
                        <Input id="sell-price" placeholder="contoh: 200000" value={sellPrice} onChange={e => setSellPrice(e.target.value)} data-testid="input-sell-price" />
                        <p className="text-xs text-muted-foreground">Rekomendasi: {selectedProduct.suggestedPrice}</p>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="unit-target" className="text-xs">Target Penjualan (unit/bulan)</Label>
                        <Input id="unit-target" placeholder="contoh: 10" value={unitTarget} onChange={e => setUnitTarget(e.target.value)} data-testid="input-unit-target" />
                      </div>
                    </div>
                  </div>
                  {calc && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-center">
                          <p className="text-xs text-muted-foreground">Profit/Unit</p>
                          <p className="font-bold text-green-700 dark:text-green-300">Rp {calc.profitPerUnit.toLocaleString("id")}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-center">
                          <p className="text-xs text-muted-foreground">ROI</p>
                          <p className="font-bold text-blue-700 dark:text-blue-300">{calc.roi}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                          <p className="text-xs text-muted-foreground">Total/Bulan</p>
                          <p className="font-bold text-primary">Rp {calc.totalProfit.toLocaleString("id")}</p>
                        </div>
                      </div>
                      {parseInt(unitTarget) > 0 && (
                        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            <strong>Analisis:</strong> Dengan harga jual Rp {parseInt(sellPrice).toLocaleString("id")}, 
                            kamu hanya perlu jual <strong>{unitTarget} unit/bulan</strong> untuk menghasilkan 
                            total profit <strong>Rp {calc.totalProfit.toLocaleString("id")}</strong>. 
                            Artinya rata-rata {Math.ceil(parseInt(unitTarget) / 30)} penjualan per hari.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {!calc && sellPrice && (
                    <p className="text-sm text-red-500">Masukkan angka yang valid untuk harga jual.</p>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
