import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles, Zap, Loader2, Copy, CheckCircle2, Download,
  Shield, TrendingUp, TrendingDown, Clock, RefreshCw, Info,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutoRule {
  id: string;
  name: string;
  emoji: string;
  type: "stop-loss" | "scale" | "protector" | "frequency" | "saturation" | "custom";
  level: string;
  condition: string;
  action: string;
  why: string;
  steps: string[];
  metaConfig: {
    applyTo: string;
    time: string;
    conditions: { metric: string; operator: string; value: string; window: string }[];
    actionType: string;
    actionValue?: string;
    notif: boolean;
  };
}

interface AutoRuleResult {
  summary: string;
  rules: AutoRule[];
  implementationOrder: string[];
  generalTips: string[];
}

const ruleTypeIcon = (type: string) => {
  switch (type) {
    case "stop-loss": return <TrendingDown className="h-4 w-4 text-red-500" />;
    case "scale": return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "protector": return <Shield className="h-4 w-4 text-blue-500" />;
    case "frequency": return <RefreshCw className="h-4 w-4 text-orange-500" />;
    case "saturation": return <Clock className="h-4 w-4 text-purple-500" />;
    default: return <Zap className="h-4 w-4 text-primary" />;
  }
};

const ruleTypeBadge = (type: string) => {
  switch (type) {
    case "stop-loss": return "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800";
    case "scale": return "bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800";
    case "protector": return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800";
    case "frequency": return "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800";
    case "saturation": return "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800";
    default: return "bg-primary/10 text-primary border-primary/20";
  }
};

