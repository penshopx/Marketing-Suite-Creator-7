import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NextSteps } from "@/components/next-steps";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { 
  Play, TrendingUp, Target, DollarSign, CheckCircle2, 
  Zap, BarChart3, Copy, AlertTriangle, Star, 
  XCircle, Clock, Lightbulb, BookOpen, Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const setupSteps = [
  {
    step: 1,
    title: "Buat Akun TikTok Ads Manager",
    duration: "15 menit",
    priority: "Wajib",
    tasks: [
      "Kunjungi ads.tiktok.com — gunakan browser desktop, bukan HP",
      "Klik 'Get Started' dan pilih 'Create an Ad'",
      "Daftar dengan email bisnis (bukan akun TikTok personal)",
      "Verifikasi nomor HP dan email",
      "Isi informasi bisnis: pilih 'Individual' jika belum punya badan usaha",
      "Pilih mata uang IDR (Indonesian Rupiah) — tidak bisa diubah nanti",
      "Tambahkan metode pembayaran: kartu kredit/debit Visa atau Mastercard",
      "Alternatif pembayaran: manfaatkan saldo yang bisa diisi manual",
    ],
    warning: "Pastikan pilih IDR dari awal. Jika sudah memilih USD, harus buat akun baru.",
  },
  {
    step: 2,
    title: "Setup TikTok Pixel",
    duration: "20-30 menit",
    priority: "Wajib",
    tasks: [
      "Di Ads Manager, masuk ke menu 'Assets' → 'Events'",
      "Klik 'Manage' → 'Create Pixel' → pilih nama pixel yang mudah diingat",
      "Pilih metode: 'Manually Install Pixel Code' untuk kontrol penuh",
      "Salin Base Code dan paste di <head> setiap halaman website/landing page",
      "Buat Event: klik 'Add Events' → pilih 'Purchase' sebagai event utama",
      "Test dengan TikTok Pixel Helper (install di Chrome dari Web Store)",
      "Pastikan event Purchase muncul saat checkout di halaman produk kamu",
      "Aktifkan Advanced Matching untuk increase data quality",
    ],
    warning: "Tanpa pixel yang berfungsi, kamu tidak bisa mengoptimalkan campaign untuk konversi.",
  },
  {
    step: 3,
    title: "Riset Produk & Konten Winning di TikTok",
    duration: "30-60 menit",
    priority: "Penting",
    tasks: [
      "Buka TikTok Creative Center: ads.tiktok.com/business/creativecenter",
      "Masuk ke 'Top Ads' → filter negara Indonesia",
      "Filter by industry yang relevan dengan produk kamu",
      "Analisis 10-15 iklan dengan engagement tertinggi (like, comment, share)",
      "Catat: hook 3 detik pertama, struktur konten, angle yang digunakan",
      "Simpan screenshot/screen recording iklan terbaik sebagai referensi",
      "Perhatikan pola: jenis musik, visual, durasi yang paling sering muncul",
      "Buat dokumen 'swipe file' untuk referensi konten iklan kamu",
    ],
    warning: "Jangan copy 100% iklan kompetitor. Gunakan sebagai inspirasi, buat versi yang lebih baik.",
  },
  {
    step: 4,
    title: "Buat Creative (Video Iklan)",
    duration: "1-3 jam",
    priority: "Krusial",
    tasks: [
      "Rekam di smartphone dengan resolusi minimal 1080x1920 (9:16 vertikal)",
      "Durasi optimal: 15-30 detik untuk iklan biasa, 60 detik untuk storytelling",
      "Buat MINIMAL 3 variasi konten dengan angle berbeda untuk A/B test",
      "Tambahkan text overlay di setiap bagian penting",
      "Gunakan musik trending dari TikTok Sound Library (gratis untuk iklan)",
      "Edit dengan CapCut atau InShot — tambahkan transisi yang smooth",
      "Pastikan hook 3 detik pertama sangat menarik dan jelas",
      "Preview di HP sebelum upload: pastikan teks tidak kepotong",
    ],
    warning: "Kualitas creative adalah faktor terbesar penentu keberhasilan iklan TikTok. Investasikan waktu di sini.",
  },
  {
    step: 5,
    title: "Setup Campaign di Ads Manager",
    duration: "30 menit",
    priority: "Wajib",
    tasks: [
      "Klik 'Create Campaign' → pilih objective sesuai tujuan:",
      "→ 'Product Sales' jika pakai TikTok Shop",
      "→ 'Website Conversions' jika jual via landing page/Lynk.id",
      "→ 'Traffic' jika baru mulai dan mau kumpulkan data dulu",
      "Atur Campaign Budget: mulai Rp 50.000 - 100.000/hari",
      "Di tingkat Ad Group: set target lokasi Indonesia, bahasa Indonesia",
      "Atur usia sesuai buyer persona (contoh: 22-40 tahun)",
      "Placement: pilih 'TikTok' saja (bukan Pangle) untuk awal",
      "Upload 3 variasi creative, tulis caption menarik, tambahkan CTA button",
    ],
    warning: "Jangan ganti setting campaign dalam 3 hari pertama — beri waktu AI TikTok belajar.",
  },
  {
    step: 6,
    title: "Monitoring & Optimasi Harian",
    duration: "15-30 menit/hari",
    priority: "Rutin",
    tasks: [
      "Cek dashboard setiap pagi setelah minimal 500 tayangan",
      "Pantau 3 metrik utama: CTR, CPM, dan Cost per Result",
      "Matikan creative dengan CTR di bawah 0.8% setelah 1.000 tayangan",
      "Scale budget 20-30% untuk ad set yang sudah profitable",
      "Refresh creative minimal 1x seminggu untuk hindari ad fatigue",
      "Dokumentasikan hasil setiap hari di spreadsheet tracking",
      "Setiap 7 hari, evaluasi keseluruhan dan putuskan: scale, optimize, atau stop",
    ],
    warning: "Jangan evaluasi terlalu cepat. Tunggu minimal 500-1000 tayangan sebelum mengambil keputusan.",
  },
];

const contentFormulas = [
  {
    name: "Hook → Problem → Solution → CTA",
    tag: "Paling Efektif",
    tagColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    description: "Formula klasik yang paling banyak digunakan dan terbukti convert di hampir semua niche",
    structure: [
      { time: "0-3 detik", label: "HOOK", desc: "Pernyataan mengejutkan atau pertanyaan yang sangat relatable. Tujuan: buat orang tidak swipe." },
      { time: "3-10 detik", label: "PROBLEM", desc: "Perjelas masalah yang dialami target market. Gunakan bahasa yang mereka gunakan sehari-hari." },
      { time: "10-25 detik", label: "SOLUTION", desc: "Tunjukkan produk sebagai solusi. Fokus pada HASIL, bukan cara kerja." },
      { time: "25-30 detik", label: "CTA", desc: "Satu ajakan bertindak yang jelas. Contoh: 'Cek link di bio sekarang'" },
    ],
    example: `Hook: "Kenapa iklan kamu habiskan jutaan tapi tidak ada yang beli?"
Problem: Tampilkan visual uang habis, frustrasi
Solution: Tunjukkan dashboard ROAS naik setelah pakai strategi yang benar
CTA: "Belajar caranya — link di bio sebelum harga naik"`,
  },
  {
    name: "Testimoni + Demo",
    tag: "Social Proof Kuat",
    tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    description: "Mulai dengan hasil nyata orang lain, lalu demo produk. Membangun kepercayaan dengan cepat.",
    structure: [
      { time: "0-5 detik", label: "RESULT HOOK", desc: "Tampilkan angka/hasil spesifik dari pengguna lain. 'Dia dapat Rp 3 juta pertama dalam 5 hari pakai ini'" },
      { time: "5-15 detik", label: "DEMO SINGKAT", desc: "Screen recording atau demo nyata cara kerja produk. Jangan terlalu panjang." },
      { time: "15-25 detik", label: "MORE PROOF", desc: "Tambahkan 2-3 testimoni pendek lainnya — screenshot chat, komentar, atau video singkat." },
      { time: "25-30 detik", label: "OFFER + CTA", desc: "Buat penawaran dengan sedikit urgency, CTA yang jelas." },
    ],
    example: `Hook: Screen recording chat pembeli: "Alhamdulillah kak, baru 3 hari udah closing!"
Demo: Tampilkan dashboard atau produknya sebentar
More Proof: 2-3 screenshot testimoni lain
CTA: "Mau hasilnya? Ambil di link bio sekarang"`,
  },
  {
    name: "Tutorial + Soft Sell",
    tag: "Trust Builder",
    tagColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    description: "Berikan nilai nyata terlebih dahulu, perkenalkan produk di akhir secara halus. Konversi lebih panjang tapi lebih berkualitas.",
    structure: [
      { time: "0-5 detik", label: "TEASER", desc: "'Cara [hasil] dalam [waktu] — ini yang saya lakukan'" },
      { time: "5-25 detik", label: "TUTORIAL NYATA", desc: "Berikan 2-3 tips yang benar-benar bermanfaat. Jangan terlalu banyak — buat penonton mau tahu lebih." },
      { time: "25-27 detik", label: "BRIDGE", desc: "'Ini baru 3 dari 47 tips yang ada di [nama produk]'" },
      { time: "27-30 detik", label: "SOFT CTA", desc: "'Cek link di bio kalau mau akses semua'" },
    ],
    example: `Teaser: "3 cara nulis caption yang langsung bikin orang beli"
Tutorial: Tip 1, 2, 3 yang actionable dan bisa langsung dipraktikkan
Bridge: "Ini cuma 3 dari 100+ template caption yang ada di AI Command Framework"
Soft CTA: "Linknya di bio ya"`,
  },
  {
    name: "Pattern Interrupt + Reveal",
    tag: "Viral Potential",
    tagColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    description: "Mulai dengan sesuatu yang tidak terduga untuk menghentikan scroll, lalu reveal yang mengejutkan.",
    structure: [
      { time: "0-3 detik", label: "PATTERN INTERRUPT", desc: "Visual atau pernyataan yang sangat tidak terduga dan relevan. 'Saya hampir bangkrut sebelum tahu hal ini'" },
      { time: "3-20 detik", label: "BUILD UP", desc: "Ceritakan situasinya, bangun penasaran. Jangan langsung kasih jawabannya." },
      { time: "20-28 detik", label: "REVEAL", desc: "Ungkapkan insight/produk sebagai 'game changer'" },
      { time: "28-30 detik", label: "CTA", desc: "Langsung ke action" },
    ],
    example: `Pattern Interrupt: "Saya bakar Rp 5 juta iklan dalam seminggu tanpa satu pun penjualan"
Build Up: Ceritakan apa yang salah
Reveal: "Sampai ketemu [strategi/produk] ini — ROAS langsung 4x"
CTA: "Pelajari caranya di link bio"`,
  },
  {
    name: "Before vs After",
    tag: "Visual Impact",
    tagColor: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    description: "Kontras before-after yang kuat membuat transformasi produk terlihat jelas dan menarik.",
    structure: [
      { time: "0-3 detik", label: "AFTER HOOK", desc: "Mulai dengan 'setelah' yang impressive — counter-intuitive tapi menarik perhatian" },
      { time: "3-15 detik", label: "BEFORE", desc: "Tampilkan situasi 'sebelum' yang relatable — situasi buruk yang dialami target market" },
      { time: "15-25 detik", label: "AFTER + PRODUK", desc: "Kembali ke 'sesudah' dan perkenalkan produk sebagai jembatannya" },
      { time: "25-30 detik", label: "CTA + URGENCY", desc: "Ajak bertindak dengan sedikit urgency" },
    ],
    example: `After Hook: Tampilkan dashboard dengan penjualan tinggi / screenshot bukti transfer
Before: "Ini kondisi saya 3 bulan lalu — iklan sepi, konten sepi"
After + Produk: "Setelah pakai [nama produk] — ini yang berubah..." [tampilkan hasilnya]
CTA: "Link di bio untuk mulai perjalanan yang sama"`,
  },
  {
    name: "FAQ / Myth Busting",
    tag: "Educational",
    tagColor: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    description: "Jawab pertanyaan atau luruskan mitos yang sering dipercaya target market. Builds authority.",
    structure: [
      { time: "0-3 detik", label: "MYTH/FAQ HOOK", desc: "'Banyak yang bilang [mitos umum]. Ini faktanya...' atau 'Pertanyaan paling sering: [pertanyaan]'" },
      { time: "3-22 detik", label: "BUST THE MYTH", desc: "Jelaskan fakta dengan singkat dan bukti yang konkret. 2-3 poin maksimal." },
      { time: "22-27 detik", label: "POSITIONING", desc: "Posisikan diri/produk sebagai sumber kebenaran yang dipercaya" },
      { time: "27-30 detik", label: "CTA SOFT", desc: "Arahkan ke resource yang lebih lengkap" },
    ],
    example: `Hook: "Banyak yang bilang TikTok Ads mahal. Ini faktanya..."
Bust: Data riil: bisa mulai Rp 50rb/hari, CTR bisa 2-3x Meta Ads
Positioning: "Di [nama produk] saya sharing teknik yang saya pakai sendiri"
Soft CTA: "Detail di link bio ya"`,
  },
];

const metrics = [
  {
    name: "Video View Rate (VVR)",
    description: "Persentase penonton yang menonton 2 detik atau lebih",
    poor: "< 25%",
    average: "25% - 40%",
    good: "> 40%",
    action: "VVR rendah = hook tidak menarik. Ganti 3 detik pertama video.",
    priority: "Tinggi",
  },
  {
    name: "Click-Through Rate (CTR)",
    description: "Persentase tayangan yang menghasilkan klik",
    poor: "< 0.8%",
    average: "0.8% - 1.5%",
    good: "> 1.5%",
    action: "CTR rendah = CTA atau teks overlay tidak menarik. Perkuat CTA.",
    priority: "Tinggi",
  },
  {
    name: "Cost Per Click (CPC)",
    description: "Biaya rata-rata per klik ke landing page",
    poor: "> Rp 5.000",
    average: "Rp 2.000 - 5.000",
    good: "< Rp 2.000",
    action: "CPC tinggi = CTR terlalu rendah atau audience terlalu sempit. Perluas targeting.",
    priority: "Menengah",
  },
  {
    name: "CPM (Cost per 1.000 tayangan)",
    description: "Biaya per 1.000 kali iklan ditampilkan",
    poor: "> Rp 60.000",
    average: "Rp 20.000 - 60.000",
    good: "< Rp 20.000",
    action: "CPM tinggi = kompetisi ketat di audience ini. Coba waktu tayang berbeda atau audience baru.",
    priority: "Menengah",
  },
  {
    name: "Conversion Rate (CVR)",
    description: "Persentase pengunjung landing page yang melakukan pembelian",
    poor: "< 1%",
    average: "1% - 3%",
    good: "> 3%",
    action: "CVR rendah = masalah di landing page, bukan iklan. Perbaiki halaman produk kamu.",
    priority: "Krusial",
  },
  {
    name: "ROAS (Return on Ad Spend)",
    description: "Revenue yang dihasilkan per 1 rupiah yang dibelanjakan untuk iklan",
    poor: "< 1x",
    average: "1x - 2x",
    good: "> 2x",
    action: "ROAS < 1x = rugi. Hentikan campaign dan evaluasi sebelum lanjut.",
    priority: "Krusial",
  },
];

const commonMistakes = [
  {
    mistake: "Ubah setting campaign sebelum cukup data",
    impact: "Tinggi",
    why: "TikTok membutuhkan 50-100 konversi untuk learning phase. Mengubah setting sebelum itu akan restart proses belajar AI.",
    solution: "Biarkan campaign berjalan minimal 7 hari atau 50 konversi sebelum membuat perubahan besar.",
  },
  {
    mistake: "Hanya buat 1 variasi creative",
    impact: "Tinggi",
    why: "Tanpa A/B test, kamu tidak tahu mana yang terbaik. TikTok juga perlu pilihan untuk optimize.",
    solution: "Selalu upload minimal 3 variasi creative dengan angle berbeda di setiap ad group.",
  },
  {
    mistake: "Langsung scale budget terlalu besar",
    impact: "Menengah",
    why: "Menaikkan budget lebih dari 50% dalam satu hari akan restart learning phase dan meningkatkan CPM.",
    solution: "Naikkan budget maksimal 20-30% setiap 2-3 hari jika campaign sudah profitable.",
  },
  {
    mistake: "Tidak memasang TikTok Pixel",
    impact: "Sangat Tinggi",
    why: "Tanpa pixel, kamu tidak bisa optimize untuk konversi. Campaign hanya bisa optimize untuk klik atau tayangan.",
    solution: "Setup pixel sebelum mulai beriklan. Gunakan TikTok Pixel Helper untuk verifikasi.",
  },
  {
    mistake: "Menggunakan musik dari HP tanpa izin",
    impact: "Tinggi",
    why: "Iklan dengan musik ber-copyright akan ditolak atau dihentikan paksa oleh TikTok.",
    solution: "Gunakan hanya musik dari TikTok Commercial Music Library yang disediakan gratis untuk pengiklan.",
  },
  {
    mistake: "Tidak refresh creative secara rutin",
    impact: "Menengah",
    why: "Ad fatigue terjadi ketika audience yang sama melihat iklan yang sama berkali-kali, menurunkan performa.",
    solution: "Buat creative baru minimal 1-2x per minggu. Monitor frequency — jika > 3, segera ganti.",
  },
];

const checklist = [
  { category: "Akun & Teknis", items: ["TikTok Ads Manager aktif dan terverifikasi", "Metode pembayaran sudah ditambahkan", "TikTok Pixel terpasang dan terbaca di Pixel Helper", "Event 'Purchase' sudah aktif di Pixel", "Advanced Matching diaktifkan di Pixel settings"] },
  { category: "Creative", items: ["Minimal 3 variasi video sudah direkam dan diedit", "Setiap video resolusi minimal 1080x1920 (9:16)", "Durasi 15-30 detik per video", "Hook 3 detik pertama sudah dioptimasi", "Text overlay ditambahkan di poin penting", "Menggunakan musik dari Commercial Music Library", "Preview sudah dilakukan di HP sebelum upload"] },
  { category: "Campaign Setup", items: ["Objective campaign sesuai tujuan (konversi/traffic)", "Budget harian sudah ditentukan (minimal Rp 50.000)", "Lokasi target: Indonesia", "Bahasa target: Bahasa Indonesia", "Usia target sesuai buyer persona", "Placement: TikTok saja (bukan Pangle untuk awal)", "Caption iklan ditulis menarik dengan CTA jelas", "Landing page / halaman produk sudah aktif dan bisa diakses"] },
  { category: "Siap Launch", items: ["Review semua setting sebelum klik Publish", "Preview iklan sudah dilihat (tampak seperti apa di feed)", "Notifikasi email aktif untuk alert campaign", "Spreadsheet tracking sudah disiapkan", "Jadwal review harian sudah ditentukan"] },
];

export default function TikTokAds() {
  const { toast } = useToast();
  const [checklistDone, setChecklistDone] = useState<Record<string, boolean>>({});

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: "Teks berhasil disalin." });
  };

  const toggleCheck = (key: string) => setChecklistDone(prev => ({ ...prev, [key]: !prev[key] }));

  const totalItems = checklist.reduce((acc, c) => acc + c.items.length, 0);
  const doneItems = Object.values(checklistDone).filter(Boolean).length;
  const readyToLaunch = doneItems === totalItems;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
          <Play className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">TikTok Ads untuk Produk Digital</h1>
          <p className="text-muted-foreground">Panduan lengkap setup, konten, optimasi, dan checklist siap launch</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Budget Minimal", value: "Rp 50rb/hari", icon: DollarSign, color: "text-green-500" },
          { label: "Waktu Setup", value: "2-3 jam", icon: Clock, color: "text-blue-500" },
          { label: "Target CTR", value: "> 1.5%", icon: Target, color: "text-orange-500" },
          { label: "Target ROAS", value: "2-5x", icon: TrendingUp, color: "text-purple-500" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-4">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="setup" data-testid="tabs-tiktok">
        <TabsList className="grid w-full grid-cols-5 text-xs">
          <TabsTrigger value="setup" data-testid="tab-setup">Setup</TabsTrigger>
          <TabsTrigger value="content" data-testid="tab-content">Formula Konten</TabsTrigger>
          <TabsTrigger value="metrics" data-testid="tab-metrics">Metrik & KPI</TabsTrigger>
          <TabsTrigger value="mistakes" data-testid="tab-mistakes">Kesalahan Umum</TabsTrigger>
          <TabsTrigger value="checklist" data-testid="tab-checklist">Checklist Launch</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
            <strong>Urutan setup penting!</strong> Jangan skip langkah — terutama pixel. Banyak pemula langsung buat campaign tanpa pixel dan akhirnya tidak bisa optimize untuk penjualan.
          </div>
          {setupSteps.map((step, i) => (
            <Card key={i} data-testid={`card-step-${step.step}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{step.title}</CardTitle>
                      <Badge variant={step.priority === "Wajib" || step.priority === "Krusial" ? "default" : "secondary"} className="text-xs">
                        {step.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" /> {step.duration}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1.5">
                  {step.tasks.map((task, ti) => (
                    <li key={ti} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
                {step.warning && (
                  <div className="flex items-start gap-2 p-3 rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">{step.warning}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="content" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Kunci sukses TikTok Ads:</strong> 3 detik pertama menentukan segalanya. Tanpa hook yang kuat, semua effort sia-sia. Fokus di sini dulu sebelum memikirkan budget atau targeting.
            </p>
          </div>
          {contentFormulas.map((formula, i) => (
            <Card key={i} data-testid={`card-formula-${i}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base">{formula.name}</CardTitle>
                  <Badge className={`text-xs ${formula.tagColor}`}>{formula.tag}</Badge>
                </div>
                <CardDescription>{formula.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {formula.structure.map((s, si) => (
                    <div key={si} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted">
                      <Badge variant="outline" className="text-xs flex-shrink-0">{s.time}</Badge>
                      <div>
                        <p className="text-xs font-bold text-primary">{s.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded bg-muted border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">Contoh Script:</p>
                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyText(formula.example)} data-testid={`button-copy-formula-${i}`}>
                      <Copy className="h-3 w-3 mr-1" /> Salin
                    </Button>
                  </div>
                  <p className="text-xs font-mono whitespace-pre-line text-muted-foreground leading-relaxed">{formula.example}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-muted text-sm">
            <strong>Cara baca metrik:</strong> Fokus pada 2 metrik paling krusial dulu: ROAS dan Conversion Rate. 
            Metrik lain (CTR, CPC, CPM) adalah early indicators — berguna untuk diagnosis tapi bukan tujuan akhir.
          </div>
          {metrics.map((m, i) => (
            <Card key={i} data-testid={`card-metric-${i}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm">{m.name}</CardTitle>
                  <Badge variant={m.priority === "Krusial" ? "default" : m.priority === "Tinggi" ? "secondary" : "outline"} className="text-xs">
                    Prioritas: {m.priority}
                  </Badge>
                </div>
                <CardDescription className="text-xs">{m.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-center">
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">Buruk</p>
                    <p className="text-sm font-bold text-red-700 dark:text-red-300">{m.poor}</p>
                  </div>
                  <div className="p-2 rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-center">
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Cukup</p>
                    <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300">{m.average}</p>
                  </div>
                  <div className="p-2 rounded bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-center">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Bagus</p>
                    <p className="text-sm font-bold text-green-700 dark:text-green-300">{m.good}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <Lightbulb className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">{m.action}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mistakes" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            Kesalahan-kesalahan ini adalah penyebab paling umum budget habis tanpa hasil. Baca dan hindari sebelum mulai.
          </div>
          {commonMistakes.map((m, i) => (
            <Card key={i} className="border-red-200/50 dark:border-red-800/50" data-testid={`card-mistake-${i}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <CardTitle className="text-sm text-red-700 dark:text-red-300">{m.mistake}</CardTitle>
                    <Badge variant="outline" className="text-xs mt-1">Impact: {m.impact}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 p-2 rounded bg-red-50 dark:bg-red-950">
                  <p className="text-xs text-red-700 dark:text-red-300"><strong>Kenapa berbahaya:</strong> {m.why}</p>
                </div>
                <div className="flex items-start gap-2 p-2 rounded bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-300"><strong>Solusi:</strong> {m.solution}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4 mt-4">
          <Card className={readyToLaunch ? "border-green-500" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Progress Persiapan Launch</p>
                <p className="text-sm font-bold text-primary">{doneItems}/{totalItems}</p>
              </div>
              <Progress value={(doneItems / totalItems) * 100} className="h-3" />
              {readyToLaunch && (
                <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-semibold">
                  <CheckCircle2 className="h-5 w-5" />
                  Semua checklist selesai! Kamu siap untuk launch campaign.
                </div>
              )}
            </CardContent>
          </Card>
          {checklist.map((group, gi) => (
            <Card key={gi}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  {group.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.items.map((item, ii) => {
                    const key = `${gi}-${ii}`;
                    const done = checklistDone[key];
                    return (
                      <div
                        key={ii}
                        className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${done ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-border hover:bg-muted"}`}
                        onClick={() => toggleCheck(key)}
                        data-testid={`checklist-item-${gi}-${ii}`}
                      >
                        <div className={`flex h-5 w-5 items-center justify-center rounded border-2 flex-shrink-0 mt-0.5 transition-colors ${done ? "border-green-500 bg-green-500" : "border-muted-foreground"}`}>
                          {done && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        <p className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{item}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <NextSteps steps={[
        { title: "Ad Creator", description: "Generate script dan copy iklan TikTok yang menarik dengan AI", href: "/ad-creator", badge: "Lanjut", badgeColor: "bg-green-100 text-green-700" },
        { title: "Affiliate Content", description: "Buat konten affiliate TikTok dengan 6 template siap pakai", href: "/affiliate-content", badge: "Template", badgeColor: "bg-blue-100 text-blue-700" },
        { title: "Prompt Framework", description: "Gunakan 15 prompt AI terbaik untuk caption dan skrip TikTok", href: "/prompt-framework", badge: "15 Prompts", badgeColor: "bg-yellow-100 text-yellow-700" },
      ]} />
    </div>
  );
}
