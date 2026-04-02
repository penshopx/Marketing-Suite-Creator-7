import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, Copy, Search, MessageSquare, Megaphone, 
  FileText, BarChart3, Users, Star, Lightbulb,
  BookOpen, DollarSign, Settings, Target, ChevronDown
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
  { id: "productivity", name: "Produktivitas" },
];

const prompts = [
  {
    id: "1",
    title: "Sales Page yang Convert",
    category: "copywriting",
    icon: Megaphone,
    difficulty: "Intermediate",
    useCase: "Membuat halaman penjualan lengkap untuk produk digital",
    description: "Generate sales page lengkap dengan semua elemen persuasif — dari headline sampai CTA",
    prompt: `Kamu adalah copywriter kelas dunia dengan pengalaman 10 tahun membuat sales page yang menghasilkan jutaan dalam penjualan. Spesialisasi: produk digital untuk pasar Indonesia.

Buatkan sales page untuk:
- Produk: [nama produk]
- Target market: [deskripsi spesifik target market]
- Harga: [harga produk]
- Benefit utama: [3-5 benefit terpenting — gunakan hasil/outcome, bukan fitur]
- Masalah yang diselesaikan: [masalah spesifik yang dialami target market]
- Social proof: [testimoni, jumlah pengguna, hasil yang sudah dicapai]

Tulis sales page dengan urutan:
1. HEADLINE: Buat 3 variasi headline (berbasis manfaat, berbasis rasa takut, berbasis curiosity). Gunakan angka spesifik jika memungkinkan.
2. SUB-HEADLINE: 1-2 kalimat yang memperkuat headline dan jelaskan untuk siapa ini
3. OPENING HOOK: Agitasi masalah dalam 2-3 paragraf — buat pembaca merasa "ini tentang saya"
4. BENEFIT BULLETS: 7-10 bullet point yang dimulai dengan kata kerja aktif (Dapatkan, Kuasai, Temukan, dst)
5. FOR WHOM: 3-4 poin "Ini untuk kamu jika..." yang sangat spesifik
6. NOT FOR WHOM: 2-3 poin "Ini bukan untuk kamu jika..." — reverse psychology yang jujur
7. SOCIAL PROOF: Bagian testimoni (gunakan format yang bisa diisi)
8. ABOUT THE PRODUCT: Deskripsi produk dalam 1 paragraf — fokus pada transformasi
9. PRICE REVEAL: Justifikasi nilai vs harga, perbandingan dengan alternatif
10. GUARANTEE: Jaminan yang mengurangi risiko pembeli
11. FAQ: 5 pertanyaan paling umum beserta jawaban
12. FINAL CTA: Tutup dengan urgency dan CTA yang emosional

Gunakan bahasa Indonesia casual tapi profesional. Hindari klaim berlebihan. Tulis seperti berbicara ke teman.`,
  },
  {
    id: "2",
    title: "30 Ide Konten Sebulan",
    category: "content",
    icon: FileText,
    difficulty: "Beginner",
    useCase: "Isi kalender konten media sosial untuk sebulan penuh",
    description: "Generate 30 ide konten yang beragam dan engaging untuk satu bulan penuh",
    prompt: `Kamu adalah content strategist senior dengan spesialisasi konten viral untuk pasar Indonesia dan pemahaman mendalam tentang algoritma media sosial.

Buat kalender konten 30 hari untuk:
- Niche/Topik: [niche bisnis kamu — contoh: digital marketing, skincare, bisnis online]
- Platform utama: [Instagram/TikTok/Facebook/LinkedIn — pilih 1-2]
- Target audience: [deskripsi audience spesifik: usia, profesi, masalah utama]
- Tujuan bisnis: [awareness/trust building/penjualan]
- Produk/Jasa yang dijual: [deskripsi singkat]

Untuk setiap dari 30 ide konten, berikan:
① HOOK (1 kalimat pembuka yang menarik)
② FORMAT (carousel/single image/Reels/TikTok/text post)
③ ANGLE (angle spesifik yang digunakan)
④ KEY MESSAGE (pesan utama yang ingin disampaikan)
⑤ CTA (ajakan bertindak yang sesuai)

Buat mix konten berikut setiap minggu:
- EDUKASI (40%): Tips, how-to, FAQ, myth busting, behind the scenes
- INSPIRASI (25%): Kisah sukses, motivasi, quote relevan dengan konteks
- ENGAGEMENT (20%): Poll, pertanyaan, challenge, konten interaktif
- SOFT SELL (10%): Review jujur, demo, before-after
- HARD SELL (5%): Promo, penawaran terbatas, CTA langsung

Tambahkan juga:
- 5 hook terkuat yang bisa langsung dipakai untuk caption
- 3 format konten yang paling efektif untuk niche ini
- Jadwal posting optimal (hari dan jam)`,
  },
  {
    id: "3",
    title: "Riset Kompetitor & Gap Pasar",
    category: "research",
    icon: BarChart3,
    difficulty: "Advanced",
    useCase: "Analisis lengkap kompetitor dan temukan peluang yang belum dimanfaatkan",
    description: "Analisis kompetitor mendalam dan identifikasi peluang di pasar yang bisa langsung dieksekusi",
    prompt: `Kamu adalah business analyst dan market intelligence expert dengan pengalaman 15 tahun di pasar digital Asia Tenggara.

Lakukan analisis kompetitif mendalam untuk:
- Bisnis/Produk saya: [deskripsi lengkap bisnis atau produk kamu]
- Kompetitor yang sudah diketahui: [list nama kompetitor, boleh kosong]
- Target pasar: [niche, segmen, dan geografi yang ditarget]
- Keunggulan yang saya miliki: [apa yang kamu sudah punya — skill, modal, network, konten]

Buat analisis dalam format berikut:

BAGIAN 1 — LANDSCAPE KOMPETITOR
- Peta 5 jenis kompetitor (langsung, tidak langsung, substitut, baru, potensial)
- Positioning matrix (harga vs kualitas vs USP)
- Kelemahan paling umum yang ada di kompetitor di niche ini

BAGIAN 2 — GAP ANALYSIS
- 5 peluang yang belum dimanfaatkan kompetitor (spesifik dan actionable)
- Segmen audience yang underserved
- Channel marketing yang masih kosong/underutilized

BAGIAN 3 — POSITIONING STRATEGY
- 3 opsi positioning yang bisa membedakan kamu dari kompetitor
- USP (Unique Selling Proposition) yang paling kuat berdasarkan gap yang ditemukan
- Harga optimal berdasarkan positioning yang dipilih

BAGIAN 4 — ACTION PLAN
- 3 langkah pertama yang bisa dilakukan minggu ini
- Metrics yang harus dipantau setiap minggu
- Early warning signs jika strategi perlu diubah

Format output: gunakan heading yang jelas, bullet points, dan tabel jika diperlukan.`,
  },
  {
    id: "4",
    title: "Caption Iklan Multi-Platform",
    category: "marketing",
    icon: Megaphone,
    difficulty: "Beginner",
    useCase: "Buat satu set caption iklan untuk semua platform sekaligus",
    description: "Generate variasi caption iklan yang dioptimasi untuk karakteristik masing-masing platform",
    prompt: `Kamu adalah performance copywriter spesialis iklan digital untuk pasar Indonesia, dengan track record menghasilkan iklan dengan CTR 3-5% dan ROAS 2-4x.

Buat set caption iklan untuk:
- Produk/Layanan: [nama dan deskripsi singkat produk]
- Benefit utama: [1-2 benefit terpenting — outcome yang nyata]
- Target audience: [deskripsi spesifik: siapa, masalah apa, impian apa]
- Harga produk: [harga — untuk framing nilai]
- CTA yang diinginkan: [beli sekarang/klik link/DM/daftar]

Buat 1 variasi caption yang dioptimasi untuk masing-masing:

FACEBOOK ADS (150-300 kata):
- Gunakan storytelling personal yang relatable
- Agitasi masalah di paragraf pertama
- Transisi ke solusi secara natural
- Tambahkan social proof (angka spesifik)
- CTA dengan framing benefit, bukan perintah

INSTAGRAM ADS + HASHTAG (80-150 kata):
- Hook visual dalam 1 baris pertama
- Konten yang complementary dengan visual
- Buat line break yang enak dibaca di mobile
- 10-15 hashtag relevan (mix populer + niche)

TIKTOK ADS CAPTION (40-60 kata):
- Energik, direct, FOMO-driven
- Bahasa yang digunakan Gen Z tapi bisa diterima semua usia
- Gunakan angka spesifik dan kata-kata trigger

WHATSAPP BROADCAST (100-180 kata):
- Tone personal dan conversational
- Dimulai seperti pesan dari teman
- Tidak terlalu formal, hindari kata "Kami" — gunakan "Saya"
- CTA yang lembut di akhir

Untuk setiap variasi, tambahkan CATATAN mengapa pendekatan ini dipilih untuk platform tersebut.`,
  },
  {
    id: "5",
    title: "Script Video Iklan 15-60 Detik",
    category: "content",
    icon: FileText,
    difficulty: "Intermediate",
    useCase: "Script lengkap video iklan untuk TikTok, Reels, atau YouTube Shorts",
    description: "Script video iklan yang terstruktur dengan hook kuat, storytelling, dan CTA yang efektif",
    prompt: `Kamu adalah video scriptwriter dan creative director yang spesialis membuat iklan video pendek yang viral sekaligus convert di platform vertikal (TikTok, Instagram Reels, YouTube Shorts).

Buat script video iklan untuk:
- Produk/Layanan: [nama dan deskripsi]
- Durasi target: [15 / 30 / 60 detik]
- Platform: [TikTok / Instagram Reels / YouTube Shorts]
- Masalah yang diselesaikan: [masalah yang paling relatable untuk target market]
- Benefit utama: [benefit yang paling impactful]
- Persona yang akan membawakan: [profesional / biasa / quirky / storyteller]

Format script (wajib ikuti urutan ini):
═══════════════════════════════
HOOK [0-3 detik]:
[VISUAL]: ...
[NARASI]: ...
[TEXT OVERLAY]: ...
Catatan: Hook harus membuat orang BERHENTI SCROLL — gunakan salah satu: shock value, pertanyaan relatable, before-after, atau kontradiksi

MASALAH [3-10 detik]:
[VISUAL]: ...
[NARASI]: ...
Catatan: Buat penonton bilang "itu saya banget!"

SOLUSI/PRODUK [10-30 detik]:
[VISUAL]: ...
[NARASI]: ...
[TEXT OVERLAY]: ...
Catatan: Fokus pada TRANSFORMASI, bukan fitur. Tunjukkan hasil, bukan cara kerja.

SOCIAL PROOF [30-45 detik]:
[VISUAL]: ...
[NARASI]: ...
Catatan: Gunakan angka spesifik, bukan kata-kata umum seperti "banyak orang"

CTA [45-60 detik]:
[VISUAL]: ...
[NARASI]: ...
[TEXT OVERLAY]: ...
Catatan: CTA harus punya 1 tindakan yang jelas — jangan berikan pilihan
═══════════════════════════════

Setelah script utama, tambahkan:
- 3 variasi hook alternatif untuk A/B testing
- Catatan teknis (angle kamera, transisi, musik)
- Tips untuk talent yang akan membawakan`,
  },
  {
    id: "6",
    title: "Email Sequence 7 Hari (Nurturing ke Penjualan)",
    category: "sales",
    icon: MessageSquare,
    difficulty: "Advanced",
    useCase: "Buat sequence email lengkap dari welcome sampai closing",
    description: "Sequence 7 email yang membangun trust dan mengkonversi subscriber menjadi pembeli",
    prompt: `Kamu adalah email marketing specialist dengan keahlian membuat sequence email yang memiliki open rate 35-50% dan conversion rate 3-8% untuk produk digital Indonesia.

Buat email sequence 7 email untuk:
- Produk: [nama produk]
- Harga produk: [harga — untuk konteks framing]
- Target subscriber: [siapa yang subscribe — apa yang mereka inginkan]
- Lead magnet yang digunakan: [apa yang mereka dapatkan gratis saat subscribe]
- Tujuan sequence: [jual langsung / nurturing jangka panjang / re-engagement]

Untuk SETIAP email, berikan:
─────────────────────────
EMAIL [Nomor]: [Nama Email]
TIMING: Dikirim hari ke-[X] setelah subscribe
TUJUAN: [apa yang ingin dicapai dengan email ini]

SUBJECT LINE: [subject utama]
Alt A: [variasi 1 untuk A/B test]
Alt B: [variasi 2 untuk A/B test]

PREVIEW TEXT: [30-90 karakter yang muncul di inbox]

OPENING (1 paragraf): [mulai dengan hook personal]
BODY (2-4 paragraf): [konten utama — value, story, atau solusi]
BRIDGE (1 paragraf): [transisi natural ke produk jika relevan]
CTA: [1 tindakan yang jelas]
PS: [pesan tambahan di post-script — sering paling dibaca]
─────────────────────────

Sequence:
Email 1 (Hari 0): Welcome + Quick Win (berikan nilai langsung)
Email 2 (Hari 1): Story personal + identifikasi masalah besar
Email 3 (Hari 3): Solusi + teaser produk secara halus
Email 4 (Hari 5): Social proof + bukti nyata + overcome objeksi umum
Email 5 (Hari 7): Perkenalan formal produk + penawaran khusus subscriber
Email 6 (Hari 9): Urgency + last chance + testimonial kuat
Email 7 (Hari 11): Nilai tambah jika belum beli, atau upsell jika sudah beli

Tone: personal, conversational, seperti newsletter dari teman yang kamu hormati. Hindari bahasa marketing yang terlalu formal.`,
  },
  {
    id: "7",
    title: "Profil Customer Ideal (ICP) Mendalam",
    category: "research",
    icon: Users,
    difficulty: "Intermediate",
    useCase: "Memahami target market secara mendalam untuk semua keputusan marketing",
    description: "Buat profil customer ideal yang sangat detail — landasan dari semua strategi marketing yang efektif",
    prompt: `Kamu adalah consumer psychologist dan market researcher dengan spesialisasi perilaku konsumen digital Indonesia dan ASEAN.

Buat profil Ideal Customer Profile (ICP) yang komprehensif untuk:
- Produk/Bisnis: [deskripsi lengkap produk dan model bisnis]
- Segmen yang ingin ditarget: [gambaran awal siapa target kamu]
- Masalah utama yang diselesaikan produk: [core problem]

Susun profil dalam format ini:

BAGIAN 1 — IDENTITAS
• Nama persona (berikan nama, buat terasa nyata)
• Rentang usia, gender, status pernikahan
• Pekerjaan, jabatan, penghasilan bulanan
• Lokasi (kota tier 1/2/3, urban/suburban)
• Gaya hidup sehari-hari

BAGIAN 2 — PSIKOGRAFI MENDALAM
• Top 3 aspirasi hidup jangka panjang
• Top 3 ketakutan terbesar (terkait dan tidak terkait produk)
• Nilai-nilai yang dipegang kuat
• Self-identity: bagaimana mereka melihat diri sendiri vs kenyataan
• Siapa "heroes" mereka (tokoh yang dikagumi)

BAGIAN 3 — PERILAKU DIGITAL
• Platform media sosial utama + intensitas penggunaan per platform
• Jenis konten yang paling banyak dikonsumsi
• Influencer/kreator yang diikuti (sebutkan contoh tipe, bukan nama spesifik)
• Waktu online paling aktif (hari dan jam)
• Cara mereka riset sebelum membeli produk

BAGIAN 4 — JOURNEY PEMBELIAN
• Trigger yang memulai pencarian solusi
• Sumber informasi yang dipercaya
• 5 objeksi paling umum sebelum membeli
• Deal breakers (hal yang pasti bikin tidak jadi beli)
• Apa yang akhirnya mendorong keputusan membeli

BAGIAN 5 — BAHASA & KOMUNIKASI
• Kata-kata dan frase yang beresonansi kuat (gunakan ini dalam iklan)
• Kata-kata yang harus DIHINDARI (terdengar inauthentic)
• Tone komunikasi yang disukai (formal/casual/teman/mentor)
• 5 headline iklan yang paling mungkin membuat mereka berhenti scroll

BAGIAN 6 — INSIGHT MARKETING
• Channel yang paling efektif dan rekomendasi pendekatan per channel
• Waktu terbaik untuk beriklan/posting
• Format konten yang paling likely direspon
• 3 pesan marketing yang paling powerful untuk persona ini`,
  },
  {
    id: "8",
    title: "Paket Bonus yang Irresistible",
    category: "sales",
    icon: Star,
    difficulty: "Beginner",
    useCase: "Buat paket bonus yang meningkatkan nilai produk dan mendorong keputusan beli",
    description: "Strategi bonus yang membuat penawaran tidak bisa ditolak tanpa meningkatkan biaya produksi",
    prompt: `Kamu adalah product strategist dan offer architect yang ahli membuat penawaran irresistible — penawaran yang membuat calon pembeli merasa "bodoh" jika tidak beli.

Buat strategi bonus untuk:
- Produk utama: [nama, deskripsi singkat, dan harga]
- Target market: [deskripsi target]
- Pain point utama: [masalah yang paling ingin diselesaikan]
- Hasil/transformasi yang dijanjikan: [apa yang terjadi setelah pakai produk]

BAGIAN 1 — AUDIT PENAWARAN SAAT INI
Identifikasi "lubang" dalam penawaran yang membuat calon pembeli ragu.

BAGIAN 2 — 7 IDE BONUS YANG MELENGKAPI
Untuk setiap bonus, berikan:
• Nama bonus (menarik, berikan nilai persepsi)
• Deskripsi singkat (1-2 kalimat — fokus pada hasil)
• Nilai yang dikomunikasikan: "Senilai Rp ___" (buat realistis tapi impresif)
• Mengapa bonus ini menyelesaikan kekhawatiran spesifik calon pembeli
• Format delivery (PDF, video, template, checklist, akses grup, dll)
• Estimasi waktu produksi jika harus dibuat dari nol

BAGIAN 3 — BONUS STACKING SCRIPT
Cara mempresentasikan semua bonus dalam urutan yang memaksimalkan persepsi nilai:
"Saat kamu ambil [nama produk] hari ini, kamu juga mendapatkan..."
[Tuliskan script lengkapnya]

BAGIAN 4 — VALUE STACKING TABEL
Buat tabel perbandingan nilai vs harga:
| Item | Nilai Normal | Kamu Bayar |
|------|-------------|------------|
...

BAGIAN 5 — FAST ACTION BONUS
1-2 bonus eksklusif untuk yang beli dalam X jam — menciptakan urgency tanpa scarcity palsu.`,
  },
  {
    id: "9",
    title: "Framework RISEN: Prompt Master",
    category: "business",
    icon: Lightbulb,
    difficulty: "Beginner",
    useCase: "Panduan membuat prompt AI yang sempurna untuk hasil terbaik",
    description: "Framework universal untuk menulis prompt AI yang menghasilkan output berkualitas tinggi setiap saat",
    prompt: `FRAMEWORK RISEN — CARA MENULIS PROMPT AI YANG SEMPURNA

Gunakan framework ini setiap kali berinteraksi dengan AI (ChatGPT, Claude, Gemini, dll):

═══════ R — ROLE (Peran) ═══════
"Kamu adalah [profesi/ahli spesifik] dengan [X tahun] pengalaman dalam [bidang spesifik], yang telah [pencapaian konkret]."

MENGAPA PENTING: AI akan "masuk karakter" dan menggunakan vocabulary, pendekatan, dan kedalaman yang sesuai dengan profesi yang disebutkan.

CONTOH BURUK: "Kamu adalah ahli marketing"
CONTOH BAGUS: "Kamu adalah growth marketer dengan 8 tahun pengalaman di startup Asia Tenggara, yang telah membantu 20+ brand mencapai 6 angka dalam penjualan digital."

═══════ I — INSTRUCTION (Instruksi) ═══════
"[Kata kerja aktif yang jelas] [output spesifik] untuk [konteks/tujuan]."

MENGAPA PENTING: Instruksi yang ambigu = output yang ambigu. Satu kata kerja yang jelas jauh lebih efektif dari paragraf panjang.

HINDARI: "bantu saya dengan marketing"
GUNAKAN: "Buat 5 headline iklan berbasis benefit untuk kampanye Meta Ads produk skincare organik saya"

═══════ S — STEPS (Langkah) ═══════
"Lakukan dalam urutan ini:
1. Pertama, [langkah 1]
2. Kemudian, [langkah 2]
3. Setelah itu, [langkah 3]"

MENGAPA PENTING: Memberikan struktur berpikir yang harus diikuti AI, menghasilkan output yang lebih logis dan terstruktur.

═══════ E — END GOAL (Tujuan Akhir) ═══════
"Hasil akhir yang saya butuhkan adalah [format output yang sangat spesifik] yang bisa langsung saya [gunakan/kirim/publish/test]."

═══════ N — NARROWING (Pembatasan) ═══════
"Batasan dan format yang harus diikuti:
✓ Gunakan bahasa [Indonesia casual/formal/Inggris]
✓ Panjang: [jumlah kata/paragraf/poin]
✓ Format: [bullet points/paragraf/tabel/numbered list]
✗ Hindari: [jargon tertentu/klaim berlebihan/bahasa formal]
✗ Jangan gunakan: [placeholder seperti 'masukkan nama' — isi langsung]"

═══════ CONTOH PROMPT RISEN LENGKAP ═══════
[ROLE] Kamu adalah conversion copywriter spesialis produk digital Indonesia dengan 10 tahun pengalaman dan track record sales page dengan konversi 3-5%.
[INSTRUCTION] Buat 5 headline untuk sales page kursus TikTok Ads saya.
[STEPS] 1) Identifikasi pain point utama target market (dropshipper pemula), 2) Buat hook berbasis pain point, 3) Tambahkan benefit spesifik dengan angka, 4) Test berbagai formula (benefit/fear/curiosity/social proof), 5) Urutkan dari paling kuat ke paling ringan.
[END GOAL] 5 headline yang bisa langsung saya A/B test di landing page saya, beserta penjelasan singkat mengapa setiap headline dipilih.
[NARROWING] Bahasa Indonesia casual, max 12 kata per headline, fokus pada hasil bukan proses, hindari klaim "terbaik" atau "nomor 1", tambahkan angka spesifik jika memungkinkan.`,
  },
  {
    id: "10",
    title: "Deskripsi Produk yang Menjual",
    category: "copywriting",
    icon: FileText,
    difficulty: "Beginner",
    useCase: "Deskripsi produk digital untuk marketplace, landing page, atau bio link",
    description: "Deskripsi produk persuasif yang meningkatkan konversi dengan memfokuskan pada transformasi",
    prompt: `Kamu adalah e-commerce copywriter yang spesialis menulis deskripsi produk digital yang meningkatkan konversi minimal 40%. Telah menulis untuk 200+ produk digital di marketplace Indonesia.

Buat deskripsi produk untuk:
- Nama produk: [nama produk]
- Jenis produk: [e-book / video course / template pack / software / membership]
- Target pembeli: [siapa yang akan beli — spesifik]
- Masalah utama yang diselesaikan: [pain point #1]
- Benefit utama (3 terpenting): [benefit 1, 2, 3]
- Harga: [harga produk]
- Platform: [Lynk.id / Tokopedia / Gumroad / Landing Page]

Buat deskripsi produk dalam format ini:

──────── HEADLINE ────────
(10-15 kata yang menarik perhatian dan langsung menyampaikan benefit utama)

──────── SUB-HEADLINE ────────
(1 kalimat yang memperjelas untuk siapa ini dan apa yang mereka dapatkan)

──────── OPENING PARAGRAPH ────────
(2-3 kalimat yang membuat pembaca merasa masalah mereka dipahami)

──────── APA YANG KAMU DAPAT ────────
(7-10 bullet point, mulai dengan kata kerja, fokus pada HASIL bukan FITUR)
• Dapatkan...
• Kuasai...
• Temukan...

──────── INI UNTUK KAMU JIKA... ────────
(3-4 kondisi yang sangat spesifik — self-qualification yang kuat)
✓ Kamu merasa...
✓ Kamu sudah pernah...
✓ Kamu ingin...

──────── BUKAN UNTUK KAMU JIKA... ────────
(2-3 poin — reverse psychology yang membangun kredibilitas)
✗ Kamu mengharapkan hasil tanpa usaha
✗ Kamu sudah expert di...

──────── TENTANG PRODUK ────────
(1 paragraf — fokus pada TRANSFORMASI yang terjadi setelah menggunakan produk)

──────── HARGA & PENAWARAN ────────
(Framing harga vs nilai, bandingkan dengan alternatif lain)

──────── CTA ────────
(Kalimat penutup dengan urgency yang masuk akal)`,
  },
  {
    id: "11",
    title: "Strategi Pricing Produk Digital",
    category: "business",
    icon: DollarSign,
    difficulty: "Intermediate",
    useCase: "Tentukan harga produk digital yang optimal untuk maximumkan revenue",
    description: "Analisis dan strategi penetapan harga produk digital berdasarkan nilai, pasar, dan psikologi pembeli",
    prompt: `Kamu adalah pricing strategist dengan spesialisasi produk digital dan SaaS di pasar Asia Tenggara, dengan pengalaman membantu 50+ bisnis mengoptimalkan revenue melalui strategi pricing yang tepat.

Buat analisis dan strategi pricing untuk:
- Produk: [nama dan deskripsi produk]
- Kompetitor yang diketahui: [nama kompetitor dan harga mereka jika tahu]
- Target market: [siapa pembelinya — pendapatan bulanan rata-rata]
- Nilai utama yang ditawarkan: [transformasi atau hasil yang didapat pembeli]
- Biaya produksi/modal: [berapa biaya untuk membuat/mendapatkan produk ini]
- Target profit margin: [persentase atau nominal yang diinginkan]

Analisis mencakup:

BAGIAN 1 — AUDIT HARGA KOMPETITOR
- Mapping harga kompetitor (rendah, menengah, premium)
- Analisis value proposition masing-masing tier
- Gap pricing yang bisa dimanfaatkan

BAGIAN 2 — PSIKOLOGI HARGA
- Analisis price anchoring yang tepat untuk produk ini
- Charm pricing vs round number — mana yang lebih efektif dan mengapa
- Framing harga per hari/minggu untuk membuat harga terasa lebih terjangkau

BAGIAN 3 — STRATEGI TIER PRICING
Buat 3 tier pricing (Good-Better-Best):
• Tier 1 (Entry): Harga, isi, dan target segment
• Tier 2 (Core): Harga, isi, dan target segment
• Tier 3 (Premium): Harga, isi, dan target segment

BAGIAN 4 — STRATEGI LAUNCH PRICING
- Harga perkenalan yang tepat dan alasan strategisnya
- Kapan dan berapa kenaikan harga pertama
- Cara mengkomunikasikan kenaikan harga kepada audience

BAGIAN 5 — REVENUE OPTIMIZATION
- Bundle strategy untuk meningkatkan average order value
- Upsell dan cross-sell yang natural
- Proyeksi revenue pada berbagai skenario penjualan

REKOMENDASIKAN harga akhir beserta justifikasi lengkap berdasarkan semua faktor di atas.`,
  },
  {
    id: "12",
    title: "Strategi WhatsApp Marketing",
    category: "marketing",
    icon: MessageSquare,
    difficulty: "Beginner",
    useCase: "Maksimalkan penjualan melalui WhatsApp — channel dengan konversi tertinggi",
    description: "Sistem WhatsApp marketing lengkap: dari membangun list sampai closing deal",
    prompt: `Kamu adalah WhatsApp marketing expert yang telah membantu ratusan UMKM dan penjual produk digital Indonesia membangun sistem penjualan via WhatsApp dengan konversi 5-15%.

Buat sistem WhatsApp marketing untuk:
- Produk yang dijual: [nama dan deskripsi produk]
- Target market: [siapa yang akan direach via WA]
- Database WA yang sudah ada: [jumlah kontak / belum ada]
- Budget iklan (jika ada): [budget iklan untuk dapat leads]

BAGIAN 1 — MEMBANGUN DATABASE BERKUALITAS
• Cara organik mendapatkan nomor WA calon pembeli (tanpa spam)
• Lead magnet terbaik untuk niche kamu
• Cara opt-in yang tepat agar tidak dianggap spam
• Cara segmentasi kontak (panas/hangat/dingin)

BAGIAN 2 — SCRIPT OPENING YANG CONVERT
Buat 3 variasi pesan pertama untuk:
• Leads dari iklan (belum kenal kamu)
• Kenalan/follower yang tertarik
• Referral dari pembeli sebelumnya

Format setiap script:
[OPENING] → [RAPPORT] → [QUALIFYING QUESTION] → [NEXT STEP]

BAGIAN 3 — SISTEM BROADCAST MINGGUAN
• Jadwal dan frekuensi broadcast yang optimal
• Mix konten: value/soft sell/hard sell per minggu
• Template broadcast untuk: promo, konten value, testimoni, follow-up

BAGIAN 4 — FOLLOW-UP SYSTEM
• Script follow-up untuk yang tidak reply (hari ke 1, 3, 7)
• Script handle objeksi via WA (harga mahal, belum ada waktu, masih pikir-pikir)
• Script closing yang natural

BAGIAN 5 — TEMPLATE PESAN SIAP PAKAI
Buat template untuk:
① Pesan pertama ke leads baru
② Follow-up tanpa reply
③ Handle "kemahalan"
④ Handle "masih pikir-pikir"
⑤ Konfirmasi setelah pembayaran
⑥ Minta testimoni (H+3 setelah pembelian)
⑦ Referral request ke pembeli yang happy`,
  },
  {
    id: "13",
    title: "Viral Hook Library (50 Hook Siap Pakai)",
    category: "content",
    icon: Target,
    difficulty: "Beginner",
    useCase: "Bank of hooks yang bisa langsung dipakai untuk konten dan iklan",
    description: "Koleksi 50 hook proven yang terbukti menghentikan scroll dan meningkatkan engagement",
    prompt: `Kamu adalah viral content strategist dengan 10 tahun pengalaman membuat konten yang menghasilkan jutaan views di TikTok, Instagram, dan YouTube Indonesia.

Buat hook library untuk niche: [niche bisnis kamu]

Buat masing-masing 5 hook untuk 10 kategori berikut (total 50 hook):

1. SHOCKING STATEMENT HOOK
(Pernyataan mengejutkan yang membuat orang berhenti)
Template: "[Fakta mengejutkan] yang [kebanyakan orang] tidak tahu tentang [topik]"

2. CURIOSITY GAP HOOK  
(Ciptakan rasa penasaran yang hanya bisa terjawab dengan menonton/membaca)
Template: "Kenapa [orang sukses] [melakukan hal tidak terduga]? Jawabannya di bawah"

3. PAIN POINT HOOK
(Langsung sentuh masalah yang dialami target market)
Template: "Kalau kamu masih [melakukan kebiasaan buruk], ini alasan kenapa [masalah belum selesai]"

4. RELATABILITY HOOK
(Buat penonton merasa "ini gue banget!")
Template: "Siapa yang pernah [pengalaman relatable]? Ternyata itu [insight yang mengubah perspektif]"

5. NUMBER HOOK
(Gunakan angka spesifik untuk meningkatkan credibility)
Template: "[Angka spesifik] cara/alasan/fakta tentang [topik] yang [outcome]"

6. STORY HOOK
(Mulai dengan cerita yang langsung menarik)
Template: "[Waktu spesifik], saya [situasi desperate/turning point] — dan itu mengubah segalanya"

7. CONTROVERSY/CONTRAST HOOK
(Tantang conventional wisdom)
Template: "Semua orang bilang [saran umum]. Tapi saya tidak setuju, dan ini alasannya"

8. FOMO HOOK
(Fear of Missing Out yang terasa genuine)
Template: "Kalau kamu belum [tindakan/pengetahuan], kamu kehilangan [benefit besar] setiap harinya"

9. AUTHORITY HOOK
(Establish credibilitas dengan cepat)
Template: "Setelah [pengalaman/pencapaian spesifik], ini satu hal yang saya pelajari tentang [topik]"

10. QUESTION HOOK
(Pertanyaan yang langsung relevan untuk target market)
Template: "[Pertanyaan langsung yang target market pasti pernah tanyakan ke diri sendiri]?"

Untuk setiap hook, berikan:
• Teks hook lengkap yang sudah disesuaikan dengan niche
• Platform terbaik untuk hook ini
• Catatan kapan/bagaimana penggunaan optimal`,
  },
  {
    id: "14",
    title: "Rencana Konten Affiliate 30 Hari",
    category: "marketing",
    icon: BookOpen,
    difficulty: "Beginner",
    useCase: "Kalender konten affiliate yang menghasilkan komisi secara konsisten",
    description: "Sistem konten 30 hari khusus affiliate marketing yang membangun trust sebelum jualan",
    prompt: `Kamu adalah affiliate marketing strategist yang membantu content creator Indonesia menghasilkan Rp 5-50 juta/bulan dari komisi affiliate tanpa terlihat seperti sales terus-terusan.

Buat rencana konten affiliate 30 hari untuk:
- Platform utama: [Instagram / TikTok / YouTube / Blog / WhatsApp]
- Niche: [niche konten kamu]
- Produk affiliate yang dipromosikan: [nama produk dan kelebihan utamanya]
- Komisi per penjualan: [nominal atau persentase]
- Jumlah followers/subscriber saat ini: [angka]

BAGIAN 1 — STRATEGI KONTEN (RATIO VALUE:SELL)
Minggu 1: 90% value : 10% sell (bangun kepercayaan)
Minggu 2: 80% value : 20% sell (mulai warm up)
Minggu 3: 70% value : 30% sell (intensifikasi)
Minggu 4: 60% value : 40% sell (closing push)

BAGIAN 2 — KALENDER KONTEN PER HARI (30 HARI)
Untuk setiap hari, berikan:
Day [X]: [Jenis konten]
• HOOK: [1 kalimat pembuka]
• KONTEN: [ringkasan isi konten]
• AFFILIATE ANGLE: [bagaimana secara natural transisi ke produk — atau tidak jika pure value]
• FORMAT: [video/carousel/single/text]

BAGIAN 3 — 10 TEMPLATE CAPTION SIAP PAKAI
Buat template yang bisa diisi langsung, untuk:
① Pure value post (tanpa jualan)
② Soft sell (mention produk natural)
③ Review jujur
④ Before-after transformasi
⑤ Tutorial + produk sebagai tool
⑥ Comparison (produk vs alternatif)
⑦ FAQ + solusi = produk
⑧ Testimoni orang lain
⑨ Personal experience
⑩ Flash promo / limited offer

BAGIAN 4 — METRIK & TARGET
• Target klik link affiliate per minggu
• Target konversi yang realistis berdasarkan followers
• Cara track performa setiap jenis konten`,
  },
  {
    id: "15",
    title: "Sistem Produktivitas Kerja dengan AI",
    category: "productivity",
    icon: Settings,
    difficulty: "Beginner",
    useCase: "Optimalkan workflow harian menggunakan AI tools untuk bisnis online",
    description: "Rancang sistem kerja yang 3-5x lebih efisien menggunakan kombinasi AI tools yang tepat",
    prompt: `Kamu adalah productivity consultant dan AI workflow architect yang membantu entrepreneur dan freelancer mengoptimalkan pekerjaan mereka menggunakan AI tools untuk menghasilkan lebih banyak dalam waktu lebih sedikit.

Buat sistem produktivitas berbasis AI untuk:
- Jenis pekerjaan/bisnis: [deskripsi pekerjaan atau bisnis kamu]
- Tugas-tugas utama harian: [list 5-10 tugas yang paling sering dikerjakan]
- Tools yang sudah digunakan: [list tools yang sudah dipakai]
- Pain point produktivitas: [apa yang paling memakan waktu atau energi]
- Target: [ingin menghemat berapa jam per hari, atau meningkatkan output apa]

BAGIAN 1 — AUDIT WORKFLOW SAAT INI
• Identifikasi tugas yang bisa langsung diotomasi dengan AI
• Tugas yang bisa dipercepat 3-5x dengan AI
• Tugas yang tetap perlu human touch
• Estimasi waktu yang bisa dihemat per minggu

BAGIAN 2 — STACK AI YANG DIREKOMENDASIKAN
Untuk setiap tool yang direkomendasikan:
• Nama tool (prioritaskan yang ada versi gratis)
• Untuk tugas apa spesifiknya
• Prompt template untuk task spesifik kamu
• Alternatif gratis jika tool berbayar

BAGIAN 3 — TEMPLATE PROMPT HARIAN
Buat prompt siap pakai untuk 10 tugas paling umum di bisnis/pekerjaan kamu:
[Tugas]: [Prompt yang langsung bisa dipakai]

BAGIAN 4 — JADWAL KERJA IDEAL
• Morning routine yang menggunakan AI untuk planning
• Time blocking yang dioptimasi
• Batch processing tasks yang serupa
• Weekly review template berbasis AI

BAGIAN 5 — SOP (STANDARD OPERATING PROCEDURE)
Buat SOP singkat untuk proses yang paling sering diulang, dengan langkah-langkah yang memasukkan AI di titik yang tepat.`,
  },
];

