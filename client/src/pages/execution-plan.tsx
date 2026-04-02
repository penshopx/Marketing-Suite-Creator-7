import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CalendarDays, CheckCircle2, Clock, Rocket, Target, 
  TrendingUp, Zap, DollarSign, Star, ChevronRight
} from "lucide-react";

const days = [
  {
    day: 1,
    title: "Setup Akun & Platform",
    phase: "Persiapan",
    phaseColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    tasks: [
      "Buat akun di platform jual produk digital (Lynk.id / Gumroad / dll)",
      "Upload foto profil & isi bio yang menarik",
      "Pilih 1 produk winning dari katalog untuk dijual",
      "Pelajari deskripsi produk & kelebihan utamanya",
      "Buat link penjualan produk pertama",
    ],
    goal: "Akun siap & produk pertama terdaftar",
    tips: "Jangan overthinking soal nama atau niche dulu. Yang penting mulai!",
  },
  {
    day: 2,
    title: "Riset Target Market",
    phase: "Persiapan",
    phaseColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    tasks: [
      "Tentukan 1 target audience spesifik (contoh: ibu rumah tangga 25-35 tahun)",
      "Catat 3 pain point utama target market kamu",
      "Lihat kompetitor yang sudah jualan produk serupa",
      "Catat bahasa/kata-kata yang dipakai target market di media sosial",
      "Buat buyer persona sederhana di notes HP",
    ],
    goal: "Tau persis siapa yang akan kamu targetkan",
    tips: "Semakin spesifik target market, semakin mudah membuat konten yang ngena.",
  },
  {
    day: 3,
    title: "Buat Konten Pertama",
    phase: "Konten",
    phaseColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    tasks: [
      "Buat 3 konten soft-selling (konten edukatif berkaitan dengan produk)",
      "Buat 1 konten hard-selling (promosi langsung produk)",
      "Gunakan AI Templates untuk buat caption menarik",
      "Siapkan gambar/video pendukung konten",
      "Jadwalkan posting konten (pagi, siang, malam)",
    ],
    goal: "4 konten siap posting",
    tips: "Gunakan fitur Article Creator dan AI Templates di aplikasi ini untuk mempercepat proses.",
  },
  {
    day: 4,
    title: "Mulai Posting & Engagement",
    phase: "Konten",
    phaseColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    tasks: [
      "Post semua konten yang sudah dibuat kemarin",
      "Balas setiap komentar dan DM dalam 2 jam",
      "Follow 20 akun yang relevan dengan niche kamu",
      "Komen di 10 postingan akun besar di niche kamu",
      "Catat engagement rate konten (like, komen, share)",
    ],
    goal: "Mulai bangun interaksi dengan calon pembeli",
    tips: "Balas komentar secepat mungkin. Algoritma menyukai akun yang aktif berinteraksi.",
  },
  {
    day: 5,
    title: "Setup Iklan Pertama",
    phase: "Iklan",
    phaseColor: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    tasks: [
      "Buat akun Facebook Business Manager jika belum ada",
      "Setup Facebook Pixel di halaman produk",
      "Buat 1 campaign iklan dengan budget Rp 50.000/hari",
      "Target audience sesuai buyer persona yang sudah dibuat",
      "Gunakan konten terbaik dari hari 3 sebagai materi iklan",
    ],
    goal: "Iklan pertama berjalan",
    tips: "Mulai dengan budget kecil. Fokus pada data dulu, bukan langsung keuntungan besar.",
  },
  {
    day: 6,
    title: "Analisis & Optimasi",
    phase: "Iklan",
    phaseColor: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    tasks: [
      "Cek performa iklan: CTR, CPC, CPM",
      "Identifikasi konten mana yang paling banyak klik",
      "Matikan ad set dengan CTR di bawah 1%",
      "Scale up ad set dengan CTR tertinggi",
      "Buat 1-2 variasi konten iklan baru",
    ],
    goal: "Temukan kombinasi iklan yang paling efektif",
    tips: "Gunakan fitur Ad Analyzer di aplikasi ini untuk membantu analisis performa iklan.",
  },
  {
    day: 7,
    title: "Evaluasi Minggu Pertama",
    phase: "Evaluasi",
    phaseColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    tasks: [
      "Hitung total pengeluaran iklan vs pendapatan",
      "Identifikasi konten organik mana yang paling viral",
      "Catat feedback/pertanyaan dari calon pembeli",
      "Perbaiki halaman produk berdasarkan feedback",
      "Rencanakan strategi minggu kedua",
    ],
    goal: "Laporan evaluasi minggu pertama selesai",
    tips: "Jangan sedih kalau belum ada penjualan di hari ke-7. Ini masih tahap belajar & testing.",
  },
  {
    day: 8,
    title: "Scale Konten Organik",
    phase: "Scaling",
    phaseColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    tasks: [
      "Buat 5-7 konten berdasarkan template yang sudah terbukti",
      "Repurpose konten terbaik ke format berbeda (Reels, Story, Post)",
      "Kolaborasi atau mention 2-3 akun relevan",
      "Mulai bangun email list / WhatsApp broadcast",
      "Buat konten behind-the-scenes atau testimoni",
    ],
    goal: "Volume konten meningkat 2x lipat",
    tips: "Konsistensi adalah kunci. Lebih baik 5 konten biasa setiap hari daripada 1 konten sempurna per minggu.",
  },
  {
    day: 9,
    title: "Testing Penawaran Baru",
    phase: "Scaling",
    phaseColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    tasks: [
      "Buat penawaran bundle (gabungkan 2 produk)",
      "Test harga berbeda (diskon waktu terbatas)",
      "Tambahkan bonus untuk pembeli pertama",
      "Buat urgensi: 'Hanya hari ini' atau 'Sisa X slot'",
      "Monitor konversi penawaran baru vs penawaran lama",
    ],
    goal: "Temukan penawaran yang paling banyak konversi",
    tips: "Orang tidak beli produk, mereka beli hasil/transformasi. Tonjolkan benefit, bukan fitur.",
  },
  {
    day: 10,
    title: "Optimasi Iklan Berbayar",
    phase: "Iklan",
    phaseColor: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    tasks: [
      "Naikkan budget iklan yang sudah profitable 2x lipat",
      "Buat Lookalike Audience dari data pembeli",
      "Test iklan TikTok Ads jika belum coba",
      "Gunakan retargeting untuk yang sudah klik tapi belum beli",
      "Buat iklan baru dengan angle berbeda (testimoni, demo, dll)",
    ],
    goal: "ROAS (Return on Ad Spend) minimal 2x",
    tips: "Jangan ubah banyak variabel sekaligus. Ubah 1 elemen, tunggu 2-3 hari, evaluasi.",
  },
  {
    day: 11,
    title: "Bangun Komunitas & Loyalitas",
    phase: "Scaling",
    phaseColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    tasks: [
      "Buat grup WhatsApp atau Telegram untuk pembeli",
      "Kirim konten eksklusif ke grup komunitas",
      "Minta testimoni dari pembeli yang sudah dapat hasil",
      "Tawarkan program afiliasi kepada pembeli loyal",
      "Follow up via WhatsApp ke leads yang belum beli",
    ],
    goal: "Komunitas pertama terbentuk dengan minimal 10 anggota",
    tips: "Komunitas adalah aset jangka panjang. 10 orang aktif lebih berharga dari 1000 follower pasif.",
  },
  {
    day: 12,
    title: "Tambah Produk Kedua",
    phase: "Scaling",
    phaseColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    tasks: [
      "Pilih produk kedua dari katalog produk digital",
      "Buat konten khusus untuk produk kedua",
      "Cross-sell ke pembeli produk pertama",
      "Buat bundle produk 1 + produk 2 dengan harga spesial",
      "Update bio dan halaman profil dengan produk baru",
    ],
    goal: "2 produk aktif dijual secara bersamaan",
    tips: "Pembeli yang sudah percaya 3x lebih mudah beli produk kedua dibanding orang baru.",
  },
  {
    day: 13,
    title: "Push Final & Closing Masif",
    phase: "Panen",
    phaseColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    tasks: [
      "Buat penawaran 'Last Chance' dengan harga naik besok",
      "Kirim broadcast ke semua leads di WhatsApp/Telegram",
      "Post 3-5 story dan feed hari ini",
      "Naikkan budget iklan 50% untuk closing sprint",
      "Balas semua DM dan pertanyaan secepat mungkin",
    ],
    goal: "Maximum closing hari ke-13",
    tips: "Scarcity + Urgency adalah kombinasi paling ampuh untuk mendorong keputusan beli.",
  },
  {
    day: 14,
    title: "Pecah Telor & Evaluasi Total",
    phase: "Panen",
    phaseColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    tasks: [
      "Hitung total revenue 14 hari",
      "Dokumentasikan semua learning yang didapat",
      "Buat laporan: apa yang berhasil, apa yang tidak",
      "Set target 30 hari ke depan berdasarkan data",
      "Rayakan pencapaian - sekecil apapun hasilnya!",
    ],
    goal: "Penjualan pertama & roadmap 30 hari ke depan",
    tips: "Siapapun yang menyelesaikan 14 hari ini sudah selangkah lebih maju dari 99% orang yang hanya berpikir.",
  },
];

