import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles, Users, Loader2, Plus, X, AlertTriangle,
  CheckCircle2, Copy, Layers, ArrowRight, Info, Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCampaignStore } from "@/hooks/use-campaign-store";
import { CampaignContextBar } from "@/components/campaign-context-bar";

interface OverlapPair {
  interest1: string;
  interest2: string;
  overlapPercent: number;
  overlapSize: string;
  risk: "Rendah" | "Sedang" | "Tinggi";
  action: string;
}

interface AdsetGroup {
  name: string;
  interests: string[];
  reason: string;
  estimatedReach: string;
  strategy: string;
}

interface OverlapResult {
  summary: string;
  overallRisk: "Rendah" | "Sedang" | "Tinggi";
  pairs: OverlapPair[];
  recommendedAdsets: AdsetGroup[];
  interestsToExclude: { interest: string; from: string; reason: string }[];
  optimizationTips: string[];
}

export default function AudienceOverlap() {
  const [interests, setInterests] = useState<string[]>(["", ""]);
  const [negara, setNegara] = useState("ID");
  const [niche, setNiche] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OverlapResult | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { campaign, save, markToolUsed } = useCampaignStore();
  const [, navigate] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const interestsParam = params.get("interests");
    const nicheParam = params.get("niche");
    if (interestsParam) {
      const list = interestsParam.split(",").map((i) => i.trim()).filter(Boolean);
      if (list.length >= 2) setInterests([...list, ""]);
    } else if (campaign.savedInterests?.length >= 2) {
      setInterests([...campaign.savedInterests.slice(0, 8), ""]);
    }
    if (nicheParam) setNiche(nicheParam);
    else if (campaign.niche) setNiche(campaign.niche);
  }, []);

  const addInterest = () => {
    if (interests.length < 10) setInterests([...interests, ""]);
  };

  const removeInterest = (i: number) => {
    setInterests(interests.filter((_, idx) => idx !== i));
  };

  const updateInterest = (i: number, val: string) => {
    const next = [...interests];
    next[i] = val;
    setInterests(next);
  };

  const handleAnalyze = async () => {
    const filled = interests.filter((i) => i.trim());
    if (filled.length < 2) {
      toast({ title: "Minimal 2 interest", description: "Isi minimal 2 interest untuk analisis overlap", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/audience-overlap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: filled, negara }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
      markToolUsed("audience-overlap");
      save({ savedInterests: filled, niche: niche || campaign.niche });
    } catch {
      toast({ title: "Error", description: "Gagal analisis overlap", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const riskColor = (r: string) =>
    r === "Rendah"
      ? "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-800"
      : r === "Sedang"
      ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      : "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800";

  const overlapBarColor = (p: number) =>
    p >= 70 ? "bg-red-500" : p >= 40 ? "bg-yellow-500" : "bg-green-500";

  const copyAdsets = () => {
    if (!result) return;
    const text = result.recommendedAdsets
      .map((g, i) => `Adset ${i + 1}: ${g.name}\nInterests: ${g.interests.join(", ")}\nStrategi: ${g.strategy}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Struktur adset disalin!" });
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Audience Overlap Analyzer
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Analisis overlap antar interest agar budget iklan tidak terbuang sia-sia
          </p>
        </div>
        <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
          Terinspirasi Adsumo
        </Badge>
      </div>

      <CampaignContextBar
        toolId="audience-overlap"
        onAutoFill={(c) => {
          if (c.savedInterests?.length >= 2) setInterests([...c.savedInterests.slice(0, 8), ""]);
          if (c.niche) setNiche(c.niche);
        }}
        currentValues={{ niche }}
        onSave={() => save({ savedInterests: interests.filter(Boolean), niche })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Daftar Interests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Negara Target</Label>
              <Select value={negara} onValueChange={setNegara}>
                <SelectTrigger className="mt-1" data-testid="select-negara-overlap">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ID">🇮🇩 Indonesia</SelectItem>
                  <SelectItem value="MY">🇲🇾 Malaysia</SelectItem>
                  <SelectItem value="SG">🇸🇬 Singapura</SelectItem>
                  <SelectItem value="PH">🇵🇭 Filipina</SelectItem>
                  <SelectItem value="US">🇺🇸 USA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Interests (2–10)</Label>
              <div className="mt-1 space-y-2">
                {interests.map((val, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Interest ${i + 1}...`}
                      value={val}
                      onChange={(e) => updateInterest(i, e.target.value)}
                      data-testid={`input-interest-${i}`}
                      className="flex-1"
                    />
                    {interests.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeInterest(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {interests.length < 10 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={addInterest}
                  data-testid="btn-add-interest"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Tambah Interest
                </Button>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleAnalyze}
              disabled={isLoading}
              data-testid="btn-analyze-overlap"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menganalisis...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Analisis Overlap</>
              )}
            </Button>

            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-1">
              <p className="font-medium flex items-center gap-1"><Info className="h-3 w-3" />Cara baca hasil:</p>
              <p>• <span className="text-green-600 font-medium">Rendah (&lt;30%)</span> — aman digabung 1 adset</p>
              <p>• <span className="text-yellow-600 font-medium">Sedang (30–70%)</span> — pisahkan atau exclude</p>
              <p>• <span className="text-red-600 font-medium">Tinggi (&gt;70%)</span> — buang salah satu atau exclude</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {!result && !isLoading && (
            <div className="flex flex-col items-center justify-center h-72 text-center border-2 border-dashed rounded-xl">
              <Layers className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="font-semibold text-muted-foreground">Belum ada hasil analisis</p>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs">
                Isi minimal 2 interest lalu klik Analisis Overlap
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-72 border-2 border-dashed rounded-xl">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="font-semibold">Menganalisis overlap audience...</p>
              <p className="text-sm text-muted-foreground mt-1">Menghitung persentase tumpang tindih</p>
            </div>
          )}

          {result && (
            <>
              <Card className={`border-2 ${result.overallRisk === "Rendah" ? "border-green-300 dark:border-green-700" : result.overallRisk === "Sedang" ? "border-yellow-300 dark:border-yellow-700" : "border-red-300 dark:border-red-700"}`}>
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm flex items-center gap-1.5">
                      {result.overallRisk === "Tinggi" ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : result.overallRisk === "Sedang" ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      Kesimpulan Analisis
                    </h3>
                    <Badge className={`text-xs border ${riskColor(result.overallRisk)}`}>
                      Risiko {result.overallRisk}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.summary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3 px-4 space-y-0">
                  <CardTitle className="text-sm">Matrix Overlap Antar Interest</CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-2 space-y-2.5">
                  {result.pairs.map((pair, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-medium min-w-0">
                          <span className="truncate max-w-[100px] sm:max-w-none">{pair.interest1}</span>
                          <ArrowRight className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                          <span className="truncate max-w-[100px] sm:max-w-none">{pair.interest2}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="font-bold">{pair.overlapPercent}%</span>
                          <Badge className={`text-xs border ${riskColor(pair.risk)} py-0 px-1.5`}>
                            {pair.risk}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${overlapBarColor(pair.overlapPercent)}`}
                          style={{ width: `${pair.overlapPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{pair.action}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" />
                    Struktur Adset yang Direkomendasikan
                  </CardTitle>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={copyAdsets}>
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    Copy
                  </Button>
                </CardHeader>
                <CardContent className="px-4 py-2 space-y-3">
                  {result.recommendedAdsets.map((adset, i) => (
                    <div key={i} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {i + 1}
                            </span>
                            {adset.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{adset.reason}</p>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">{adset.estimatedReach}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {adset.interests.map((int) => (
                          <span key={int} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-md">
                            {int}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 italic">{adset.strategy}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {result.interestsToExclude?.length > 0 && (
                <Card className="border-orange-200 dark:border-orange-800">
                  <CardHeader className="py-3 px-4 space-y-0">
                    <CardTitle className="text-sm text-orange-600 dark:text-orange-400">
                      ⚠️ Interest yang Disarankan untuk Di-Exclude
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-2 space-y-2">
                    {result.interestsToExclude.map((exc, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <X className="h-3.5 w-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium">{exc.interest}</span>
                          <span className="text-muted-foreground"> dari adset "{exc.from}" — {exc.reason}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {result.optimizationTips?.length > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="py-3 px-4 space-y-0">
                    <CardTitle className="text-sm text-primary flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      Tips Optimasi Budget Iklan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-2">
                    <ul className="space-y-1.5">
                      {result.optimizationTips.map((tip, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-green-500/5">
                <CardHeader className="pb-2 pt-3 px-4 space-y-0">
                  <CardTitle className="text-sm text-primary flex items-center gap-1.5">
                    <ArrowRight className="h-4 w-4" />
                    Lanjutkan ke Fitur Berikutnya
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-300 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 justify-start h-auto py-2.5 px-3"
                      onClick={() => {
                        save({ savedInterests: interests.filter(Boolean) });
                        const q = `produk=${encodeURIComponent(campaign.produk || niche)}&niche=${encodeURIComponent(niche || campaign.niche)}&target=${encodeURIComponent(campaign.target)}`;
                        navigate(`/wa-broadcast?${q}`);
                      }}
                      data-testid="btn-overlap-to-broadcast"
                    >
                      <div className="flex flex-col items-start text-left gap-0.5">
                        <span className="font-semibold text-xs flex items-center gap-1">WA Broadcast <ArrowRight className="h-3 w-3" /></span>
                        <span className="text-xs opacity-70 font-normal">Generate follow-up sequence</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-300 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 justify-start h-auto py-2.5 px-3"
                      onClick={() => navigate(`/customer-journey?produk=${encodeURIComponent(campaign.produk || niche)}&target=${encodeURIComponent(campaign.target)}`)}
                      data-testid="btn-overlap-to-journey"
                    >
                      <div className="flex flex-col items-start text-left gap-0.5">
                        <span className="font-semibold text-xs flex items-center gap-1">Customer Journey <ArrowRight className="h-3 w-3" /></span>
                        <span className="text-xs opacity-70 font-normal">Petakan perjalanan customer</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 justify-start h-auto py-2.5 px-3"
                      onClick={() => navigate(`/auto-rule?produk=${encodeURIComponent(campaign.produk || niche)}`)}
                      data-testid="btn-overlap-to-autorule"
                    >
                      <div className="flex flex-col items-start text-left gap-0.5">
                        <span className="font-semibold text-xs flex items-center gap-1">Auto Rule Builder <ArrowRight className="h-3 w-3" /></span>
                        <span className="text-xs opacity-70 font-normal">Rules otomatis Meta Ads</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
