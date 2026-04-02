import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle, Loader2, Copy, Sparkles, ChevronRight,
  Flame, Snowflake, ThermometerSun, RefreshCw, CheckCircle2,
  Phone, Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const prospectStages = [
  { id: "cold", label: "Cold Prospect", icon: Snowflake, color: "text-blue-500", desc: "Belum kenal produk sama sekali" },
  { id: "warm", label: "Warm Prospect", icon: ThermometerSun, color: "text-orange-500", desc: "Sudah tahu, belum ambil keputusan" },
  { id: "hot", label: "Hot Prospect", icon: Flame, color: "text-red-500", desc: "Sudah minat, tinggal closing" },
];

const objectionTypes = [
  "Harga terlalu mahal",
  "Mau pikir-pikir dulu",
  "Nanti saja kalau ada uang",
  "Sudah punya produk serupa",
  "Tidak yakin hasilnya",
  "Tidak ada waktu",
  "Perlu konsultasi pasangan/keluarga",
  "Takut tertipu / tidak percaya",
  "Belum butuh sekarang",
  "Sudah pernah coba yang lain gagal",
];

const closingTechniques = [
  { id: "fomo", label: "FOMO (Fear of Missing Out)", desc: "Batas waktu & stok terbatas" },
  { id: "testimonial", label: "Testimonial Closing", desc: "Bukti nyata dari pembeli lain" },
  { id: "guarantee", label: "Garansi Uang Kembali", desc: "Hilangkan rasa takut rugi" },
  { id: "value_stack", label: "Value Stack", desc: "Tumpuk nilai & bonus yang didapat" },
  { id: "empathy", label: "Empathy Closing", desc: "Sambungkan ke pain point utama" },
  { id: "comparison", label: "Comparison Closing", desc: "Bandingkan dengan alternatif lain" },
  { id: "question", label: "Question Closing", desc: "Ajukan pertanyaan yang mengarah ke 'ya'" },
  { id: "story", label: "Story Closing", desc: "Cerita sukses yang relatable" },
];

const funnelTypes = [
  { id: "short", label: "Short Form Funnel", desc: "Langsung WA/order tanpa LP panjang" },
  { id: "full", label: "Full Form Funnel", desc: "Melalui Landing Page → WA → Order" },
];

const platforms = [
  { id: "whatsapp", label: "WhatsApp", icon: "💬" },
  { id: "instagram_dm", label: "Instagram DM", icon: "📷" },
  { id: "tiktok_dm", label: "TikTok DM", icon: "🎵" },
  { id: "email", label: "Email", icon: "📧" },
];

interface GeneratedScript {
  id: string;
  productName: string;
  stage: string;
  technique: string;
  scripts: {
    opening: string;
    closing: string;
    followUp1: string;
    followUp2: string;
    followUp3: string;
  };
  createdAt: Date;
}

