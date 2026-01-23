import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Play, ChevronRight, ChevronLeft, CheckCircle2, Target, Users, 
  DollarSign, Image, FileText, BarChart3, Sparkles, Eye, MousePointer,
  TrendingUp, Clock, Zap, AlertCircle, Lightbulb, Globe
} from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiLinkedin, SiYoutube, SiGoogle } from "react-icons/si";

type Platform = "meta" | "instagram" | "tiktok" | "linkedin" | "youtube" | "google";

interface SimulationStep {
  title: string;
  description: string;
  tips: string[];
  fields?: {
    name: string;
    type: "text" | "textarea" | "select" | "budget";
    label: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
  }[];
}

const platformData: Record<Platform, {
  name: string;
  icon: typeof SiFacebook;
  color: string;
  bgColor: string;
  description: string;
  steps: SimulationStep[];
  adFormats: { name: string; description: string; bestFor: string }[];
  bestPractices: string[];
  metrics: { name: string; benchmark: string }[];
}> = {
  meta: {
    name: "Meta Ads",
    icon: SiFacebook,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    description: "Facebook & Instagram Ads Manager - Platform iklan terbesar dengan targeting detail",
    steps: [
      {
        title: "1. Pilih Objective Campaign",
        description: "Tentukan tujuan utama campaign Anda",
        tips: [
          "Awareness: Untuk brand baru, fokus jangkauan luas",
          "Traffic: Mengarahkan pengunjung ke website",
          "Engagement: Meningkatkan interaksi (like, comment, share)",
          "Leads: Mengumpulkan data prospek",
          "Sales: Fokus konversi dan penjualan langsung",
        ],
        fields: [
          {
            name: "objective",
            type: "select",
            label: "Campaign Objective",
            options: [
              { value: "awareness", label: "Awareness - Jangkau orang baru" },
              { value: "traffic", label: "Traffic - Kunjungan website" },
              { value: "engagement", label: "Engagement - Interaksi" },
              { value: "leads", label: "Leads - Kumpulkan prospek" },
              { value: "sales", label: "Sales - Penjualan" },
            ],
          },
        ],
      },
      {
        title: "2. Setup Ad Account & Pixel",
        description: "Pastikan tracking sudah terpasang dengan benar",
        tips: [
          "Install Meta Pixel di website untuk tracking konversi",
          "Setup Conversion API untuk data yang lebih akurat",
          "Buat Custom Audience dari visitor website",
          "Setup Standard Events (ViewContent, AddToCart, Purchase)",
          "Verifikasi domain di Business Manager",
        ],
      },
      {
        title: "3. Definisikan Target Audience",
        description: "Tentukan siapa yang akan melihat iklan Anda",
        tips: [
          "Core Audience: Targeting berdasarkan demografi & interest",
          "Custom Audience: Retargeting pengunjung website atau customer",
          "Lookalike Audience: Orang mirip dengan customer terbaik Anda",
          "Mulai dengan audience 1-5 juta untuk testing",
          "Gunakan Advantage+ Audience untuk AI optimization",
        ],
        fields: [
          { name: "location", type: "text", label: "Lokasi Target", placeholder: "Indonesia, Jakarta, dll" },
          { name: "age", type: "text", label: "Range Usia", placeholder: "25-45" },
          { name: "interests", type: "text", label: "Interests", placeholder: "Bisnis, Investasi, Startup" },
        ],
      },
      {
        title: "4. Pilih Placement",
        description: "Di mana iklan Anda akan tampil",
        tips: [
          "Advantage+ Placements: Biarkan Meta optimize otomatis",
          "Manual: Pilih sendiri (Feed, Stories, Reels, dll)",
          "Mobile-first: 90%+ traffic dari mobile",
          "Stories/Reels: Format vertical 9:16 lebih engaging",
          "Hindari Audience Network untuk campaign awal",
        ],
        fields: [
          {
            name: "placement",
            type: "select",
            label: "Placement Strategy",
            options: [
              { value: "advantage", label: "Advantage+ (Recommended)" },
              { value: "feed", label: "Feed Only" },
              { value: "stories", label: "Stories & Reels" },
              { value: "manual", label: "Manual Selection" },
            ],
          },
        ],
      },
      {
        title: "5. Set Budget & Schedule",
        description: "Tentukan budget dan durasi campaign",
        tips: [
          "Testing: Minimal Rp 50.000-100.000/hari per ad set",
          "Daily Budget: Lebih fleksibel untuk testing",
          "Lifetime Budget: Untuk campaign dengan tanggal pasti",
          "Jangan ubah budget >20% sekaligus saat scaling",
          "Run minimal 7 hari untuk data yang cukup",
        ],
        fields: [
          { name: "budget", type: "budget", label: "Daily Budget", placeholder: "100000" },
          { name: "duration", type: "text", label: "Durasi (hari)", placeholder: "7" },
        ],
      },
      {
        title: "6. Buat Creative Ads",
        description: "Desain iklan yang menarik perhatian",
        tips: [
          "Hook dalam 3 detik pertama (video) atau headline (image)",
          "Test 3-5 variasi creative per ad set",
          "Gunakan UGC style untuk engagement lebih tinggi",
          "Aspect ratio: 1:1 untuk feed, 9:16 untuk stories/reels",
          "Include clear CTA button yang sesuai objective",
        ],
        fields: [
          { name: "headline", type: "text", label: "Headline", placeholder: "Dapatkan Kulit Glowing dalam 7 Hari" },
          { name: "primaryText", type: "textarea", label: "Primary Text", placeholder: "Tulis copy iklan yang menarik..." },
          { name: "cta", type: "select", label: "Call to Action", options: [
            { value: "learn_more", label: "Learn More" },
            { value: "shop_now", label: "Shop Now" },
            { value: "sign_up", label: "Sign Up" },
            { value: "contact_us", label: "Contact Us" },
            { value: "get_offer", label: "Get Offer" },
          ]},
        ],
      },
      {
        title: "7. Review & Launch",
        description: "Periksa semua setting sebelum publish",
        tips: [
          "Double check targeting, placement, dan budget",
          "Preview iklan di semua placement",
          "Pastikan landing page sudah ready dan fast loading",
          "Setup UTM parameters untuk tracking",
          "Iklan akan direview 24 jam, siapkan backup creative",
        ],
      },
    ],
    adFormats: [
      { name: "Image Ads", description: "Single image dengan text", bestFor: "Brand awareness, simple offers" },
      { name: "Video Ads", description: "Video 15-60 detik", bestFor: "Storytelling, product demo" },
      { name: "Carousel Ads", description: "Multiple images/videos", bestFor: "Multiple products, features" },
      { name: "Collection Ads", description: "Video + product catalog", bestFor: "E-commerce, instant experience" },
      { name: "Reels Ads", description: "Short vertical video", bestFor: "Young audience, high engagement" },
    ],
    bestPractices: [
      "Test audience sebelum creative, lalu test creative",
      "Gunakan Campaign Budget Optimization (CBO)",
      "Buat minimal 3 ad sets dengan targeting berbeda",
      "Kill ads dengan CTR <1% setelah 48 jam",
      "Scale winning ads dengan duplicate, bukan increase budget",
    ],
    metrics: [
      { name: "CTR", benchmark: "> 1.5%" },
      { name: "CPC", benchmark: "< Rp 2.000" },
      { name: "CPM", benchmark: "< Rp 50.000" },
      { name: "ROAS", benchmark: "> 3x" },
    ],
  },
  instagram: {
    name: "Instagram Ads",
    icon: SiInstagram,
    color: "text-pink-500",
    bgColor: "bg-gradient-to-r from-purple-500/10 to-pink-500/10",
    description: "Platform visual untuk brand lifestyle & e-commerce",
    steps: [
      {
        title: "1. Connect Instagram Business Account",
        description: "Hubungkan akun Instagram ke Facebook Business Manager",
        tips: [
          "Convert ke Business atau Creator account",
          "Hubungkan ke Facebook Page",
          "Setup Instagram Shopping jika jualan produk",
          "Lengkapi profile dengan link & contact info",
          "Pastikan akun sudah aktif dengan konten organik",
        ],
      },
      {
        title: "2. Pilih Objective yang Tepat",
        description: "IG Ads dikelola melalui Meta Ads Manager",
        tips: [
          "Engagement: Untuk meningkatkan followers & likes",
          "Traffic: Mengarahkan ke website atau landing page",
          "Messages: Untuk leads via DM atau WhatsApp",
          "Shopping: Jika sudah setup Instagram Shopping",
          "Reels views: Untuk video content viral",
        ],
        fields: [
          {
            name: "objective",
            type: "select",
            label: "Campaign Goal",
            options: [
              { value: "followers", label: "Grow Followers" },
              { value: "engagement", label: "Increase Engagement" },
              { value: "traffic", label: "Website Traffic" },
              { value: "messages", label: "Get Messages/DM" },
              { value: "sales", label: "Product Sales" },
            ],
          },
        ],
      },
      {
        title: "3. Pilih Format Iklan",
        description: "Instagram punya beberapa format unik",
        tips: [
          "Feed Post: 1:1 atau 4:5 ratio, paling versatile",
          "Stories: 9:16 full screen, 15 detik max per slide",
          "Reels: 9:16, 15-90 detik, organic feel works best",
          "Carousel: Up to 10 slides, great for storytelling",
          "Explore: Reach new audience di halaman explore",
        ],
        fields: [
          {
            name: "format",
            type: "select",
            label: "Ad Format",
            options: [
              { value: "feed", label: "Feed Image/Video" },
              { value: "stories", label: "Stories" },
              { value: "reels", label: "Reels" },
              { value: "carousel", label: "Carousel" },
              { value: "explore", label: "Explore" },
            ],
          },
        ],
      },
      {
        title: "4. Target Audience Instagram",
        description: "Fokus pada demografi dan interest yang tepat",
        tips: [
          "Instagram users cenderung 18-44 tahun",
          "Interest targeting: Fashion, Beauty, Lifestyle, Food",
          "Lookalike dari Instagram engagers",
          "Retarget orang yang interact dengan IG profile Anda",
          "Exclude existing customers untuk acquisition",
        ],
        fields: [
          { name: "age", type: "text", label: "Target Usia", placeholder: "18-35" },
          { name: "interests", type: "text", label: "Interests", placeholder: "Fashion, Beauty, Lifestyle" },
        ],
      },
      {
        title: "5. Buat Visual yang Scroll-Stopping",
        description: "Instagram adalah platform visual-first",
        tips: [
          "High quality images/videos adalah wajib",
          "Aesthetic yang konsisten dengan brand",
          "Include faces untuk engagement lebih tinggi",
          "Text minimal di image (< 20% area)",
          "Native look > obviously ads untuk Reels/Stories",
        ],
        fields: [
          { name: "caption", type: "textarea", label: "Caption", placeholder: "Tulis caption yang engaging..." },
          { name: "hashtags", type: "text", label: "Hashtags (optional)", placeholder: "#skincare #glowingskin" },
        ],
      },
      {
        title: "6. Set Budget & Launch",
        description: "Mulai dengan budget testing",
        tips: [
          "Minimal Rp 30.000/hari untuk Instagram specific",
          "Boost post organic yang sudah perform bagus",
          "Run A/B test format (Feed vs Stories vs Reels)",
          "Monitor engagement rate dan saves",
          "Best posting time: 11-13:00 atau 19-21:00",
        ],
        fields: [
          { name: "budget", type: "budget", label: "Daily Budget", placeholder: "50000" },
        ],
      },
    ],
    adFormats: [
      { name: "Feed Ads", description: "Appear in main feed", bestFor: "Brand awareness, product showcase" },
      { name: "Stories Ads", description: "Full-screen vertical", bestFor: "Flash sales, limited offers" },
      { name: "Reels Ads", description: "Short-form video", bestFor: "Young audience, viral content" },
      { name: "Carousel", description: "Swipeable images", bestFor: "Product catalog, tutorials" },
      { name: "Shopping Ads", description: "Shoppable posts", bestFor: "E-commerce, direct sales" },
    ],
    bestPractices: [
      "Maintain consistent visual aesthetic",
      "Use trending audio for Reels ads",
      "Hook dalam 1 detik pertama",
      "Include UGC dan testimonial",
      "Monitor saves dan shares sebagai signal kualitas",
    ],
    metrics: [
      { name: "Engagement Rate", benchmark: "> 3%" },
      { name: "Story Completion", benchmark: "> 70%" },
      { name: "Swipe Up Rate", benchmark: "> 1%" },
      { name: "Cost per Engagement", benchmark: "< Rp 500" },
    ],
  },
  tiktok: {
    name: "TikTok Ads",
    icon: SiTiktok,
    color: "text-black dark:text-white",
    bgColor: "bg-gradient-to-r from-cyan-500/10 to-pink-500/10",
    description: "Platform video pendek dengan reach massive ke Gen Z & Millennials",
    steps: [
      {
        title: "1. Setup TikTok Ads Manager",
        description: "Buat akun di ads.tiktok.com",
        tips: [
          "Daftar dengan email bisnis",
          "Lengkapi Business Information",
          "Setup payment method (kartu kredit/debit)",
          "Install TikTok Pixel di website",
          "Hubungkan dengan TikTok Business Account",
        ],
      },
      {
        title: "2. Pilih Advertising Objective",
        description: "TikTok menawarkan berbagai objective",
        tips: [
          "Reach: Maksimalkan jumlah orang yang melihat",
          "Traffic: Kirim orang ke website/app",
          "Video Views: Untuk brand awareness via video",
          "Lead Generation: Collect leads dengan form",
          "Conversions: Optimasi untuk pembelian/signup",
        ],
        fields: [
          {
            name: "objective",
            type: "select",
            label: "Campaign Objective",
            options: [
              { value: "reach", label: "Reach - Jangkauan maksimal" },
              { value: "traffic", label: "Traffic - Website visits" },
              { value: "video_views", label: "Video Views" },
              { value: "leads", label: "Lead Generation" },
              { value: "conversions", label: "Conversions - Sales" },
            ],
          },
        ],
      },
      {
        title: "3. Define Target Audience",
        description: "TikTok audience berbeda dengan platform lain",
        tips: [
          "Core demographic: 16-34 tahun dominan",
          "Interest targeting berdasarkan video yang ditonton",
          "Behavior targeting: creators, commenters, sharers",
          "Custom audience dari Pixel atau customer list",
          "Automatic targeting sering perform bagus di TikTok",
        ],
        fields: [
          { name: "location", type: "text", label: "Lokasi", placeholder: "Indonesia" },
          { name: "age", type: "text", label: "Usia", placeholder: "18-34" },
          { name: "interests", type: "text", label: "Interests", placeholder: "Beauty, Gaming, Fashion" },
        ],
      },
      {
        title: "4. Pilih Ad Placement",
        description: "Di mana iklan akan tampil",
        tips: [
          "TikTok: Di For You Page (FYP)",
          "Pangle: Jaringan iklan partner TikTok",
          "Automatic placement biasanya optimal",
          "Pilih TikTok only untuk kontrol lebih",
          "Exclude placements yang tidak relevant",
        ],
        fields: [
          {
            name: "placement",
            type: "select",
            label: "Placement",
            options: [
              { value: "auto", label: "Automatic Placement" },
              { value: "tiktok", label: "TikTok Only" },
              { value: "pangle", label: "Include Pangle Network" },
            ],
          },
        ],
      },
      {
        title: "5. Set Budget & Bidding",
        description: "Tentukan berapa yang mau Anda spend",
        tips: [
          "Minimum budget: $20/day atau setara Rp 300.000",
          "Lowest Cost: Biarkan TikTok optimize CPA",
          "Cost Cap: Set maksimum CPA yang Anda mau",
          "Bid Cap: Kontrol maksimum bid per action",
          "Mulai dengan Lowest Cost untuk testing",
        ],
        fields: [
          { name: "budget", type: "budget", label: "Daily Budget (Rp)", placeholder: "300000" },
          {
            name: "bidding",
            type: "select",
            label: "Bidding Strategy",
            options: [
              { value: "lowest", label: "Lowest Cost (Recommended)" },
              { value: "cost_cap", label: "Cost Cap" },
              { value: "bid_cap", label: "Bid Cap" },
            ],
          },
        ],
      },
      {
        title: "6. Create TikTok-Native Ads",
        description: "Konten yang terlihat organik adalah kunci",
        tips: [
          "DON'T make ads, make TikToks",
          "Vertical video 9:16 adalah wajib",
          "Hook dalam 1 detik pertama",
          "Gunakan trending sounds/music",
          "Include text overlay untuk silent viewing",
          "UGC style performs better than polished ads",
        ],
        fields: [
          { name: "hook", type: "text", label: "Opening Hook", placeholder: "POV: Kamu baru tau..." },
          { name: "adText", type: "textarea", label: "Ad Copy", placeholder: "Tulis script TikTok yang catchy..." },
        ],
      },
      {
        title: "7. Launch & Optimize",
        description: "Submit iklan dan monitor performa",
        tips: [
          "Review process 24-48 jam",
          "Monitor dalam 3-5 hari pertama",
          "Jangan edit ad yang sudah perform bagus",
          "Test multiple creatives (5-10 variasi)",
          "Scale dengan duplicate winning ad groups",
        ],
      },
    ],
    adFormats: [
      { name: "In-Feed Ads", description: "Muncul di FYP", bestFor: "Brand awareness, conversions" },
      { name: "TopView", description: "Full screen saat buka app", bestFor: "Maximum impact, launches" },
      { name: "Branded Hashtag", description: "Sponsored hashtag challenge", bestFor: "UGC, viral campaign" },
      { name: "Branded Effects", description: "Custom AR filters", bestFor: "Engagement, brand recall" },
      { name: "Spark Ads", description: "Boost organic TikToks", bestFor: "Authentic content, UGC" },
    ],
    bestPractices: [
      "Make content, not ads - blend with organic",
      "Use trending sounds and challenges",
      "First 1-2 seconds are everything",
      "Include clear CTA in video",
      "Test different hooks and creators",
    ],
    metrics: [
      { name: "Video View Rate", benchmark: "> 15%" },
      { name: "CTR", benchmark: "> 1%" },
      { name: "CPM", benchmark: "< Rp 30.000" },
      { name: "Watch Time", benchmark: "> 5 sec avg" },
    ],
  },
  linkedin: {
    name: "LinkedIn Ads",
    icon: SiLinkedin,
    color: "text-blue-700",
    bgColor: "bg-blue-700/10",
    description: "Platform B2B terbaik untuk professional & business targeting",
    steps: [
      {
        title: "1. Setup LinkedIn Campaign Manager",
        description: "Akses ads di linkedin.com/campaignmanager",
        tips: [
          "Hubungkan dengan LinkedIn Company Page",
          "Setup billing dengan kartu kredit",
          "Install LinkedIn Insight Tag di website",
          "Buat matched audiences dari email list",
          "Pastikan Company Page sudah optimized",
        ],
      },
      {
        title: "2. Pilih Campaign Objective",
        description: "LinkedIn fokus pada B2B goals",
        tips: [
          "Brand Awareness: Reach professional audience",
          "Website Visits: Traffic ke website/landing page",
          "Engagement: Interaksi dengan konten",
          "Video Views: Brand storytelling",
          "Lead Gen: Collect leads tanpa leave LinkedIn",
          "Conversions: Website conversions tracking",
        ],
        fields: [
          {
            name: "objective",
            type: "select",
            label: "Campaign Objective",
            options: [
              { value: "awareness", label: "Brand Awareness" },
              { value: "visits", label: "Website Visits" },
              { value: "engagement", label: "Engagement" },
              { value: "video", label: "Video Views" },
              { value: "leads", label: "Lead Generation" },
              { value: "conversions", label: "Conversions" },
            ],
          },
        ],
      },
      {
        title: "3. Define Professional Targeting",
        description: "LinkedIn punya targeting professional paling detail",
        tips: [
          "Job Title: Target posisi spesifik (CEO, Marketing Manager)",
          "Company: Target berdasarkan nama perusahaan",
          "Industry: Sektor bisnis tertentu",
          "Company Size: Startup, SMB, atau Enterprise",
          "Seniority: Entry level sampai C-Suite",
          "Skills: Berdasarkan skills di profile",
        ],
        fields: [
          { name: "jobTitle", type: "text", label: "Job Titles", placeholder: "Marketing Manager, CEO, Founder" },
          { name: "industry", type: "text", label: "Industries", placeholder: "Technology, Finance, Healthcare" },
          { name: "companySize", type: "select", label: "Company Size", options: [
            { value: "1-10", label: "1-10 employees (Startup)" },
            { value: "11-50", label: "11-50 employees" },
            { value: "51-200", label: "51-200 employees" },
            { value: "201-500", label: "201-500 employees" },
            { value: "500+", label: "500+ employees (Enterprise)" },
          ]},
        ],
      },
      {
        title: "4. Choose Ad Format",
        description: "Pilih format yang sesuai objective",
        tips: [
          "Single Image: Simple dan effective",
          "Carousel: Multiple offerings",
          "Video: Storytelling & demos",
          "Message Ads: Langsung ke inbox (Sponsored InMail)",
          "Document Ads: Share PDF/slides",
          "Lead Gen Forms: Pre-filled forms, high conversion",
        ],
        fields: [
          {
            name: "format",
            type: "select",
            label: "Ad Format",
            options: [
              { value: "image", label: "Single Image Ad" },
              { value: "carousel", label: "Carousel Ad" },
              { value: "video", label: "Video Ad" },
              { value: "message", label: "Message Ad (InMail)" },
              { value: "document", label: "Document Ad" },
              { value: "lead_form", label: "Lead Gen Form" },
            ],
          },
        ],
      },
      {
        title: "5. Set Budget & Schedule",
        description: "LinkedIn ads cenderung lebih mahal tapi high quality",
        tips: [
          "Minimum budget: $10/day (~Rp 150.000)",
          "CPC di LinkedIn bisa $2-15 tergantung targeting",
          "Worth it karena audience quality tinggi",
          "B2B sales cycle panjang, run campaign minimal 1 bulan",
          "Weekdays perform better (jam kerja)",
        ],
        fields: [
          { name: "budget", type: "budget", label: "Daily Budget (Rp)", placeholder: "500000" },
          { name: "duration", type: "text", label: "Durasi Campaign (minggu)", placeholder: "4" },
        ],
      },
      {
        title: "6. Craft Professional Content",
        description: "Tone dan style harus sesuai LinkedIn",
        tips: [
          "Professional tone, bukan casual",
          "Focus on business value proposition",
          "Include stats dan data",
          "Thought leadership content works well",
          "Clear CTA yang professional (Download Report, Request Demo)",
        ],
        fields: [
          { name: "headline", type: "text", label: "Headline", placeholder: "Transform Your Business with AI" },
          { name: "adCopy", type: "textarea", label: "Ad Copy", placeholder: "Tulis copy profesional..." },
          { name: "cta", type: "select", label: "Call to Action", options: [
            { value: "learn_more", label: "Learn More" },
            { value: "download", label: "Download" },
            { value: "register", label: "Register" },
            { value: "request_demo", label: "Request Demo" },
            { value: "contact_us", label: "Contact Us" },
          ]},
        ],
      },
    ],
    adFormats: [
      { name: "Sponsored Content", description: "Native ads di feed", bestFor: "Awareness, engagement" },
      { name: "Message Ads", description: "Direct to inbox", bestFor: "Personal outreach, events" },
      { name: "Lead Gen Forms", description: "Pre-filled lead forms", bestFor: "B2B lead generation" },
      { name: "Text Ads", description: "Simple text sidebar", bestFor: "Budget-friendly awareness" },
      { name: "Dynamic Ads", description: "Personalized ads", bestFor: "Follower growth, jobs" },
    ],
    bestPractices: [
      "Target berdasarkan job function, bukan title saja",
      "Use Lead Gen Forms untuk conversion rate tinggi",
      "Test multiple ad creatives",
      "Monitor Quality Score untuk biaya lebih rendah",
      "Retarget website visitors dengan Matched Audiences",
    ],
    metrics: [
      { name: "CTR", benchmark: "> 0.4%" },
      { name: "CPC", benchmark: "< $8 (Rp 120.000)" },
      { name: "Lead Gen Form Rate", benchmark: "> 10%" },
      { name: "CPL", benchmark: "< $50 (Rp 750.000)" },
    ],
  },
  youtube: {
    name: "YouTube Ads",
    icon: SiYoutube,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    description: "Platform video terbesar untuk brand storytelling & reach massive",
    steps: [
      {
        title: "1. Setup Google Ads Account",
        description: "YouTube Ads dikelola melalui Google Ads",
        tips: [
          "Buat akun Google Ads jika belum punya",
          "Link YouTube channel ke Google Ads",
          "Setup conversion tracking",
          "Buat remarketing lists dari YouTube viewers",
          "Pastikan channel sudah dioptimasi",
        ],
      },
      {
        title: "2. Pilih Campaign Type",
        description: "YouTube punya berbagai tipe campaign",
        tips: [
          "Video Campaigns: Untuk awareness & consideration",
          "Performance Max: AI-optimized conversions",
          "Discovery Campaigns: Muncul di search & suggestions",
          "App Campaigns: Untuk download aplikasi",
          "Shopping Campaigns: Untuk e-commerce",
        ],
        fields: [
          {
            name: "campaignType",
            type: "select",
            label: "Campaign Type",
            options: [
              { value: "video", label: "Video Campaign" },
              { value: "pmax", label: "Performance Max" },
              { value: "discovery", label: "Discovery Campaign" },
              { value: "action", label: "Video Action Campaign" },
            ],
          },
        ],
      },
      {
        title: "3. Choose Video Ad Format",
        description: "Berbagai format untuk tujuan berbeda",
        tips: [
          "Skippable In-Stream: Skip setelah 5 detik (paling common)",
          "Non-Skippable: 15-20 detik, wajib ditonton penuh",
          "Bumper Ads: 6 detik, non-skip, great for awareness",
          "In-Feed (Discovery): Muncul di search results",
          "Masthead: Premium placement di homepage",
        ],
        fields: [
          {
            name: "format",
            type: "select",
            label: "Ad Format",
            options: [
              { value: "skippable", label: "Skippable In-Stream (5s skip)" },
              { value: "non_skip", label: "Non-Skippable (15-20s)" },
              { value: "bumper", label: "Bumper Ads (6s)" },
              { value: "infeed", label: "In-Feed/Discovery" },
              { value: "shorts", label: "YouTube Shorts" },
            ],
          },
        ],
      },
      {
        title: "4. Define Targeting Options",
        description: "Kombinasi targeting untuk reach yang tepat",
        tips: [
          "Demographics: Age, gender, parental status, income",
          "Interests: Affinity audiences (broad interests)",
          "In-Market: Actively researching/buying",
          "Custom Intent: Based on search keywords",
          "Placements: Target specific channels/videos",
          "Topics: Berdasarkan topic video",
        ],
        fields: [
          { name: "demographics", type: "text", label: "Demographics", placeholder: "25-54, Parents" },
          { name: "interests", type: "text", label: "Interests/Affinity", placeholder: "Technology Enthusiasts, Foodies" },
          { name: "keywords", type: "text", label: "Keywords (untuk Custom Intent)", placeholder: "belajar bisnis, cara investasi" },
        ],
      },
      {
        title: "5. Set Budget & Bidding",
        description: "YouTube menggunakan CPV atau CPM bidding",
        tips: [
          "CPV (Cost Per View): Bayar saat orang nonton 30 detik",
          "Target CPM: Optimasi untuk impressions",
          "Target CPA: Untuk conversion-focused campaigns",
          "Average CPV di Indonesia: Rp 50-300",
          "Mulai dengan Rp 100.000-500.000/hari untuk testing",
        ],
        fields: [
          { name: "budget", type: "budget", label: "Daily Budget (Rp)", placeholder: "200000" },
          {
            name: "bidding",
            type: "select",
            label: "Bidding Strategy",
            options: [
              { value: "cpv", label: "Maximum CPV" },
              { value: "cpm", label: "Target CPM" },
              { value: "cpa", label: "Target CPA (Conversions)" },
              { value: "maximize", label: "Maximize Conversions" },
            ],
          },
        ],
      },
      {
        title: "6. Create Compelling Video Ads",
        description: "Video berkualitas adalah kunci sukses",
        tips: [
          "Hook dalam 5 detik pertama (sebelum skip button)",
          "Branding early - show logo dalam 5 detik",
          "Clear value proposition",
          "Include CTA in video dan end screen",
          "Mobile-friendly (text besar, visible)",
          "Test multiple video lengths (15s, 30s, 60s+)",
        ],
        fields: [
          { name: "hookLine", type: "text", label: "Opening Hook (5 detik)", placeholder: "Apa Anda tahu bahwa..." },
          { name: "videoConcept", type: "textarea", label: "Video Concept/Script Outline", placeholder: "Describe video concept..." },
        ],
      },
      {
        title: "7. Launch & Optimize",
        description: "Monitor performa dan optimize",
        tips: [
          "View Rate: % yang nonton lebih dari 30 detik",
          "Watch Time: Seberapa lama orang menonton",
          "Earned Actions: Likes, shares, subscribes gratis",
          "Test different audiences dan placements",
          "Exclude placements yang underperform",
        ],
      },
    ],
    adFormats: [
      { name: "Skippable In-Stream", description: "Skip after 5s", bestFor: "Awareness, consideration" },
      { name: "Non-Skippable", description: "15-20s mandatory", bestFor: "Short impactful message" },
      { name: "Bumper Ads", description: "6 second non-skip", bestFor: "Brand recall, reach" },
      { name: "In-Feed Ads", description: "Search/browse results", bestFor: "Content discovery" },
      { name: "Shorts Ads", description: "Between Shorts", bestFor: "Young audience, mobile" },
    ],
    bestPractices: [
      "Buat hook yang impossible to skip dalam 5 detik",
      "Include branding early, jangan di akhir saja",
      "Test skippable vs bumper untuk message yang sama",
      "Use YouTube Analytics untuk insights",
      "Remarketing ke orang yang sudah nonton 50%+",
    ],
    metrics: [
      { name: "View Rate", benchmark: "> 15%" },
      { name: "CPV", benchmark: "< Rp 200" },
      { name: "Watch Time", benchmark: "> 30s avg" },
      { name: "Click Rate", benchmark: "> 0.5%" },
    ],
  },
  google: {
    name: "Google Ads",
    icon: SiGoogle,
    color: "text-blue-500",
    bgColor: "bg-gradient-to-r from-blue-500/10 via-red-500/10 to-yellow-500/10",
    description: "Search & Display Ads untuk capture high-intent traffic",
    steps: [
      {
        title: "1. Setup Google Ads Account",
        description: "Mulai di ads.google.com",
        tips: [
          "Buat akun dengan email bisnis",
          "Setup billing dengan kartu kredit",
          "Link Google Analytics untuk tracking",
          "Install conversion tracking di website",
          "Setup Google Tag Manager untuk flexibility",
        ],
      },
      {
        title: "2. Pilih Campaign Type",
        description: "Google Ads punya berbagai tipe campaign",
        tips: [
          "Search: Muncul di hasil pencarian Google",
          "Display: Banner ads di website partner",
          "Shopping: Untuk produk e-commerce",
          "Performance Max: AI manages semua placement",
          "App: Untuk download aplikasi",
        ],
        fields: [
          {
            name: "campaignType",
            type: "select",
            label: "Campaign Type",
            options: [
              { value: "search", label: "Search Campaign" },
              { value: "display", label: "Display Campaign" },
              { value: "shopping", label: "Shopping Campaign" },
              { value: "pmax", label: "Performance Max" },
              { value: "discovery", label: "Discovery Campaign" },
            ],
          },
        ],
      },
      {
        title: "3. Keyword Research (untuk Search)",
        description: "Keywords adalah fondasi Search Ads",
        tips: [
          "Broad Match: Reach luas, kurang precise",
          "Phrase Match: Harus include phrase tertentu",
          "Exact Match: Paling precise, reach terbatas",
          "Gunakan Keyword Planner untuk research",
          "Target high-intent keywords (beli, harga, jual)",
          "Add negative keywords untuk filter traffic",
        ],
        fields: [
          { name: "keywords", type: "textarea", label: "Target Keywords", placeholder: "jual sepatu running\nharga sepatu nike\nbeli sneakers online" },
          { name: "negative", type: "text", label: "Negative Keywords", placeholder: "gratis, bekas, second" },
        ],
      },
      {
        title: "4. Create Ad Groups",
        description: "Organisasi keywords dalam ad groups",
        tips: [
          "Group keywords dengan tema yang sama",
          "5-20 keywords per ad group ideal",
          "Buat ad copy specific untuk setiap group",
          "Single Keyword Ad Groups (SKAG) untuk precision",
          "Use Dynamic Keyword Insertion dengan hati-hati",
        ],
        fields: [
          { name: "adGroup", type: "text", label: "Ad Group Name", placeholder: "Sepatu Running Pria" },
        ],
      },
      {
        title: "5. Write Compelling Ad Copy",
        description: "Search ads perlu copy yang compelling",
        tips: [
          "Include keyword di headline",
          "Highlight unique selling points",
          "Add numbers dan statistics",
          "Include clear CTA",
          "Use all available ad extensions",
          "Test 3+ ad variations per ad group",
        ],
        fields: [
          { name: "headline1", type: "text", label: "Headline 1 (30 char)", placeholder: "Sepatu Running Terbaik" },
          { name: "headline2", type: "text", label: "Headline 2 (30 char)", placeholder: "Diskon 50% Hari Ini" },
          { name: "headline3", type: "text", label: "Headline 3 (30 char)", placeholder: "Free Ongkir Seluruh Indonesia" },
          { name: "description1", type: "textarea", label: "Description 1 (90 char)", placeholder: "Koleksi sepatu running premium dengan teknologi terbaru..." },
          { name: "description2", type: "textarea", label: "Description 2 (90 char)", placeholder: "Garansi 1 tahun, return gratis 30 hari..." },
        ],
      },
      {
        title: "6. Set Budget & Bidding",
        description: "Budget dan bidding strategy",
        tips: [
          "Start dengan Rp 50.000-100.000/hari",
          "Manual CPC untuk kontrol penuh",
          "Target CPA untuk optimize conversions",
          "Maximize Clicks untuk traffic focus",
          "Target ROAS untuk e-commerce",
          "Use bid adjustments untuk device/location/time",
        ],
        fields: [
          { name: "budget", type: "budget", label: "Daily Budget (Rp)", placeholder: "100000" },
          {
            name: "bidding",
            type: "select",
            label: "Bidding Strategy",
            options: [
              { value: "manual", label: "Manual CPC" },
              { value: "maximize_clicks", label: "Maximize Clicks" },
              { value: "maximize_conv", label: "Maximize Conversions" },
              { value: "target_cpa", label: "Target CPA" },
              { value: "target_roas", label: "Target ROAS" },
            ],
          },
        ],
      },
      {
        title: "7. Add Extensions",
        description: "Extensions meningkatkan CTR dan Quality Score",
        tips: [
          "Sitelinks: Link ke halaman spesifik",
          "Callouts: Highlight benefits (Free Shipping, 24/7 Support)",
          "Structured Snippets: List products/services",
          "Call Extensions: Nomor telepon",
          "Location: Alamat untuk local business",
          "Price: Tampilkan harga produk",
        ],
      },
      {
        title: "8. Launch & Optimize",
        description: "Monitor dan improve performa",
        tips: [
          "Check Quality Score (target 7+)",
          "Monitor Search Terms Report",
          "Add negative keywords regularly",
          "Test ad copy variations",
          "Adjust bids based on performance",
          "Use automated rules untuk efficiency",
        ],
      },
    ],
    adFormats: [
      { name: "Text Ads", description: "Search results text", bestFor: "High-intent traffic, leads" },
      { name: "Responsive Search", description: "AI-optimized headlines", bestFor: "Testing variations" },
      { name: "Display Ads", description: "Banner across websites", bestFor: "Brand awareness, retargeting" },
      { name: "Shopping Ads", description: "Product listings", bestFor: "E-commerce, retail" },
      { name: "Performance Max", description: "All placements, AI", bestFor: "Conversions, full funnel" },
    ],
    bestPractices: [
      "Focus on Quality Score untuk biaya lebih rendah",
      "Use Search Terms Report untuk find new keywords",
      "Implement negative keywords secara regular",
      "A/B test ad copy continuously",
      "Segment campaigns by match type atau intent",
    ],
    metrics: [
      { name: "CTR", benchmark: "> 3% (Search)" },
      { name: "Quality Score", benchmark: "> 7" },
      { name: "CPC", benchmark: "< Rp 3.000" },
      { name: "Conversion Rate", benchmark: "> 3%" },
    ],
  },
};

