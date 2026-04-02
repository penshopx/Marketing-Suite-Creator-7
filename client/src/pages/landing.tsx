import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Zap, Target, Users, MessageSquare, Image, FileText, 
  Video, Megaphone, BarChart3, CheckCircle2, ArrowRight, Star,
  Shield, Clock, TrendingUp, Trophy, LogIn, Search, Layers,
  Send, Bot, Map, Link2, Package,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: Search,
    title: "Interest Finder AI",
    description: "Temukan 80+ hidden interest FB/IG untuk kurangi CPA hingga 90% — kompetitor tidak tahu ini",
    badge: "Adsumo",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    icon: Send,
    title: "WA Broadcast Sequence",
    description: "Generate urutan follow-up WhatsApp 7–30 hari otomatis per segmen — new lead, warm lead, past buyer",
    badge: "Cekat.AI",
    badgeColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  {
    icon: Bot,
    title: "CS Bot Script Builder",
    description: "Buat knowledge base Q&A + alur percakapan CS untuk Respond.io, Qontak dalam menit",
    badge: "Cekat.AI",
    badgeColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  {
    icon: Megaphone,
    title: "Ad Copy Generator",
    description: "Generate copy iklan untuk Meta, TikTok, Google, YouTube, dan LinkedIn yang langsung convert",
    badge: null,
    badgeColor: "",
  },
  {
    icon: Target,
    title: "Campaign Wizard",
    description: "Panduan 5 langkah dari research, audience, kompetitor, creative, sampai launch",
    badge: null,
    badgeColor: "",
  },
  {
    icon: BarChart3,
    title: "Ad Analyzer",
    description: "Analisis dan scoring iklan Anda dengan AI — dapat rekomendasi perbaikan spesifik",
    badge: null,
    badgeColor: "",
  },
  {
    icon: Map,
    title: "Customer Journey Mapper",
    description: "Petakan perjalanan customer dari awareness sampai advocacy lengkap dengan KPI dan touchpoint",
    badge: "Cekat.AI",
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    icon: Layers,
    title: "Audience Overlap Analyzer",
    description: "Analisis overlap antar interest agar budget tidak double-spend — struktur adset optimal",
    badge: "Adsumo",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    icon: Zap,
    title: "Sinkronisasi Lintas Tools",
    description: "Data produk, niche, target, dan interest otomatis mengalir dari satu tool ke tool berikutnya",
    badge: "Eksklusif",
    badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
];

const highlightFeatures = [
  "Interest Finder AI — 80+ hidden interests",
  "Audience Overlap Analyzer",
  "Auto Rule Builder — aturan Meta Ads otomatis",
  "WA Broadcast Sequence 7–30 hari",
  "CS Bot Script Builder (Respond.io, Qontak)",
  "Customer Journey Mapper 6 tahap",
  "Sinkronisasi lintas tools otomatis",
  "Campaign Wizard 5 langkah",
  "Audience Builder — buyer persona AI",
  "Ad Creator semua platform (Meta, TikTok, Google)",
  "AI Image & Banner Creator",
  "Article & Story Telling Creator",
  "Landing Page HTML Builder",
  "Ad Analyzer & Laporan Kampanye",
  "Simulasi Beriklan 6 platform",
  "AI Chat & Expert Chat",
  "Text-to-Speech & Speech-to-Text",
  "AI Templates Library (30+ template)",
];

const testimonials = [
  {
    name: "Rizky Pratama",
    role: "Performance Marketer, Jakarta",
    content: "Interest Finder AI mengubah game saya. CPA turun 60% dalam 2 minggu — niche tersembunyi yang AI temukan itu beneran nggak ketahuan kompetitor.",
    avatar: "RP",
    stars: 5,
  },
  {
    name: "Dewi Rahayu",
    role: "Owner Skincare Brand, Surabaya",
    content: "WA Broadcast Sequence 14 hari bisa diset sekali, terus jalan sendiri. Closing rate dari follow-up naik dari 12% ke 34%.",
    avatar: "DR",
    stars: 5,
  },
  {
    name: "Andi Kurniawan",
    role: "Agency Owner, Bandung",
    content: "Fitur Sinkronisasi yang bikin saya kagum — data produk isi sekali, otomatis muncul di semua tools. Client-client saya bisa onboard 3x lebih cepat.",
    avatar: "AK",
    stars: 5,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">AI Marketing Tools</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimoni</a>
              <a href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Harga</a>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="outline" size="lg" asChild>
                <a href="/pricing">Lihat Harga</a>
              </Button>
              <Button size="lg" asChild data-testid="button-login">
                <a href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Powered by GPT-5
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Buat Iklan <span className="text-primary">Winning</span> dalam Hitungan Menit
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                AI Marketing Tools Suite membantu Anda membuat iklan, artikel, dan strategi marketing 
                yang convert - tanpa perlu jadi expert copywriter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8" asChild data-testid="button-cta-hero">
                  <a href="/login">
                    Mulai Gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                  <a href="#features">Lihat Fitur</a>
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Gratis selamanya
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Tanpa kartu kredit
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <Card className="relative border-2 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-primary to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    AI Marketing Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Kamu:</p>
                    <p className="font-medium">Buatkan iklan untuk skincare yang target wanita usia 25-35</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-sm text-primary">AI Assistant:</p>
                    <p className="font-medium">"Kulit glowing bukan lagi mimpi! Serum vitamin C kami telah dibuktikan 95% user..."</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    AI sedang menulis...
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">30+</div>
              <div className="text-muted-foreground">AI Marketing Tools</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-muted-foreground">Pengguna Aktif</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">3x</div>
              <div className="text-muted-foreground">Avg ROAS Increase</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">4.9</div>
              <div className="text-muted-foreground flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Fitur Lengkap</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Semua yang Anda Butuhkan untuk Marketing Sukses
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              30+ AI tools — dari riset interest, sistem sales WA, hingga sinkronisasi data lintas tools
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate transition-all relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    {feature.badge && (
                      <Badge className={`text-xs ${feature.badgeColor}`}>{feature.badge}</Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Winning Campaign Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="px-4 py-2">
                <Trophy className="h-4 w-4 mr-2" />
                Winning Campaign System
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                Sistem Lengkap untuk Campaign yang Winning
              </h2>
              <p className="text-lg text-muted-foreground">
                Pelajari 8 prinsip fundamental iklan winning, simulasi beriklan di 6 platform, 
                dan buat campaign step-by-step dengan AI.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Panduan Praktis 8 Prinsip</h4>
                    <p className="text-muted-foreground text-sm">Hook, emotional trigger, copywriting formula, CTA, dan lainnya</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Simulasi Beriklan 6 Platform</h4>
                    <p className="text-muted-foreground text-sm">Meta, Instagram, TikTok, LinkedIn, YouTube, Google Ads</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Campaign Wizard</h4>
                    <p className="text-muted-foreground text-sm">5 langkah dari research hingga launch</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="font-semibold">Roadmap</div>
                <div className="text-sm text-muted-foreground">Progress tracking</div>
              </Card>
              <Card className="p-4 text-center">
                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="font-semibold">Panduan</div>
                <div className="text-sm text-muted-foreground">8 prinsip winning</div>
              </Card>
              <Card className="p-4 text-center">
                <Video className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="font-semibold">Simulasi</div>
                <div className="text-sm text-muted-foreground">6 platform ads</div>
              </Card>
              <Card className="p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="font-semibold">Audience</div>
                <div className="text-sm text-muted-foreground">Persona builder</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Sinkronisasi Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <Zap className="h-4 w-4 mr-2" />
              Fitur Eksklusif
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sistem Sinkronisasi Lintas Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Isi data produk sekali — otomatis terisi di semua 30+ tools. Tidak perlu input ulang.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold">Interest Finder → Audience Overlap</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">80+ interest ditemukan AI, langsung kirim ke Overlap Analyzer untuk analisis struktur adset optimal</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                  <Send className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-bold">Audience Overlap → WA Broadcast</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">Setelah adset dioptimasi, langsung generate sequence follow-up WA untuk setiap segmen audience</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                  <Map className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold">WA Broadcast → Customer Journey</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">Data produk dan target dari broadcast otomatis masuk ke Journey Mapper — petakan touchpoint tiap tahap</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="font-bold">Customer Journey → CS Bot Script</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">Touchpoint dari journey langsung jadi knowledge base Q&A untuk bot CS Anda di semua platform chat</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-background to-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-base text-green-700 dark:text-green-400">Campaign Aktif — Skincare Vitamin C</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">4 tools digunakan hari ini</p>
                </CardHeader>
                <CardContent className="space-y-2 pb-4">
                  {[
                    { tool: "Interest Finder", status: "✓ Selesai", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
                    { tool: "Audience Overlap", status: "✓ Selesai", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
                    { tool: "WA Broadcast", status: "✓ Selesai", color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30" },
                    { tool: "CS Bot Script", status: "→ Berikutnya", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
                    { tool: "Customer Journey", status: "Belum dimulai", color: "text-muted-foreground", bg: "bg-muted/50" },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg ${item.bg}`}>
                      <span className="text-sm font-medium">{item.tool}</span>
                      <span className={`text-xs font-semibold ${item.color}`}>{item.status}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* All Features Section */}
      <section id="all-features" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Akses Penuh</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Semua Fitur Tersedia
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Daftar sekarang dan akses semua fitur marketing AI tanpa batasan
            </p>
          </div>
          <Card className="border-primary border-2 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">Fitur Lengkap</CardTitle>
              <CardDescription>Semua tools AI marketing dalam satu platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="grid md:grid-cols-2 gap-3">
                {highlightFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                size="lg"
                asChild
                data-testid="button-register-cta"
              >
                <a href="/login">Daftar Sekarang</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimoni</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Apa Kata Mereka?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-elevate transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 text-sm">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Siap Membuat Iklan yang Winning?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Bergabung dengan 10,000+ marketer yang sudah menggunakan AI Marketing Tools
          </p>
          <Button size="lg" className="text-lg px-8" asChild data-testid="button-cta-bottom">
            <a href="/login">
              Mulai Gratis Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold">AI Marketing Tools</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 AI Marketing Tools. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
