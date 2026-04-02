import { useAuth } from "./use-auth";
import { useLocation } from "wouter";

interface PageInfo {
  path: string;
  title: string;
  description: string;
  suggestedActions: string[];
}

const PAGE_INFO: Record<string, PageInfo> = {
  "landing": {
    path: "/",
    title: "Landing Page",
    description: "Halaman selamat datang untuk pengunjung baru",
    suggestedActions: [
      "Daftar gratis sekarang",
      "Lihat fitur aplikasi",
      "Login ke akun",
    ],
  },
  "/login": {
    path: "/login",
    title: "Login",
    description: "Halaman masuk ke akun kamu",
    suggestedActions: [
      "Login dengan email dan password",
      "Daftar akun baru",
    ],
  },
  "/": {
    path: "/",
    title: "Dashboard",
    description: "Halaman utama dengan ringkasan dan akses cepat ke semua fitur",
    suggestedActions: [
      "Lihat statistik penggunaan",
      "Mulai buat iklan baru",
      "Cek fitur Winning Campaign",
    ],
  },
  "/ai-chat": {
    path: "/ai-chat",
    title: "AI Chat",
    description: "Chat dengan AI assistant untuk konsultasi marketing",
    suggestedActions: [
      "Tanya strategi marketing",
      "Minta saran copywriting",
      "Diskusikan target audience",
    ],
  },
  "/ai-expert": {
    path: "/ai-expert",
    title: "AI Expert Chat",
    description: "Chat dengan AI persona spesialis (Marketing, SEO, Copywriting, dll)",
    suggestedActions: [
      "Pilih expert yang sesuai",
      "Konsultasi SEO dengan expert",
      "Tanya tips copywriting",
    ],
  },
  "/ad-creator": {
    path: "/ad-creator",
    title: "Ad Creator",
    description: "Generate copy iklan untuk berbagai platform (Meta, TikTok, Google, dll)",
    suggestedActions: [
      "Buat iklan Facebook/Meta",
      "Generate copy Instagram",
      "Buat iklan TikTok",
    ],
  },
  "/ai-images": {
    path: "/ai-images",
    title: "AI Image Creator",
    description: "Generate gambar marketing dengan AI",
    suggestedActions: [
      "Buat gambar produk",
      "Generate banner promosi",
      "Buat visual untuk iklan",
    ],
  },
  "/ai-articles": {
    path: "/ai-articles",
    title: "AI Article Creator",
    description: "Buat artikel SEO-optimized secara otomatis",
    suggestedActions: [
      "Buat artikel blog",
      "Generate konten SEO",
      "Tulis deskripsi produk",
    ],
  },
  "/ai-banners": {
    path: "/ai-banners",
    title: "AI Banner Creator",
    description: "Desain banner untuk iklan dan promosi",
    suggestedActions: [
      "Buat banner promo",
      "Desain header website",
      "Generate banner iklan",
    ],
  },
  "/ai-video": {
    path: "/ai-video",
    title: "AI Video Creator",
    description: "Pembuatan video marketing",
    suggestedActions: [
      "Buat video promosi",
      "Generate video ads",
    ],
  },
  "/ai-tts": {
    path: "/ai-tts",
    title: "Text to Speech",
    description: "Konversi teks ke suara natural untuk voiceover",
    suggestedActions: [
      "Buat voiceover iklan",
      "Generate audio narasi",
      "Konversi script ke audio",
    ],
  },
  "/ai-stt": {
    path: "/ai-stt",
    title: "Speech to Text",
    description: "Transkripsi rekaman audio ke teks",
    suggestedActions: [
      "Transkripsi meeting",
      "Konversi podcast ke teks",
      "Buat subtitle video",
    ],
  },
  "/story-telling": {
    path: "/story-telling",
    title: "Story Telling",
    description: "Buat narasi promosi yang menarik dan engaging",
    suggestedActions: [
      "Buat brand story",
      "Generate testimoni narrative",
      "Tulis product story",
    ],
  },
  "/ai-templates": {
    path: "/ai-templates",
    title: "AI Templates",
    description: "Library template marketing siap pakai",
    suggestedActions: [
      "Pilih template email",
      "Gunakan template social media",
      "Copy template ads",
    ],
  },
  "/landing-page": {
    path: "/landing-page",
    title: "Landing Page Creator",
    description: "Generate halaman landing HTML untuk campaign",
    suggestedActions: [
      "Buat landing page produk",
      "Generate LP promo",
      "Desain halaman konversi",
    ],
  },
  "/winning-dashboard": {
    path: "/winning-dashboard",
    title: "Roadmap Winning",
    description: "Peta jalan lengkap untuk membuat campaign iklan yang sukses",
    suggestedActions: [
      "Lihat progress campaign",
      "Ikuti langkah-langkah winning",
      "Track hasil campaign",
    ],
  },
  "/winning-guide": {
    path: "/winning-guide",
    title: "Panduan Praktis",
    description: "8 prinsip fundamental iklan winning",
    suggestedActions: [
      "Pelajari hook yang menarik",
      "Pahami emotional trigger",
      "Kuasai copywriting formula",
    ],
  },
  "/ad-simulation": {
    path: "/ad-simulation",
    title: "Simulasi Beriklan",
    description: "Simulasi interaktif untuk berbagai platform iklan",
    suggestedActions: [
      "Simulasi Meta Ads",
      "Coba Instagram Ads",
      "Latihan TikTok Ads",
    ],
  },
  "/campaign-wizard": {
    path: "/campaign-wizard",
    title: "Campaign Wizard",
    description: "Proses 5 langkah: Research, Audience, Competitors, Creative, Launch",
    suggestedActions: [
      "Mulai campaign baru",
      "Lanjutkan campaign",
      "Review hasil research",
    ],
  },
  "/audience-builder": {
    path: "/audience-builder",
    title: "Audience Builder",
    description: "Buat buyer persona detail dengan bantuan AI",
    suggestedActions: [
      "Buat persona baru",
      "Analisis target market",
      "Definisikan ideal customer",
    ],
  },
  "/campaign-analyzer": {
    path: "/campaign-analyzer",
    title: "Ad Analyzer",
    description: "Analisis dan scoring copy iklan untuk improvement",
    suggestedActions: [
      "Analisis copy iklan",
      "Cek skor performa",
      "Dapatkan saran perbaikan",
    ],
  },
  "/guide-chatbot": {
    path: "/guide-chatbot",
    title: "Panduan Fitur",
    description: "Panduan lengkap penggunaan aplikasi",
    suggestedActions: [
      "Tanya fitur tertentu",
      "Minta rekomendasi",
      "Pelajari cara pakai",
    ],
  },
  "/interest-finder": {
    path: "/interest-finder",
    title: "Interest Finder AI",
    description: "Generate 80+ hidden FB/IG interests per niche — grupkan ke 5 kategori (Direct, Adjacent, Behavioral, Competitor, Demographic) dengan skor kompetisi dan ukuran audience",
    suggestedActions: [
      "Temukan interest untuk niche kamu",
      "Kirim Top Picks ke Audience Overlap",
      "Simpan interest ke Campaign Store",
    ],
  },
  "/audience-overlap": {
    path: "/audience-overlap",
    title: "Audience Overlap Analyzer",
    description: "Analisis overlap antar interest — cegah double-spend budget, dapatkan rekomendasi struktur adset optimal dan daftar interest yang perlu di-exclude",
    suggestedActions: [
      "Analisis 2–10 interests sekaligus",
      "Lihat matriks overlap antar interest",
      "Kirim ke WA Broadcast atau Customer Journey",
    ],
  },
  "/wa-broadcast": {
    path: "/wa-broadcast",
    title: "WA Broadcast Sequence",
    description: "Generate urutan pesan follow-up WhatsApp 7–30 hari untuk segmen new lead, warm lead, hot lead, past buyer, inactive, cart abandon",
    suggestedActions: [
      "Generate sequence untuk new lead",
      "Buat follow-up untuk past buyer",
      "Salin semua pesan sekaligus",
    ],
  },
  "/cs-bot-script": {
    path: "/cs-bot-script",
    title: "CS Bot Script Builder",
    description: "Generate knowledge base Q&A + alur percakapan CS siap pakai di Respond.io, Qontak, atau platform chat manapun",
    suggestedActions: [
      "Buat script untuk WhatsApp CS Bot",
      "Generate Q&A knowledge base",
      "Dapatkan rekomendasi platform bot",
    ],
  },
  "/customer-journey": {
    path: "/customer-journey",
    title: "Customer Journey Mapper",
    description: "Petakan perjalanan customer lengkap 6 tahap (Awareness → Consideration → Purchase → Retention → Advocacy) dengan touchpoint, KPI, dan idea konten tiap tahap",
    suggestedActions: [
      "Petakan journey untuk produkmu",
      "Lihat bottleneck dan cara mengatasinya",
      "Kirim ke CS Bot Script atau WA Broadcast",
    ],
  },
  "/auto-rule": {
    path: "/auto-rule",
    title: "Auto Rule Builder",
    description: "Generate 5 aturan otomatis Meta Ads Manager siap implementasi — Stop Loss, Scale Winner, Budget Protector, Frequency Cap, Saturation Detector",
    suggestedActions: [
      "Generate rules untuk campaign Meta",
      "Pelajari cara setup di Ads Manager",
      "Optimalkan berdasarkan ROAS dan CPA",
    ],
  },
  "/campaign-launcher": {
    path: "/campaign-launcher",
    title: "Campaign Launcher",
    description: "Workflow otomatis untuk launch campaign baru",
    suggestedActions: [
      "Launch campaign baru",
      "Setup workflow otomatis",
    ],
  },
  "/content-repurposer": {
    path: "/content-repurposer",
    title: "Content Repurposer",
    description: "Transform konten yang ada ke berbagai format dan platform",
    suggestedActions: [
      "Repurpose artikel ke social media",
      "Transform video script ke teks",
    ],
  },
  "/profit-lab": {
    path: "/profit-lab",
    title: "Profit Lab",
    description: "Analisis profit dan proyeksi keuangan campaign iklan",
    suggestedActions: [
      "Hitung profit margin campaign",
      "Proyeksikan ROAS yang ditargetkan",
    ],
  },
  "/video-script": {
    path: "/video-script",
    title: "Video Script",
    description: "Generate script video marketing berkualitas tinggi",
    suggestedActions: [
      "Buat script video iklan",
      "Generate video script TikTok",
    ],
  },
  "/hashtag-generator": {
    path: "/hashtag-generator",
    title: "Hashtag Generator",
    description: "Generate hashtag optimal untuk Instagram, TikTok, dan platform lainnya",
    suggestedActions: [
      "Generate hashtag untuk niche kamu",
      "Cari trending hashtag",
    ],
  },
  "/execution-plan": {
    path: "/execution-plan",
    title: "Sistem 14 Hari",
    description: "Tracker harian interaktif — dari riset hari pertama hingga penjualan hari ke-14",
    suggestedActions: [
      "Cek task hari ini",
      "Tandai task selesai",
      "Lihat progress keseluruhan",
    ],
  },
  "/campaign-report": {
    path: "/campaign-report",
    title: "Laporan Kampanye",
    description: "Generate laporan performa kampanye AI dengan format share WhatsApp ringkas atau detail",
    suggestedActions: [
      "Generate laporan campaign",
      "Share laporan ke WA",
      "Analisis performa iklan",
    ],
  },
  "/lp-html-generator": {
    path: "/lp-html-generator",
    title: "LP HTML Builder",
    description: "Generate landing page HTML lengkap siap deploy — hero, manfaat, testimoni, FAQ, CTA",
    suggestedActions: [
      "Buat landing page produk",
      "Generate LP untuk campaign",
      "Download HTML siap pakai",
    ],
  },
  "/pricing": {
    path: "/pricing",
    title: "Harga & Paket",
    description: "Pilih paket yang sesuai — Gratis, Pro Marketer (Rp 149.000/bulan), atau Enterprise (Rp 399.000/bulan)",
    suggestedActions: [
      "Lihat perbedaan paket",
      "Upgrade ke Pro",
      "Tanya tentang Enterprise",
    ],
  },
};