const phases = [
  { name: "Persiapan", color: "bg-blue-500", days: "1-2" },
  { name: "Konten", color: "bg-purple-500", days: "3-4" },
  { name: "Iklan", color: "bg-orange-500", days: "5-6, 10" },
  { name: "Evaluasi", color: "bg-green-500", days: "7" },
  { name: "Scaling", color: "bg-red-500", days: "8-9, 11-12" },
  { name: "Panen", color: "bg-yellow-500", days: "13-14" },
];

export default function ExecutionPlan() {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [activeDay, setActiveDay] = useState<number | null>(1);

  const toggleTask = (dayIndex: number, taskIndex: number) => {
    const key = `${dayIndex}-${taskIndex}`;
    setCompletedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getDayProgress = (dayIndex: number) => {
    const day = days[dayIndex];
    const completed = day.tasks.filter((_, ti) => completedTasks[`${dayIndex}-${ti}`]).length;
    return Math.round((completed / day.tasks.length) * 100);
  };

  const totalCompleted = Object.values(completedTasks).filter(Boolean).length;
  const totalTasks = days.reduce((acc, d) => acc + d.tasks.length, 0);
  const overallProgress = Math.round((totalCompleted / totalTasks) * 100);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Sistem 14 Hari Pecah Telor</h1>
          <p className="text-muted-foreground">Step-by-step execution plan dari nol sampai penjualan pertama</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Progress</p>
                <p className="text-2xl font-bold">{overallProgress}%</p>
              </div>
            </div>
            <Progress value={overallProgress} className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tugas Selesai</p>
                <p className="text-2xl font-bold">{totalCompleted}<span className="text-sm text-muted-foreground">/{totalTasks}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target</p>
                <p className="text-2xl font-bold">Rp 5 Juta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Fase Eksekusi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {phases.map(phase => (
              <div key={phase.name} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${phase.color}`} />
                <span className="text-sm font-medium">{phase.name}</span>
                <Badge variant="secondary" className="text-xs">Hari {phase.days}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const progress = getDayProgress(i);
          const isActive = activeDay === day.day;
          return (
            <button
              key={day.day}
              data-testid={`button-day-${day.day}`}
              onClick={() => setActiveDay(isActive ? null : day.day)}
              className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                isActive 
                  ? "border-primary bg-primary/10" 
                  : progress === 100 
                    ? "border-green-500 bg-green-50 dark:bg-green-950" 
                    : "border-border hover:border-primary/50"
              }`}
            >
              <span className="text-xs font-medium text-muted-foreground">Hari</span>
              <span className="text-lg font-bold">{day.day}</span>
              {progress > 0 && (
                <div className="w-full bg-muted rounded-full h-1 mt-1">
                  <div 
                    className="bg-primary h-1 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {activeDay !== null && (() => {
        const dayData = days[activeDay - 1];
        const dayIndex = activeDay - 1;
        return (
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={dayData.phaseColor}>{dayData.phase}</Badge>
                    <span className="text-sm text-muted-foreground">Hari ke-{dayData.day}</span>
                  </div>
                  <CardTitle className="text-xl">{dayData.title}</CardTitle>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold text-primary">{getDayProgress(dayIndex)}%</p>
                </div>
              </div>
              <Progress value={getDayProgress(dayIndex)} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Tugas Hari Ini
                </h3>
                <div className="space-y-3">
                  {dayData.tasks.map((task, ti) => {
                    const key = `${dayIndex}-${ti}`;
                    const done = completedTasks[key];
                    return (
                      <div 
                        key={ti}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          done ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-border"
                        }`}
                      >
                        <Checkbox
                          id={key}
                          checked={!!done}
                          onCheckedChange={() => toggleTask(dayIndex, ti)}
                          data-testid={`checkbox-task-${dayIndex}-${ti}`}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor={key}
                          className={`text-sm cursor-pointer leading-relaxed ${done ? "line-through text-muted-foreground" : ""}`}
                        >
                          {task}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Target Hari Ini</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{dayData.goal}</p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-sm text-yellow-700 dark:text-yellow-300">Tips</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{dayData.tips}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {activeDay > 1 && (
                  <Button variant="outline" onClick={() => setActiveDay(activeDay - 1)} data-testid="button-prev-day">
                    ← Hari {activeDay - 1}
                  </Button>
                )}
                {activeDay < 14 && (
                  <Button onClick={() => setActiveDay(activeDay + 1)} data-testid="button-next-day" className="ml-auto">
                    Hari {activeDay + 1} <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Ingat: Progress {">"} Perfection</h3>
              <p className="text-sm text-muted-foreground">
                Tidak ada yang sempurna di hari pertama. Yang penting adalah konsistensi 14 hari ini. 
                Setiap hari yang kamu selesaikan membawa kamu lebih dekat ke penjualan pertama. 
                Jangan berhenti di tengah jalan!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
