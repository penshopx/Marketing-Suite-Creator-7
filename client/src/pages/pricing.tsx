import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, Sparkles, Zap, Crown, ArrowRight, 
  MessageSquare, Image, FileText, Volume2, Megaphone,
  Target, Users, BarChart3, X, Star
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

const plans = [
  {
    id: "free",
    name: "Gratis",
    price: "Rp 0",
    period: "selamanya",
    description: "Mulai kenali semua fitur marketing AI",
    badge: null,
    badgeColor: "",
    color: "border-border",
    headerColor: "bg-muted/50",
    icon: Sparkles,
    cta: "Pakai Gratis",
    ctaVariant: "outline" as const,
    features: [
      { label: "5 AI Generate / hari", included: true },
      { label: "Akses 10 tool dasar", included: true },
      { label: "AI Chat & Expert Chat", included: true },
      { label: "Panduan Praktis & Roadmap", included: true },
      { label: "Sistem 14 Hari", included: true },
      { label: "Simulasi Beriklan", included: true },
      { label: "Unlimited AI Generate", included: false },
      { label: "Image & Banner Creator", included: false },
      { label: "Text-to-Speech & STT", included: false },
      { label: "Ekspor & simpan konten", included: false },
      { label: "Priority AI responses", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro Marketer",
    price: "Rp 149.000",
    period: "per bulan",
    description: "Semua tool tanpa batas untuk marketer serius",
    badge: "Paling Populer",
    badgeColor: "bg-primary text-primary-foreground",
    color: "border-primary border-2",
    headerColor: "bg-primary/5",
    icon: Zap,
    cta: "Upgrade ke Pro",
    ctaVariant: "default" as const,
    features: [
      { label: "Unlimited AI Generate", included: true },
      { label: "Semua 30+ AI Tools", included: true },
      { label: "Sinkronisasi lintas tools", included: true },
      { label: "AI Chat & Expert Chat", included: true },
      { label: "Interest Finder + Audience Overlap", included: true },
      { label: "WA Broadcast + CS Bot + Journey", included: true },
      { label: "Image & Banner Creator", included: true },
      { label: "Text-to-Speech & STT", included: true },
      { label: "Video Creator & LP HTML Builder", included: true },
      { label: "Ekspor & simpan konten", included: true },
      { label: "Priority AI responses", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Rp 399.000",
    period: "per bulan",
    description: "Untuk agency dan tim marketing profesional",
    badge: "Terlengkap",
    badgeColor: "bg-orange-500 text-white",
    color: "border-orange-400 border-2",
    headerColor: "bg-orange-50 dark:bg-orange-950/30",
    icon: Crown,
    cta: "Hubungi Kami",
    ctaVariant: "outline" as const,
    features: [
      { label: "Semua fitur Pro", included: true },
      { label: "Tim management (5 user)", included: true },
      { label: "API access penuh", included: true },
      { label: "Custom branding / white-label", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "Onboarding & training", included: true },
      { label: "Priority support 24/7", included: true },
      { label: "SLA 99.9% uptime", included: true },
      { label: "Laporan analytics tim", included: true },
      { label: "Integrasi webhook", included: true },
      { label: "Custom AI persona", included: true },
    ],
  },
];

const faq = [
  {
    q: "Apakah ada masa percobaan gratis untuk paket Pro?",
    a: "Ya! Setiap pengguna baru mendapatkan akses penuh ke semua fitur selama 7 hari. Setelah itu, Anda bisa pilih paket yang sesuai.",
  },
  {
    q: "Bagaimana cara upgrade atau downgrade paket?",
    a: "Kamu bisa upgrade atau downgrade kapan saja dari dashboard. Perubahan berlaku di awal siklus tagihan berikutnya.",
  },
  {
    q: "Metode pembayaran apa saja yang diterima?",
    a: "Kami menerima transfer bank (BCA, Mandiri, BNI, BRI), GoPay, OVO, Dana, dan kartu kredit/debit Visa/Mastercard.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Semua data dienkripsi dengan standar AES-256. Kami tidak pernah menjual atau membagikan data pengguna ke pihak ketiga.",
  },
  {
    q: "Bagaimana kebijakan refund?",
    a: "Kami menawarkan garansi uang kembali 14 hari jika Anda tidak puas dengan layanan kami. Tidak ada pertanyaan.",
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const { tier } = useSubscription();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const upgradeMutation = useMutation({
    mutationFn: async (plan: string) => {
      const response = await fetch("/api/auth/upgrade-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
        credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Gagal upgrade");
      }
      return response.json();
    },
    onSuccess: (_, plan) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Berhasil upgrade!",
        description: `Paket kamu berhasil diubah ke ${plan === "pro" ? "Pro Marketer" : "Enterprise"}.`,
      });
    },
    onError: (err: Error) => {
      toast({ title: "Gagal upgrade", description: err.message, variant: "destructive" });
    },
  });

  const handleCTA = (planId: string) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (planId === "free") return;
    if (planId === "enterprise") {
      window.open("mailto:support@aimarketingtools.id?subject=Enterprise%20Plan", "_blank");
      return;
    }
    if (planId === tier) {
      toast({ title: "Paket aktif", description: "Kamu sudah menggunakan paket ini." });
      return;
    }
    upgradeMutation.mutate(planId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg">AI Marketing Tools</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild size="sm">
                <Link href="/">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login">Daftar Gratis</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 text-center">
        <Badge variant="secondary" className="mb-4 px-4 py-1.5">
          <Crown className="h-4 w-4 mr-2 text-orange-500" />
          Harga Spesial untuk Marketer Indonesia
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Pilih Paket yang <span className="text-primary">Tepat</span> untuk Kamu
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Mulai gratis, upgrade kapan saja. Tidak ada biaya tersembunyi.
        </p>

        {user && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Paket aktif kamu: <strong className="text-primary capitalize">{tier === "free" ? "Gratis" : tier === "pro" ? "Pro Marketer" : "Enterprise"}</strong></span>
          </div>
        )}
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = user && tier === plan.id;
              return (
                <Card key={plan.id} className={`relative flex flex-col ${plan.color} shadow-lg`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className={plan.badgeColor}>{plan.badge}</Badge>
                    </div>
                  )}
                  <CardHeader className={`rounded-t-lg ${plan.headerColor} pt-6`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                    </div>
                    <div className="mb-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-2 text-sm">/ {plan.period}</span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 p-6">
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className={`flex items-start gap-2.5 text-sm ${!f.included ? "text-muted-foreground/60" : ""}`}>
                          {f.included ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/40 mt-0.5 flex-shrink-0" />
                          )}
                          {f.label}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.ctaVariant}
                      className="w-full"
                      onClick={() => handleCTA(plan.id)}
                      disabled={upgradeMutation.isPending || isCurrentPlan === true}
                      data-testid={`button-plan-${plan.id}`}
                    >
                      {isCurrentPlan ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Paket Aktif
                        </>
                      ) : (
                        <>
                          {plan.cta}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools Overview */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">25+ AI Tools yang Kamu Dapatkan</h2>
            <p className="text-muted-foreground">Semua tool dalam satu platform terintegrasi</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: MessageSquare, label: "AI Chat & Expert", desc: "Konsultasi marketing" },
              { icon: Megaphone, label: "Ad Creator", desc: "Semua platform iklan" },
              { icon: Image, label: "Image Creator", desc: "Visual marketing AI" },
              { icon: FileText, label: "Article Creator", desc: "Konten SEO otomatis" },
              { icon: Target, label: "Campaign Wizard", desc: "Strategi step-by-step" },
              { icon: Users, label: "Audience Builder", desc: "Persona pembeli detail" },
              { icon: BarChart3, label: "Ad Analyzer", desc: "Scoring copy iklan" },
              { icon: Volume2, label: "Text to Speech", desc: "Voiceover marketing" },
            ].map((tool, i) => (
              <Card key={i} className="p-4 hover:shadow-md transition-shadow">
                <tool.icon className="h-7 w-7 text-primary mb-2" />
                <div className="font-semibold text-sm">{tool.label}</div>
                <div className="text-xs text-muted-foreground">{tool.desc}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-muted-foreground">Pengguna Aktif</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-muted-foreground">Rating 4.9/5</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">14 hari</div>
              <div className="text-muted-foreground">Garansi uang kembali</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Pertanyaan yang Sering Ditanya</h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <Card key={i} className="cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-sm">{item.q}</p>
                    <span className="text-muted-foreground flex-shrink-0 text-lg">{openFaq === i ? "−" : "+"}</span>
                  </div>
                  {openFaq === i && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Mulai Sekarang, Gratis</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Bergabung dengan ribuan marketer Indonesia yang sudah menggunakan AI Marketing Tools.
          Tidak perlu kartu kredit untuk mulai.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button size="lg" asChild>
              <Link href="/">
                Ke Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link href="/login">
                  Daftar Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sudah punya akun? Login</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">AI Marketing Tools</span>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-foreground transition-colors">Beranda</Link>
            <a href="#" className="hover:text-foreground transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-foreground transition-colors">Privasi</a>
          </div>
          <span>© 2026 AI Marketing Tools</span>
        </div>
      </footer>
    </div>
  );
}
