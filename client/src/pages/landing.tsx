import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Zap, Target, Users, MessageSquare, Image, FileText, 
  Video, Megaphone, BarChart3, CheckCircle2, ArrowRight, Star,
  Shield, Clock, TrendingUp, Trophy
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description: "Konsultasikan strategi marketing dengan AI yang paham bisnis Anda",
  },
  {
    icon: Megaphone,
    title: "Ad Copy Generator",
    description: "Generate iklan untuk Meta, TikTok, Google, YouTube, dan LinkedIn",
  },
  {
    icon: Target,
    title: "Campaign Wizard",
    description: "Panduan step-by-step untuk membuat campaign yang winning",
  },
  {
    icon: Image,
    title: "AI Image Creator",
    description: "Generate gambar marketing berkualitas tinggi dengan AI",
  },
  {
    icon: FileText,
    title: "Article Generator",
    description: "Buat artikel SEO-optimized dalam hitungan menit",
  },
  {
    icon: BarChart3,
    title: "Ad Analyzer",
    description: "Analisis dan scoring iklan Anda untuk performa maksimal",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "Rp 0",
    period: "/bulan",
    description: "Untuk yang baru mulai",
    features: [
      "5 AI Chat/hari",
      "3 Ad Copy/hari",
      "1 Artikel/hari",
      "Akses Panduan Praktis",
      "Akses Simulasi Beriklan",
    ],
    cta: "Mulai Gratis",
    popular: false,
  },
  {
    name: "Pro",
    price: "Rp 199K",
    period: "/bulan",
    description: "Untuk marketer serius",
    features: [
      "Unlimited AI Chat",
      "Unlimited Ad Copy",
      "Unlimited Artikel",
      "AI Image Generator",
      "Campaign Wizard",
      "Audience Builder",
      "Ad Analyzer",
      "Priority Support",
    ],
    cta: "Pilih Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Rp 499K",
    period: "/bulan",
    description: "Untuk agency & tim besar",
    features: [
      "Semua fitur Pro",
      "Team Collaboration",
      "White-label Reports",
      "API Access",
      "Custom AI Training",
      "Dedicated Support",
      "SLA Guarantee",
    ],
    cta: "Hubungi Sales",
    popular: false,
  },
];

const testimonials = [
  {
    name: "Sarah Putri",
    role: "Digital Marketer",
    content: "ROAS saya naik 3x setelah pakai tool ini. AI-nya benar-benar paham cara bikin iklan yang convert!",
    avatar: "SP",
  },
  {
    name: "Budi Santoso",
    role: "E-commerce Owner",
    content: "Dulu bikin 1 iklan butuh 2 jam. Sekarang dengan AI ini, 10 menit sudah jadi 5 variasi iklan.",
    avatar: "BS",
  },
  {
    name: "Amanda Lee",
    role: "Agency Owner",
    content: "Tim saya jadi 5x lebih produktif. Fitur Campaign Wizard membantu client-client baru juga.",
    avatar: "AL",
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
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Harga</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimoni</a>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" asChild data-testid="button-login">
                <a href="/api/login">Masuk</a>
              </Button>
              <Button asChild data-testid="button-signup">
                <a href="/api/login">Daftar Gratis</a>
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
                  <a href="/api/login">
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
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-muted-foreground">Pengguna Aktif</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">500K+</div>
              <div className="text-muted-foreground">Iklan Dibuat</div>
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
              13+ AI tools yang membantu Anda dari research sampai launch campaign
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Harga Transparan</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pilih Paket yang Sesuai
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mulai gratis, upgrade kapan saja
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? "border-primary border-2 shadow-xl" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Paling Populer</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                    data-testid={`button-pricing-${plan.name.toLowerCase()}`}
                  >
                    <a href="/api/login">{plan.cta}</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
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
            <a href="/api/login">
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
