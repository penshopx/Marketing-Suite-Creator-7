import { useAuth } from "./use-auth";
import { useSubscription } from "./use-subscription";
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
      "Cek paket harga",
    ],
  },
  "/login": {
    path: "/login",
    title: "Login",
    description: "Halaman masuk ke akun kamu",
    suggestedActions: [
      "Login dengan email",
      "Daftar akun baru",
      "Lupa password?",
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
    description: "Pembuatan video marketing (fitur premium Enterprise)",
    suggestedActions: [
      "Buat video promosi",
      "Generate video ads",
      "Upgrade untuk akses",
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
  "/pricing": {
    path: "/pricing",
    title: "Pricing",
    description: "Pilih paket yang sesuai dengan kebutuhan",
    suggestedActions: [
      "Bandingkan paket",
      "Upgrade ke Pro",
      "Lihat fitur Enterprise",
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
};

export interface GuideContext {
  isAuthenticated: boolean;
  userName: string | null;
  userEmail: string | null;
  subscriptionTier: string;
  isAdmin: boolean;
  isPro: boolean;
  isEnterprise: boolean;
  currentPage: PageInfo;
  availableFeatures: string[];
  lockedFeatures: string[];
}

export function useGuideContext(): GuideContext {
  const { user, isAuthenticated } = useAuth();
  const { tier, isAdmin, isPro, isEnterprise, canAccess } = useSubscription();
  const [location] = useLocation();

  // For non-authenticated users at root, show landing page context
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

  // For unauthenticated users, provide default feature lists
  // They need to login first before accessing any features
  if (!isAuthenticated) {
    return {
      isAuthenticated: false,
      userName: null,
      userEmail: null,
      subscriptionTier: "guest",
      isAdmin: false,
      isPro: false,
      isEnterprise: false,
      currentPage,
      availableFeatures: ["Melihat Landing Page", "Melihat Pricing", "Login/Daftar"],
      lockedFeatures: ["Semua fitur aplikasi (perlu login terlebih dahulu)"],
    };
  }

  const allFeatures = [
    { name: "AI Chat", key: "aiChatsPerDay", path: "/ai-chat" },
    { name: "AI Expert Chat", key: "aiChatsPerDay", path: "/ai-expert" },
    { name: "Ad Creator", key: "adCopiesPerDay", path: "/ad-creator" },
    { name: "Image Creator", key: "imageGenerations", path: "/ai-images" },
    { name: "Article Creator", key: "articleGeneration", path: "/ai-articles" },
    { name: "Banner Creator", key: "imageGenerations", path: "/ai-banners" },
    { name: "Text to Speech", key: "ttsGeneration", path: "/ai-tts" },
    { name: "Speech to Text", key: "sttTranscription", path: "/ai-stt" },
    { name: "Story Telling", key: "adCopiesPerDay", path: "/story-telling" },
    { name: "AI Templates", key: "aiChatsPerDay", path: "/ai-templates" },
    { name: "Landing Page Creator", key: "landingPageCreator", path: "/landing-page" },
    { name: "Campaign Wizard", key: "campaignWizard", path: "/campaign-wizard" },
    { name: "Audience Builder", key: "audienceBuilder", path: "/audience-builder" },
    { name: "Ad Analyzer", key: "adAnalyzer", path: "/campaign-analyzer" },
    { name: "Video Creator", key: "videoCreator", path: "/ai-video" },
  ];

  const availableFeatures: string[] = [];
  const lockedFeatures: string[] = [];

  for (const feature of allFeatures) {
    if (canAccess(feature.key as any)) {
      availableFeatures.push(feature.name);
    } else {
      lockedFeatures.push(feature.name);
    }
  }

  return {
    isAuthenticated,
    userName: user?.firstName || null,
    userEmail: user?.email || null,
    subscriptionTier: tier,
    isAdmin,
    isPro,
    isEnterprise,
    currentPage,
    availableFeatures,
    lockedFeatures,
  };
}
