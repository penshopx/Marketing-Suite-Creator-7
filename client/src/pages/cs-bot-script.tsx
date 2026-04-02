import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles, Bot, Loader2, Copy, CheckCircle2, Download,
  MessageSquare, BookOpen, AlertCircle, ChevronRight, Info, Zap, ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCampaignStore } from "@/hooks/use-campaign-store";
import { CampaignContextBar } from "@/components/campaign-context-bar";

interface QnaItem {
  pertanyaan: string;
  jawaban: string;
  kategori: string;
  prioritas: "Tinggi" | "Sedang" | "Rendah";
  keywords: string[];
}

interface ConversationStep {
  step: number;
  trigger: string;
  respon: string;
  nextStep?: string;
  isEscalation?: boolean;
}

interface BotScript {
  pesanSelamatDatang: string;
  pesanOffline: string;
  pesanEskalasi: string;
  qna: QnaItem[];
  alurPercakapan: ConversationStep[];
  objeksiUmum: { objeksi: string; respon: string }[];
  platformRekomendasi: { nama: string; fitur: string; harga: string }[];
  tipsImplementasi: string[];
}

export default function CsBotScript() {
  const [produk, setProduk] = useState("");
  const [harga, setHarga] = useState("");
  const [deskripsiProduk, setDeskripsiProduk] = useState("");
  const [target, setTarget] = useState("");
  const [platform, setPlatform] = useState("whatsapp");
  const [tone, setTone] = useState("ramah");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BotScript | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { toast } = useToast();
  const { campaign, save, markToolUsed } = useCampaignStore();
  const [, navigate] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("produk");
    const h = params.get("harga");
    const t = params.get("target");
    if (p) setProduk(p);
    else if (campaign.produk) setProduk(campaign.produk);
    if (h) setHarga(h);
    else if (campaign.harga) setHarga(campaign.harga);
    if (t) setTarget(t);
    else if (campaign.target) setTarget(campaign.target);
    if (campaign.usp) setDeskripsiProduk(campaign.usp);
  }, []);

  const handleGenerate = async () => {
    if (!produk.trim()) {
      toast({ title: "Nama produk wajib diisi", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate-cs-bot-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produk, harga, deskripsiProduk, target, platform, tone }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
      markToolUsed("cs-bot-script");
      save({ produk, harga, target, usp: deskripsiProduk });
    } catch {
      toast({ title: "Error", description: "Gagal generate CS bot script", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copySection = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
    toast({ title: `${label} disalin!` });
  };

  const downloadScript = () => {
    if (!result) return;
    const sections = [
      `=== CS BOT SCRIPT: ${produk} ===\n`,
      `PESAN SELAMAT DATANG:\n${result.pesanSelamatDatang}`,
      `\nPESAN OFFLINE:\n${result.pesanOffline}`,
      `\nPESAN ESKALASI KE HUMAN:\n${result.pesanEskalasi}`,
      `\n${"=".repeat(60)}\nDATABASE Q&A (${result.qna.length} item)\n${"=".repeat(60)}`,
      ...result.qna.map((q, i) => `\n${i + 1}. [${q.kategori}] ${q.pertanyaan}\nJawaban: ${q.jawaban}\nKeywords: ${q.keywords.join(", ")}`),
      `\n${"=".repeat(60)}\nALUR PERCAKAPAN\n${"=".repeat(60)}`,
      ...result.alurPercakapan.map((s) => `\nStep ${s.step}: ${s.trigger}\n→ ${s.respon}${s.nextStep ? `\nNext: ${s.nextStep}` : ""}`),
      `\n${"=".repeat(60)}\nHANDLE OBJEKSI\n${"=".repeat(60)}`,
      ...result.objeksiUmum.map((o) => `\nObjeksi: ${o.objeksi}\nRespon: ${o.respon}`),
      `\n${"=".repeat(60)}\nTIPS IMPLEMENTASI\n${"=".repeat(60)}\n`,
      result.tipsImplementasi.map((t, i) => `${i + 1}. ${t}`).join("\n"),
    ].join("\n");
    const blob = new Blob([sections], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cs-bot-script-${produk.slice(0, 20).replace(/\s/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const prioritasColor = (p: string) =>
    p === "Tinggi"
      ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800"
      : p === "Sedang"
      ? "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800"
      : "bg-muted text-muted-foreground border-border";

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            CS Bot Script Builder
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Generate knowledge base Q&A + alur percakapan CS siap pakai di Respond.io, Qontak, dll
          </p>
        </div>
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          Terinspirasi Cekat.AI
        </Badge>
      </div>

      <CampaignContextBar
        toolId="cs-bot-script"
        onAutoFill={(c) => {
          if (c.produk) setProduk(c.produk);
          if (c.harga) setHarga(c.harga);
          if (c.target) setTarget(c.target);
          if (c.usp) setDeskripsiProduk(c.usp);
        }}
        currentValues={{ produk, harga, target, usp: deskripsiProduk }}
        onSave={() => save({ produk, harga, target, usp: deskripsiProduk })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detail Produk & CS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nama Produk / Bisnis *</Label>
              <Input
                placeholder="e.g. Serum Wajah, Kursus Trading"
                value={produk}
                onChange={(e) => setProduk(e.target.value)}
                data-testid="input-produk-csbot"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Harga & Paket</Label>
              <Input
                placeholder="e.g. Rp 149k / Paket Basic 299k, Pro 599k"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                data-testid="input-harga-csbot"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Deskripsi Produk + FAQ Sering Ditanya</Label>
              <Textarea
                placeholder="Jelaskan produk Anda, fitur, garansi, pengiriman, kebijakan refund, dll. Semakin detail = script lebih akurat"
                value={deskripsiProduk}
                onChange={(e) => setDeskripsiProduk(e.target.value)}
                data-testid="input-desc-csbot"
                className="mt-1 h-28 resize-none"
              />
            </div>
            <div>
              <Label>Target Customer</Label>
              <Input
                placeholder="e.g. Wanita 20-35, ibu muda, pebisnis online"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                data-testid="input-target-csbot"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Channel / Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="mt-1" data-testid="select-platform-csbot">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp Business</SelectItem>
                  <SelectItem value="instagram">Instagram DM</SelectItem>
                  <SelectItem value="facebook">Facebook Messenger</SelectItem>
                  <SelectItem value="multichannel">Multi-Channel (WA + IG + FB)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kepribadian CS Bot</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="mt-1" data-testid="select-tone-csbot">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ramah">😊 Ramah & Hangat — seperti sahabat</SelectItem>
                  <SelectItem value="profesional">💼 Profesional — formal tapi helpful</SelectItem>
                  <SelectItem value="cepat">⚡ Cepat & Efisien — straight to the point</SelectItem>
                  <SelectItem value="premium">👑 Premium — eksklusif, high-end feel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isLoading}
              data-testid="btn-generate-csbot"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Script...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Generate CS Bot Script</>
              )}
            </Button>

            {result && (
              <Button variant="outline" className="w-full" size="sm" onClick={downloadScript} data-testid="btn-dl-csbot">
                <Download className="h-3.5 w-3.5 mr-1" />Download Script Lengkap
              </Button>
            )}

            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-1">
              <p className="font-medium flex items-center gap-1"><Info className="h-3 w-3" />Kompatibel dengan:</p>
              <p>• Respond.io, Qontak, Kommo</p>
              <p>• WA Business API + ManyChat</p>
              <p>• Cekat.AI, Jubelio, Tokotalk</p>
              <p>• Atau CS manual pakai script ini</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {!result && !isLoading && (
            <div className="flex flex-col items-center justify-center h-72 text-center border-2 border-dashed rounded-xl">
              <Bot className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="font-semibold text-muted-foreground">Belum ada script</p>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs">
                Isi detail produk di sebelah kiri, lalu generate script Q&A dan alur CS lengkap
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-72 border-2 border-dashed rounded-xl">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="font-semibold">AI membangun knowledge base...</p>
              <p className="text-sm text-muted-foreground mt-1">Merancang Q&A, alur chat, dan handle objeksi</p>
            </div>
          )}

          {result && (
            <Tabs defaultValue="welcome">
              <div className="overflow-x-auto pb-1">
                <TabsList className="inline-flex h-auto gap-1 bg-muted/50 flex-nowrap min-w-max text-xs">
                  <TabsTrigger value="welcome" className="text-xs">💬 Welcome</TabsTrigger>
                  <TabsTrigger value="qna" className="text-xs">📚 Q&A ({result.qna.length})</TabsTrigger>
                  <TabsTrigger value="flow" className="text-xs">🔄 Alur Chat</TabsTrigger>
                  <TabsTrigger value="objeksi" className="text-xs">🛡️ Handle Objeksi</TabsTrigger>
                  <TabsTrigger value="platform" className="text-xs">⚙️ Platform</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="welcome" className="mt-3 space-y-3">
                {[
                  { key: "welcome", label: "💬 Pesan Selamat Datang", text: result.pesanSelamatDatang, icon: MessageSquare, color: "green" },
                  { key: "offline", label: "🌙 Pesan Offline / Di Luar Jam Kerja", text: result.pesanOffline, icon: AlertCircle, color: "orange" },
                  { key: "eskalasi", label: "👤 Eskalasi ke Human Agent", text: result.pesanEskalasi, icon: Zap, color: "blue" },
                ].map(({ key, label, text, color }) => (
                  <Card key={key}>
                    <CardHeader className="py-2.5 px-4 flex-row items-center justify-between space-y-0">
                      <h3 className="font-semibold text-sm">{label}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => copySection(text, label)}
                      >
                        {copiedSection === label ? (
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 mr-1" />
                        )}
                        Copy
                      </Button>
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                      <div className={`bg-[#e8f8e0] dark:bg-[#1a3a1a] rounded-xl rounded-tl-none p-3 border border-${color}-200 dark:border-${color}-900`}>
                        <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
                          {text}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="qna" className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{result.qna.length} pertanyaan ter-cover dalam knowledge base</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => copySection(
                      result.qna.map((q) => `Q: ${q.pertanyaan}\nA: ${q.jawaban}`).join("\n\n"),
                      "Database Q&A"
                    )}
                  >
                    {copiedSection === "Database Q&A" ? <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    Copy Semua Q&A
                  </Button>
                </div>
                {result.qna.map((item, i) => (
                  <Card key={i} className="hover:shadow-sm transition-shadow">
                    <CardHeader className="py-2.5 px-4 flex-row items-start justify-between space-y-0">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{item.pertanyaan}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-xs text-muted-foreground">{item.kategori}</span>
                            {item.keywords.slice(0, 3).map((kw) => (
                              <span key={kw} className="text-xs px-1.5 bg-muted rounded text-muted-foreground">{kw}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Badge className={`text-xs border flex-shrink-0 ${prioritasColor(item.prioritas)}`}>
                        {item.prioritas}
                      </Badge>
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                      <div className="bg-[#e8f8e0] dark:bg-[#1a3a1a] rounded-xl rounded-tl-none p-2.5 border border-green-200 dark:border-green-900">
                        <p className="text-sm leading-relaxed">{item.jawaban}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="flow" className="mt-3 space-y-3">
                <p className="text-xs text-muted-foreground">Alur percakapan dari greeting hingga closing atau eskalasi</p>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  <div className="space-y-3">
                    {result.alurPercakapan.map((step) => (
                      <div key={step.step} className="flex gap-4 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-xs font-bold ${step.isEscalation ? "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 border-2 border-orange-300 dark:border-orange-700" : "bg-primary/10 text-primary border-2 border-primary/20"}`}>
                          {step.step}
                        </div>
                        <Card className="flex-1 hover:shadow-sm transition-shadow">
                          <CardContent className="py-2.5 px-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">{step.trigger}</p>
                            <div className="bg-[#e8f8e0] dark:bg-[#1a3a1a] rounded-xl rounded-tl-none p-2.5 mt-1.5 border border-green-200 dark:border-green-900">
                              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
                                {step.respon}
                              </pre>
                            </div>
                            {step.nextStep && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <ChevronRight className="h-3 w-3" />
                                Lanjut ke: {step.nextStep}
                              </p>
                            )}
                            {step.isEscalation && (
                              <Badge className="mt-1 text-xs bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400 border border-orange-200">
                                Eskalasi ke Human
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="objeksi" className="mt-3 space-y-3">
                <p className="text-xs text-muted-foreground">Skrip untuk menangani keberatan umum dari calon pembeli</p>
                {result.objeksiUmum.map((item, i) => (
                  <Card key={i}>
                    <CardContent className="pt-3 pb-3 px-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <p className="font-semibold text-sm">{item.objeksi}</p>
                      </div>
                      <div className="bg-[#e8f8e0] dark:bg-[#1a3a1a] rounded-xl rounded-tl-none p-2.5 border border-green-200 dark:border-green-900 ml-6">
                        <p className="text-sm leading-relaxed">{item.respon}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="platform" className="mt-3 space-y-3">
                <p className="text-xs text-muted-foreground">Platform rekomendasi untuk mengimplementasikan script ini</p>
                {result.platformRekomendasi.map((p, i) => (
                  <Card key={i} className="hover:shadow-sm transition-shadow">
                    <CardContent className="pt-3 pb-3 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm flex items-center gap-1.5">
                            <Zap className="h-4 w-4 text-primary" />
                            {p.nama}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{p.fitur}</p>
                        </div>
                        <Badge variant="outline" className="flex-shrink-0 text-xs">{p.harga}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="py-3 px-4 space-y-0">
                    <CardTitle className="text-sm text-primary flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      Tips Implementasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-2">
                    <ul className="space-y-1.5">
                      {result.tipsImplementasi.map((t, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <ChevronRight className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-blue-500/5">
                  <CardHeader className="pb-2 pt-3 px-4 space-y-0">
                    <CardTitle className="text-sm text-primary flex items-center gap-1.5">
                      <ArrowRight className="h-4 w-4" />
                      Lanjutkan ke Fitur Berikutnya
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button variant="outline" size="sm"
                        className="border-green-300 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 justify-start h-auto py-2.5 px-3"
                        onClick={() => navigate(`/wa-broadcast?produk=${encodeURIComponent(produk)}&harga=${encodeURIComponent(harga)}&target=${encodeURIComponent(target)}`)}
                        data-testid="btn-csbot-to-broadcast">
                        <div className="flex flex-col items-start text-left gap-0.5">
                          <span className="font-semibold text-xs flex items-center gap-1">WA Broadcast <ArrowRight className="h-3 w-3" /></span>
                          <span className="text-xs opacity-70 font-normal">Follow-up dari Q&A CS</span>
                        </div>
                      </Button>
                      <Button variant="outline" size="sm"
                        className="border-purple-300 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 justify-start h-auto py-2.5 px-3"
                        onClick={() => navigate(`/customer-journey?produk=${encodeURIComponent(produk)}&target=${encodeURIComponent(target)}&harga=${encodeURIComponent(harga)}`)}
                        data-testid="btn-csbot-to-journey">
                        <div className="flex flex-col items-start text-left gap-0.5">
                          <span className="font-semibold text-xs flex items-center gap-1">Customer Journey <ArrowRight className="h-3 w-3" /></span>
                          <span className="text-xs opacity-70 font-normal">Petakan touchpoint customer</span>
                        </div>
                      </Button>
                      <Button variant="outline" size="sm"
                        className="border-orange-300 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 justify-start h-auto py-2.5 px-3"
                        onClick={() => navigate(`/interest-finder?niche=${encodeURIComponent(produk)}&target=${encodeURIComponent(target)}`)}
                        data-testid="btn-csbot-to-interests">
                        <div className="flex flex-col items-start text-left gap-0.5">
                          <span className="font-semibold text-xs flex items-center gap-1">Interest Finder <ArrowRight className="h-3 w-3" /></span>
                          <span className="text-xs opacity-70 font-normal">Temukan targeting FB/IG</span>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