export default function CSClosing() {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productBenefit, setProductBenefit] = useState("");
  const [stage, setStage] = useState("warm");
  const [objection, setObjection] = useState("Harga terlalu mahal");
  const [technique, setTechnique] = useState("fomo");
  const [funnelType, setFunnelType] = useState("full");
  const [platform, setPlatform] = useState("whatsapp");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedScript | null>(null);
  const [history, setHistory] = useState<GeneratedScript[]>([]);
  const [activeSection, setActiveSection] = useState("opening");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast({ title: "Lengkapi form", description: "Nama produk wajib diisi", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-closing-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, productPrice, productBenefit, stage, objection, technique, funnelType, platform }),
      });
      if (!response.ok) throw new Error("Gagal generate script");
      const data = await response.json();
      const newResult: GeneratedScript = {
        id: Date.now().toString(),
        productName,
        stage,
        technique,
        scripts: data.scripts,
        createdAt: new Date(),
      };
      setResult(newResult);
      setHistory((prev) => [newResult, ...prev.slice(0, 9)]);
      setActiveSection("opening");
    } catch {
      toast({ title: "Error", description: "Gagal generate. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: `${label} berhasil disalin` });
  };

  const scriptSections = result
    ? [
        { key: "opening", label: "📩 Opening", content: result.scripts.opening },
        { key: "closing", label: "🔥 Closing Script", content: result.scripts.closing },
        { key: "followUp1", label: "⏰ Follow-up 1", content: result.scripts.followUp1 },
        { key: "followUp2", label: "📌 Follow-up 2", content: result.scripts.followUp2 },
        { key: "followUp3", label: "🎯 Follow-up Final", content: result.scripts.followUp3 },
      ]
    : [];

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              CS Closing Script Generator
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Generate script closing & follow-up WhatsApp yang convert berdasarkan stage prospect
            </p>
          </div>
          <Badge variant="secondary" className="hidden md:flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Teknik Closing Pro
          </Badge>
        </div>

        {/* Prospect Stage Selector */}
        <div className="grid grid-cols-3 gap-3">
          {prospectStages.map((s) => {
            const Icon = s.icon;
            const isActive = stage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStage(s.id)}
                data-testid={`button-stage-${s.id}`}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${s.color}`} />
                  <span className={`text-sm font-semibold ${isActive ? "text-primary" : ""}`}>{s.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          {/* Form */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Info Produk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Nama Produk *</Label>
                  <Input
                    placeholder="contoh: Kelas Meta Ads Mastery"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    data-testid="input-cs-product-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Harga Produk</Label>
                  <Input
                    placeholder="contoh: Rp 97.000"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    data-testid="input-cs-price"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Manfaat / Hasil Utama</Label>
                  <Textarea
                    placeholder="contoh: Bisa mulai ngiklan dari 100k, dapat script iklan yang winning, bimbingan sampai berhasil..."
                    value={productBenefit}
                    onChange={(e) => setProductBenefit(e.target.value)}
                    className="min-h-[70px] resize-none"
                    data-testid="input-cs-benefit"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  Strategi Closing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Platform</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {platforms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPlatform(p.id)}
                        data-testid={`button-platform-${p.id}`}
                        className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                          platform === p.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"
                        }`}
                      >
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Tipe Funnel</Label>
                  <div className="space-y-1.5">
                    {funnelTypes.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFunnelType(f.id)}
                        data-testid={`button-funnel-${f.id}`}
                        className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                          funnelType === f.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className={`text-xs font-medium ${funnelType === f.id ? "text-primary" : ""}`}>{f.label}</div>
                        <div className="text-xs text-muted-foreground">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Objeksi Utama Prospect</Label>
                  <Select value={objection} onValueChange={setObjection}>
                    <SelectTrigger data-testid="select-objection">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {objectionTypes.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Teknik Closing</Label>
                  <Select value={technique} onValueChange={setTechnique}>
                    <SelectTrigger data-testid="select-technique">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {closingTechniques.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          <div>
                            <span className="font-medium">{t.label}</span>
                            <span className="text-muted-foreground text-xs ml-2">{t.desc}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {closingTechniques.find((t) => t.id === technique)?.desc}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !productName.trim()}
              className="w-full"
              size="lg"
              data-testid="button-generate-closing"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sedang Generate...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Generate Script Closing<ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>

            {history.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Riwayat Script</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {history.slice(0, 5).map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setResult(h)}
                      className="w-full text-left p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-xs font-medium truncate">{h.productName}</div>
                      <div className="text-xs text-muted-foreground">
                        {prospectStages.find((s) => s.id === h.stage)?.label} •{" "}
                        {new Date(h.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Result */}
          <Card className="xl:col-span-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    {result ? `Script: ${result.productName}` : "Hasil Script"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {result
                      ? `${prospectStages.find((s) => s.id === result.stage)?.label} • ${closingTechniques.find((t) => t.id === result.technique)?.label}`
                      : "Script closing dan follow-up akan muncul di sini"}
                  </CardDescription>
                </div>
                {result && (
                  <Button size="sm" variant="outline" onClick={handleGenerate} data-testid="button-regenerate">
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    Regenerate
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[520px] flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                    <p className="text-sm font-medium">AI sedang menulis script closing...</p>
                    <p className="text-xs text-muted-foreground">Membuat opening + closing + 3 follow-up</p>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {scriptSections.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setActiveSection(s.key)}
                        data-testid={`tab-script-${s.key}`}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          activeSection === s.key
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {scriptSections.map((s) =>
                    activeSection === s.key ? (
                      <div key={s.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{s.label}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyText(s.content, s.label)}
                            data-testid={`button-copy-${s.key}`}
                          >
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <ScrollArea className="h-[430px]">
                          <div className="bg-muted/50 rounded-lg p-4 border">
                            <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{s.content}</pre>
                          </div>
                        </ScrollArea>
                      </div>
                    ) : null
                  )}

                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => {
                      const allScripts = scriptSections.map((s) => `===== ${s.label} =====\n\n${s.content}`).join("\n\n");
                      copyText(allScripts, "Semua script");
                    }}
                    data-testid="button-copy-all"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Semua Script Sekaligus
                  </Button>
                </div>
              ) : (
                <div className="h-[520px] flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Belum ada script</p>
                      <p className="text-xs text-muted-foreground mt-1">Isi form & pilih teknik closing, lalu klik Generate</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-w-[280px] mx-auto text-left">
                      {[
                        { icon: "📩", label: "Opening yang engaging" },
                        { icon: "🔥", label: "Closing script persuasif" },
                        { icon: "⏰", label: "Follow-up sequence" },
                        { icon: "🎯", label: "Final push closing" },
                      ].map(({ icon, label }) => (
                        <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{icon}</span>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
