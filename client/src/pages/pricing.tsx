import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const pricingPlans = [
  {
    id: "free",
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
    limitations: [
      "Tanpa AI Image Generator",
      "Tanpa Campaign Wizard",
      "Tanpa Priority Support",
    ],
    cta: "Paket Aktif",
    icon: Sparkles,
    popular: false,
    current: true,
  },
  {
    id: "pro",
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
    limitations: [],
    cta: "Upgrade ke Pro",
    icon: Zap,
    popular: true,
    current: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Rp 499K",
    period: "/bulan",
    description: "Untuk agency & tim besar",
    features: [
      "Semua fitur Pro",
      "Team Collaboration (5 user)",
      "White-label Reports",
      "API Access",
      "Custom AI Training",
      "Dedicated Support",
      "SLA Guarantee",
    ],
    limitations: [],
    cta: "Hubungi Sales",
    icon: Crown,
    popular: false,
    current: false,
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async (planId: string) => {
    setIsProcessing(true);
    // In real implementation, this would call the Stripe checkout
    alert(`Upgrade ke ${planId} akan segera tersedia! Hubungi support untuk early access.`);
    setIsProcessing(false);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Pilih Paket Anda</h1>
            <p className="text-muted-foreground">Upgrade untuk akses fitur premium</p>
          </div>
        </div>

        {user && (
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Halo, {user.firstName || user.email}!</h3>
                    <p className="text-sm text-muted-foreground">Anda saat ini menggunakan paket Free</p>
                  </div>
                </div>
                <Badge variant="secondary">Free Plan</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? "border-primary border-2 shadow-xl" : ""} ${plan.current ? "bg-muted/50" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Paling Populer</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <plan.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {plan.limitations.length > 0 && (
                  <div className="pt-4 border-t space-y-2">
                    {plan.limitations.map((limitation, i) => (
                      <div key={i} className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-sm">• {limitation}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  className="w-full" 
                  variant={plan.current ? "secondary" : plan.popular ? "default" : "outline"}
                  disabled={plan.current || isProcessing}
                  onClick={() => handleUpgrade(plan.id)}
                  data-testid={`button-upgrade-${plan.id}`}
                >
                  {plan.current ? "Paket Aktif" : plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Butuh custom plan untuk tim besar?</h3>
                <p className="text-muted-foreground">Hubungi kami untuk diskusi kebutuhan spesifik Anda</p>
              </div>
              <Button variant="outline" data-testid="button-contact-sales">
                Hubungi Sales
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>Semua paket berbayar termasuk 14 hari money-back guarantee</p>
          <p>Pembayaran aman via Stripe • Bisa cancel kapan saja</p>
        </div>
      </div>
    </div>
  );
}
