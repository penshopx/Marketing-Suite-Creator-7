import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NextSteps } from "@/components/next-steps";
import { 
  Globe, Copy, Star, TrendingUp, Users, CheckCircle2,
  MessageSquare, Lightbulb, DollarSign, Calendar, 
  Target, BarChart3, BookOpen, Zap, ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const templateTypes = [
  {
    id: "review",
    name: "Review Jujur & Komprehensif",
    tag: "Konversi Tertinggi",
    tagColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    description: "Review mendalam yang membangun trust tinggi. Pembaca merasa mendapat rekomendasi dari teman yang sudah pakai.",
    useWhen: "Kamu sudah pakai atau familiar dengan produk. Idealnya ada pengalaman pribadi.",
    template: `🔍 REVIEW JUJUR: [Nama Produk] — Worth It atau Nggak?

Setelah [berapa lama] pakai [nama produk], ini honest review saya.

THE GOOD ✅
• [Kelebihan 1 — spesifik dengan detail]
• [Kelebihan 2 — fokus pada hasil/dampak]
• [Kelebihan 3 — apa yang paling berkesan]

THE NOT-SO-GOOD ⚠️
• [Kekurangan jujur 1 — ini yang bikin review dipercaya]
• [Kekurangan 2 — tapi bukan deal breaker]

SIAPA YANG HARUS BELI?
[Nama produk] cocok untuk kamu jika:
✓ Kamu sedang [situasi spesifik]
✓ Kamu punya masalah [masalah yang diselesaikan]
✓ Kamu mau [hasil yang diinginkan]

Kurang cocok jika:
✗ Kamu [situasi yang tidak sesuai]

VERDICT SAYA: [Rating] ⭐
[Satu kalimat kesimpulan yang jujur dan memorable]

Link untuk cek langsung: [link affiliate]

Pertanyaan? Drop di kolom komentar atau DM ya! 👇`,
    platforms: ["Blog / Medium", "Instagram Carousel", "YouTube (script)", "Facebook Post panjang"],
  },
  {
    id: "problem-solution",
    name: "Problem → Solusi (Pain Point)",
    tag: "High Engagement",
    tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    description: "Mulai dengan masalah yang sangat relatable, lalu hadirkan produk sebagai solusi alami. Terasa helpful, bukan menjual.",
    useWhen: "Kamu tahu pain point audience-mu sangat spesifik dan produk benar-benar menyelesaikannya.",
    template: `Pernah nggak sih ngerasain [masalah yang sangat relatable]?

Saya juga pernah. Sampai [akibat/konsekuensi masalah ini].

Yang bikin frustrasi: udah coba [solusi lain yang gagal], tetap aja [hasil yang tidak memuaskan].

Sampai akhirnya saya ketemu [nama produk].

Awalnya skeptis juga sih — tapi setelah [berapa lama/mencoba apa]:

✨ [Hasil konkret yang didapat]
✨ [Perubahan yang terasa nyata]  
✨ [Manfaat yang paling diapresiasi]

Ini yang bikin beda dari yang lain:
→ [Diferensiasi 1]
→ [Diferensiasi 2]

Kalau kamu juga punya masalah [masalah], mungkin ini bisa bantu:
[link affiliate]

P.S. Sekarang ada promo [diskon/bonus] — lumayan buat yang mau coba. Cek sebelum berakhir.`,
    platforms: ["Instagram Feed / Story", "TikTok Caption", "WhatsApp Broadcast", "Facebook Group"],
  },
  {
    id: "comparison",
    name: "Perbandingan (Versus / Alternative)",
    tag: "SEO Friendly",
    tagColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    description: "Bandingkan produk dengan alternatif lain secara jujur. Audience yang sudah riset sangat menghargai konten ini.",
    useWhen: "Audience kamu sedang dalam tahap riset dan membandingkan beberapa pilihan.",
    template: `[Produk A] vs [Produk B] — Mana yang Lebih Worth It di 2024?

Banyak yang DM nanya soal ini, jadi saya bikin perbandingan jujurnya.

📊 PERBANDINGAN LANGSUNG

| Aspek | [Produk A] | [Produk B] |
|-------|------------|------------|
| Harga | [harga A] | [harga B] |
| [Fitur 1] | [detail] | [detail] |
| [Fitur 2] | [detail] | [detail] |
| [Fitur 3] | [detail] | [detail] |
| Support | [detail] | [detail] |
| Overall | [rating] ⭐ | [rating] ⭐ |

PILIH [PRODUK A] JIKA:
• Kamu [kondisi spesifik]
• Budget kamu [range]
• Prioritas kamu adalah [hal yang diutamakan]

PILIH [PRODUK B] JIKA:
• Kamu [kondisi berbeda]
• Kamu butuh [fitur spesifik B]

REKOMENDASI SAYA:
Untuk mayoritas [niche audience], saya rekomendasikan [produk pilihan] karena [alasan yang jujur dan spesifik].

Link: [produk A] → [link]
Link: [produk B] → [link affiliate]

Save post ini buat referensi sebelum beli! 📌`,
    platforms: ["Blog / Medium", "YouTube", "Instagram Carousel (tabel versi visual)", "Thread Twitter/X"],
  },
  {
    id: "tutorial",
    name: "Tutorial + Produk sebagai Tool",
    tag: "Value Tinggi",
    tagColor: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    description: "Berikan tutorial yang benar-benar berguna, sebutkan produk secara natural sebagai alat yang kamu gunakan.",
    useWhen: "Produk adalah tool atau resource yang membantu proses tertentu. Bukan jualan — berbagi cara.",
    template: `CARA [HASIL YANG DICAPAI] dalam [waktu] — Step by Step

Ini yang saya lakukan dan hasilnya [hasil konkret]:

STEP 1: [Langkah pertama]
[Penjelasan detail. Di sinilah kamu bisa natural mention produk jika relevan]
→ Saya pakai [nama produk] untuk [fungsi spesifik] — hemat waktu banget

STEP 2: [Langkah kedua]
[Penjelasan. Fokus pada nilai, bukan produk]

STEP 3: [Langkah ketiga]
[Penjelasan]

STEP 4: [Langkah keempat]
[Tips pro yang tidak banyak orang tahu]

STEP 5: [Langkah terakhir]
[Cara finishing yang benar]

TOOLS YANG SAYA GUNAKAN:
• [Nama produk]: untuk [fungsi] → [link affiliate]
• [Tool gratis 1]: untuk [fungsi]
• [Tool gratis 2]: untuk [fungsi]

Coba deh langkah-langkah ini! Kalau ada pertanyaan, tanya di komentar 👇

Save dulu biar nggak kehilangan tutorial ini! 🔖`,
    platforms: ["Instagram Carousel", "TikTok / Reels (video)", "Blog / YouTube", "Pinterest"],
  },
  {
    id: "list",
    name: "Daftar Rekomendasi (Listicle)",
    tag: "Viral Potential",
    tagColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    description: "List '5 tools terbaik', 'rekomendasi untuk pemula', dll. Format yang mudah di-share dan di-save.",
    useWhen: "Audience butuh referensi cepat. Bagus untuk evergreen content yang terus-terusan dapat organic reach.",
    template: `[Angka] [NAMA PRODUK/TOOLS] yang Wajib Dicoba [Target Audience] di [Tahun]

[Hook: mengapa list ini penting dan kenapa kamu yang bikin]

1️⃣ [NAMA #1]
Kenapa masuk list: [alasan spesifik dan jujur]
Terbaik untuk: [siapa yang paling benefit]
Harga: [harga atau gratis]
→ [link affiliate atau link info]

2️⃣ [NAMA #2]
Kenapa masuk list: [alasan]
Terbaik untuk: [siapa]
Harga: [harga]
→ [link]

3️⃣ [NAMA #3] ← [ini affiliate utama kamu]
Kenapa masuk list: [alasan yang lebih detail — ini yang ingin kamu promote]
Yang bikin beda: [USP spesifik]
Terbaik untuk: [siapa]
Harga: [harga]
→ Link: [link affiliate]

4️⃣ [NAMA #4]
...

5️⃣ [NAMA #5]
...

KESIMPULAN:
Dari semua yang di atas, kalau kamu hanya bisa pilih satu, saya rekomendasikan [produk affiliate] karena [alasan terkuat].

Mana yang sudah kamu coba? Comment di bawah! 👇
Save post ini untuk referensi! 📌`,
    platforms: ["Instagram Carousel", "Blog / Medium", "TikTok (list format)", "Pinterest", "Facebook"],
  },
  {
    id: "faq",
    name: "FAQ / Menjawab Pertanyaan Audience",
    tag: "Trust Builder",
    tagColor: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    description: "Jawab pertanyaan yang paling sering muncul di niche kamu, posisikan diri sebagai expert yang bisa dipercaya.",
    useWhen: "Kamu sudah punya community atau audience yang aktif bertanya soal suatu topik.",
    template: `Pertanyaan yang paling sering masuk ke DM saya tentang [topik]:

❓ "[Pertanyaan 1 yang paling sering]"
→ [Jawaban jujur dan detail. Mention produk jika relevan sebagai salah satu solusi, bukan satu-satunya]

❓ "[Pertanyaan 2]"
→ [Jawaban]

❓ "[Pertanyaan 3]"
→ [Jawaban]

❓ "[Pertanyaan 4]"
→ [Jawaban]

❓ "[Pertanyaan 5 — biasanya soal budget/harga]"
→ [Jawaban jujur tentang investasi yang diperlukan]

Untuk [topik yang lebih mendalam], saya rekomendasikan [nama produk]. 
Ini yang saya pakai dan sering saya refer ke orang yang serius mau [hasil]:
→ [link affiliate]

Ada pertanyaan lain? DM atau comment di bawah — saya usahakan jawab semua! 🙏`,
    platforms: ["Instagram Story Q&A format", "Facebook Post", "Thread Twitter/X", "LinkedIn"],
  },
];

const contentCalendar = [
  { week: 1, theme: "Perkenalan & Value Building", posts: [
    { day: "Sen", type: "Edukasi", content: "Tips [topik niche] yang berguna untuk audience — TIDAK menyebut produk sama sekali", platform: "IG/TikTok" },
    { day: "Rab", type: "Behind the Scenes", content: "Ceritakan pengalaman kamu menggunakan produk — bukan promosi, hanya sharing", platform: "Story" },
    { day: "Jum", type: "Soft Mention", content: "Tutorial yang menggunakan produk sebagai salah satu tool — bukan highlight produk", platform: "Carousel" },
  ]},
  { week: 2, theme: "Building Trust & Social Proof", posts: [
    { day: "Sen", type: "Edukasi", content: "Konten edukasi mendalam yang relate dengan masalah audience — 0% promosi", platform: "IG/TikTok" },
    { day: "Sel", type: "Q&A", content: "Jawab pertanyaan yang masuk terkait topik produk secara jujur dan helpful", platform: "Story" },
    { day: "Kam", type: "Testimoni", content: "Share testimoni orang lain yang menggunakan produk — dengan izin atau dari review publik", platform: "Feed" },
    { day: "Sab", type: "Perbandingan", content: "Konten perbandingan jujur: produk vs alternatif gratisan", platform: "Carousel" },
  ]},
  { week: 3, theme: "Intensifikasi & Offer", posts: [
    { day: "Sen", type: "Review", content: "Review jujur lengkap produk: kelebihan, kekurangan, verdict. Ini konten utama bulan ini.", platform: "Blog / IG" },
    { day: "Rab", type: "Tutorial", content: "Tutorial 'Cara [hasil] menggunakan [produk]' — lebih direct dari sebelumnya", platform: "Reels/TikTok" },
    { day: "Jum", type: "Promo", content: "Informasikan promo atau bonus yang sedang berlaku untuk produk", platform: "Semua" },
  ]},
  { week: 4, theme: "Closing & Retargeting", posts: [
    { day: "Sen", type: "FOMO", content: "Countdown konten — promo/bonus hampir berakhir", platform: "Story" },
    { day: "Rab", type: "Objection Handling", content: "Post yang menjawab 3 keberatan terbesar mengapa orang ragu beli", platform: "Feed" },
    { day: "Jum", type: "Last Call", content: "CTA langsung dan jelas dengan urgency yang masuk akal", platform: "Semua" },
    { day: "Min", type: "Refleksi", content: "Konten value tanpa promosi — untuk maintain trust setelah periode promosi", platform: "IG/TikTok" },
  ]},
];

const platformTips = [
  {
    platform: "Instagram",
    icon: "📸",
    bestContent: "Carousel (multiple slides), Reels, Story dengan swipe-up link",
    linkStrategy: "Link di bio (gunakan Linktree atau Lynk.id untuk multiple links). Mention 'link di bio' di caption.",
    frequency: "1 feed post per hari, 3-7 Story per hari",
    keyTips: [
      "Caption dengan banyak line break lebih mudah dibaca dan engagement-nya lebih tinggi",
      "Story link direct conversion lebih tinggi dari feed — gunakan untuk CTA langsung",
      "Carousel rata-rata dapat jangkauan 3x lebih luas dari single image",
      "Tambahkan CTA di slide terakhir carousel: 'Klik link di bio untuk info lengkap'",
    ],
  },
  {
    platform: "TikTok",
    icon: "🎵",
    bestContent: "Video tutorial, review produk, before-after, POV storytelling",
    linkStrategy: "Link di bio profil. Verifikasi akun untuk fitur link di video. Arahkan ke link bio dalam video.",
    frequency: "1-3 video per hari untuk pertumbuhan organik",
    keyTips: [
      "Hook 3 detik pertama menentukan apakah video akan di-push algoritma atau tidak",
      "Video yang mengedukasi + menghibur secara bersamaan mendapat jangkauan paling luas",
      "Gunakan trending audio yang relevan — bisa boost jangkauan 5-10x",
      "Balas komentar dengan video — TikTok mendistribusikan video reply lebih agresif",
    ],
  },
  {
    platform: "WhatsApp",
    icon: "💬",
    bestContent: "Broadcast personal, grup komunitas, status WA",
    linkStrategy: "Kirim link langsung dalam pesan. Konversi tertinggi dari semua platform.",
    frequency: "Broadcast 2-3x per minggu — lebih sering dianggap spam",
    keyTips: [
      "WhatsApp broadcast ke kontak yang sudah opt-in (minta izin dulu) — bukan cold spam",
      "Pesan personal dan conversational menghasilkan reply dan konversi jauh lebih tinggi",
      "Status WA: update 2-3x per hari, gunakan untuk soft sell dan behind the scenes",
      "Buat katalog produk di WA Business untuk showcase yang lebih profesional",
    ],
  },
  {
    platform: "YouTube",
    icon: "▶️",
    bestContent: "Review panjang mendalam, tutorial step-by-step, comparison video",
    linkStrategy: "Link di deskripsi video (baris pertama paling optimal). Mention secara verbal dalam video.",
    frequency: "1-2 video per minggu cukup untuk affiliate",
    keyTips: [
      "Video YouTube dengan durasi 8-15 menit cenderung lebih profitable untuk affiliate",
      "Sebutkan link di deskripsi secara verbal dalam video: 'Linknya ada di deskripsi ya'",
      "Thumbnail yang menunjukkan hasil/transformation lebih efektif dari produk shots",
      "SEO judul YouTube penting — riset keyword dulu sebelum buat judul",
    ],
  },
];

const incomeCalc = {
  scenarios: [
    { followers: "1.000", convRate: "0.5%", avgComm: "Rp 30.000", monthly: "~Rp 150.000" },
    { followers: "5.000", convRate: "1%", avgComm: "Rp 50.000", monthly: "~Rp 2.500.000" },
    { followers: "10.000", convRate: "1.5%", avgComm: "Rp 70.000", monthly: "~Rp 10.500.000" },
    { followers: "50.000", convRate: "2%", avgComm: "Rp 100.000", monthly: "~Rp 100.000.000" },
  ],
};

export default function AffiliateContent() {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templateTypes[0] | null>(null);
  const [customProduct, setCustomProduct] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const { toast } = useToast();

  const copyText = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: label ? `${label} berhasil disalin.` : undefined });
  };

  const getFilledTemplate = (template: string) => {
    let filled = template;
    if (customProduct) filled = filled.replace(/\[nama produk\]/gi, customProduct);
    if (customNiche) filled = filled.replace(/\[niche bisnis kamu\]/gi, customNiche);
    return filled;
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Affiliate Content System</h1>
          <p className="text-muted-foreground">6 template konten, kalender 30 hari, tips platform, dan kalkulator income affiliate</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: "6", label: "Template Konten", icon: BookOpen, color: "text-blue-500" },
          { value: "30", label: "Hari Konten Terencana", icon: Calendar, color: "text-green-500" },
          { value: "4", label: "Platform Utama", icon: Globe, color: "text-purple-500" },
          { value: "100%", label: "Komisi untuk Kamu", icon: DollarSign, color: "text-orange-500" },
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

      <Tabs defaultValue="templates" data-testid="tabs-affiliate">
        <TabsList className="grid w-full grid-cols-4 text-xs">
          <TabsTrigger value="templates" data-testid="tab-templates">Template Konten</TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-calendar">Kalender 30 Hari</TabsTrigger>
          <TabsTrigger value="platforms" data-testid="tab-platforms">Tips Platform</TabsTrigger>
          <TabsTrigger value="income" data-testid="tab-income">Kalkulator Income</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm font-medium mb-2">Personalisasi Template (Opsional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nama Produk Affiliate</Label>
                <Input placeholder="contoh: Blueprint Digital" value={customProduct} onChange={e => setCustomProduct(e.target.value)} data-testid="input-product-name" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Niche Konten Kamu</Label>
                <Input placeholder="contoh: digital marketing" value={customNiche} onChange={e => setCustomNiche(e.target.value)} data-testid="input-niche" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templateTypes.map((tmpl, i) => (
              <Card key={i} className="hover:border-primary/40 transition-colors" data-testid={`card-template-${i}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-sm">{tmpl.name}</CardTitle>
                    <Badge className={`text-xs ${tmpl.tagColor}`}>{tmpl.tag}</Badge>
                  </div>
                  <CardDescription className="text-xs">{tmpl.description}</CardDescription>
                  <div className="flex items-start gap-1.5">
                    <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground italic">Gunakan ketika: {tmpl.useWhen}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {tmpl.platforms.map((p, pi) => <Badge key={pi} variant="secondary" className="text-xs">{p}</Badge>)}
                  </div>
                  <div className="p-2.5 rounded bg-muted text-xs font-mono line-clamp-4 text-muted-foreground leading-relaxed">
                    {getFilledTemplate(tmpl.template).split("\n").slice(0, 4).join("\n")}...
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedTemplate(tmpl)} data-testid={`button-preview-${i}`}>
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => copyText(getFilledTemplate(tmpl.template), tmpl.name)} data-testid={`button-copy-template-${i}`}>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Salin
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedTemplate && (
            <Card className="border-primary/40" data-testid="card-template-preview">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base">{selectedTemplate.name}</CardTitle>
                  <Button size="sm" onClick={() => copyText(getFilledTemplate(selectedTemplate.template), selectedTemplate.name)} data-testid="button-copy-full-template">
                    <Copy className="h-3.5 w-3.5 mr-1" /> Salin Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={getFilledTemplate(selectedTemplate.template)}
                  readOnly
                  className="min-h-[400px] text-xs font-mono leading-relaxed"
                  data-testid="textarea-template-preview"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
            <strong>Strategi 30 hari ini menggunakan rasio 70:30</strong> — 70% konten nilai murni, 30% promosi.
            Pendekatan ini membangun trust terlebih dahulu sebelum menjual, menghasilkan konversi yang jauh lebih tinggi dan audience yang loyal.
          </div>
          <div className="space-y-4">
            {contentCalendar.map((week, wi) => (
              <Card key={wi} data-testid={`card-week-${wi + 1}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Minggu {week.week}: {week.theme}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {week.posts.map((post, pi) => (
                      <div key={pi} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors" data-testid={`card-post-${wi}-${pi}`}>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{post.day}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">{post.type}</Badge>
                            <Badge variant="secondary" className="text-xs">{post.platform}</Badge>
                          </div>
                          <p className="text-sm mt-1 text-muted-foreground">{post.content}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2 flex-shrink-0" onClick={() => copyText(post.content)} data-testid={`button-copy-post-${wi}-${pi}`}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                Script Follow-up untuk Audience yang Belum Beli
              </CardTitle>
              <CardDescription>Kirim via DM ke yang sudah tanya tapi belum beli dalam 3-7 hari</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  label: "Follow-up Ringan (H+2 setelah tanya)",
                  script: `Halo kak [nama]! 

Sekadar follow-up — kemarin kak tanya soal [nama produk]. Ada yang bisa saya bantu jelaskan lebih lanjut?

Saya happy bantu kalau ada pertanyaan spesifik sebelum kak memutuskan 😊`,
                },
                {
                  label: "Tangani Objeksi Harga (H+4)",
                  script: `Kak [nama], boleh saya share sesuatu?

Banyak yang bilang harga [nama produk] kemahalan. Tapi coba bandingkan: kalau metode ini membantu kak [hasil yang diinginkan], nilai balik investasinya seperti apa?

Anyway, kalau masih mau pikir-pikir dulu, no pressure. Saya di sini kalau ada pertanyaan 🙏`,
                },
                {
                  label: "Last Chance (H+7)",
                  script: `Hai kak [nama]! 

Mau kasih info — promo/bonus untuk [nama produk] berlaku sampai [tanggal]. Setelah itu harga kembali normal.

Kalau kak tertarik, ini linknya: [link affiliate]

Kalau belum waktu yang tepat, tidak apa-apa — saya tetap di sini kalau mau tanya kapanpun 😊`,
                },
              ].map((s, si) => (
                <div key={si} className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
                  <div className="relative">
                    <pre className="text-xs bg-muted p-3 rounded whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">{s.script}</pre>
                    <Button variant="outline" size="sm" className="mt-1 w-full" onClick={() => copyText(s.script, s.label)} data-testid={`button-copy-followup-${si}`}>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Salin Script
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4 mt-4">
          {platformTips.map((p, i) => (
            <Card key={i} data-testid={`card-platform-${i}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-xl">{p.icon}</span> {p.platform}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded bg-muted">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Konten Terbaik</p>
                    <p className="text-xs">{p.bestContent}</p>
                  </div>
                  <div className="p-3 rounded bg-muted">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Strategi Link</p>
                    <p className="text-xs">{p.linkStrategy}</p>
                  </div>
                  <div className="p-3 rounded bg-muted">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Frekuensi Posting</p>
                    <p className="text-xs">{p.frequency}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-yellow-500" /> Tips Spesifik untuk {p.platform}:
                  </p>
                  <ul className="space-y-1.5">
                    {p.keyTips.map((tip, ti) => (
                      <li key={ti} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" /> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="income" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Simulasi Income Affiliate
              </CardTitle>
              <CardDescription>Estimasi berdasarkan jumlah followers dan conversion rate rata-rata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-3 text-xs font-semibold">Followers/Subscriber</th>
                      <th className="text-center p-3 text-xs font-semibold">Conv. Rate</th>
                      <th className="text-center p-3 text-xs font-semibold">Rata-rata Komisi</th>
                      <th className="text-center p-3 text-xs font-semibold text-primary">Estimasi/Bulan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeCalc.scenarios.map((s, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-3 font-medium">{s.followers}</td>
                        <td className="p-3 text-center text-muted-foreground">{s.convRate}</td>
                        <td className="p-3 text-center text-muted-foreground">{s.avgComm}</td>
                        <td className="p-3 text-center font-bold text-primary">{s.monthly}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-3 rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  <strong>Penting:</strong> Angka ini adalah estimasi. Hasil nyata sangat bergantung pada kualitas audience, 
                  relevansi produk, konsistensi konten, dan strategi yang digunakan. 
                  Follower berkualitas {">"}  follower banyak tapi tidak relevan.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Kalkulator Income Sederhana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeCalculator />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Cara Memilih Produk Affiliate yang Profitable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Komisi minimal 30-50% dari harga produk", desc: "Produk digital idealnya menawarkan komisi lebih tinggi karena biaya produksi rendah. Hindari produk fisik yang komisinya 3-10%." },
                { title: "Produk yang kamu gunakan atau percaya", desc: "Mempromosikan sesuatu yang kamu sendiri tidak yakin akan terlihat di konten kamu. Audience modern sangat bisa membedakan genuine vs forced promotion." },
                { title: "Sesuai dengan niche dan kebutuhan audience", desc: "Produk paling profitable adalah yang menjawab masalah nyata audience kamu. Relevansi > komisi besar." },
                { title: "Seller yang terpercaya dan responsif", desc: "Pastikan seller punya track record yang baik. Jika pembeli kecewa dengan produk, reputasimu yang ikut rusak." },
                { title: "Ada materi support yang membantu proses jualan", desc: "Seller yang baik menyediakan: deskripsi produk, gambar produk, materi promosi, dan bahkan script jualannya." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NextSteps steps={[
        { title: "Prompt Framework", description: "Gunakan 15 prompt AI untuk buat konten affiliate lebih cepat", href: "/prompt-framework", badge: "15 Prompts", badgeColor: "bg-yellow-100 text-yellow-700" },
        { title: "Story Telling", description: "Buat narasi review produk yang engaging dan tingkatkan konversi", href: "/story-telling", badge: "Konversi", badgeColor: "bg-orange-100 text-orange-700" },
        { title: "Katalog Produk Digital", description: "Temukan produk digital yang layak dipromosikan sebagai affiliate", href: "/digital-products", badge: "Produk", badgeColor: "bg-green-100 text-green-700" },
      ]} />
    </div>
  );
}

function IncomeCalculator() {
  const [followers, setFollowers] = useState("");
  const [convRate, setConvRate] = useState("");
  const [commission, setCommission] = useState("");

  const calc = () => {
    const f = parseInt(followers.replace(/\D/g, "")) || 0;
    const cr = parseFloat(convRate) / 100 || 0;
    const comm = parseInt(commission.replace(/\D/g, "")) || 0;
    if (!f || !cr || !comm) return null;
    const monthly = Math.floor(f * cr * comm);
    return { monthly, sales: Math.floor(f * cr) };
  };
  const result = calc();
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Jumlah Followers/Subscriber</Label>
          <Input placeholder="contoh: 5000" value={followers} onChange={e => setFollowers(e.target.value)} data-testid="input-calc-followers" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Conversion Rate (%)</Label>
          <Input placeholder="contoh: 1" value={convRate} onChange={e => setConvRate(e.target.value)} data-testid="input-calc-convrate" />
          <p className="text-xs text-muted-foreground">Rata-rata: 0.5–2%</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Komisi per Penjualan (Rp)</Label>
          <Input placeholder="contoh: 50000" value={commission} onChange={e => setCommission(e.target.value)} data-testid="input-calc-commission" />
        </div>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <p className="text-xs text-muted-foreground">Estimasi Penjualan/Bulan</p>
            <p className="text-xl font-bold text-primary">{result.sales} unit</p>
          </div>
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-center">
            <p className="text-xs text-muted-foreground">Estimasi Income/Bulan</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">Rp {result.monthly.toLocaleString("id")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
