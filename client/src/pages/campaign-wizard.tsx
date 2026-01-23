import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Circle, ArrowRight, ArrowLeft, Target, Users, Lightbulb, Rocket, TrendingUp, Sparkles, Trophy, Loader2 } from "lucide-react";

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: WizardStep[] = [
  { id: 1, title: "Product Research", description: "Analisis produk dan USP", icon: <Lightbulb className="h-5 w-5" /> },
  { id: 2, title: "Audience Targeting", description: "Definisikan target audience", icon: <Users className="h-5 w-5" /> },
  { id: 3, title: "Competitor Analysis", description: "Riset kompetitor", icon: <Target className="h-5 w-5" /> },
  { id: 4, title: "Creative Strategy", description: "Buat strategi kreatif", icon: <Sparkles className="h-5 w-5" /> },
  { id: 5, title: "Launch Plan", description: "Rencanakan peluncuran", icon: <Rocket className="h-5 w-5" /> },
];

export default function CampaignWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignData, setCampaignData] = useState({
    productName: "",
    productDescription: "",
    uniqueValue: "",
    targetAge: "",
    targetGender: "",
    targetInterests: "",
    targetPainPoints: "",
    competitors: "",
    competitorWeakness: "",
    creativeAngle: "",
    emotionalHook: "",
    platform: "",
    budget: "",
    duration: "",
  });
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});

  const progress = (currentStep / steps.length) * 100;

  const updateData = (field: string, value: string) => {
    setCampaignData(prev => ({ ...prev, [field]: value }));
  };

  const generateAISuggestion = async (field: string, prompt: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          history: [],
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      let result = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                result += data.content;
              }
            } catch (e) {}
          }
        }
      }

      setAiSuggestions(prev => ({ ...prev, [field]: result }));
    } catch (error) {
      console.error("Error generating suggestion:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="productName">Nama Produk/Layanan</Label>
              <Input
                id="productName"
                data-testid="input-wizard-product-name"
                placeholder="Contoh: SkinCare Pro"
                value={campaignData.productName}
                onChange={(e) => updateData("productName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productDescription">Deskripsi Produk</Label>
              <Textarea
                id="productDescription"
                data-testid="input-wizard-product-description"
                placeholder="Jelaskan produk Anda secara detail..."
                value={campaignData.productDescription}
                onChange={(e) => updateData("productDescription", e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="uniqueValue">Unique Selling Proposition (USP)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-generate-usp"
                  disabled={isGenerating || !campaignData.productDescription}
                  onClick={() => generateAISuggestion("usp", `Berdasarkan produk ini: "${campaignData.productDescription}", buatkan 3 USP (Unique Selling Proposition) yang kuat dan compelling. Format: bullet points singkat.`)}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate USP
                </Button>
              </div>
              <Textarea
                id="uniqueValue"
                data-testid="input-wizard-usp"
                placeholder="Apa yang membuat produk Anda unik?"
                value={campaignData.uniqueValue}
                onChange={(e) => updateData("uniqueValue", e.target.value)}
                rows={3}
              />
              {aiSuggestions.usp && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <p className="text-sm whitespace-pre-wrap">{aiSuggestions.usp}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="targetAge">Range Usia</Label>
                <Input
                  id="targetAge"
                  data-testid="input-wizard-target-age"
                  placeholder="Contoh: 25-35 tahun"
                  value={campaignData.targetAge}
                  onChange={(e) => updateData("targetAge", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetGender">Gender</Label>
                <Input
                  id="targetGender"
                  data-testid="input-wizard-target-gender"
                  placeholder="Pria/Wanita/Semua"
                  value={campaignData.targetGender}
                  onChange={(e) => updateData("targetGender", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetInterests">Minat & Hobi Target</Label>
              <Textarea
                id="targetInterests"
                data-testid="input-wizard-target-interests"
                placeholder="Contoh: fitness, kesehatan, skincare, fashion..."
                value={campaignData.targetInterests}
                onChange={(e) => updateData("targetInterests", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="targetPainPoints">Pain Points Target Audience</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-generate-pain-points"
                  disabled={isGenerating || !campaignData.productDescription}
                  onClick={() => generateAISuggestion("painPoints", `Untuk produk "${campaignData.productName}" dengan deskripsi: "${campaignData.productDescription}", untuk target audience usia ${campaignData.targetAge || "25-40"} ${campaignData.targetGender || ""}, apa saja pain points yang mungkin mereka alami? Berikan 5 pain points utama dalam format bullet points.`)}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate Pain Points
                </Button>
              </div>
              <Textarea
                id="targetPainPoints"
                data-testid="input-wizard-pain-points"
                placeholder="Masalah apa yang dihadapi target audience Anda?"
                value={campaignData.targetPainPoints}
                onChange={(e) => updateData("targetPainPoints", e.target.value)}
                rows={3}
              />
              {aiSuggestions.painPoints && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <p className="text-sm whitespace-pre-wrap">{aiSuggestions.painPoints}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="competitors">Kompetitor Utama</Label>
              <Textarea
                id="competitors"
                data-testid="input-wizard-competitors"
                placeholder="Sebutkan 3-5 kompetitor utama Anda..."
                value={campaignData.competitors}
                onChange={(e) => updateData("competitors", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="competitorWeakness">Kelemahan Kompetitor</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-analyze-competitors"
                  disabled={isGenerating || !campaignData.competitors}
                  onClick={() => generateAISuggestion("competitorAnalysis", `Analisis kompetitor berikut untuk produk ${campaignData.productName}: ${campaignData.competitors}. Berikan insight tentang: 1) Kelemahan umum kompetitor 2) Peluang yang bisa dimanfaatkan 3) Strategi diferensiasi yang bisa digunakan. Format dalam bullet points yang actionable.`)}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Analisis AI
                </Button>
              </div>
              <Textarea
                id="competitorWeakness"
                data-testid="input-wizard-competitor-weakness"
                placeholder="Apa kelemahan kompetitor yang bisa Anda manfaatkan?"
                value={campaignData.competitorWeakness}
                onChange={(e) => updateData("competitorWeakness", e.target.value)}
                rows={3}
              />
              {aiSuggestions.competitorAnalysis && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <p className="text-sm whitespace-pre-wrap">{aiSuggestions.competitorAnalysis}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="creativeAngle">Creative Angle</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-generate-creative-angle"
                  disabled={isGenerating}
                  onClick={() => generateAISuggestion("creativeAngle", `Untuk produk "${campaignData.productName}" dengan USP: "${campaignData.uniqueValue}", target audience dengan pain points: "${campaignData.targetPainPoints}", buatkan 5 creative angle yang bisa digunakan untuk iklan. Setiap angle harus: 1) Menarik perhatian 2) Relevan dengan pain points 3) Menunjukkan solusi. Format: Judul angle + penjelasan singkat.`)}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate Angles
                </Button>
              </div>
              <Textarea
                id="creativeAngle"
                data-testid="input-wizard-creative-angle"
                placeholder="Angle kreatif apa yang akan Anda gunakan?"
                value={campaignData.creativeAngle}
                onChange={(e) => updateData("creativeAngle", e.target.value)}
                rows={3}
              />
              {aiSuggestions.creativeAngle && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <p className="text-sm whitespace-pre-wrap">{aiSuggestions.creativeAngle}</p>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="emotionalHook">Emotional Hook</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-generate-emotional-hook"
                  disabled={isGenerating}
                  onClick={() => generateAISuggestion("emotionalHook", `Buatkan 5 emotional hook yang powerful untuk iklan produk "${campaignData.productName}". Hooks harus: 1) Memicu emosi kuat (fear, desire, curiosity, urgency) 2) Relevan dengan target audience 3) Bisa digunakan sebagai opening iklan. Format: Hook + emosi yang dipicu.`)}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate Hooks
                </Button>
              </div>
              <Textarea
                id="emotionalHook"
                data-testid="input-wizard-emotional-hook"
                placeholder="Hook emosional apa yang akan menarik perhatian?"
                value={campaignData.emotionalHook}
                onChange={(e) => updateData("emotionalHook", e.target.value)}
                rows={3}
              />
              {aiSuggestions.emotionalHook && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <p className="text-sm whitespace-pre-wrap">{aiSuggestions.emotionalHook}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Platform Iklan</Label>
              <div className="flex flex-wrap gap-2">
                {["Meta Ads", "Instagram", "TikTok", "YouTube", "Google Ads", "LinkedIn"].map((platform) => (
                  <Badge
                    key={platform}
                    variant={campaignData.platform === platform ? "default" : "outline"}
                    className="cursor-pointer"
                    data-testid={`badge-platform-${platform.toLowerCase().replace(" ", "-")}`}
                    onClick={() => updateData("platform", platform)}
                  >
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Harian</Label>
                <Input
                  id="budget"
                  data-testid="input-wizard-budget"
                  placeholder="Contoh: Rp 500.000"
                  value={campaignData.budget}
                  onChange={(e) => updateData("budget", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi Kampanye</Label>
                <Input
                  id="duration"
                  data-testid="input-wizard-duration"
                  placeholder="Contoh: 14 hari"
                  value={campaignData.duration}
                  onChange={(e) => updateData("duration", e.target.value)}
                />
              </div>
            </div>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Campaign Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Produk:</span>
                    <span className="font-medium">{campaignData.productName || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-medium">{campaignData.targetAge} {campaignData.targetGender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform:</span>
                    <span className="font-medium">{campaignData.platform || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">{campaignData.budget || "-"}</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  data-testid="button-generate-winning-campaign"
                  onClick={() => generateAISuggestion("winningStrategy", `Buatkan strategi winning campaign lengkap untuk:
Produk: ${campaignData.productName}
USP: ${campaignData.uniqueValue}
Target: ${campaignData.targetAge} ${campaignData.targetGender}, interests: ${campaignData.targetInterests}
Pain Points: ${campaignData.targetPainPoints}
Kompetitor: ${campaignData.competitors}
Creative Angle: ${campaignData.creativeAngle}
Emotional Hook: ${campaignData.emotionalHook}
Platform: ${campaignData.platform}
Budget: ${campaignData.budget}/hari selama ${campaignData.duration}

Berikan strategi lengkap meliputi:
1. Struktur kampanye (awareness, consideration, conversion)
2. Rekomendasi targeting detail
3. Creative recommendations (format, copy, visual)
4. A/B testing plan
5. KPIs yang harus dimonitor
6. Tips optimisasi untuk winning`)}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
                  Generate Winning Strategy
                </Button>
                {aiSuggestions.winningStrategy && (
                  <div className="mt-4 p-4 bg-background rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{aiSuggestions.winningStrategy}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Campaign Wizard
          </h1>
          <p className="text-muted-foreground">
            Ikuti panduan langkah demi langkah untuk membuat kampanye iklan yang winning
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Step {currentStep} of {steps.length}</CardTitle>
                <CardDescription>{steps[currentStep - 1].title}</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
        </Card>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {steps.map((step) => (
            <Button
              key={step.id}
              variant={currentStep === step.id ? "default" : "outline"}
              size="sm"
              className="shrink-0 gap-2"
              data-testid={`button-wizard-step-${step.id}`}
              onClick={() => setCurrentStep(step.id)}
            >
              {currentStep > step.id ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : currentStep === step.id ? (
                step.icon
              ) : (
                <Circle className="h-4 w-4" />
              )}
              {step.title}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep - 1].icon}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            data-testid="button-wizard-prev"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Sebelumnya
          </Button>
          <Button
            data-testid="button-wizard-next"
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
          >
            Selanjutnya
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
