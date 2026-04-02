import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NextSteps } from "@/components/next-steps";
import { 
  BarChart3, Target, DollarSign, CheckCircle2, 
  AlertTriangle, TrendingUp, Users, Lightbulb, 
  Copy, Layers, Settings, XCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const campaignTypes = [
  {
    name: "Sales (Konversi / Purchase)",
    icon: DollarSign,
    color: "bg-green-100 dark:bg-green-900",
    iconColor: "text-green-600 dark:text-green-400",
    whenToUse: "Sudah punya data pixel minimal 50 Purchase/minggu, mau scale penjualan secara agresif",
    howItWorks: "AI Meta mengoptimalkan iklan untuk tampil ke orang yang paling mungkin membeli berdasarkan data historis pixel kamu.",
    setup: [
      "Objective: Sales → Website → Conversions → Purchase",
      "Budget: Minimal 3-5x CPA target per hari (jika target Rp 50rb/purchase, budget minimal Rp 150rb/hari)",
      "Audience: Mulai dengan Broad (tanpa interest) atau Lookalike 1-3% dari pembeli",
      "Bidding: Cost per Result Goal — isi target CPA yang realistis",
      "Creative: Upload minimal 4-6 variasi (gabungkan gambar dan video)",
      "Placement: Advantage+ Placements (biarkan Meta pilih) untuk efisiensi terbaik",
    ],
    tips: "Percayakan AI Meta. Semakin banyak data pixel, semakin akurat optimasinya. Hindari terlalu banyak batasan audience.",
    bestFor: "Produk digital harga Rp 50rb–500rb, landing page yang sudah dioptimasi untuk konversi",
  },
  {
    name: "Lead Generation (Kumpul Database)",
    icon: Users,
    color: "bg-blue-100 dark:bg-blue-900",
    iconColor: "text-blue-600 dark:text-blue-400",
    whenToUse: "Mau kumpulkan database (nama, email, WhatsApp) untuk follow-up atau jual produk melalui funnel",
    howItWorks: "Meta menyediakan form lead langsung di dalam platform — user tidak perlu keluar dari Facebook/Instagram untuk isi data.",
    setup: [
      "Objective: Leads → Instant Forms",
      "Buat Instant Form: minta hanya data yang perlu (nama + nomor WA sudah cukup untuk awal)",
      "Budget: Rp 50.000–100.000/hari sudah cukup untuk mulai",
      "Audience: Interest targeting yang relevan dengan niche produk",
      "Sambungkan dengan Google Sheets via Zapier atau integrasi bawaan Meta untuk auto-export leads",
      "Pastikan ada alur follow-up setelah lead masuk (WA otomatis / email / telepon)",
    ],
    tips: "Form yang terlalu panjang akan menurunkan conversion rate drastis. Lebih baik sedikit lead berkualitas daripada banyak yang tidak relevan.",
    bestFor: "Webinar gratis, lead magnet, workshop, trial produk, konsultasi gratis, gathering data email",
  },
  {
    name: "Traffic (Kunjungan Website)",
    icon: TrendingUp,
    color: "bg-purple-100 dark:bg-purple-900",
    iconColor: "text-purple-600 dark:text-purple-400",
    whenToUse: "Baru mulai beriklan, pixel masih kosong — atau mau warming up audience sebelum retargeting",
    howItWorks: "Mengoptimalkan untuk klik ke website. Tidak optimal untuk konversi, tapi bagus untuk mengisi pixel dengan data pengunjung.",
    setup: [
      "Objective: Traffic → Website",
      "Budget: Rp 30.000–50.000/hari cukup untuk fase ini",
      "Audience: Interest targeting yang relevan dengan niche",
      "Tambahkan UTM parameter di semua link untuk tracking di Google Analytics",
      "Pastikan pixel sudah terpasang dan aktif untuk rekam data pengunjung",
      "Buat Custom Audience dari pengunjung website untuk remarketing nanti",
    ],
    tips: "Jangan terlalu lama di Traffic objective. Setelah pixel punya 1.000+ pengunjung, pertimbangkan switch ke Sales untuk optimize konversi.",
    bestFor: "Warming up pixel baru, artikel blog, konten edukasi, awareness produk baru",
  },
  {
    name: "Advantage+ Shopping Campaign (ASC)",
    icon: Settings,
    color: "bg-orange-100 dark:bg-orange-900",
    iconColor: "text-orange-600 dark:text-orange-400",
    whenToUse: "Sudah profitable dengan campaign manual, ingin scale dengan effort minimal menggunakan full AI automation Meta",
    howItWorks: "Campaign hampir fully automated oleh AI Meta. Kamu hanya upload creative dan set budget — Meta mengurus audience, placement, dan bidding secara otomatis.",
    setup: [
      "Di Campaign level: pilih 'Advantage+ Shopping Campaign'",
      "Pixel wajib sudah mature — minimal 100-200 Purchase events",
      "Upload semua creative yang pernah perform bagus (6-12 variasi berbeda)",
      "Set budget lebih tinggi dari campaign manual (minimal 2x budget campaign biasa)",
      "Upload existing customer list untuk better exclusion dan lookalike signals",
      "Beri waktu minimal 2-4 minggu learning phase sebelum evaluasi",
    ],
    tips: "ASC bekerja terbaik dengan banyak data pixel. Jangan run ASC dengan pixel yang masih baru — hasilnya tidak akan optimal.",
    bestFor: "E-commerce, produk digital yang sudah terbukti laku, scale dari budget Rp 1-5 juta/hari",
  },
];

const audienceTypes = [
  {
    type: "Broad Audience (Tanpa Interest Targeting)",
    tag: "Direkomendasikan 2024",
    tagColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    description: "Tidak menggunakan interest targeting sama sekali. Biarkan AI Meta yang menentukan siapa yang paling relevan berdasarkan data pixel.",
    pros: [
      "AI Meta 2024 sangat powerful — sering outperform interest targeting manual",
      "Tidak perlu waktu lama untuk riset interest",
      "Audience tidak 'habis' seperti interest targeting yang terbatas",
      "Lebih skalabel karena tidak ada batasan buatan",
    ],
    cons: [
      "Membutuhkan pixel yang sudah mature (minimal 50+ konversi/minggu)",
      "Learning phase lebih panjang di awal karena tidak ada anchor interest",
      "Creative harus sangat kuat untuk menarik perhatian yang tepat",
    ],
    setup: "Campaign > Ad Set > Audience: Hapus semua interest. Set hanya lokasi (Indonesia) dan usia (18-65 atau sesuai buyer persona). Aktifkan Advantage+ Audience jika tersedia.",
    bestFor: "Campaign scale dengan pixel mature, produk mainstream, retargeting",
  },
  {
    type: "Interest Targeting",
    tag: "Untuk Pemula",
    tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    description: "Target berdasarkan interest, perilaku, dan demografis yang relevan dengan produk. Cocok saat pixel belum punya cukup data.",
    pros: [
      "Mudah dipahami dan setup bahkan untuk pemula",
      "Memberikan arahan awal ke AI saat pixel masih kosong",
      "Efektif untuk niche produk yang sangat spesifik",
    ],
    cons: [
      "Audience interest populer bisa sangat mahal (CPM tinggi)",
      "Sering terjadi audience overlap antar ad set",
      "Tidak fleksibel — terbatas oleh interest yang tersedia di Meta",
    ],
    setup: "Gunakan Audience Insights untuk riset interest yang paling relevan. Buat 3-4 ad set berbeda dengan interest yang tidak overlap. Evaluasi setelah 7 hari dan matikan yang CPA-nya tertinggi.",
    bestFor: "Niche produk spesifik, campaign baru dengan pixel kosong, produk B2B",
  },
  {
    type: "Lookalike Audience (1-10%)",
    tag: "Kualitas Tinggi",
    tagColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    description: "Meta membuat audience baru yang mirip dengan daftar yang kamu upload — pembeli, subscriber email, atau pengunjung website.",
    pros: [
      "Kualitas lead sangat tinggi karena berbasis data nyata dari pembeli kamu",
      "Conversion rate sering lebih baik dari interest targeting",
      "Bisa dibuat dari berbagai sumber data yang sudah kamu punya",
    ],
    cons: [
      "Butuh minimal 100 data di source list untuk akurasi yang bagus (idealnya 1.000+)",
      "Perlu data list yang bersih dan relevan (email, phone dalam format benar)",
      "Bisa overlap dengan broad audience jika dijalankan bersamaan",
    ],
    setup: "Custom Audiences > Create Audience > Lookalike Audience. Upload list pembeli (CSV: nama, email, phone). Pilih 1% untuk paling mirip dengan data asli, 3-5% untuk reach yang lebih luas.",
    bestFor: "Scale campaign yang sudah profitable, produk premium, email marketing follow-up",
  },
  {
    type: "Retargeting (Custom Audience Hangat)",
    tag: "Konversi Tertinggi",
    tagColor: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    description: "Target ulang orang yang sudah berinteraksi dengan bisnis kamu — pengunjung website, engagement Instagram/Facebook, penonton video iklan.",
    pros: [
      "CTR dan Conversion Rate tertinggi dari semua jenis audience",
      "Cost per konversi paling rendah karena audience sudah 'warm'",
      "Audience sudah mengenal produk kamu — tinggal push ke keputusan beli",
    ],
    cons: [
      "Audience size sangat terbatas — bergantung pada traffic yang ada",
      "Butuh minimal 500-1.000 pengunjung sebelum bisa retarget secara efektif",
      "Bisa cepat saturated — frequency tinggi bisa ganggu user experience",
    ],
    setup: "Custom Audiences: Website Traffic (pengunjung 30-7 hari), Video Views (25% atau 50% durasi), atau Engagement (interaksi Instagram/Facebook 30 hari). Buat campaign khusus dengan penawaran lebih spesifik atau urgency lebih kuat.",
    bestFor: "Cart abandonment, pengunjung halaman produk, penonton video iklan, follower aktif Instagram",
  },
];

const budgetStrategy = [
  {
    level: "Fase Testing (Pemula)",
    dailyBudget: "Rp 50.000 – Rp 150.000/hari",
    totalBudget: "Total: Rp 1,5 – Rp 5 juta",
    duration: "2-4 minggu",
    goal: "Temukan creative, angle, dan audience yang menghasilkan konversi",
    allocation: [
      { label: "3-4 Ad Set dengan interest/broad berbeda", pct: 60 },
      { label: "Retargeting pengunjung website (jika ada traffic)", pct: 25 },
      { label: "Lookalike dari email list jika tersedia", pct: 15 },
    ],
    kpi: "Target: Temukan 1-2 ad set dengan CPA di bawah target profit",
    tips: "Fase ini adalah investasi belajar. Jangan evaluasi terlalu cepat — tunggu minimal 7 hari dan 500+ tayangan per ad set sebelum ambil keputusan.",
  },
  {
    level: "Fase Scale Awal (Profitable)",
    dailyBudget: "Rp 200.000 – Rp 500.000/hari",
    totalBudget: "Total: Rp 6 – Rp 15 juta/bulan",
    duration: "1-2 bulan",
    goal: "Scale campaign yang sudah terbukti profitable, pertahankan CPA yang stabil",
    allocation: [
      { label: "Best performing campaign dari fase testing", pct: 50 },
      { label: "Advantage+ Shopping Campaign (ASC) baru", pct: 30 },
      { label: "Retargeting & Lookalike dari pembeli baru", pct: 20 },
    ],
    kpi: "Target: ROAS > 2x, volume penjualan naik minimal 2x dari fase sebelumnya",
    tips: "Naikkan budget maksimal 20-30% setiap 2-3 hari. Perkenalkan creative baru setiap minggu untuk hindari ad fatigue.",
  },
  {
    level: "Fase Scale Agresif (Growth)",
    dailyBudget: "Rp 500.000 – Rp 2.000.000+/hari",
    totalBudget: "Total: Rp 15 juta+/bulan",
    duration: "Ongoing (dengan evaluasi mingguan)",
    goal: "Maksimalkan revenue sambil jaga profitabilitas — scale besar dengan sistem yang sudah terbukti",
    allocation: [
      { label: "Advantage+ Shopping (full automation Meta AI)", pct: 60 },
      { label: "New creative testing campaign (refreshment)", pct: 20 },
      { label: "Retargeting high-intent audience (cart, produk viewer)", pct: 20 },
    ],
    kpi: "Target: ROAS > 3x, volume scale minimal 2x setiap bulan sambil maintain CPA",
    tips: "Di fase ini, kunci adalah diversifikasi creative secara konsisten dan test offer/bonus baru untuk sustain performa jangka panjang.",
  },
];

const kpiData = [
  { metric: "CTR (Click-Through Rate)", poor: "< 0.8%", average: "0.8%–1.5%", good: "> 1.5%", note: "CTR rendah = creative atau headline tidak menarik untuk audience ini. Ganti visual atau teks headline." },
  { metric: "CPC (Cost Per Click)", poor: "> Rp 8.000", average: "Rp 3.000–8.000", good: "< Rp 3.000", note: "CPC tinggi biasanya tanda audience terlalu sempit atau CPM sedang tinggi. Coba broad audience." },
  { metric: "CPM (Cost per 1.000 Tayangan)", poor: "> Rp 80.000", average: "Rp 30.000–80.000", good: "< Rp 30.000", note: "CPM tinggi saat kompetisi iklan tinggi (Ramadan, Harbolnas). Coba waktu atau placement berbeda." },
  { metric: "Conversion Rate Landing Page", poor: "< 1%", average: "1%–3%", good: "> 3%", note: "CVR rendah menunjukkan masalah di landing page, bukan iklan. Perbaiki headline, kecepatan halaman, atau CTA." },
  { metric: "Cost Per Lead (CPL)", poor: "> Rp 50.000", average: "Rp 15.000–50.000", good: "< Rp 15.000", note: "Standar CPL berbeda per industri. Untuk produk Rp 500rb, CPL Rp 50rb masih bisa acceptable." },
  { metric: "ROAS (Return on Ad Spend)", poor: "< 1.5x", average: "1.5x–3x", good: "> 3x", note: "Hitung break-even ROAS berdasarkan profit margin dulu sebelum set target. ROAS 2x dengan margin 60% = profitable." },
  { metric: "Frequency (Seberapa Sering Dilihat)", poor: "> 5x", average: "2x–5x", good: "1x–2x", note: "Frequency tinggi = ad fatigue. Refresh creative atau perluas audience sebelum CTR turun drastis." },
];

const creativeSpecs = [
  {
    format: "Single Image",
    ratio: "1:1 (Square) atau 4:5 (Portrait)",
    resolution: "1080 x 1080 px atau 1080 x 1350 px",
    fileSize: "Maks 30 MB — format JPG atau PNG",
    textRule: "< 20% area gambar untuk reach optimal. Terlalu banyak teks = reach dibatasi Meta.",
    bestFor: "Product showcase, promo flash, quote/testimoni, announcement",
    tips: "Format 4:5 lebih baik dari 1:1 — lebih banyak screen real estate di feed mobile tanpa biaya ekstra.",
  },
  {
    format: "Video Ad",
    ratio: "4:5 (Portrait) atau 9:16 (Vertical Full)",
    resolution: "1080 x 1350 px atau 1080 x 1920 px",
    fileSize: "Maks 4 GB — durasi optimal 15-30 detik untuk feed, 15 detik untuk Story",
    textRule: "Tambahkan caption teks — 80% penonton nonton tanpa suara di Facebook/Instagram.",
    bestFor: "Storytelling brand, tutorial singkat, testimoni video, before-after, product demo",
    tips: "Hook 3 detik pertama adalah segalanya. Mulai dengan visual eye-catching atau teks besar mengejutkan.",
  },
  {
    format: "Carousel (Multi-Image / Multi-Video)",
    ratio: "1:1 per card",
    resolution: "1080 x 1080 px per card — 2 sampai 10 card",
    fileSize: "< 30 MB per gambar, < 4 GB per video card",
    textRule: "Headline maks 40 karakter, deskripsi maks 125 karakter per card.",
    bestFor: "Showcase multiple produk/fitur, langkah tutorial step-by-step, before-after beberapa aspek",
    tips: "Card pertama harus paling impactful — itu yang menentukan apakah penonton mau geser ke card berikutnya.",
  },
  {
    format: "Story & Reels Ad",
    ratio: "9:16 (Vertikal Full Screen) — wajib",
    resolution: "1080 x 1920 px minimal",
    fileSize: "Video maks 4 GB — Story maks 15 detik, Reels maks 60 detik (optimal 15-30 detik)",
    textRule: "Jaga semua elemen penting di zona aman tengah — 20% area atas dan bawah bisa tertutup UI Instagram/Facebook.",
    bestFor: "Flash promo, konten urgent, announcement, konten yang ingin terasa native dan tidak seperti iklan",
    tips: "Desain seolah ini bukan iklan — konten yang terlihat organik performa jauh lebih baik di Story dan Reels.",
  },
];

const commonMistakes = [
  {
    mistake: "Mengubah campaign di tengah learning phase (7-14 hari pertama)",
    why: "Meta AI butuh waktu belajar. Setiap perubahan signifikan akan restart learning phase dari awal.",
    solution: "Buat campaign baru jika ingin test sesuatu yang berbeda. Jangan ubah budget > 30% atau ganti audience pada campaign yang masih dalam learning.",
  },
  {
    mistake: "Terlalu banyak ad set dengan budget terlalu kecil",
    why: "Budget Rp 30.000 per ad set tidak cukup untuk menghasilkan data yang statistically significant.",
    solution: "Lebih baik 2-3 ad set dengan Rp 75.000 masing-masing daripada 7 ad set dengan Rp 30.000. Konsentrasi budget untuk belajar lebih cepat.",
  },
  {
    mistake: "Hanya punya 1-2 variasi creative",
    why: "Ad fatigue terjadi saat audience melihat iklan yang sama berulang kali. CTR turun, CPM naik, ROAS hancur.",
    solution: "Siapkan minimal 5-8 creative per campaign. Buat creative baru minimal 1-2 per minggu untuk menjaga performa.",
  },
  {
    mistake: "Over-targeting (terlalu banyak filter audience)",
    why: "Terlalu banyak interest, demografis, dan behavioral filter membuat Meta kesulitan menemukan orang yang tepat — CPM meningkat.",
    solution: "Di 2024, kurangi interest targeting. Gunakan broad atau maksimal 1-2 interest yang sangat relevan. Biarkan AI Meta bekerja.",
  },
  {
    mistake: "Landing page lambat dan tidak mobile-friendly",
    why: "70-80% traffic Meta Ads dari HP. Landing page load > 3 detik = pengguna langsung pergi sebelum baca apapun.",
    solution: "Test landing page di HP sebelum launch. Gunakan Google PageSpeed Insights. Tombol CTA harus besar dan mudah diklik di layar kecil.",
  },
  {
    mistake: "Tidak setup tracking yang proper",
    why: "Tanpa tracking yang benar, kamu tidak tahu iklan mana yang benar-benar menghasilkan penjualan. Semua keputusan jadi tebak-tebakan.",
    solution: "Verifikasi pixel Purchase event dengan Meta Pixel Helper. Tambahkan UTM parameter di semua link iklan sebagai backup tracking di Analytics.",
  },
];

export default function MetaAds() {
  const [expandedBudget, setExpandedBudget] = useState<number | null>(0);
  const { toast } = useToast();

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!" });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Meta Ads Advanced</h1>
          <p className="text-muted-foreground">Strategi Facebook & Instagram Ads untuk produk digital — dari setup sampai scale agresif</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Platform", value: "FB + IG + Reels", icon: Layers, color: "text-blue-500" },
          { label: "Budget Mulai", value: "Rp 50rb/hari", icon: DollarSign, color: "text-green-500" },
          { label: "Target CTR", value: "> 1.5%", icon: Target, color: "text-orange-500" },
          { label: "Target ROAS", value: "> 2–3x", icon: TrendingUp, color: "text-purple-500" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-4">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="campaign" data-testid="tabs-meta">
        <TabsList className="grid w-full grid-cols-5 text-xs">
          <TabsTrigger value="campaign" data-testid="tab-campaign">Jenis Campaign</TabsTrigger>
          <TabsTrigger value="audience" data-testid="tab-audience">Audience</TabsTrigger>
          <TabsTrigger value="budget" data-testid="tab-budget">Strategi Budget</TabsTrigger>
          <TabsTrigger value="creative" data-testid="tab-creative">Spesifikasi Creative</TabsTrigger>
          <TabsTrigger value="kpi" data-testid="tab-kpi">KPI & Kesalahan</TabsTrigger>
        </TabsList>

        <TabsContent value="campaign" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
            <strong>Pilih objective yang tepat = 50% keberhasilan campaign.</strong> Jika kamu pilih Traffic tapi harapannya dapat Purchase, Meta tidak akan optimize untuk pembelian dan hasilnya akan mengecewakan.
          </div>
          {campaignTypes.map((ct, i) => (
            <Card key={i} data-testid={`card-campaign-${i}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${ct.color}`}>
                    <ct.icon className={`h-5 w-5 ${ct.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{ct.name}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{ct.bestFor}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs font-semibold mb-1 text-muted-foreground">Kapan Digunakan</p>
                    <p className="text-sm">{ct.whenToUse}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs font-semibold mb-1 text-muted-foreground">Cara Kerja</p>
                    <p className="text-sm">{ct.howItWorks}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">Setup Step-by-Step:</p>
                  <ul className="space-y-1.5">
                    {ct.setup.map((s, si) => (
                      <li key={si} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-start gap-2 p-3 rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">{ct.tips}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="audience" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-700 dark:text-yellow-300">
            <strong>Tren Meta Ads 2024:</strong> Broad audience + AI Meta sering outperform interest targeting manual yang rumit. 
            Jika pixel sudah mature, coba broad audience terlebih dahulu sebelum memperumit dengan interest.
          </div>
          {audienceTypes.map((a, i) => (
            <Card key={i} data-testid={`card-audience-${i}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base">{a.type}</CardTitle>
                  <Badge className={`text-xs ${a.tagColor}`}>{a.tag}</Badge>
                </div>
                <CardDescription className="text-xs">{a.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">✓ Kelebihan</p>
                    <ul className="space-y-1">
                      {a.pros.map((p, pi) => <li key={pi} className="text-xs text-muted-foreground flex items-start gap-1"><span className="text-green-500 mt-0.5">•</span>{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">✗ Kekurangan</p>
                    <ul className="space-y-1">
                      {a.cons.map((c, ci) => <li key={ci} className="text-xs text-muted-foreground flex items-start gap-1"><span className="text-red-500 mt-0.5">•</span>{c}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-muted">
                  <p className="text-xs font-semibold mb-1">Cara Setup:</p>
                  <p className="text-xs text-muted-foreground">{a.setup}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <p className="text-xs"><strong>Terbaik untuk:</strong> {a.bestFor}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="budget" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">
            <strong>Rumus budget minimal:</strong> Budget harian per ad set = 3-5x target CPA. 
            Contoh: jika target biaya per pembelian Rp 50.000, budget minimal Rp 150.000–250.000/hari untuk satu ad set.
          </div>
          <div className="space-y-3">
            {budgetStrategy.map((b, i) => (
              <Card key={i} data-testid={`card-budget-${i}`}>
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedBudget(expandedBudget === i ? null : i)}
                  data-testid={`button-budget-expand-${i}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{b.level}</CardTitle>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">{b.dailyBudget}</Badge>
                          <Badge variant="secondary" className="text-xs">{b.duration}</Badge>
                        </div>
                      </div>
                      {expandedBudget === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </CardHeader>
                </button>
                {expandedBudget === i && (
                  <CardContent className="space-y-4 pt-0">
                    <div className="p-3 rounded bg-muted">
                      <p className="text-xs font-semibold mb-1 text-muted-foreground">Tujuan Fase Ini</p>
                      <p className="text-sm">{b.goal}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-2 text-muted-foreground">Alokasi Budget yang Disarankan:</p>
                      <div className="space-y-2">
                        {b.allocation.map((a, ai) => (
                          <div key={ai} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{a.label}</span>
                              <span className="font-bold text-primary">{a.pct}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${a.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">KPI Target</p>
                        <p className="text-xs text-muted-foreground">{b.kpi}</p>
                      </div>
                      <div className="p-3 rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-1">Tips Kunci</p>
                        <p className="text-xs text-muted-foreground">{b.tips}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="creative" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-sm text-purple-700 dark:text-purple-300">
            <strong>Tips universal:</strong> Gunakan format 4:5 (Portrait) untuk image dan video — lebih banyak space di feed mobile dibanding 1:1, 
            menghasilkan CTR lebih tinggi tanpa biaya tambahan.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creativeSpecs.map((c, i) => (
              <Card key={i} data-testid={`card-creative-${i}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{c.format}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {[
                      { label: "Rasio Aspek", value: c.ratio },
                      { label: "Resolusi", value: c.resolution },
                      { label: "Ukuran File", value: c.fileSize },
                    ].map((spec, si) => (
                      <div key={si} className="flex justify-between items-center py-1.5 border-b last:border-0">
                        <span className="text-xs text-muted-foreground">{spec.label}</span>
                        <span className="text-xs font-medium text-right max-w-[60%]">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 rounded bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                    <p className="text-xs text-orange-700 dark:text-orange-300">⚠️ {c.textRule}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p><strong>Terbaik untuk:</strong> {c.bestFor}</p>
                    <p className="mt-1 flex items-start gap-1">
                      <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" /> {c.tips}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kpi" className="space-y-6 mt-4">
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              Tabel KPI & Benchmark Meta Ads
            </h3>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-3 font-semibold text-xs">Metrik</th>
                    <th className="text-center p-3 text-red-600 dark:text-red-400 font-semibold text-xs">Buruk</th>
                    <th className="text-center p-3 text-yellow-600 dark:text-yellow-400 font-semibold text-xs">Rata-rata</th>
                    <th className="text-center p-3 text-green-600 dark:text-green-400 font-semibold text-xs">Bagus</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiData.map((k, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3">
                        <p className="font-medium text-sm">{k.metric}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{k.note}</p>
                      </td>
                      <td className="p-3 text-center text-red-600 dark:text-red-400 font-bold text-sm">{k.poor}</td>
                      <td className="p-3 text-center text-yellow-600 dark:text-yellow-400 font-bold text-sm">{k.average}</td>
                      <td className="p-3 text-center text-green-600 dark:text-green-400 font-bold text-sm">{k.good}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-base">
              <XCircle className="h-4 w-4 text-red-500" />
              6 Kesalahan Paling Umum di Meta Ads
            </h3>
            <div className="space-y-3">
              {commonMistakes.map((m, i) => (
                <Card key={i} className="border-red-200/60 dark:border-red-800/60" data-testid={`card-meta-mistake-${i}`}>
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm font-semibold">{m.mistake}</p>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">{m.why}</p>
                    <div className="flex items-start gap-2 pl-6 p-2 rounded bg-green-50 dark:bg-green-950">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-green-700 dark:text-green-300"><strong>Solusi:</strong> {m.solution}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <NextSteps steps={[
        { title: "Audience Builder", description: "Buat buyer persona detail untuk targeting Meta Ads yang lebih akurat", href: "/audience-builder", badge: "Penting", badgeColor: "bg-orange-100 text-orange-700" },
        { title: "Ad Creator", description: "Generate copy iklan Facebook, Instagram, dan platform lain dengan AI", href: "/ad-creator", badge: "AI", badgeColor: "bg-purple-100 text-purple-700" },
        { title: "Ad Analyzer", description: "Analisis dan scoring copy iklan yang sudah kamu buat", href: "/campaign-analyzer", badge: "Optimalkan", badgeColor: "bg-green-100 text-green-700" },
      ]} />
    </div>
  );
}
