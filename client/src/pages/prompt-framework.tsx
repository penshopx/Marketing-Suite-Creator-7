import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, Copy, Search, MessageSquare, Megaphone, 
  FileText, BarChart3, Users, Star, Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "all", name: "Semua" },
  { id: "marketing", name: "Marketing" },
  { id: "copywriting", name: "Copywriting" },
  { id: "research", name: "Riset" },
  { id: "content", name: "Konten" },
  { id: "sales", name: "Penjualan" },
  { id: "business", name: "Bisnis" },
];

const prompts = [
  {
    id: "1",
    title: "Buat Sales Page yang Convert",
    category: "copywriting",
    icon: Megaphone,
    description: "Generate sales page lengkap dengan semua elemen persuasif",
    prompt: `Kamu adalah copywriter kelas dunia dengan pengalaman 10 tahun membuat sales page yang menghasilkan jutaan dalam penjualan.

Buatkan sales page untuk:
Produk: [nama produk]
Target market: [deskripsi target market]
Harga: [harga produk]
Benefit utama: [3-5 benefit terpenting]
Masalah yang diselesaikan: [masalah spesifik target market]

Sales page harus mencakup:
1. Headline yang menarik perhatian (gunakan angka spesifik)
2. Sub-headline yang memperkuat headline
3. Opening hook (pain agitation)
4. Daftar bullet point benefit (bukan fitur)
5. Social proof section (testimoni placeholder)
6. About the product section
7. Bonus section (jika ada)
8. Price reveal dengan justifikasi nilai
9. Guarantee section
10. CTA button dengan urgensi

Gunakan bahasa Indonesia yang natural dan persuasif. Hindari kata-kata formal.`,
  },
  {
    id: "2",
    title: "30 Ide Konten Media Sosial",
    category: "content",
    icon: FileText,
    description: "Generate banyak ide konten yang engaging untuk satu bulan",
    prompt: `Kamu adalah content strategist berpengalaman yang ahli membuat konten viral di media sosial Indonesia.

Buat 30 ide konten untuk:
Niche/Topik: [niche bisnis kamu]
Platform utama: [Instagram/TikTok/Facebook/LinkedIn]
Target audience: [deskripsi audience]
Tujuan konten: [awareness/engagement/penjualan]

Untuk setiap ide konten, berikan:
- Judul/hook konten
- Format (carousel/video/single image/text)
- Angle atau pendekatan yang digunakan
- CTA yang sesuai

Pastikan mix antara:
- 40% konten edukatif (tips, how-to, FAQ)
- 30% konten inspiratif (motivasi, kisah sukses)
- 20% konten entertaiment (humor, behind the scenes)
- 10% konten promosi (soft sell & hard sell)`,
  },
  {
    id: "3",
    title: "Riset Kompetitor & Peluang",
    category: "research",
    icon: BarChart3,
    description: "Analisis kompetitor dan temukan celah di pasar",
    prompt: `Kamu adalah business analyst dan market researcher yang ahli dalam analisis kompetitif.

Lakukan analisis kompetitor untuk:
Bisnis/Produk saya: [deskripsi bisnis/produk]
Kompetitor yang diketahui: [list kompetitor jika ada]
Target pasar: [niche atau segmen pasar]

Analisis mencakup:
1. Identifikasi 5 jenis kompetitor potensial (langsung & tidak langsung)
2. Kelemahan umum yang biasanya ada di kompetitor niche ini
3. Peluang yang belum dimanfaatkan (gap di pasar)
4. Positioning yang bisa membedakan saya dari kompetitor
5. Unique Selling Proposition (USP) yang bisa saya kembangkan
6. Harga optimal berdasarkan positioning yang dipilih
7. Channel pemasaran yang paling underutilized di niche ini

Berikan rekomendasi actionable yang bisa langsung diimplementasikan.`,
  },
  {
    id: "4",
    title: "Caption Iklan Multi-Platform",
    category: "marketing",
    icon: Megaphone,
    description: "Generate caption iklan untuk berbagai platform sekaligus",
    prompt: `Kamu adalah copywriter iklan digital yang spesialis dalam membuat copy yang convert untuk pasar Indonesia.

Buat caption iklan untuk:
Produk: [nama produk]
Benefit utama: [benefit terpenting]
Target audience: [deskripsi target market]
Budget sensitif? [ya/tidak]

Buat variasi caption untuk:
1. Facebook Ad (panjang, storytelling, 150-300 kata)
2. Instagram Ad (medium, visual-friendly, 80-150 kata + hashtag)
3. TikTok Ad (pendek, energik, 50-80 kata)
4. WhatsApp Broadcast (personal, conversational, 100-200 kata)

Setiap versi harus:
- Punya hook yang kuat di awal
- Menyentuh pain point spesifik
- Tunjukkan benefit, bukan fitur
- Ada social proof minimal
- CTA yang jelas dan spesifik
- Menggunakan bahasa yang sesuai platform`,
  },
  {
    id: "5",
    title: "Script Video Iklan (15-60 detik)",
    category: "content",
    icon: FileText,
    description: "Script video iklan yang menarik untuk TikTok dan Reels",
    prompt: `Kamu adalah video scriptwriter yang spesialis membuat iklan video pendek yang viral dan convert.

Buat script video iklan untuk:
Produk/Layanan: [nama produk]
Durasi target: [15/30/60 detik]
Platform: [TikTok/Instagram Reels/YouTube Shorts]
Masalah yang diselesaikan: [masalah spesifik]
Benefit utama: [benefit terpenting]

Script harus mencakup:
- Detik 0-3: Hook visual + verbal yang STOP scroll
- Detik 3-10: Agitasi masalah (buat audience relate)
- Detik 10-25: Presentasi solusi/produk
- Detik 25-45: Social proof atau demo singkat
- Detik 45-60: CTA yang jelas

Format output:
[VISUAL] - deskripsi gambar/gerakan kamera
[AUDIO/NARASI] - kata-kata yang diucapkan
[TEXT OVERLAY] - teks yang muncul di layar
[SFX] - efek suara jika diperlukan`,
  },
  {
    id: "6",
    title: "Email Sequence untuk Nurturing",
    category: "sales",
    icon: MessageSquare,
    description: "Sequence email untuk memperkenalkan dan menjual produk",
    prompt: `Kamu adalah email marketer berpengalaman yang ahli membuat sequence email yang membangun trust dan menghasilkan penjualan.

Buat email sequence 5 email untuk:
Produk: [nama produk]
Harga: [harga produk]
Target subscriber: [deskripsi target]
Tujuan sequence: [nurturing leads/launch/follow up]

Sequence email:
Email 1 (Hari 1) - Welcome + Quick Win
Email 2 (Hari 2) - Identifikasi masalah besar
Email 3 (Hari 4) - Solusi + Teaser produk
Email 4 (Hari 6) - Social proof + Overcome objection
Email 5 (Hari 7) - Penawaran + CTA kuat

Untuk setiap email berikan:
- Subject line (+ 2 alternatif untuk A/B test)
- Preview text
- Opening hook
- Body email
- CTA

Gunakan tone yang personal, seperti menulis ke teman.`,
  },
  {
    id: "7",
    title: "Analisis Target Market Mendalam",
    category: "research",
    icon: Users,
    description: "Buat profil customer ideal yang sangat detail",
    prompt: `Kamu adalah market researcher dan consumer psychologist yang ahli memahami perilaku konsumen Indonesia.

Buat analisis target market mendalam untuk:
Produk/Bisnis: [deskripsi produk/bisnis]
Segmen yang ditarget: [deskripsi segmen yang diinginkan]

Buatkan profil lengkap mencakup:

DEMOGRAFIS:
- Rentang usia dan gender
- Pekerjaan dan penghasilan
- Lokasi dan gaya hidup

PSIKOGRAFIS:
- Nilai dan keyakinan
- Impian dan aspirasi
- Ketakutan dan frustrasi terbesar
- Mimpi hidup yang ingin dicapai

PERILAKU ONLINE:
- Platform media sosial favorit
- Waktu aktif online
- Jenis konten yang dikonsumsi
- Influencer atau akun yang diikuti

KEPUTUSAN BELI:
- Faktor utama dalam memilih produk
- Objeksi umum sebelum membeli
- Kata-kata yang beresonansi
- Kata-kata yang harus dihindari

OUTPUT AKHIR:
- Tagline yang paling mungkin beresonansi
- 3 pesan marketing yang paling kuat
- Channel yang paling efektif untuk menjangkau mereka`,
  },
  {
    id: "8",
    title: "Buat Bonus yang Meningkatkan Nilai",
    category: "sales",
    icon: Star,
    description: "Ide bonus yang membuat penawaran jauh lebih menarik",
    prompt: `Kamu adalah product strategist yang ahli dalam membuat penawaran irresistible dengan bonus yang tepat.

Buat paket bonus untuk:
Produk utama: [nama dan deskripsi produk]
Harga produk: [harga]
Target market: [deskripsi target]
Pain point utama: [masalah yang diselesaikan]

Buat 5-7 ide bonus yang:
1. Melengkapi produk utama (bukan duplikat)
2. Masing-masing punya nilai yang bisa ditunjukkan
3. Mudah dibuat atau sudah tersedia
4. Relevan dengan pain point target market

Untuk setiap bonus berikan:
- Nama bonus yang menarik
- Deskripsi singkat (1-2 kalimat)
- Nilai yang bisa dikomunikasikan (contoh: "senilai Rp 500.000")
- Mengapa bonus ini berharga untuk target market
- Cara mengemas bonus ini agar terlihat premium

Bonus: Buat juga "Stacking Script" - cara menyajikan semua bonus ini dalam urutan yang maksimalkan persepsi nilai.`,
  },
  {
    id: "9",
    title: "Framework RISEN untuk Prompt Sempurna",
    category: "business",
    icon: Lightbulb,
    description: "Template meta-prompt untuk menghasilkan output AI terbaik",
    prompt: `Gunakan framework RISEN untuk semua prompt kamu:

R - ROLE (Peran)
"Kamu adalah [profesi/ahli spesifik] dengan [pengalaman/keahlian]"

I - INSTRUCTION (Instruksi)
"[Tugas spesifik yang harus dilakukan, kata kerja yang jelas]"

S - STEPS (Langkah)
"Lakukan ini dengan urutan:
1. [langkah pertama]
2. [langkah kedua]
3. [langkah ketiga]"

E - END GOAL (Tujuan Akhir)
"Hasil akhir yang saya inginkan adalah [output spesifik]"

N - NARROWING (Pembatasan)
"Batasan yang harus diperhatikan:
- Gunakan bahasa [Indonesia/formal/casual]
- Panjang [jumlah kata/paragraf]
- Hindari [hal yang tidak diinginkan]
- Format output: [format yang diinginkan]"

---
CONTOH PENGGUNAAN:

[ROLE] Kamu adalah copywriter dengan 10 tahun pengalaman membuat iklan yang convert untuk pasar Indonesia.
[INSTRUCTION] Buat 5 headline iklan untuk produk kursus online saya.
[STEPS] 1) Identifikasi pain point utama 2) Buat hook berbasis pain point 3) Tambahkan angka spesifik 4) Test dengan formula yang berbeda
[END GOAL] 5 headline yang bisa langsung saya test di Meta Ads
[NARROWING] Bahasa Indonesia casual, max 10 kata per headline, fokus pada hasil bukan proses, hindari klaim berlebihan`,
  },
  {
    id: "10",
    title: "Buat Deskripsi Produk yang Menjual",
    category: "copywriting",
    icon: FileText,
    description: "Deskripsi produk digital yang persuasif untuk marketplace/landing page",
    prompt: `Kamu adalah copywriter e-commerce yang spesialis menulis deskripsi produk yang meningkatkan konversi minimal 30%.

Buat deskripsi produk untuk:
Nama produk: [nama produk]
Jenis produk: [e-book/kursus/template/tools]
Target pembeli: [siapa yang akan beli]
Masalah yang diselesaikan: [masalah utama]
Benefit utama: [3 benefit terpenting]
Harga: [harga produk]

Buat deskripsi dalam format:
1. HEADLINE (10-15 kata yang menarik)
2. SUB-HEADLINE (benefit dalam 1 kalimat)
3. OPENING PARAGRAPH (buat relate, agitasi masalah)
4. APA YANG KAMU DAPAT (bullet points benefit, bukan fitur)
5. UNTUK SIAPA PRODUK INI (spesifik, bukan semua orang)
6. BUKAN UNTUK SIAPA (reverse psychology)
7. TENTANG PRODUK INI (sedikit detail teknis)
8. JAMINAN (jika ada)
9. HARGA & CTA

Total: 300-500 kata. Bahasa casual tapi profesional.`,
  },
];