export default function AdSimulation() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("meta");
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSimulating, setIsSimulating] = useState(false);

  const platform = platformData[selectedPlatform];
  const progress = ((currentStep + 1) / platform.steps.length) * 100;

  const handleNext = () => {
    if (currentStep < platform.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlatformChange = (p: Platform) => {
    setSelectedPlatform(p);
    setCurrentStep(0);
    setFormData({});
    setIsSimulating(false);
  };

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setCurrentStep(0);
    setFormData({});
  };

  const platforms: { id: Platform; name: string; icon: typeof SiFacebook; color: string }[] = [
    { id: "meta", name: "Meta Ads", icon: SiFacebook, color: "text-blue-600" },
    { id: "instagram", name: "Instagram", icon: SiInstagram, color: "text-pink-500" },
    { id: "tiktok", name: "TikTok", icon: SiTiktok, color: "text-black dark:text-white" },
    { id: "linkedin", name: "LinkedIn", icon: SiLinkedin, color: "text-blue-700" },
    { id: "youtube", name: "YouTube", icon: SiYoutube, color: "text-red-600" },
    { id: "google", name: "Google Ads", icon: SiGoogle, color: "text-blue-500" },
  ];

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            Simulasi Beriklan
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pelajari cara beriklan di berbagai platform dengan simulasi interaktif step-by-step
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {platforms.map((p) => (
            <Button
              key={p.id}
              variant={selectedPlatform === p.id ? "default" : "outline"}
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handlePlatformChange(p.id)}
              data-testid={`button-platform-${p.id}`}
            >
              <p.icon className={`h-6 w-6 ${selectedPlatform === p.id ? "text-white" : p.color}`} />
              <span className="text-xs">{p.name}</span>
            </Button>
          ))}
        </div>

        <Card className={platform.bgColor}>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-background">
                <platform.icon className={`h-8 w-8 ${platform.color}`} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{platform.name}</CardTitle>
                <CardDescription className="text-base">{platform.description}</CardDescription>
              </div>
              {!isSimulating && (
                <Button size="lg" onClick={handleStartSimulation} data-testid="button-start-simulation">
                  <Play className="mr-2 h-5 w-5" />
                  Mulai Simulasi
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {!isSimulating ? (
          <Tabs defaultValue="formats" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="formats">Ad Formats</TabsTrigger>
              <TabsTrigger value="practices">Best Practices</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="formats">
              <div className="grid md:grid-cols-2 gap-4">
                {platform.adFormats.map((format, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-lg">{format.name}</h4>
                      <p className="text-muted-foreground text-sm">{format.description}</p>
                      <Badge variant="secondary" className="mt-2">
                        Best for: {format.bestFor}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="practices">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {platform.bestPractices.map((practice, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{practice}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {platform.metrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{metric.name}</div>
                      <div className="text-lg font-medium text-green-600">{metric.benchmark}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Step {currentStep + 1} of {platform.steps.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {platform.steps.map((step, index) => (
                <Button
                  key={index}
                  variant={index === currentStep ? "default" : index < currentStep ? "secondary" : "outline"}
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => setCurrentStep(index)}
                >
                  {index < currentStep && <CheckCircle2 className="h-4 w-4 mr-1" />}
                  {index + 1}
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{platform.steps[currentStep].title}</CardTitle>
                <CardDescription className="text-base">
                  {platform.steps[currentStep].description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  {platform.steps[currentStep].tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>

                {platform.steps[currentStep].fields && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Coba Isi (Simulasi)
                    </h4>
                    <div className="grid gap-4">
                      {platform.steps[currentStep].fields?.map((field, index) => (
                        <div key={index} className="space-y-2">
                          <Label>{field.label}</Label>
                          {field.type === "text" && (
                            <Input
                              placeholder={field.placeholder}
                              value={formData[field.name] || ""}
                              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                              data-testid={`input-${field.name}`}
                            />
                          )}
                          {field.type === "textarea" && (
                            <Textarea
                              placeholder={field.placeholder}
                              value={formData[field.name] || ""}
                              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                              rows={3}
                              data-testid={`textarea-${field.name}`}
                            />
                          )}
                          {field.type === "select" && (
                            <Select
                              value={formData[field.name] || ""}
                              onValueChange={(value) => setFormData({ ...formData, [field.name]: value })}
                            >
                              <SelectTrigger data-testid={`select-${field.name}`}>
                                <SelectValue placeholder="Pilih..." />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {field.type === "budget" && (
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                              <Input
                                type="number"
                                placeholder={field.placeholder}
                                className="pl-10"
                                value={formData[field.name] || ""}
                                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                data-testid={`input-${field.name}`}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    data-testid="button-prev-step"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Sebelumnya
                  </Button>

                  {currentStep === platform.steps.length - 1 ? (
                    <Button onClick={() => setIsSimulating(false)} data-testid="button-finish">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Selesai
                    </Button>
                  ) : (
                    <Button onClick={handleNext} data-testid="button-next-step">
                      Selanjutnya
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">Tips Pro</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentStep === 0 && "Pilih objective yang aligned dengan business goal Anda. Jangan langsung pilih Sales kalau brand masih baru."}
                      {currentStep === 1 && "Setup tracking dengan benar adalah fondasi. Tanpa tracking, Anda tidak bisa optimize."}
                      {currentStep === 2 && "Mulai dengan audience yang cukup besar untuk testing, lalu narrow down based on data."}
                      {currentStep === 3 && "Automatic placement biasanya lebih baik untuk campaign baru karena biarkan AI optimize."}
                      {currentStep === 4 && "Jangan scale budget terlalu cepat. Max 20% increase per 3 hari untuk menjaga performance."}
                      {currentStep === 5 && "Test 3-5 variasi creative. Satu creative winning bisa mengubah seluruh campaign."}
                      {currentStep >= 6 && "Monitor daily di awal, lalu weekly setelah campaign stabil. Jangan micromanage terlalu banyak."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