export default function AutoRule() {
  const [objective, setObjective] = useState("purchase");
  const [budget, setBudget] = useState("");
  const [targetCpa, setTargetCpa] = useState("");
  const [targetRoas, setTargetRoas] = useState("");
  const [platform, setPlatform] = useState("facebook");
  const [agresivitas, setAgresivitas] = useState("balanced");
  const [niche, setNiche] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AutoRuleResult | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!budget) {
      toast({ title: "Budget harian wajib diisi", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate-auto-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective, budget, targetCpa, targetRoas, platform, agresivitas, niche }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
    } catch {
      toast({ title: "Error", description: "Gagal generate rules", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyRule = (rule: AutoRule) => {
    const text = `=== ${rule.emoji} ${rule.name} ===\n\nKondisi:\n${rule.condition}\n\nAksi:\n${rule.action}\n\nAlasan:\n${rule.why}\n\nLangkah implementasi di Meta Ads Manager:\n${rule.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedId(rule.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: `Rule "${rule.name}" disalin!` });
  };

  const downloadAllRules = () => {
    if (!result) return;
    const text = result.rules
      .map((r) => `=== ${r.emoji} ${r.name} ===\n\nKondisi:\n${r.condition}\n\nAksi:\n${r.action}\n\nAlasan:\n${r.why}\n\nImplementasi:\n${r.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`)
      .join("\n\n" + "=".repeat(50) + "\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "automation-rules-meta-ads.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Auto Rule Builder
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Generate automated rules siap pakai — pause saat boncos, scale saat profit, otomatis
          </p>
        </div>
        <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          Meta Ads Manager Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Parameter Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Niche / Produk (opsional)</Label>
              <Input
                placeholder="e.g. skincare, kursus digital, dropship"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                data-testid="input-niche-rule"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Objective Campaign *</Label>
              <Select value={objective} onValueChange={setObjective}>
                <SelectTrigger className="mt-1" data-testid="select-objective-rule">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchases (ROAS)</SelectItem>
                  <SelectItem value="lead">Lead Generation (CPL)</SelectItem>
                  <SelectItem value="traffic">Traffic (CPC)</SelectItem>
                  <SelectItem value="awareness">Awareness (CPM)</SelectItem>
                  <SelectItem value="video_view">Video Views (CPV)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Budget Harian (Rp) *</Label>
              <Input
                placeholder="e.g. 500000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                data-testid="input-budget-rule"
                className="mt-1"
              />
            </div>
            {(objective === "purchase") && (
              <div>
                <Label>Target ROAS</Label>
                <Input
                  placeholder="e.g. 3"
                  value={targetRoas}
                  onChange={(e) => setTargetRoas(e.target.value)}
                  data-testid="input-roas-rule"
                  className="mt-1"
                />
              </div>
            )}
            {(objective === "lead") && (
              <div>
                <Label>Target CPL (Rp)</Label>
                <Input
                  placeholder="e.g. 30000"
                  value={targetCpa}
                  onChange={(e) => setTargetCpa(e.target.value)}
                  data-testid="input-cpa-rule"
                  className="mt-1"
                />
              </div>
            )}
            <div>
              <Label>Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="mt-1" data-testid="select-platform-rule">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook Ads</SelectItem>
                  <SelectItem value="instagram">Instagram Ads</SelectItem>
                  <SelectItem value="both">Facebook + Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Agresivitas Rule</Label>
              <Select value={agresivitas} onValueChange={setAgresivitas}>
                <SelectTrigger className="mt-1" data-testid="select-agresivitas">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">🐢 Konservatif — aman, sedikit pause</SelectItem>
                  <SelectItem value="balanced">⚖️ Balanced — rekomendasi umum</SelectItem>
                  <SelectItem value="aggressive">🚀 Agresif — scale cepat, risiko tinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isLoading}
              data-testid="btn-generate-rules"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Rules...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Generate Automation Rules</>
              )}
            </Button>

            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-1">
              <p className="font-medium flex items-center gap-1"><Info className="h-3 w-3" />Cara pakai:</p>
              <p>1. Generate rules sesuai parameter campaign</p>
              <p>2. Buka Meta Ads Manager → Automated Rules</p>
              <p>3. Buat rule baru dan ikuti langkah yang diberikan</p>
              <p>4. Aktifkan rule dan monitor hasilnya</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {!result && !isLoading && (
            <div className="flex flex-col items-center justify-center h-72 text-center border-2 border-dashed rounded-xl">
              <Zap className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="font-semibold text-muted-foreground">Belum ada rules</p>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs">
                Isi parameter campaign di kiri, lalu klik "Generate Automation Rules"
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {[
                  { emoji: "🛑", label: "Stop Loss" },
                  { emoji: "🚀", label: "Scale Winner" },
                  { emoji: "🛡️", label: "Budget Protector" },
                  { emoji: "🔄", label: "Frequency Cap" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-1.5 text-muted-foreground border rounded-lg p-2">
                    <span>{t.emoji}</span>
                    <span>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-72 border-2 border-dashed rounded-xl">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="font-semibold">Merancang automation rules...</p>
              <p className="text-sm text-muted-foreground mt-1">AI menganalisa best practice Meta Ads</p>
            </div>
          )}

          {result && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{result.summary}</p>
                <Button variant="outline" size="sm" onClick={downloadAllRules} data-testid="btn-download-rules">
                  <Download className="h-3.5 w-3.5 mr-1" />Semua Rules
                </Button>
              </div>

              <Tabs defaultValue={result.rules[0]?.id || "0"}>
                <div className="overflow-x-auto pb-1">
                  <TabsList className="inline-flex h-auto gap-1 bg-muted/50 flex-nowrap min-w-max">
                    {result.rules.map((rule) => (
                      <TabsTrigger key={rule.id} value={rule.id} className="text-xs gap-1">
                        <span>{rule.emoji}</span>
                        <span className="hidden sm:inline">{rule.name}</span>
                        <span className="sm:hidden">{rule.name.split(" ")[0]}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {result.rules.map((rule) => (
                  <TabsContent key={rule.id} value={rule.id} className="mt-3 space-y-3">
                    <Card>
                      <CardHeader className="py-3 px-4 flex-row items-start justify-between space-y-0">
                        <div className="flex items-center gap-2">
                          {ruleTypeIcon(rule.type)}
                          <div>
                            <h3 className="font-bold text-base">{rule.emoji} {rule.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{rule.level}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs border ${ruleTypeBadge(rule.type)}`}>
                            {rule.type.replace("-", " ")}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => copyRule(rule)}
                            data-testid={`btn-copy-rule-${rule.id}`}
                          >
                            {copiedId === rule.id ? (
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 mr-1" />
                            )}
                            Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 py-2 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900">
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1.5">IF (Kondisi)</p>
                            <p className="text-sm">{rule.condition}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900">
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1.5">THEN (Aksi)</p>
                            <p className="text-sm">{rule.action}</p>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Kenapa Rule Ini Penting?</p>
                          <p className="text-sm text-muted-foreground">{rule.why}</p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <ChevronRight className="h-3.5 w-3.5 text-primary" />
                            Langkah Implementasi di Meta Ads Manager
                          </p>
                          <ol className="space-y-2">
                            {rule.steps.map((step, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/50 border text-xs">
                          <p className="font-semibold mb-1.5">Config Meta Ads Manager:</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                            <p>Apply to: <span className="text-foreground font-medium">{rule.metaConfig.applyTo}</span></p>
                            <p>Time range: <span className="text-foreground font-medium">{rule.metaConfig.time}</span></p>
                            <p>Notifikasi: <span className="text-foreground font-medium">{rule.metaConfig.notif ? "Ya" : "Tidak"}</span></p>
                            <p>Action: <span className="text-foreground font-medium">{rule.metaConfig.actionType}{rule.metaConfig.actionValue ? ` (${rule.metaConfig.actionValue})` : ""}</span></p>
                          </div>
                          {rule.metaConfig.conditions?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="font-semibold text-foreground">Kondisi detail:</p>
                              {rule.metaConfig.conditions.map((c, i) => (
                                <p key={i} className="text-muted-foreground">
                                  {c.metric} {c.operator} {c.value} (window: {c.window})
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>

              {result.implementationOrder?.length > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="py-3 px-4 space-y-0">
                    <CardTitle className="text-sm text-primary flex items-center gap-1.5">
                      <Zap className="h-4 w-4" />
                      Urutan Implementasi yang Disarankan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-2">
                    <ol className="space-y-1.5">
                      {result.implementationOrder.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {result.generalTips?.length > 0 && (
                <Card>
                  <CardHeader className="py-3 px-4 space-y-0">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-primary" />
                      Tips Penting Automation Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-2">
                    <ul className="space-y-1.5">
                      {result.generalTips.map((tip, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