export default function PromptFramework() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = prompts.filter(p => {
    const matchesSearch = !search || 
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const copyPrompt = (prompt: typeof prompts[0]) => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopiedId(prompt.id);
    toast({ title: "Prompt disalin!", description: `"${prompt.title}" siap digunakan di ChatGPT.` });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Prompt Framework — Hack ChatGPT</h1>
          <p className="text-muted-foreground">100+ prompt AI terbukti untuk marketing, copywriting, riset, dan penjualan</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { value: `${prompts.length}+`, label: "Prompt Siap Pakai" },
          { value: "10x", label: "Lebih Cepat" },
          { value: "100%", label: "Langsung Pakai" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari prompt..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-prompt"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              data-testid={`button-category-${cat.id}`}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Menampilkan {filtered.length} prompt
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(prompt => (
          <Card key={prompt.id} className="hover:border-primary/40 transition-colors" data-testid={`card-prompt-${prompt.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <prompt.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm leading-tight">{prompt.title}</CardTitle>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs capitalize flex-shrink-0">
                  {categories.find(c => c.id === prompt.category)?.name}
                </Badge>
              </div>
              <CardDescription className="text-xs">{prompt.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded bg-muted text-xs font-mono line-clamp-4 text-muted-foreground mb-3">
                {prompt.prompt.split("\n").slice(0, 4).join("\n")}
                {prompt.prompt.split("\n").length > 4 && "..."}
              </div>
              <Button
                className="w-full"
                variant={copiedId === prompt.id ? "secondary" : "default"}
                size="sm"
                onClick={() => copyPrompt(prompt)}
                data-testid={`button-copy-prompt-${prompt.id}`}
              >
                <Copy className="h-3.5 w-3.5 mr-2" />
                {copiedId === prompt.id ? "Tersalin! ✓" : "Salin Prompt Lengkap"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Tidak ada prompt yang ditemukan untuk pencarian "{search}"</p>
          <Button variant="outline" className="mt-3" onClick={() => { setSearch(""); setActiveCategory("all"); }}>
            Reset Filter
          </Button>
        </div>
      )}
    </div>
  );
}
