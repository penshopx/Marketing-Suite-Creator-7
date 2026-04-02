import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2, ChevronRight, Copy, Download, RefreshCw,
  Eye, Code2, Globe, Smartphone, Monitor, Sparkles,
  CheckCircle2, Zap, ShoppingBag, GraduationCap, Megaphone,
  Users, Gift, Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const templates = [
  { id: "product", label: "🛒 Produk Fisik", desc: "Jualan produk e-commerce, COD-friendly", icon: ShoppingBag },
  { id: "digital", label: "💾 Produk Digital", desc: "Ebook, template, software, preset", icon: Sparkles },
  { id: "jasa", label: "🔧 Jasa / Service", desc: "Jasa desain, marketing, konsultasi", icon: Users },
  { id: "kursus", label: "🎓 Kursus / Bootcamp", desc: "Kelas online, mentoring, pelatihan", icon: GraduationCap },
  { id: "webinar", label: "🎙️ Webinar / Event", desc: "Event online, workshop, seminar", icon: Megaphone },
  { id: "leadmagnet", label: "🎁 Lead Magnet", desc: "Freebie, free trial, gratis ebook", icon: Gift },
];

const gayas = [
  { id: "formal", label: "Formal", desc: "Profesional & terpercaya" },
  { id: "santai", label: "Santai", desc: "Ramah & mudah dipahami" },
  { id: "gaul", label: "Gaul", desc: "Trendi & relate Gen Z" },
  { id: "provokatif", label: "Provokatif", desc: "Menggugah & bikin penasaran" },
  { id: "inspiratif", label: "Inspiratif", desc: "Memotivasi & emosional" },
];

const warna = [
  { id: "biru", label: "🔵 Biru Pro", hex: "#2563EB" },
  { id: "hijau", label: "🟢 Hijau Segar", hex: "#16A34A" },
  { id: "merah", label: "🔴 Merah Power", hex: "#DC2626" },
  { id: "ungu", label: "🟣 Ungu Premium", hex: "#7C3AED" },
  { id: "oranye", label: "🟠 Oranye Energi", hex: "#EA580C" },
  { id: "hitam", label: "⚫ Hitam Elegan", hex: "#111827" },
];

const sections = [
  { id: "hero", label: "Hero / Headline", locked: true },
  { id: "masalah", label: "Bagian Masalah", locked: false },
  { id: "solusi", label: "Solusi / Benefit", locked: true },
  { id: "fitur", label: "Fitur / Detail", locked: false },
  { id: "bonus", label: "Bonus Section", locked: false },
  { id: "testimoni", label: "Testimoni", locked: false },
  { id: "harga", label: "Pricing / Penawaran", locked: false },
  { id: "faq", label: "FAQ", locked: false },
  { id: "guarantee", label: "Garansi", locked: false },
  { id: "countdown", label: "Countdown Urgency", locked: false },
  { id: "cta", label: "Final CTA", locked: true },
];

