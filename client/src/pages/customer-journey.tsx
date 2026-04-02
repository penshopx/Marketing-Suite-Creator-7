import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles, Map, Loader2, Copy, CheckCircle2, Download,
  ArrowRight, Users, Target, TrendingUp, Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JourneyStage {
  id: string;
  nama: string;
  emoji: string;
  deskripsi: string;
  mindsetCustomer: string;
  pertanyaanCustomer: string[];
  touchpoints: string[];
  konten: { tipe: string; contoh: string }[];
  kpi: string[];
  kesalahan: string[];
  peluang: string;
}

interface JourneyResult {
  produk: string;
  ringkasan: string;
  stages: JourneyStage[];
  winningMoments: string[];
  contentCalendar: { tahap: string; kontenIdea: string; frekuensi: string; platform: string }[];
  bottlenecks: { tahap: string; masalah: string; solusi: string }[];
}

const stageColors: Record<string, string> = {
  aware: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  consideration: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  purchase: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
  retention: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800",
  advocacy: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
};

export default function CustomerJourney() {
  const [produk, setProduk] = useState("");
  const [target, setTarget] = useState("");
  const [harga, setHarga] = useState("");
  const [model, setModel] = useState("ecommerce");
  const [kompetitor, setKompetitor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<JourneyResult | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!produk.trim()) {
      toast({ title: "Nama produk wajib diisi", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    setSelectedStage(null);
    try {
      const res = await fetch("/api/generate-customer-journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produk, target, harga, model, kompetitor }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
      setSelectedStage(data.stages?.[0]?.id || null);
    } catch {
      toast({ title: "Error", description: "Gagal generate customer journey", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyJourney = () => {
    if (!result) return;
    const text = result.stages
      .map((s) => `=== ${s.emoji} ${s.nama} ===\n${s.deskripsi}\n\nMindset: ${s.mindsetCustomer}\nTouchpoints: ${s.touchpoints.join(", ")}\nKPI: ${s.kpi.join(", ")}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Customer Journey disalin!" });
  };

  const downloadJourney = () => {
    if (!result) return;
    const lines = [
      `CUSTOMER JOURNEY MAP: ${result.produk}`,
      `\n${result.ringkasan}`,
      `\n${"=".repeat(60)}\n`,
      ...result.stages.map((s) => [
        `${s.emoji} TAHAP: ${s.nama}`,
        `\nDeskripsi: ${s.deskripsi}`,
        `\nMindset: ${s.mindsetCustomer}`,
        `\nPertanyaan Customer:\n${s.pertanyaanCustomer.map((q) => `  • ${q}`).join("\n")}`,
        `\nTouchpoints: ${s.touchpoints.join(", ")}`,
        `\nIdea Konten:\n${s.konten.map((k) => `  • [${k.tipe}] ${k.contoh}`).join("\n")}`,
        `\nKPI: ${s.kpi.join(", ")}`,
        `\nKesalahan Umum:\n${s.kesalahan.map((k) => `  ❌ ${k}`).join("\n")}`,
        `\nPeluang: ${s.peluang}`,
        "\n" + "-".repeat(50),
      ].join("\n")),
      `\n${"=".repeat(60)}\nBOTTLENECKS\n${"=".repeat(60)}`,
      ...result.bottlenecks.map((b) => `\nTahap: ${b.tahap}\nMasalah: ${b.masalah}\nSolusi: ${b.solusi}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customer-journey-${produk.slice(0, 20).replace(/\s/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeStage = result?.stages.find((s) => s.id === selectedStage);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" />
            Customer Journey Mapper
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Petakan perjalanan customer lengkap dari kenal produk hingga jadi brand advocate
          </p>
        </div>
        <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
          Terinspirasi Cekat.AI CRM
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detail Bisnis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Produk / Bisnis *</Label>
              <Input
                placeholder="e.g. Skincare, SaaS, Kursus Online"
                value={produk}
                onChange={(e) => setProduk(e.target.value)}
                data-testid="input-produk-journey"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Target Customer</Label>
              <Textarea
                placeholder="Siapa customer ideal Anda? Umur, profesi, pain point..."
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                data-testid="input-target-journey"
                className="mt-1 h-16 resize-none"
              />
            </div>
            <div>
              <Label>Harga Produk</Label>
              <Input
                placeholder="e.g. Rp 149k / Rp 299k-599k"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                data-testid="input-harga-journey"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Model Bisnis</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="mt-1" data-testid="select-model-journey">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecommerce">🛒 E-commerce / Produk Fisik</SelectItem>
                  <SelectItem value="digital">💾 Produk Digital / Ebook</SelectItem>
                  <SelectItem value="kursus">🎓 Kursus / Edukasi</SelectItem>
                  <SelectItem value="jasa">🔧 Jasa / Service</SelectItem>
                  <SelectItem value="saas">💻 SaaS / Aplikasi</SelectItem>
                  <SelectItem value="fmcg">🧴 FMCG / Skincare / Kuliner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kompetitor Utama (opsional)</Label>
              <Input
                placeholder="e.g. Wardah, Sociolla, dll"
                value={kompetitor}
                onChange={(e) => setKompetitor(e.target.value)}
                data-testid="input-kompetitor-journey"
                className="mt-1"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isLoading}
              data-testid="btn-generate-journey"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mapping Journey...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Generate Journey Map</>
              )}
            </Button>

            {result && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={copyJourney} data-testid="btn-copy-journey">
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadJourney} data-testid="btn-dl-journey">
                  <Download className="h-3.5 w-3.5 mr-1" />Download
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {!result && !isLoading && (
            <div className="flex flex-col items-center justify-center h-72 text-center border-2 border-dashed rounded-xl">
              <Map className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="font-semibold text-muted-foreground">Belum ada peta perjalanan</p>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs">
                Isi detail bisnis dan generate peta customer journey lengkap 5 tahap
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                {["Aware", "Pertimbang", "Beli", "Loyal", "Advocate"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="border rounded-full px-2 py-0.5">{s}</span>
                    {i < 4 && <ArrowRight className="h-3 w-3 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-72 border-2 border-dashed rounded-xl">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="font-semibold">Memetakan customer journey...</p>
              <p className="text-sm text-muted-foreground mt-1">AI menganalisa 5 tahap dari Aware → Advocacy</p>
            </div>
          )}

          {result && (
            <>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-3 pb-3 px-4">
                  <p className="text-sm">{result.ringkasan}</p>
                </CardContent>
              </Card>

              {/* Stage navigation */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {result.stages.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStage(stage.id)}
                    data-testid={`btn-stage-${stage.id}`}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all flex-shrink-0 ${
                      selectedStage === stage.id
                        ? `${stageColors[stage.id] || "bg-primary/10 text-primary border-primary/30"} shadow-sm`
                        : "hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <span>{stage.emoji}</span>
                    <span>{stage.nama}</span>
                  </button>
                ))}
              </div>

              {activeStage && (
                <Card key={activeStage.id} className={`border-2 ${stageColors[activeStage.id]?.includes("border") ? "" : ""}`}>
                  <CardHeader className="pb-3 px-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <span className="text-2xl">{activeStage.emoji}</span>
                          Tahap {activeStage.nama}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">{activeStage.deskripsi}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          Mindset Customer
                        </p>
                        <p className="text-sm italic">"{activeStage.mindsetCustomer}"</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Pertanyaan yang Dipikirkan</p>
                        <ul className="space-y-1">
                          {activeStage.pertanyaanCustomer.map((q, i) => (
                            <li key={i} className="text-sm flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">?</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Touchpoints</p>
                        <div className="flex flex-wrap gap-1.5">
                          {activeStage.touchpoints.map((tp) => (
                            <span key={tp} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-md">{tp}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Target className="h-3.5 w-3.5" />
                          Idea Konten yang Efektif
                        </p>
                        <ul className="space-y-1.5">
                          {activeStage.konten.map((k, i) => (
                            <li key={i} className="text-sm flex items-start gap-1.5">
                              <span className="text-xs px-1.5 bg-muted rounded text-muted-foreground flex-shrink-0 mt-0.5">{k.tipe}</span>
                              <span>{k.contoh}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          KPI Ukuran Keberhasilan
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {activeStage.kpi.map((k) => (
                            <span key={k} className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-md">{k}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Kesalahan yang Harus Dihindari</p>
                        <ul className="space-y-1">
                          {activeStage.kesalahan.map((k, i) => (
                            <li key={i} className="text-sm flex items-start gap-1.5 text-red-600 dark:text-red-400">
                              <span className="flex-shrink-0">✗</span>
                              <span>{k}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">💡 Peluang Utama:</p>
                        <p className="text-sm mt-0.5">{activeStage.peluang}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.bottlenecks?.length > 0 && (
                <Card>
                  <CardHeader className="py-3 px-4 space-y-0">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-orange-500" />
                      Bottleneck & Cara Mengatasinya
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-2 space-y-2">
                    {result.bottlenecks.map((b, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-lg border">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{b.tahap}</span>
                        </div>
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-1"><span className="mt-0.5">✗</span>{b.masalah}</p>
                        <p className="text-sm text-green-600 dark:text-green-400 flex items-start gap-1"><span className="mt-0.5">✓</span>{b.solusi}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {result.winningMoments?.length > 0 && (
                <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/10">
                  <CardHeader className="py-3 px-4 space-y-0">
                    <CardTitle className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      Winning Moments — Momen Kritis yang Bisa Dioptimalkan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-2">
                    <ul className="space-y-1.5">
                      {result.winningMoments.map((m, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0">⭐</span>
                          <span>{m}</span>
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
