import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Target, CheckCircle2, Clock, Zap, TrendingUp, 
  Star, AlertTriangle, ChevronDown, ChevronUp, 
  Lightbulb, Calendar, BarChart3, Trophy, BookOpen,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NextSteps } from "@/components/next-steps";

const days = [
  {
    day: 1,
    phase: "Fondasi",
    title: "Riset & Validasi Pasar",
    objective: "Memastikan produk yang akan dijual benar-benar dibutuhkan dan ada pasarnya sebelum membuang waktu dan uang.",
    timeRequired: "2-3 jam",
    energy: "Tinggi",
    tasks: [
      { task: "Pilih niche yang akan dikerjakan: digital marketing, kesehatan, keuangan, parenting, atau lainnya", important: true },
      { task: "Riset 10 produk yang sudah terjual di marketplace (Tokopedia Digital, Shopee, Gumroad)", important: true },
      { task: "Analisis review produk: apa yang pembeli suka dan tidak suka", important: false },
      { task: "Identifikasi 3-5 pain point terbesar yang belum diselesaikan produk existing", important: false },
      { task: "Validasi ide produk: cari apakah orang secara aktif mencari solusi ini", important: true },
    ],
    tools: ["Google Trends", "Tokopedia Digital", "Facebook Groups (cari pertanyaan yang sering muncul)", "Reddit r/Indonesia"],
    kpi: "Selesaikan validasi dan putuskan produk/niche final yang akan dikerjakan",
    motivasi: "Riset yang baik di awal akan menghindarkan kamu dari kerja keras tapi salah arah. Satu hari investasi riset bisa menghemat berminggu-minggu usaha yang sia-sia.",
    warning: "Jangan langsung buat produk sebelum validasi. Banyak pemula yang membuat produk bagus tapi tidak ada yang beli karena salah niche.",
  },
  {
    day: 2,
    phase: "Fondasi",
    title: "Tentukan Produk & Pricing",
    objective: "Memilih produk yang akan dijual, menentukan harga yang optimal, dan memahami positioning di pasar.",
    timeRequired: "2-3 jam",
    energy: "Menengah",
    tasks: [
      { task: "Tentukan format produk: e-book, video course, template pack, atau gabungan", important: true },
      { task: "Riset harga kompetitor — temukan range harga yang pasar bersedia bayar", important: true },
      { task: "Tentukan harga produk menggunakan strategi: moderat vs premium positioning", important: true },
      { task: "Buat outline konten produk (bab/modul/halaman yang akan ada)", important: false },
      { task: "Tentukan nama produk yang menarik dan mencerminkan transformasi yang didapat", important: false },
    ],
    tools: ["Kompetitor di Tokopedia/Shopee", "Gumroad.com (cari produk serupa)", "ChatGPT (brainstorm nama produk)"],
    kpi: "Nama produk, harga final, dan outline konten produk sudah ditentukan",
    motivasi: "Harga bukan tentang 'semurah mungkin' — tapi tentang nilai yang kamu berikan. Produk yang terlalu murah justru sering tidak dipercaya.",
    warning: "Jangan underprice produk kamu. Harga rendah tidak selalu meningkatkan penjualan — malah sering menurunkan persepsi kualitas.",
  },
  {
    day: 3,
    phase: "Fondasi",
    title: "Buat Buyer Persona Detail",
    objective: "Memahami secara mendalam siapa yang akan membeli produk kamu — informasi ini akan menjadi dasar semua konten dan marketing.",
    timeRequired: "1-2 jam",
    energy: "Menengah",
    tasks: [
      { task: "Tulis profil lengkap buyer persona: usia, pekerjaan, pendapatan, lokasi", important: true },
      { task: "Identifikasi 5 pain point terbesar yang mereka rasakan", important: true },
      { task: "Tuliskan impian dan goals yang ingin mereka capai", important: false },
      { task: "Tentukan platform media sosial utama yang mereka gunakan dan waktu aktifnya", important: false },
      { task: "Catat kata-kata yang mereka gunakan saat mendeskripsikan masalahnya (untuk copywriting)", important: true },
    ],
    tools: ["ChatGPT (prompt: 'Buat buyer persona detail untuk...')", "Facebook Audience Insights", "Google Forms (survey sederhana jika ada audience)"],
    kpi: "Dokumen buyer persona satu halaman yang bisa jadi referensi semua konten",
    motivasi: "Semakin spesifik kamu mengenal pembelimu, semakin efektif setiap kata dalam konten dan iklanmu.",
    warning: "Jangan buat buyer persona yang terlalu luas ('semua orang yang butuh uang'). Semakin spesifik = semakin efektif.",
  },
  {
    day: 4,
    phase: "Produksi",
    title: "Setup Platform & Sistem Penjualan",
    objective: "Menyiapkan infrastruktur teknis untuk menerima pembayaran dan mengirim produk secara otomatis.",
    timeRequired: "3-4 jam",
    energy: "Tinggi",
    tasks: [
      { task: "Daftar dan setup akun di Lynk.id atau Gumroad (pilih sesuai target market)", important: true },
      { task: "Setup metode pembayaran: transfer bank, QRIS, atau kartu kredit", important: true },
      { task: "Test proses pembelian dari sisi pembeli — pastikan tidak ada hambatan", important: true },
      { task: "Setup nomor WhatsApp Business dan buat template auto-reply", important: false },
      { task: "Buat sistem delivery produk: Google Drive link, email otomatis, atau akses halaman khusus", important: true },
    ],
    tools: ["Lynk.id", "Gumroad", "Google Drive (untuk delivery)", "Tawk.to (live chat gratis)"],
    kpi: "Link pembelian aktif dan bisa diakses oleh siapapun — test dari HP kamu sendiri",
    motivasi: "Sistem penjualan yang smooth adalah perbedaan antara penjualan dan pembeli yang frustasi lalu pergi.",
    warning: "Test proses pembelian sampai tuntas sebelum promosi. Lebih baik temukan masalah sekarang daripada saat ada pembeli sungguhan.",
  },
  {
    day: 5,
    phase: "Produksi",
    title: "Buat Produk (Bagian 1)",
    objective: "Mulai mengeksekusi pembuatan produk — fokus pada bagian paling penting dan bernilai tinggi terlebih dahulu.",
    timeRequired: "4-5 jam",
    energy: "Tinggi",
    tasks: [
      { task: "Gunakan ChatGPT dengan prompt RISEN untuk mempercepat penulisan konten", important: true },
      { task: "Tulis 50% dari konten produk — fokus pada bagian yang paling bernilai", important: true },
      { task: "Buat struktur yang jelas: pembuka kuat, konten inti, dan actionable takeaways", important: false },
      { task: "Tambahkan contoh dan kasus nyata — ini yang membedakan konten biasa dan luar biasa", important: false },
      { task: "Review dan revisi tulisan hari ini sebelum melanjutkan besok", important: false },
    ],
    tools: ["ChatGPT / Claude (untuk percepat penulisan)", "Canva (untuk desain e-book)", "Notion / Google Docs (penulisan)"],
    kpi: "50% konten produk selesai dan sudah direview",
    motivasi: "Produktif bukan tentang bekerja banyak jam — tapi tentang menghasilkan output berkualitas. Gunakan AI sebagai asisten, bukan sebagai pengganti pikiran kamu.",
    warning: "Gunakan AI sebagai asisten, bukan satu-satunya penulis. Konten harus tetap punya sentuhan dan perspektif personal kamu.",
  },
  {
    day: 6,
    phase: "Produksi",
    title: "Buat Produk (Bagian 2) & Desain",
    objective: "Menyelesaikan konten produk dan membuat tampilan visual yang profesional dan meningkatkan nilai persepsi.",
    timeRequired: "4-5 jam",
    energy: "Tinggi",
    tasks: [
      { task: "Selesaikan 50% konten produk yang tersisa", important: true },
      { task: "Desain cover e-book / thumbnail kursus yang profesional di Canva", important: true },
      { task: "Format konten: typography yang readable, warna konsisten, spacing yang enak", important: false },
      { task: "Buat halaman bonus (jika ada) atau supplementary material", important: false },
      { task: "Export ke PDF atau format delivery yang sesuai", important: true },
    ],
    tools: ["Canva (desain cover dan layout)", "Adobe Acrobat / PDF24 (export PDF)", "Grammarly (proofreading)"],
    kpi: "Produk sudah selesai 100% dalam format final siap dikirim ke pembeli",
    motivasi: "Tampilan profesional meningkatkan persepsi nilai produk secara signifikan — investasi 1-2 jam di desain bisa meningkatkan harga jual 50%.",
    warning: "Jangan terjebak perfectionisme. 'Done is better than perfect' — produk yang selesai dengan kualitas 80% jauh lebih baik dari produk sempurna yang tidak pernah jadi.",
  },
  {
    day: 7,
    phase: "Produksi",
    title: "Buat Sales Page & Copywriting",
    objective: "Membuat halaman penjualan yang meyakinkan dan mengkonversi pengunjung menjadi pembeli.",
    timeRequired: "3-4 jam",
    energy: "Menengah",
    tasks: [
      { task: "Tulis headline utama yang kuat — manfaat spesifik dalam 10-15 kata", important: true },
      { task: "Tulis opening paragraph yang agitasi masalah — buat pembaca merasa dipahami", important: true },
      { task: "Buat daftar benefit (bukan fitur) menggunakan bullet points aktif", important: true },
      { task: "Tulis bagian 'untuk siapa' dan 'bukan untuk siapa' yang spesifik", important: false },
      { task: "Buat FAQ yang menjawab 5 objeksi paling umum", important: false },
      { task: "Pasang di Lynk.id atau landing page tool yang kamu gunakan", important: true },
    ],
    tools: ["ChatGPT (gunakan prompt sales page dari Prompt Framework)", "Lynk.id", "ConvertKit / Mailchimp (jika ada email list)"],
    kpi: "Sales page live dan bisa diakses — minta feedback dari 2-3 orang sebelum promosi besar",
    motivasi: "Copywriting yang baik adalah multiplier — satu halaman yang ditulis dengan baik bisa menghasilkan 5x lebih banyak konversi dari traffic yang sama.",
    warning: "Jangan copy-paste sales page orang lain. Gunakan sebagai inspirasi, tapi tuliskan dengan suara dan pengalaman kamu sendiri.",
  },
  {
    day: 8,
    phase: "Marketing",
    title: "Buat Konten Organic (Pre-launch)",
    objective: "Mulai membangun awareness dan excitement sebelum produk resmi diluncurkan — warming up audience.",
    timeRequired: "2-3 jam",
    energy: "Menengah",
    tasks: [
      { task: "Buat 3 konten 'teaser' yang membangun rasa ingin tahu tentang produk yang akan datang", important: true },
      { task: "Posting konten edukasi tentang masalah yang diselesaikan produkmu (tanpa sebut produk)", important: true },
      { task: "Update bio semua platform dengan 'Something coming soon...' atau preview yang menarik", important: false },
      { task: "Mulai berinteraksi aktif di komunitas yang relevan — bangun kehadiran organik", important: false },
      { task: "Kumpulkan testimonial awal dari beta tester jika ada (bisa teman, kenalan)", important: true },
    ],
    tools: ["Instagram / TikTok", "Facebook Groups", "Komunitas Telegram", "CapCut / Canva untuk konten"],
    kpi: "3 konten teaser sudah diposting dan ada interaksi awal dari audience",
    motivasi: "Jangan tunggu semua sempurna untuk mulai. Konten yang diposting hari ini lebih berharga dari konten yang sempurna tapi tidak pernah jadi.",
    warning: "Pre-launch marketing bukan tentang pamer produk — tapi tentang membangun masalah dan keingintahuan. Jual masalahnya dulu, baru solusinya.",
  },
  {
    day: 9,
    phase: "Marketing",
    title: "Setup Iklan Berbayar (Opsional)",
    objective: "Jika ada budget, mulai setup iklan berbayar untuk mempercepat reach — tapi organic dulu harus ada jalan.",
    timeRequired: "2-4 jam",
    energy: "Tinggi",
    tasks: [
      { task: "Buat akun Meta Business Suite jika belum ada", important: false },
      { task: "Setup Facebook Pixel di landing page — wajib sebelum iklan", important: true },
      { task: "Buat 3 variasi creative iklan (gambar/video) dengan hook berbeda", important: true },
      { task: "Setup campaign Traffic terlebih dahulu untuk kumpulkan data sebelum Sales campaign", important: true },
      { task: "Set budget harian awal yang konservatif: Rp 50.000/hari untuk testing", important: false },
    ],
    tools: ["Meta Business Suite / Ads Manager", "Canva / CapCut (creative)", "Meta Pixel Helper (Chrome extension)"],
    kpi: "Campaign testing aktif dan berjalan. Pantau 3 hari pertama sebelum evaluasi.",
    motivasi: "Iklan berbayar mempercepat, tapi bukan menggantikan, konten organik yang bagus. Gunakan iklan untuk mengamplifikasi yang sudah terbukti bekerja secara organik.",
    warning: "Jangan habiskan semua budget di hari pertama. Mulai kecil, pelajari datanya, baru scale yang terbukti perform.",
  },
  {
    day: 10,
    phase: "Marketing",
    title: "Soft Launch — Jual ke Inner Circle",
    objective: "Lakukan penjualan perdana ke orang-orang yang sudah mengenalmu — dapatkan penjualan pertama dan testimonial.",
    timeRequired: "2-3 jam",
    energy: "Tinggi",
    tasks: [
      { task: "Kirim pesan personal ke 20-30 kontak terdekat yang paling relevan dengan produk", important: true },
      { task: "Post di WhatsApp Story dan Instagram Story dengan CTA yang jelas", important: true },
      { task: "Tawarkan harga early bird spesial untuk inner circle (discount 20-30%)", important: false },
      { task: "Minta feedback langsung dari setiap orang yang membaca — bahkan yang tidak beli", important: true },
      { task: "Dokumentasikan semua objeksi yang muncul untuk diperbaiki di launch berikutnya", important: false },
    ],
    tools: ["WhatsApp Personal", "Instagram Story", "Direct outreach"],
    kpi: "Minimal 1-3 penjualan pertama dan 1-2 testimonial. Jumlah penjualan bukan tujuan utama — validasi dan testimonial adalah target.",
    motivasi: "Penjualan pertama adalah yang paling sulit dan paling berkesan. Setelah itu, semuanya terasa lebih mudah karena kamu tahu ini bekerja.",
    warning: "Jangan takut ditolak. Setiap 'tidak' adalah data berharga tentang kenapa orang belum beli — ini goldmine untuk perbaikan.",
  },
  {
    day: 11,
    phase: "Marketing",
    title: "Hard Launch — Promosi Besar",
    objective: "Lakukan promosi besar ke semua channel sekaligus — ini momentum yang sudah dipersiapkan 10 hari terakhir.",
    timeRequired: "3-4 jam",
    energy: "Sangat Tinggi",
    tasks: [
      { task: "Post konten promosi utama di semua platform: IG, TikTok, Facebook", important: true },
      { task: "Kirim broadcast WhatsApp ke semua kontak yang relevan", important: true },
      { task: "Aktifkan iklan berbayar dengan budget yang lebih besar dari testing", important: false },
      { task: "Post testimoni dari soft launch untuk social proof", important: true },
      { task: "Monitor semua channel dan reply setiap pertanyaan dengan cepat", important: true },
    ],
    tools: ["Semua platform sosial media", "WhatsApp Broadcast", "Meta Ads / TikTok Ads"],
    kpi: "Minimal 5-10 penjualan dari hard launch. Track dari mana traffic dan konversi terbanyak.",
    motivasi: "Ini saatnya gasss! Semua persiapan 10 hari terakhir bermuara di hari ini. Energi dan kepercayaan diri kamu akan terpancar dari konten yang kamu buat.",
    warning: "Jangan post dan hilang. Responsif di hari launch sangat krusial — setiap pertanyaan yang tidak dijawab = penjualan yang hilang.",
  },
  {
    day: 12,
    phase: "Optimasi",
    title: "Analisis & Optimasi Campaign",
    objective: "Review data dari launch untuk memahami apa yang berhasil, apa yang tidak, dan bagaimana mengoptimasi ke depan.",
    timeRequired: "2-3 jam",
    energy: "Menengah",
    tasks: [
      { task: "Review data: berapa total penjualan, dari channel mana, dari konten apa", important: true },
      { task: "Analisis konten mana yang paling banyak engage dan convert", important: true },
      { task: "Identifikasi objeksi yang paling sering muncul dari calon pembeli yang belum beli", important: true },
      { task: "Buat rencana optimasi: perbaiki sales page, tambah FAQ, update pricing jika perlu", important: false },
      { task: "Minta testimonial dari semua pembeli dan perbarui di sales page", important: false },
    ],
    tools: ["Google Analytics / Meta Pixel data", "Spreadsheet tracking", "Feedback dari pembeli"],
    kpi: "Dokumen analisis yang berisi: what worked, what didn't, dan action plan 3 hari ke depan",
    motivasi: "Data adalah teman terbaik entrepreneur. Setiap angka menceritakan kisah — tugas kamu adalah membacanya dan mengambil keputusan yang tepat.",
    warning: "Jangan terlalu berfokus pada apa yang tidak berhasil. 80% energi ke hal yang sudah terbukti berhasil, 20% ke perbaikan.",
  },
  {
    day: 13,
    phase: "Optimasi",
    title: "Buat Urgensi & Closing Push",
    objective: "Konversi leads yang masih belum memutuskan dengan urgency yang genuine dan follow-up yang tepat.",
    timeRequired: "2-3 jam",
    energy: "Menengah",
    tasks: [
      { task: "Identifikasi semua yang sudah tanya tapi belum beli — list mereka", important: true },
      { task: "Kirim follow-up personal ke setiap prospek dengan informasi yang relevan dengan keberatan mereka", important: true },
      { task: "Buat konten 'last chance' dengan urgency yang masuk akal (deadline atau bonus terbatas)", important: true },
      { task: "Post testimonial terbaru yang paling kuat di semua platform", important: false },
      { task: "Perbarui sales page dengan semua testimonial dan FAQ tambahan yang didapat dari interaksi", important: false },
    ],
    tools: ["WhatsApp untuk follow-up personal", "Semua platform sosmed"],
    kpi: "Minimum 3-5 penjualan tambahan dari follow-up dan closing push",
    motivasi: "Orang tidak beli karena belum cukup yakin, bukan karena tidak mau. Tugas kamu adalah memberikan informasi dan kepercayaan yang mereka butuhkan.",
    warning: "Follow-up berbeda dengan spam. Personal dan relevan = follow-up. Copy-paste pesan promo tanpa konteks = spam.",
  },
  {
    day: 14,
    phase: "Scale",
    title: "Review Keseluruhan & Rencana Scale",
    objective: "Evaluasi total perjalanan 14 hari dan buat rencana untuk scale atau iterate ke versi yang lebih baik.",
    timeRequired: "2-3 jam",
    energy: "Rendah",
    tasks: [
      { task: "Hitung total revenue, profit, dan ROI dari investasi waktu dan budget yang dikeluarkan", important: true },
      { task: "Identifikasi 3 hal terbesar yang berhasil dan 3 hal yang perlu diperbaiki", important: true },
      { task: "Buat rencana 30 hari ke depan: scale produk yang sama atau iterate dengan produk baru", important: true },
      { task: "Kumpulkan semua testimoni dan buat halaman social proof yang lebih kuat", important: false },
      { task: "Dokumentasikan semua yang dipelajari — ini aset berharga untuk iterasi berikutnya", important: false },
    ],
    tools: ["Spreadsheet untuk kalkulasi", "Notion / Google Docs untuk dokumentasi"],
    kpi: "Dokumen review lengkap dan rencana 30 hari yang jelas dan actionable",
    motivasi: "14 hari ini bukan akhir — ini adalah awal. Setiap iterasi akan lebih baik dari sebelumnya karena kamu sudah punya data dan pengalaman yang tidak ternilai.",
    warning: "Jangan berhenti setelah 14 hari bahkan jika hasilnya belum sesuai ekspektasi. Bisnis digital butuh konsistensi, bukan kesempurnaan di putaran pertama.",
  },
];