export interface GuideContext {
  isAuthenticated: boolean;
  userName: string | null;
  userEmail: string | null;
  currentPage: PageInfo;
  availableFeatures: string[];
  lockedFeatures: string[];
}

export function useGuideContext(): GuideContext {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  let currentPage: PageInfo;
  if (!isAuthenticated && location === "/") {
    currentPage = PAGE_INFO["landing"];
  } else {
    currentPage = PAGE_INFO[location] || {
      path: location,
      title: "Halaman",
      description: "Halaman aplikasi",
      suggestedActions: ["Jelajahi fitur", "Kembali ke dashboard"],
    };
  }

  if (!isAuthenticated) {
    return {
      isAuthenticated: false,
      userName: null,
      userEmail: null,
      currentPage,
      availableFeatures: ["Melihat Landing Page", "Login/Daftar"],
      lockedFeatures: ["Semua fitur aplikasi (perlu login terlebih dahulu)"],
    };
  }

  const allFeatures = [
    "Interest Finder AI (80+ hidden interests)",
    "Audience Overlap Analyzer",
    "Auto Rule Builder (Meta Ads)",
    "WA Broadcast Sequence",
    "CS Bot Script Builder",
    "Customer Journey Mapper",
    "Sinkronisasi Lintas Tools",
    "Campaign Wizard",
    "Audience Builder",
    "Ad Creator (semua platform)",
    "AI Image & Banner Creator",
    "Article & Story Telling Creator",
    "LP HTML Builder",
    "Ad Analyzer & Laporan Kampanye",
    "Simulasi Beriklan (6 platform)",
    "AI Chat & Expert Chat",
    "Text-to-Speech & Speech-to-Text",
    "AI Templates (30+ template)",
  ];

  return {
    isAuthenticated,
    userName: user?.firstName || null,
    userEmail: user?.email || null,
    currentPage,
    availableFeatures: allFeatures,
    lockedFeatures: [],
  };
}
