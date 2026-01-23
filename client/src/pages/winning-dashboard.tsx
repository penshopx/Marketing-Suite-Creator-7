import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Trophy, Target, Users, Lightbulb, Rocket, BarChart3, CheckCircle2, Circle, ArrowRight, Sparkles, TrendingUp, Zap, BookOpen, Video, MessageSquare } from "lucide-react";

interface WinningStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  completed: boolean;
  tips: string[];
}

const winningSteps: WinningStep[] = [
  {
    id: 1,
    title: "Research & Discovery",
    description: "Pahami produk, market, dan kompetitor Anda",
    icon: <Lightbulb className="h-5 w-5" />,
    link: "/campaign-wizard",
    completed: false,
    tips: [
      "Identifikasi USP yang kuat",
      "Riset kompetitor minimal 5 brand",
      "Temukan gap di market",
    ],
  },
  {
    id: 2,
    title: "Audience Definition",
    description: "Bangun buyer persona yang detail dan akurat",
    icon: <Users className="h-5 w-5" />,
    link: "/audience-builder",
    completed: false,
    tips: [
      "Buat minimal 3 buyer persona",
      "Pahami pain points mendalam",
      "Identifikasi buying triggers",
    ],
  },
  {
    id: 3,
    title: "Creative Development",
    description: "Kembangkan angle dan hook yang winning",
    icon: <Sparkles className="h-5 w-5" />,
    link: "/ad-creator",
    completed: false,
    tips: [
      "Test 5-10 creative angles",
      "Gunakan emotional hooks",
      "A/B test headlines",
    ],
  },
  {
    id: 4,
    title: "Campaign Analysis",
    description: "Analisis dan optimasi iklan Anda",
    icon: <BarChart3 className="h-5 w-5" />,
    link: "/campaign-analyzer",
    completed: false,
    tips: [
      "Score iklan minimal 70+",
      "Perbaiki semua weaknesses",
      "Implement action items",
    ],
  },
  {
    id: 5,
    title: "Launch & Scale",
    description: "Luncurkan dan scale campaign yang winning",
    icon: <Rocket className="h-5 w-5" />,
    link: "/campaign-wizard",
    completed: false,
    tips: [
      "Start dengan budget kecil",
      "Monitor KPIs harian",
      "Scale pemenang cepat",
    ],
  },
];

const winningTips = [
  {
    icon: <Target className="h-5 w-5 text-primary" />,
    title: "Fokus pada 1 Avatar",
    description: "Jangan mencoba menjual ke semua orang. Fokus pada 1 buyer persona dulu.",
  },
  {
    icon: <MessageSquare className="h-5 w-5 text-primary" />,
    title: "Hook dalam 3 Detik",
    description: "Audience memutuskan dalam 3 detik pertama. Buat hook yang powerful.",
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-primary" />,
    title: "Test, Test, Test",
    description: "Winning ads ditemukan dari testing. Minimum 5-10 variasi per campaign.",
  },
  {
    icon: <Zap className="h-5 w-5 text-primary" />,
    title: "Kill Losers Fast",
    description: "Matikan iklan yang tidak perform dalam 3-5 hari. Fokus pada pemenang.",
  },
];

const resources = [
  { icon: <BookOpen className="h-4 w-4" />, title: "AI Templates", link: "/ai-templates", description: "Template marketing siap pakai" },
  { icon: <Video className="h-4 w-4" />, title: "Story Telling", link: "/story-telling", description: "Buat narasi yang menjual" },
  { icon: <MessageSquare className="h-4 w-4" />, title: "AI Expert Chat", link: "/ai-expert", description: "Konsultasi dengan AI expert" },
];

export default function WinningDashboard() {
  const completedSteps = winningSteps.filter(s => s.completed).length;
  const progress = (completedSteps / winningSteps.length) * 100;

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Winning Campaign Guide
          </h1>
          <p className="text-muted-foreground">
            Ikuti roadmap ini untuk membuat kampanye iklan yang winning
          </p>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>Your Winning Journey</CardTitle>
                <CardDescription>Progress menuju campaign yang winning</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1 text-lg px-4 py-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                {completedSteps}/{winningSteps.length} Steps
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {progress === 100 
                ? "Selamat! Anda telah menyelesaikan semua langkah. Saatnya launch!" 
                : `${Math.round(progress)}% complete - Lanjutkan perjalanan Anda`}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {winningSteps.map((step, index) => (
            <Card 
              key={step.id} 
              className={`transition-all ${step.completed ? "bg-green-500/5 border-green-500/20" : ""}`}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center h-12 w-12 rounded-full shrink-0 ${
                    step.completed 
                      ? "bg-green-500 text-white" 
                      : "bg-primary/10 text-primary"
                  }`}>
                    {step.completed ? <CheckCircle2 className="h-6 w-6" /> : step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          Step {step.id}: {step.title}
                          {step.completed && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Completed
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <Link href={step.link}>
                        <Button variant={step.completed ? "outline" : "default"} size="sm" data-testid={`button-step-${step.id}`}>
                          {step.completed ? "Review" : "Mulai"}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {step.tips.map((tip, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tip}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {index < winningSteps.length - 1 && (
                  <div className="ml-6 mt-4 border-l-2 border-dashed border-muted-foreground/20 h-4" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Winning Tips
              </CardTitle>
              <CardDescription>Tips dari expert untuk winning campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {winningTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{tip.icon}</div>
                  <div>
                    <h4 className="font-medium text-sm">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Resources
              </CardTitle>
              <CardDescription>Tools tambahan untuk membantu Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {resources.map((resource, i) => (
                <Link key={i} href={resource.link}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover-elevate cursor-pointer border">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {resource.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{resource.title}</h4>
                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="py-6">
            <div className="flex items-center gap-4 flex-wrap">
              <Trophy className="h-12 w-12 text-yellow-500" />
              <div className="flex-1">
                <h3 className="font-bold text-lg">Ready to Win?</h3>
                <p className="text-sm text-muted-foreground">
                  Mulai perjalanan Anda menuju campaign yang winning sekarang
                </p>
              </div>
              <Link href="/campaign-wizard">
                <Button size="lg" className="gap-2" data-testid="button-start-winning">
                  <Rocket className="h-5 w-5" />
                  Start Campaign Wizard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
