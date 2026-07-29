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

const CAMPAIGN_OBJECTIVES = [
  "Sales (Purchase)",
  "Traffic",
  "Leads",
  "Awareness",
  "Engagement",
  "Video Views",
  "Messages (WA/Messenger)",
];

// Shared scrollable output card
function AIOutputCard({ content }: { content: string }) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-4">
        <div className="max-h-64 overflow-y-auto pr-1">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
      </CardContent>
    </Card>
  );
}

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
    campaignObjective: "",
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
    setAiSuggestions(prev => ({ ...prev, [field]: "" }));
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, history: [] }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setAiSuggestions(prev => ({
                  ...prev,
                  [field]: (prev[field] ?? "") + data.content,
                }));
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      console.error("Error generating suggestion:", error);
      setAiSuggestions(prev => ({
        ...prev,
        [field]: "Terjadi kesalahan saat generate. Silakan coba lagi.",
      }));
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
                placeholder="Jelaskan produk Anda secara detail — apa isinya, untuk siapa, dan apa manfaat utamanya..."
                value={campaignData.productDescription}
                onChange={(e) => updateData("productDescription", e.target.value)}
                rows={5}
                className="resize-y"
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
                  onClick={() => generateAISuggestion("usp",
                    `Anda adalah seorang Meta Ads Copywriter profesional.

Produk: "${campaignData.productName}"
Deskripsi: "${campaignData.productDescription}"

Tugas:
Buatkan 5 USP (Unique Selling Proposition) yang kuat, emosional, dan berbeda dari kompetitor.

Format setiap USP:
- **USP [nomor]: [Judul singkat]**
  Penjelasan: [1-2 kalimat kenapa ini unik dan penting bagi calon pembeli]
  Positioning: [Kalimat pendek siap pakai untuk iklan]

Fokus pada: manfaat nyata, emosi calon pembeli, dan diferensiasi yang tidak mudah ditiru.`
                  )}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate USP
                </Button>
              </div>
              <Textarea
                id="uniqueValue"
                data-testid="input-wizard-usp"
                placeholder="Apa yang membuat produk Anda unik dan berbeda dari kompetitor?"
                value={campaignData.uniqueValue}
                onChange={(e) => updateData("uniqueValue", e.target.value)}
                rows={4}
                className="resize-y"
              />
              {aiSuggestions.usp && <AIOutputCard content={aiSuggestions.usp} />}
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
                  placeholder="Contoh: 25-55 tahun"
                  value={campaignData.targetAge}
                  onChange={(e) => updateData("targetAge", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetGender">Gender</Label>
                <Input
                  id="targetGender"
                  data-testid="input-wizard-target-gender"
                  placeholder="Pria / Wanita / Semua"
                  value={campaignData.targetGender}
                  onChange={(e) => updateData("targetGender", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetInterests">
                Minat, Jabatan & Interest Targeting
              </Label>
              <Textarea
                id="targetInterests"
                data-testid="input-wizard-target-interests"
                placeholder="Contoh: Kontraktor, Civil Engineering, Project Management, Tender, LPJK, AutoCAD, BIM, Manajemen Proyek..."
                value={campaignData.targetInterests}
                onChange={(e) => updateData("targetInterests", e.target.value)}
                rows={4}
                className="resize-y"
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
                  onClick={() => generateAISuggestion("painPoints",
                    `Anda adalah Meta Ads Strategist yang ahli di perilaku konsumen.

Produk: "${campaignData.productName}"
Deskripsi produk: "${campaignData.productDescription}"
Target audience: Usia ${campaignData.targetAge || "25-55"}, ${campaignData.targetGender || "pria & wanita"}
Minat/Jabatan: ${campaignData.targetInterests || "sesuai produk"}

Tugas:
Identifikasi 10 pain points utama target audience yang paling relevan untuk digunakan dalam iklan Meta Ads.

Format setiap pain point:
**[nomor]. [Nama masalah singkat]**
- Situasi: [Kapan/dimana masalah ini terjadi]
- Dampak bisnis/kehidupan: [Konsekuensi nyata jika dibiarkan]
- Emosi yang dirasakan: [Frustrasi / Panik / Malu / Cemas / dll]
- Hook iklan: [1 kalimat opening iklan yang langsung menyentuh masalah ini]

Fokus pada masalah yang paling sering dialami sehari-hari dan paling menyakitkan secara emosional.`
                  )}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate Pain Points
                </Button>
              </div>
              <Textarea
                id="targetPainPoints"
                data-testid="input-wizard-pain-points"
                placeholder="Masalah apa yang paling sering dan paling menyakitkan bagi target audience Anda?"
                value={campaignData.targetPainPoints}
                onChange={(e) => updateData("targetPainPoints", e.target.value)}
                rows={4}
                className="resize-y"
              />
              {aiSuggestions.painPoints && <AIOutputCard content={aiSuggestions.painPoints} />}
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
                placeholder="Sebutkan kompetitor: bisa produk sejenis, solusi alternatif, atau cara lain orang menyelesaikan masalah yang sama..."
                value={campaignData.competitors}
                onChange={(e) => updateData("competitors", e.target.value)}
                rows={4}
                className="resize-y"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="competitorWeakness">Analisis Kompetitor & Diferensiasi</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-analyze-competitors"
                  disabled={isGenerating || !campaignData.competitors}
                  onClick={() => generateAISuggestion("competitorAnalysis",
                    `Anda adalah seorang Brand Strategist dan Meta Ads Consultant.

Produk saya: "${campaignData.productName}"
Deskripsi: "${campaignData.productDescription}"
USP: "${campaignData.uniqueValue}"
Target: ${campaignData.targetAge} ${campaignData.targetGender}

Kompetitor yang dihadapi:
${campaignData.competitors}

Tugas:
Lakukan analisis kompetitor yang mendalam dan berikan strategi diferensiasi.

Format output:

## 1. Analisis Kelemahan Kompetitor
Untuk setiap kompetitor, jelaskan:
- Fokus mereka
- Kelemahan utama
- Celah yang bisa dimanfaatkan

## 2. Tabel Positioning
Buat tabel perbandingan: Kompetitor | Fokus Mereka | Posisi Unik Produk Saya

## 3. Strategi Diferensiasi
- 3 pesan utama yang membedakan produk dari semua kompetitor
- Angle iklan yang tidak dipakai kompetitor

## 4. Pesan Utama untuk Iklan
Berikan 3 kalimat positioning siap pakai.`
                  )}
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
                rows={4}
                className="resize-y"
              />
              {aiSuggestions.competitorAnalysis && <AIOutputCard content={aiSuggestions.competitorAnalysis} />}
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
                  onClick={() => generateAISuggestion("creativeAngle",
                    `Anda adalah Meta Ads Creative Strategist berpengalaman.

Produk: "${campaignData.productName}"
USP: "${campaignData.uniqueValue}"
Target audience pain points: "${campaignData.targetPainPoints}"
Target: ${campaignData.targetAge}, ${campaignData.targetGender}

Tugas:
Buatkan 15 Creative Angle untuk iklan Meta Ads. Jangan menjual produknya — jual solusi terhadap masalah. Gunakan pendekatan Problem → Consequence → Solution.

Format setiap angle:

### Angle [nomor]: [Nama Angle]
- **Pain Point:** [Masalah spesifik yang diangkat]
- **Ide Visual:** [Deskripsi visual/gambar/video yang mendukung]
- **Headline:** [Judul iklan maks 10 kata]
- **Primary Text:** [Kalimat pembuka iklan 1-2 kalimat]
- **CTA:** [Call-to-action]

Variasikan jenis angle: Fear of Loss, Curiosity, Story, Before-After, Authority, Urgency, Contrarian, Social Proof.`
                  )}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate 15 Angles
                </Button>
              </div>
              <Textarea
                id="creativeAngle"
                data-testid="input-wizard-creative-angle"
                placeholder="Tulis angle utama yang akan digunakan, atau pilih dari hasil generate AI di bawah..."
                value={campaignData.creativeAngle}
                onChange={(e) => updateData("creativeAngle", e.target.value)}
                rows={4}
                className="resize-y"
              />
              {aiSuggestions.creativeAngle && <AIOutputCard content={aiSuggestions.creativeAngle} />}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="emotionalHook">Emotional Hook</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-generate-emotional-hook"
                  disabled={isGenerating}
                  onClick={() => generateAISuggestion("emotionalHook",
                    `Anda adalah seorang Meta Ads Copywriter yang ahli psikologi pemasaran.

Produk: "${campaignData.productName}"
Target audience: ${campaignData.targetAge}, ${campaignData.targetGender}
Pain points utama: "${campaignData.targetPainPoints}"

Tugas:
Buatkan 30 hook Meta Ads yang kuat. Maksimal 12 kata per hook. Gunakan bahasa yang sederhana, emosional, dan langsung ke masalah.

Kelompokkan berdasarkan kategori:

**🔴 Fear of Loss (5 hook)**
**🟡 Curiosity (5 hook)**
**🟢 Story (5 hook)**
**🔵 Question (5 hook)**
**🟠 Urgency (3 hook)**
**⚫ Mistake (3 hook)**
**🟣 Contrarian (2 hook)**
**⭐ Authority (2 hook)**

Format: [nomor]. "[teks hook]"`
                  )}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate 30 Hooks
                </Button>
              </div>
              <Textarea
                id="emotionalHook"
                data-testid="input-wizard-emotional-hook"
                placeholder="Tulis hook utama yang akan dipakai, atau pilih dari hasil generate AI di bawah..."
                value={campaignData.emotionalHook}
                onChange={(e) => updateData("emotionalHook", e.target.value)}
                rows={4}
                className="resize-y"
              />
              {aiSuggestions.emotionalHook && <AIOutputCard content={aiSuggestions.emotionalHook} />}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Campaign Objective */}
            <div className="space-y-2">
              <Label>Campaign Objective</Label>
              <div className="flex flex-wrap gap-2">
                {CAMPAIGN_OBJECTIVES.map((obj) => (
                  <Badge
                    key={obj}
                    variant={campaignData.campaignObjective === obj ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => updateData("campaignObjective", obj)}
                  >
                    {obj}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Pilih Sales jika pixel & tracking sudah siap. Pilih Traffic/Leads untuk validasi awal.
              </p>
            </div>

            {/* Platform */}
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

            {/* Budget & Duration */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Harian</Label>
                <Input
                  id="budget"
                  data-testid="input-wizard-budget"
                  placeholder="Contoh: Rp 100.000"
                  value={campaignData.budget}
                  onChange={(e) => updateData("budget", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi Kampanye</Label>
                <Input
                  id="duration"
                  data-testid="input-wizard-duration"
                  placeholder="Contoh: 7 hari"
                  value={campaignData.duration}
                  onChange={(e) => updateData("duration", e.target.value)}
                />
              </div>
            </div>

            {/* Campaign Summary + Generate */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Campaign Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm">
                  {[
                    { label: "Produk", value: campaignData.productName },
                    { label: "Target", value: `${campaignData.targetAge} ${campaignData.targetGender}`.trim() },
                    { label: "Objective", value: campaignData.campaignObjective },
                    { label: "Platform", value: campaignData.platform },
                    { label: "Budget", value: campaignData.budget ? `${campaignData.budget}/hari` : "" },
                    { label: "Durasi", value: campaignData.duration },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}:</span>
                      <span className="font-medium text-right max-w-[60%] break-words">{value || "-"}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  data-testid="button-generate-winning-campaign"
                  disabled={isGenerating}
                  onClick={() => generateAISuggestion("winningStrategy",
                    `Anda adalah Meta Ads Strategist senior dengan pengalaman kampanye digital di berbagai industri.

DATA KAMPANYE:
- Produk: ${campaignData.productName}
- Deskripsi: ${campaignData.productDescription}
- USP: ${campaignData.uniqueValue}
- Target: Usia ${campaignData.targetAge}, ${campaignData.targetGender}
- Interests: ${campaignData.targetInterests}
- Pain Points: ${campaignData.targetPainPoints}
- Kompetitor: ${campaignData.competitors}
- Creative Angle: ${campaignData.creativeAngle}
- Emotional Hook: ${campaignData.emotionalHook}
- Platform: ${campaignData.platform}
- Campaign Objective: ${campaignData.campaignObjective}
- Budget: ${campaignData.budget}/hari selama ${campaignData.duration}

Tugas:
Buatkan Winning Campaign Strategy yang komprehensif dan siap dieksekusi. Format dalam markdown yang rapi.

---

## 📋 Executive Summary
[Ringkasan strategi 2-3 kalimat]

## 🎯 Campaign Objective & Funnel
[Objective yang dipilih + alasan + struktur funnel Awareness→Consideration→Conversion dengan alokasi budget %]

## 👥 Target Audience
[Segmentasi audience: Audience 1, 2, 3 dengan jabatan/minat spesifik]

## 📊 Struktur Kampanye
[Campaign → Ad Set → Ads: nama dan breakdown]

## 🎨 Creative Strategy
[3 angle utama yang direkomendasikan + format creative: image/video/carousel]

## ✍️ Copywriting Angles
[3 variasi copy: Headline + Primary Text + CTA untuk masing-masing angle]

## 🖼 Creative Recommendation
[Rekomendasi visual: ukuran, warna, elemen gambar, teks overlay]

## 🌐 Landing Page Checklist
[Elemen LP yang wajib ada: Hero, Pain Point, Solusi, Bukti, FAQ, CTA]

## 📈 KPI Target
[CTR, CPC, CPM, ROAS, Cost per Lead/Purchase — sesuaikan dengan objective]

## 🔄 Optimization Plan
- Hari 1-2: [aksi]
- Hari 3-5: [aksi]  
- Hari 6-7: [aksi]

## 🚀 Scaling Strategy
[Kapan dan bagaimana menaikkan budget + kriteria lolos untuk scale]

## ⚠️ Risiko & Mitigasi
[3 risiko utama yang harus dihindari + cara mengatasinya]`
                  )}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
                  Generate Winning Strategy
                </Button>

                {aiSuggestions.winningStrategy && (
                  <div className="mt-4 p-4 bg-background rounded-lg max-h-[480px] overflow-y-auto">
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
    <>
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
    </>
  );
}