export default function LpHtmlGenerator() {
  const [template, setTemplate] = useState("product");
  const [gaya, setGaya] = useState("santai");
  const [warnaId, setWarnaId] = useState("biru");
  const [produk, setProduk] = useState("");
  const [tagline, setTagline] = useState("");
  const [target, setTarget] = useState("");
  const [offer, setOffer] = useState("");
  const [cta, setCta] = useState("");
  const [noWa, setNoWa] = useState("");
  const [harga, setHarga] = useState("");
  const [hargaCoret, setHargaCoret] = useState("");
  const [enabledSections, setEnabledSections] = useState<Record<string, boolean>>({
    hero: true, masalah: true, solusi: true, fitur: true,
    bonus: false, testimoni: true, harga: true, faq: true,
    guarantee: false, countdown: false, cta: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [htmlResult, setHtmlResult] = useState<string>("");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const selectedWarna = warna.find((w) => w.id === warnaId) || warna[0];

  const toggleSection = (id: string) => {
    const sec = sections.find((s) => s.id === id);
    if (sec?.locked) return;
    setEnabledSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerate = async () => {
    if (!produk.trim()) {
      toast({ title: "Isi nama produk/bisnis dulu", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setHtmlResult("");
    try {
      const response = await fetch("/api/generate-lp-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template, gaya, warna: selectedWarna, produk, tagline, target,
          offer, cta, noWa, harga, hargaCoret, enabledSections,
        }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setHtmlResult(data.html);
    } catch {
      toast({ title: "Error", description: "Gagal generate landing page. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlResult);
    toast({ title: "HTML disalin!", description: "Siap paste ke website builder atau hosting" });
  };

  const handleDownload = () => {
    const blob = new Blob([htmlResult], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `landing-page-${produk.toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "File diunduh!", description: "landing-page.html" });
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              LP HTML Generator
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Isi detail produk → AI generate kode HTML landing page siap pakai — preview langsung di sini
            </p>
          </div>
          <Badge className="hidden md:flex items-center gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-0">
            <Zap className="h-3 w-3" />
            Siap Deploy
          </Badge>
        </div>

        {/* Template */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              data-testid={`btn-lph-tpl-${t.id}`}
              className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-sm ${
                template === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
              }`}
            >
              <p className="text-sm">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{t.desc}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-5">
          {/* Form Panel */}
          <div className="xl:col-span-2 space-y-4">
            {/* Info Produk */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Info Produk / Bisnis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Nama Produk / Bisnis *</Label>
                  <Input placeholder="contoh: Kursus Copywriting Kilat, Jasa Desain Logo..." value={produk} onChange={(e) => setProduk(e.target.value)} data-testid="input-lph-produk" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tagline / Headline Utama</Label>
                  <Input placeholder="contoh: Belajar Copywriting & Langsung Cuan dalam 7 Hari" value={tagline} onChange={(e) => setTagline(e.target.value)} data-testid="input-lph-tagline" />
                </div>
                <div className="space-y-1.5">
                  <Label>Target Pembeli / Audiens</Label>
                  <Input placeholder="contoh: Pebisnis online pemula, ibu rumah tangga, freelancer..." value={target} onChange={(e) => setTarget(e.target.value)} data-testid="input-lph-target" />
                </div>
                <div className="space-y-1.5">
                  <Label>Penawaran / Offer</Label>
                  <Textarea placeholder="contoh: Bonus 3 template, garansi uang kembali 7 hari, akses lifetime..." value={offer} onChange={(e) => setOffer(e.target.value)} className="min-h-[70px] text-sm" data-testid="input-lph-offer" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label>Harga Jual (Rp)</Label>
                    <Input placeholder="297.000" value={harga} onChange={(e) => setHarga(e.target.value)} data-testid="input-lph-harga" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Harga Coret (Rp)</Label>
                    <Input placeholder="597.000" value={hargaCoret} onChange={(e) => setHargaCoret(e.target.value)} data-testid="input-lph-hcoret" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Teks Tombol CTA</Label>
                  <Input placeholder="contoh: BELI SEKARANG, YA, SAYA MAU!, DAFTAR GRATIS" value={cta} onChange={(e) => setCta(e.target.value)} data-testid="input-lph-cta" />
                </div>
                <div className="space-y-1.5">
                  <Label>Nomor WhatsApp (opsional)</Label>
                  <Input placeholder="628123456789" value={noWa} onChange={(e) => setNoWa(e.target.value)} data-testid="input-lph-wa" />
                </div>
              </CardContent>
            </Card>

            {/* Gaya */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Gaya Bahasa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {gayas.map((g) => (
                    <button key={g.id} onClick={() => setGaya(g.id)} data-testid={`btn-lph-gaya-${g.id}`}
                      className={`p-2 rounded-lg border text-left transition-all ${gaya === g.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"}`}>
                      <p className="text-xs font-medium">{g.label}</p>
                      <p className="text-xs text-muted-foreground">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Warna */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Warna Tema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {warna.map((w) => (
                    <button key={w.id} onClick={() => setWarnaId(w.id)} data-testid={`btn-lph-warna-${w.id}`}
                      className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all ${warnaId === w.id ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/30"}`}>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: w.hex }} />
                        {w.label.split(" ").slice(1).join(" ")}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sections */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Section yang Dimasukkan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sections.map((sec) => (
                    <div key={sec.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{sec.label}</span>
                        {sec.locked && <Badge variant="outline" className="text-xs h-4">Wajib</Badge>}
                      </div>
                      <Switch
                        checked={enabledSections[sec.id]}
                        onCheckedChange={() => toggleSection(sec.id)}
                        disabled={sec.locked}
                        data-testid={`switch-lph-${sec.id}`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleGenerate} disabled={isLoading || !produk.trim()} className="w-full" size="lg" data-testid="button-gen-lph">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Landing Page HTML...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Generate Landing Page<ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>

          {/* Output Panel */}
          <div className="xl:col-span-3">
            {isLoading ? (
              <Card className="h-full min-h-[600px] flex items-center justify-center">
                <CardContent className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                  <div>
                    <p className="font-semibold">Generating HTML Landing Page...</p>
                    <p className="text-sm text-muted-foreground mt-1">AI sedang tulis kode HTML, CSS, dan copy sekaligus</p>
                  </div>
                  <div className="flex justify-center gap-2 flex-wrap text-xs text-muted-foreground">
                    {Object.entries(enabledSections).filter(([, v]) => v).map(([k]) => (
                      <Badge key={k} variant="outline" className="text-xs">{sections.find((s) => s.id === k)?.label}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : htmlResult ? (
              <Card className="h-full">
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-sm">Landing Page Siap!</span>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0 text-xs">
                        {htmlResult.length.toLocaleString()} chars
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Viewport toggle */}
                      <div className="flex border rounded-md overflow-hidden">
                        <button onClick={() => setViewMode("desktop")} data-testid="btn-vw-desktop"
                          className={`p-1.5 transition-colors ${viewMode === "desktop" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                          <Monitor className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setViewMode("mobile")} data-testid="btn-vw-mobile"
                          className={`p-1.5 transition-colors ${viewMode === "mobile" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                          <Smartphone className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Button size="sm" variant="outline" onClick={handleGenerate} data-testid="btn-regen-lph">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCopyHtml} data-testid="btn-copy-lph">
                        <Copy className="h-3.5 w-3.5 mr-1" />HTML
                      </Button>
                      <Button size="sm" onClick={handleDownload} data-testid="btn-dl-lph">
                        <Download className="h-3.5 w-3.5 mr-1" />Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <Tabs defaultValue="preview">
                    <div className="px-4 pt-2 border-b">
                      <TabsList className="h-8 bg-transparent gap-1">
                        <TabsTrigger value="preview" data-testid="tab-lph-preview"
                          className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
                          <Eye className="h-3 w-3" />Preview
                        </TabsTrigger>
                        <TabsTrigger value="code" data-testid="tab-lph-code"
                          className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
                          <Code2 className="h-3 w-3" />Kode HTML
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Preview Tab */}
                    <TabsContent value="preview" className="mt-0 p-3">
                      <div className={`mx-auto transition-all duration-300 border rounded-xl overflow-hidden shadow-lg ${viewMode === "mobile" ? "max-w-[390px]" : "w-full"}`}>
                        <div className="bg-muted/60 border-b px-3 py-1.5 flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                          </div>
                          <div className="flex-1 bg-background rounded text-xs px-2 py-0.5 text-muted-foreground truncate">
                            landing-page-preview
                          </div>
                          {viewMode === "mobile" && <Smartphone className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <iframe
                          ref={iframeRef}
                          srcDoc={htmlResult}
                          className="w-full border-0"
                          style={{ height: viewMode === "mobile" ? "700px" : "600px" }}
                          sandbox="allow-scripts allow-same-origin"
                          title="Landing Page Preview"
                          data-testid="iframe-lph-preview"
                        />
                      </div>
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        👆 Preview interaktif — scroll untuk lihat semua section
                      </p>
                    </TabsContent>

                    {/* Code Tab */}
                    <TabsContent value="code" className="mt-0 p-3">
                      <div className="relative">
                        <ScrollArea className="h-[560px] w-full">
                          <pre className="text-xs font-mono bg-muted/50 rounded-lg p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all" data-testid="pre-lph-code">
                            {htmlResult}
                          </pre>
                        </ScrollArea>
                        <button
                          onClick={handleCopyHtml}
                          data-testid="btn-copy-lph-code"
                          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-background border rounded text-xs hover:bg-muted transition-colors"
                        >
                          <Copy className="h-3 w-3" />Copy
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="p-2 bg-muted/40 rounded text-center">
                          <p className="text-xs text-muted-foreground">Total Ukuran</p>
                          <p className="text-sm font-semibold">{(htmlResult.length / 1024).toFixed(1)} KB</p>
                        </div>
                        <div className="p-2 bg-muted/40 rounded text-center">
                          <p className="text-xs text-muted-foreground">Mobile-Ready</p>
                          <p className="text-sm font-semibold text-green-600">✅ Ya</p>
                        </div>
                        <div className="p-2 bg-muted/40 rounded text-center">
                          <p className="text-xs text-muted-foreground">No-Dependency</p>
                          <p className="text-sm font-semibold text-green-600">✅ Ya</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full min-h-[600px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-5 max-w-sm">
                    <div className="w-24 h-24 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Globe className="h-12 w-12 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-xl">LP HTML Generator</p>
                      <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                        Isi form di kiri → klik Generate → dapat landing page HTML lengkap yang bisa langsung dipakai
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-left">
                      {[
                        { icon: Code2, label: "HTML + CSS inline, no dependency" },
                        { icon: Eye, label: "Live preview desktop & mobile" },
                        { icon: Smartphone, label: "Responsive mobile-friendly" },
                        { icon: Download, label: "Download .html siap deploy" },
                        { icon: Zap, label: "Copywriting persuasif otomatis" },
                        { icon: CheckCircle2, label: "Section lengkap + WhatsApp CTA" },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-start gap-2 text-sm">
                          <Icon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