const phases = [
  { name: "Fondasi", days: "1-3", color: "bg-blue-500" },
  { name: "Produksi", days: "4-7", color: "bg-purple-500" },
  { name: "Marketing", days: "8-11", color: "bg-orange-500" },
  { name: "Optimasi & Scale", days: "12-14", color: "bg-green-500" },
];

const kpiTracker = [
  { day: 7, checkpoint: "Produk selesai 100%, sales page live, sistem pembayaran aktif" },
  { day: 10, checkpoint: "1-3 penjualan pertama dari soft launch, minimal 1 testimoni" },
  { day: 12, checkpoint: "5-10+ penjualan total dari hard launch" },
  { day: 14, checkpoint: "ROI positif, rencana scale bulan depan sudah siap" },
];

const phaseColors: Record<string, string> = {
  "Fondasi": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "Produksi": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  "Marketing": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  "Optimasi": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "Scale": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

const DAYS_KEY = "execution_completed_days";
const TASKS_KEY = "execution_completed_tasks";
const NOTES_KEY = "execution_notes";

function loadLS<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

export default function ExecutionPlan() {
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>(() => loadLS(DAYS_KEY, {}));
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => loadLS(TASKS_KEY, {}));
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [notes, setNotes] = useState<Record<number, string>>(() => loadLS(NOTES_KEY, {}));
  const { toast } = useToast();

  const toggleDay = (dayNum: number) => {
    setCompletedDays(prev => {
      const newVal = !prev[dayNum];
      const next = { ...prev, [dayNum]: newVal };
      localStorage.setItem(DAYS_KEY, JSON.stringify(next));
      if (newVal) toast({ title: `Hari ${dayNum} selesai! 🎉`, description: "Lanjut ke hari berikutnya, konsisten adalah kuncinya." });
      return next;
    });
  };

  const toggleTask = (key: string) => setCompletedTasks(prev => {
    const next = { ...prev, [key]: !prev[key] };
    localStorage.setItem(TASKS_KEY, JSON.stringify(next));
    return next;
  });

  const doneCount = Object.values(completedDays).filter(Boolean).length;
  const overallProgress = (doneCount / 14) * 100;

  const getDayTaskProgress = (dayNum: number) => {
    const day = days[dayNum - 1];
    const done = day.tasks.filter((_, ti) => completedTasks[`${dayNum}-${ti}`]).length;
    return { done, total: day.tasks.length };
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Sistem Eksekusi 14 Hari</h1>
          <p className="text-muted-foreground">Dari riset hingga penjualan pertama — langkah demi langkah, hari demi hari</p>
        </div>
      </div>

      <Card className="border-primary/40">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">Overall Progress</p>
            <p className="font-bold text-primary">{doneCount}/14 hari</p>
          </div>
          <Progress value={overallProgress} className="h-3 mb-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {phases.map((phase, i) => (
              <div key={i} className="text-center p-2 rounded bg-muted">
                <div className={`h-2 w-full rounded-full ${phase.color} opacity-70 mb-1`} />
                <p className="text-xs font-medium">{phase.name}</p>
                <p className="text-xs text-muted-foreground">Hari {phase.days}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tracker" data-testid="tabs-execution">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracker" data-testid="tab-tracker">Tracker Harian</TabsTrigger>
          <TabsTrigger value="kpi" data-testid="tab-kpi">KPI & Checkpoint</TabsTrigger>
          <TabsTrigger value="resources" data-testid="tab-resources">Resources & Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-3 mt-4">
          {days.map((dayData) => {
            const taskProg = getDayTaskProgress(dayData.day);
            const isExpanded = expandedDay === dayData.day;
            const isDone = completedDays[dayData.day];

            return (
              <Card key={dayData.day} className={isDone ? "border-green-400 dark:border-green-600" : ""} data-testid={`card-day-${dayData.day}`}>
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedDay(isExpanded ? null : dayData.day)}
                  data-testid={`button-expand-day-${dayData.day}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0 text-sm font-bold ${isDone ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"}`}>
                          {isDone ? <CheckCircle2 className="h-5 w-5" /> : dayData.day}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{dayData.title}</p>
                            <Badge className={`text-xs ${phaseColors[dayData.phase] || "bg-gray-100 text-gray-700"}`}>{dayData.phase}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> {dayData.timeRequired}
                            </span>
                            <span className="text-xs text-muted-foreground">{taskProg.done}/{taskProg.total} tasks</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Selesai ✓</Badge>
                        ) : (
                          <Progress value={(taskProg.done / taskProg.total) * 100} className="w-16 h-2" />
                        )}
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                      </div>
                    </div>
                  </CardHeader>
                </button>

                {isExpanded && (
                  <CardContent className="space-y-4 pt-0">
                    <div className="p-3 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">🎯 Tujuan Hari Ini</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{dayData.objective}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Checklist Tasks:</p>
                      {dayData.tasks.map((t, ti) => {
                        const key = `${dayData.day}-${ti}`;
                        const done = completedTasks[key];
                        return (
                          <div
                            key={ti}
                            className={`flex items-start gap-3 p-2.5 rounded border cursor-pointer transition-colors ${done ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-border hover:bg-muted"}`}
                            onClick={() => toggleTask(key)}
                            data-testid={`task-${dayData.day}-${ti}`}
                          >
                            <div className={`flex h-5 w-5 items-center justify-center rounded border-2 flex-shrink-0 mt-0.5 transition-colors ${done ? "border-green-500 bg-green-500" : "border-muted-foreground"}`}>
                              {done && <CheckCircle2 className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>{t.task}</p>
                            </div>
                            {t.important && !done && <Star className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded bg-muted">
                        <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-primary" /> Tools yang Disarankan
                        </p>
                        <ul className="space-y-1">
                          {dayData.tools.map((tool, ti) => (
                            <li key={ti} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary">→</span> {tool}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded bg-primary/5 border border-primary/20">
                        <p className="text-xs font-semibold mb-1 flex items-center gap-1.5">
                          <BarChart3 className="h-3.5 w-3.5 text-primary" /> KPI Hari Ini
                        </p>
                        <p className="text-xs text-muted-foreground">{dayData.kpi}</p>
                      </div>
                    </div>

                    {dayData.warning && (
                      <div className="flex items-start gap-2 p-3 rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">{dayData.warning}</p>
                      </div>
                    )}

                    <div className="flex items-start gap-2 p-3 rounded bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                      <Lightbulb className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-purple-700 dark:text-purple-300 italic">{dayData.motivasi}</p>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground">Catatan Hari Ini (opsional):</p>
                      <Textarea
                        placeholder="Apa yang kamu pelajari, hambatan yang ditemui, ide yang muncul..."
                        value={notes[dayData.day] || ""}
                        onChange={e => setNotes(prev => {
                          const next = { ...prev, [dayData.day]: e.target.value };
                          localStorage.setItem(NOTES_KEY, JSON.stringify(next));
                          return next;
                        })}
                        className="min-h-[80px] text-xs resize-none"
                        data-testid={`textarea-notes-${dayData.day}`}
                      />
                    </div>

                    <Button
                      className={`w-full ${isDone ? "bg-green-600 hover:bg-green-700" : ""}`}
                      onClick={() => toggleDay(dayData.day)}
                      data-testid={`button-complete-day-${dayData.day}`}
                    >
                      {isDone ? (
                        <><CheckCircle2 className="h-4 w-4 mr-2" /> Tandai Belum Selesai</>
                      ) : (
                        <><Trophy className="h-4 w-4 mr-2" /> Tandai Hari {dayData.day} Selesai!</>
                      )}
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="kpi" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm">
            <strong>Checkpoint system</strong> — evaluasi progress di 4 titik kritis selama 14 hari. 
            Jika di checkpoint tertentu kamu belum mencapai target, review dan adjust strategi sebelum lanjut.
          </div>
          <div className="space-y-3">
            {kpiTracker.map((kpi, i) => (
              <Card key={i} data-testid={`card-kpi-${i}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 font-bold text-sm ${completedDays[kpi.day] ? "bg-green-500 text-white" : "bg-primary/10 text-primary"}`}>
                      {completedDays[kpi.day] ? <CheckCircle2 className="h-5 w-5" /> : `D${kpi.day}`}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Checkpoint Hari {kpi.day}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{kpi.checkpoint}</p>
                      {completedDays[kpi.day] && (
                        <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">Checkpoint Tercapai ✓</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Summary Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{doneCount}</p>
                  <p className="text-xs text-muted-foreground">Hari Selesai</p>
                </div>
                <div className="p-3 rounded bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{14 - doneCount}</p>
                  <p className="text-xs text-muted-foreground">Hari Tersisa</p>
                </div>
                <div className="p-3 rounded bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {Object.values(completedTasks).filter(Boolean).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Task Selesai</p>
                </div>
                <div className="p-3 rounded bg-primary/10 text-center">
                  <p className="text-2xl font-bold text-primary">{Math.round(overallProgress)}%</p>
                  <p className="text-xs text-muted-foreground">Overall Progress</p>
                </div>
              </div>
              {doneCount === 14 && (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-400 dark:border-green-600 text-center">
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="font-bold text-green-700 dark:text-green-300">Selamat! Kamu berhasil menyelesaikan 14 hari eksekusi!</p>
                  <p className="text-sm text-muted-foreground mt-1">Sekarang waktunya evaluasi dan rencanakan bulan berikutnya untuk scale up.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                category: "Buat & Desain Produk",
                icon: BookOpen,
                color: "text-blue-500",
                tools: [
                  { name: "Canva", use: "Desain cover, presentasi, infografis — gratis dengan fitur lengkap", cost: "Gratis (Pro: Rp 170rb/bln)" },
                  { name: "Google Docs", use: "Penulisan e-book, panduan, materi teks lainnya", cost: "Gratis" },
                  { name: "ChatGPT / Claude", use: "Percepat penulisan konten dengan AI — gunakan prompt RISEN", cost: "Gratis (GPT-4: $20/bln)" },
                  { name: "Notion", use: "Outline produk, project management, database konten", cost: "Gratis" },
                  { name: "CapCut / DaVinci Resolve", use: "Edit video untuk kursus atau konten marketing", cost: "Gratis" },
                ],
              },
              {
                category: "Jual & Terima Pembayaran",
                icon: DollarSign,
                color: "text-green-500",
                tools: [
                  { name: "Lynk.id", use: "Platform jual produk digital Indonesia — mudah setup, QRIS + transfer", cost: "Gratis (komisi 3%)" },
                  { name: "Gumroad", use: "Marketplace internasional untuk produk digital", cost: "Gratis (komisi 10%)" },
                  { name: "Tokopedia Digital", use: "Marketplace besar Indonesia dengan traffic organik tinggi", cost: "Gratis (komisi 2.5-5%)" },
                  { name: "WhatsApp Business", use: "Jualan direct dengan konversi tertinggi", cost: "Gratis" },
                  { name: "Xendit / Midtrans", use: "Payment gateway jika punya website sendiri", cost: "Komisi per transaksi" },
                ],
              },
              {
                category: "Marketing & Distribusi",
                icon: TrendingUp,
                color: "text-orange-500",
                tools: [
                  { name: "Meta Business Suite", use: "Kelola Facebook + Instagram ads dan posting dalam satu tempat", cost: "Gratis (bayar per iklan)" },
                  { name: "TikTok Ads Manager", use: "Iklan di TikTok — mulai Rp 50.000/hari", cost: "Gratis (bayar per iklan)" },
                  { name: "Mailchimp / ConvertKit", use: "Email marketing untuk nurturing leads dan list building", cost: "Gratis (hingga 1.000 subscriber)" },
                  { name: "Linktree / Lynk.id Bio", use: "Multiple link di bio Instagram / TikTok", cost: "Gratis" },
                  { name: "Hootsuite / Buffer", use: "Schedule posting sosmed ke semua platform sekaligus", cost: "Gratis (limited)" },
                ],
              },
              {
                category: "Analitik & Tracking",
                icon: BarChart3,
                color: "text-purple-500",
                tools: [
                  { name: "Google Analytics 4", use: "Track pengunjung website, sumber traffic, dan konversi", cost: "Gratis" },
                  { name: "Meta Pixel + Pixel Helper", use: "Track pengunjung dari iklan Facebook/Instagram", cost: "Gratis" },
                  { name: "Google Search Console", use: "Track performa SEO dan kata kunci organik", cost: "Gratis" },
                  { name: "Bitly / UTM Builder", use: "Track klik dari setiap link yang kamu bagikan", cost: "Gratis" },
                  { name: "Spreadsheet (Google Sheets)", use: "Dashboard tracking manual untuk revenue, lead, konversi", cost: "Gratis" },
                ],
              },
            ].map((group, gi) => (
              <Card key={gi} data-testid={`card-resources-${gi}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <group.icon className={`h-4 w-4 ${group.color}`} />
                    {group.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {group.tools.map((tool, ti) => (
                      <div key={ti} className="border-b last:border-0 pb-2 last:pb-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{tool.name}</p>
                          <Badge variant="outline" className="text-xs">{tool.cost}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{tool.use}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <NextSteps steps={[
        { title: "Ad Creator", description: "Generate copy iklan untuk semua platform berdasarkan produk yang sudah kamu buat", href: "/ad-creator", badge: "Langkah berikutnya", badgeColor: "bg-green-100 text-green-700" },
        { title: "Audience Builder", description: "Bangun buyer persona detail sebelum jalankan iklan berbayar", href: "/audience-builder", badge: "AI", badgeColor: "bg-purple-100 text-purple-700" },
        { title: "Meta Ads Advanced", description: "Panduan lengkap jalankan iklan di Facebook & Instagram", href: "/meta-ads", badge: "Platform", badgeColor: "bg-blue-100 text-blue-700" },
      ]} />
    </div>
  );
}