const risenBuilder = {
  fields: [
    { id: "role", label: "R — Role (Peran AI)", placeholder: "contoh: copywriter dengan 10 tahun pengalaman di digital marketing Indonesia" },
    { id: "instruction", label: "I — Instruction (Tugas Spesifik)", placeholder: "contoh: Buat 5 headline iklan untuk produk kursus TikTok Ads saya" },
    { id: "steps", label: "S — Steps (Langkah-langkah)", placeholder: "contoh: 1) Identifikasi pain point, 2) Buat hook, 3) Tambahkan angka spesifik" },
    { id: "endgoal", label: "E — End Goal (Hasil yang Diinginkan)", placeholder: "contoh: 5 headline siap test di Meta Ads, dengan penjelasan singkat tiap headline" },
    { id: "narrowing", label: "N — Narrowing (Batasan & Format)", placeholder: "contoh: Bahasa Indonesia casual, max 12 kata, hindari klaim berlebihan, format bullet points" },
  ],
};

export default function PromptFramework() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<typeof prompts[0] | null>(null);
  const [risenValues, setRisenValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const filtered = prompts.filter(p => {
    const matchesSearch = !search || 
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.useCase.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const copyPrompt = (p: typeof prompts[0]) => {
    navigator.clipboard.writeText(p.prompt);
    setCopiedId(p.id);
    toast({ title: "Prompt disalin!", description: `"${p.title}" siap digunakan di ChatGPT / Claude / Gemini.` });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const buildRisenPrompt = () => {
    const { role, instruction, steps, endgoal, narrowing } = risenValues;
    if (!role && !instruction) {
      toast({ title: "Isi dulu!", description: "Minimal isi Role dan Instruction.", variant: "destructive" });
      return;
    }
    const built = [
      role ? `Kamu adalah ${role}.` : "",
      instruction ? `\n${instruction}.` : "",
      steps ? `\nLakukan dengan urutan berikut:\n${steps}` : "",
      endgoal ? `\nHasil akhir yang saya inginkan: ${endgoal}.` : "",
      narrowing ? `\nBatasan yang harus diikuti:\n${narrowing}` : "",
    ].filter(Boolean).join("");
    navigator.clipboard.writeText(built);
    toast({ title: "Prompt RISEN disalin!", description: "Prompt siap digunakan." });
  };

  const difficultyColor: Record<string, string> = {
    Beginner: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    Advanced: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Prompt Framework — Hack ChatGPT</h1>
          <p className="text-muted-foreground">Library prompt AI terbukti untuk marketing, copywriting, riset, konten, dan penjualan</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: `${prompts.length}`, label: "Prompt Siap Pakai", color: "text-primary" },
          { value: "7", label: "Kategori Tersedia", color: "text-blue-500" },
          { value: "10x", label: "Lebih Cepat Kerja", color: "text-green-500" },
          { value: "100%", label: "Gratis Digunakan", color: "text-purple-500" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="library" data-testid="tabs-prompt">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="library" data-testid="tab-library">Library Prompt</TabsTrigger>
          <TabsTrigger value="risen" data-testid="tab-risen">Builder RISEN</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4 mt-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari prompt berdasarkan judul, deskripsi, atau use case..."
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

          <p className="text-sm text-muted-foreground">
            Menampilkan <strong>{filtered.length}</strong> dari {prompts.length} prompt
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(prompt => (
              <Card key={prompt.id} className="hover:border-primary/40 transition-colors flex flex-col" data-testid={`card-prompt-${prompt.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 flex-shrink-0 mt-0.5">
                      <prompt.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-sm">{prompt.title}</CardTitle>
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {categories.find(c => c.id === prompt.category)?.name}
                        </Badge>
                        <Badge className={`text-xs ${difficultyColor[prompt.difficulty]}`}>
                          {prompt.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-xs mt-1">{prompt.description}</CardDescription>
                  <p className="text-xs text-primary/70 italic">Use case: {prompt.useCase}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="p-2.5 rounded bg-muted text-xs font-mono line-clamp-3 text-muted-foreground mb-3 leading-relaxed">
                    {prompt.prompt.split("\n").slice(0, 3).join(" ").substring(0, 150)}...
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedPrompt(prompt)}
                      data-testid={`button-view-prompt-${prompt.id}`}
                    >
                      Lihat Lengkap
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      variant={copiedId === prompt.id ? "secondary" : "default"}
                      onClick={() => copyPrompt(prompt)}
                      data-testid={`button-copy-prompt-${prompt.id}`}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      {copiedId === prompt.id ? "Tersalin ✓" : "Salin Prompt"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Tidak ada prompt yang ditemukan</p>
              <Button variant="outline" className="mt-3" onClick={() => { setSearch(""); setActiveCategory("all"); }}>
                Reset Filter
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="risen" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Prompt Builder — Framework RISEN
              </CardTitle>
              <CardDescription>
                Isi setiap elemen RISEN untuk membuat prompt yang sempurna. 
                Semakin detail kamu mengisi, semakin baik output AI yang kamu dapatkan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {risenBuilder.fields.map(field => (
                <div key={field.id} className="space-y-1.5">
                  <Label htmlFor={field.id} className="font-semibold text-sm">
                    {field.label}
                  </Label>
                  <Textarea
                    id={field.id}
                    placeholder={field.placeholder}
                    value={risenValues[field.id] || ""}
                    onChange={e => setRisenValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                    className="min-h-[70px] text-sm resize-none"
                    data-testid={`textarea-risen-${field.id}`}
                  />
                </div>
              ))}
              <Button className="w-full" onClick={buildRisenPrompt} data-testid="button-build-risen">
                <Copy className="h-4 w-4 mr-2" />
                Build & Salin Prompt RISEN
              </Button>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Tips:</strong> Tidak perlu mengisi semua kolom. Minimal isi <strong>Role</strong> dan <strong>Instruction</strong> untuk hasil yang jauh lebih baik dari prompt biasa.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cheat Sheet: Kata-Kata Trigger AI</CardTitle>
              <CardDescription>Tambahkan kata-kata ini ke prompt kamu untuk hasil yang lebih baik</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { category: "Untuk Hasil yang Lebih Detail", words: ["Berikan penjelasan step-by-step", "Sertakan contoh spesifik untuk setiap poin", "Jelaskan dengan analogi yang mudah dipahami", "Tambahkan catatan penting di setiap bagian"] },
                  { category: "Untuk Format yang Lebih Baik", words: ["Format dalam tabel jika memungkinkan", "Gunakan emoji untuk visual hierarchy", "Buat dalam format yang bisa langsung copy-paste", "Berikan dalam poin-poin singkat, bukan paragraf panjang"] },
                  { category: "Untuk Kualitas yang Lebih Tinggi", words: ["Berpikir seperti seorang expert di bidang ini", "Hindari jawaban generik — berikan yang spesifik untuk konteks saya", "Kritisi pendekatan yang kurang optimal", "Berikan alternatif jika ada pendekatan yang lebih baik"] },
                  { category: "Untuk Konteks Indonesia", words: ["Sesuaikan dengan budaya dan bahasa Indonesia", "Gunakan contoh yang relevan dengan pasar Indonesia", "Pertimbangkan regulasi dan norma bisnis Indonesia", "Gunakan platform yang populer di Indonesia"] },
                ].map((group, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{group.category}</p>
                    {group.words.map((word, wi) => (
                      <div key={wi} className="flex items-center justify-between p-2 rounded bg-muted hover:bg-muted/80 transition-colors">
                        <p className="text-xs">{word}</p>
                        <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => { navigator.clipboard.writeText(word); toast({ title: "Disalin!" }); }} data-testid={`button-copy-trigger-${i}-${wi}`}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedPrompt && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <selectedPrompt.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle>{selectedPrompt.title}</DialogTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{categories.find(c => c.id === selectedPrompt.category)?.name}</Badge>
                      <Badge className={`text-xs ${difficultyColor[selectedPrompt.difficulty]}`}>{selectedPrompt.difficulty}</Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm font-medium">Use Case:</p>
                  <p className="text-sm text-muted-foreground">{selectedPrompt.useCase}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">Prompt Lengkap:</p>
                    <Button size="sm" onClick={() => copyPrompt(selectedPrompt)} data-testid="button-copy-full-prompt">
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      {copiedId === selectedPrompt.id ? "Tersalin ✓" : "Salin Semua"}
                    </Button>
                  </div>
                  <Textarea
                    value={selectedPrompt.prompt}
                    readOnly
                    className="min-h-[350px] text-xs font-mono leading-relaxed"
                    data-testid="textarea-full-prompt"
                  />
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    <strong>Cara pakai:</strong> Salin prompt, paste ke ChatGPT/Claude/Gemini, ganti semua teks dalam [kurung siku] dengan informasi spesifik kamu, lalu tekan Enter.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
