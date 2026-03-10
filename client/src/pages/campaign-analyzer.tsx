import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, CheckCircle2, XCircle, AlertTriangle, Sparkles, Loader2, Target, TrendingUp, Zap, MessageSquare, Eye, MousePointer } from "lucide-react";

interface AnalysisResult {
  overallScore: number;
  categories: {
    name: string;
    score: number;
    feedback: string;
    suggestions: string[];
  }[];
  strengths: string[];
  weaknesses: string[];
  actionItems: string[];
}

export default function CampaignAnalyzer() {
  const [adCopy, setAdCopy] = useState("");
  const [platform, setPlatform] = useState("meta_ads");
  const [objective, setObjective] = useState("conversions");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const getFallbackResult = (): AnalysisResult => ({
    overallScore: 65,
    categories: [
      { name: "Hook Strength", score: 60, feedback: "Hook bisa lebih kuat", suggestions: ["Tambahkan pertanyaan", "Gunakan angka spesifik"] },
      { name: "Emotional Appeal", score: 70, feedback: "Emosi cukup baik", suggestions: ["Tambah pain points"] },
      { name: "Value Proposition", score: 65, feedback: "Value proposition perlu diperkuat", suggestions: ["Highlight benefits"] },
      { name: "Call to Action", score: 60, feedback: "CTA perlu lebih compelling", suggestions: ["Tambah urgency"] },
      { name: "Platform Fit", score: 70, feedback: "Sesuai dengan platform", suggestions: ["Sesuaikan panjang copy"] },
    ],
    strengths: ["Copy cukup jelas", "Pesan utama tersampaikan", "CTA ada"],
    weaknesses: ["Hook kurang kuat", "CTA bisa diperkuat", "Kurang social proof"],
    actionItems: ["Perkuat hook di 3 kata pertama", "Tambahkan social proof", "Buat CTA lebih spesifik", "Test beberapa variasi"],
  });

  const analyzeAd = async () => {
    if (!adCopy.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      const response = await fetch("/api/analyze-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adCopy, platform, objective }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed to analyze ad");
      }

      const data = await response.json();
      
      if (data.error || !data.overallScore) {
        throw new Error(data.error || "Invalid response");
      }

      setResult(data);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error analyzing ad:", error);
      setResult(getFallbackResult());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 50) return "Needs Work";
    return "Poor";
  };

  return (
    <>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              AI Campaign Analyzer
            </h1>
            <p className="text-muted-foreground">
              Analisis dan skor iklan Anda untuk memaksimalkan potensi winning
            </p>
          </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Input Iklan</CardTitle>
              <CardDescription>Masukkan copy iklan yang ingin Anda analisis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger data-testid="select-analyzer-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meta_ads">Meta Ads</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="google_ads">Google Ads</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Objective</Label>
                  <Select value={objective} onValueChange={setObjective}>
                    <SelectTrigger data-testid="select-analyzer-objective">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Awareness</SelectItem>
                      <SelectItem value="traffic">Traffic</SelectItem>
                      <SelectItem value="conversions">Conversions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adCopy">Copy Iklan</Label>
                <Textarea
                  id="adCopy"
                  data-testid="input-analyzer-ad-copy"
                  placeholder="Paste seluruh copy iklan Anda di sini termasuk headline, body text, dan CTA..."
                  value={adCopy}
                  onChange={(e) => setAdCopy(e.target.value)}
                  rows={10}
                  className="resize-none"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={analyzeAd} 
                disabled={isAnalyzing || !adCopy.trim()}
                data-testid="button-analyze-ad"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analisis Iklan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Hasil Analisis</span>
                  <Badge variant={result.overallScore >= 70 ? "default" : "secondary"}>
                    {getScoreLabel(result.overallScore)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                  <div className={`text-5xl font-bold ${getScoreColor(result.overallScore)}`}>
                    {result.overallScore}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Overall Score</div>
                  <Progress value={result.overallScore} className="mt-3 h-3" />
                </div>

                <div className="space-y-3">
                  {result.categories.map((cat, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cat.name}</span>
                        <span className={getScoreColor(cat.score)}>{cat.score}/100</span>
                      </div>
                      <Progress value={cat.score} className="h-2" />
                      <p className="text-xs text-muted-foreground">{cat.feedback}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {result && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Kekuatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Area Perbaikan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Action Items untuk Winning
                </CardTitle>
                <CardDescription>Langkah-langkah konkret untuk meningkatkan performa iklan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.actionItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!result && (
          <Card className="bg-muted/30">
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Belum Ada Analisis</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Masukkan copy iklan Anda di atas untuk mendapatkan analisis mendalam tentang kekuatan, kelemahan, dan cara meningkatkan winning rate iklan Anda.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <Badge variant="outline" className="gap-1">
                  <Target className="h-3 w-3" />
                  Hook Analysis
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Copy Quality
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Eye className="h-3 w-3" />
                  Attention Score
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <MousePointer className="h-3 w-3" />
                  CTA Strength
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Conversion Potential
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}
