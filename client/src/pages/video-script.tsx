import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clapperboard, Loader2, Sparkles, ChevronRight, Copy,
  CheckCircle2, RefreshCw, Download, Zap, Hash,
  Clock, Eye, Volume2, Play, Film, List,
  Camera, MessageSquare,
} from "lucide-react";
import { SiTiktok, SiInstagram, SiYoutube } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

const platforms = [
  { id: "tiktok", label: "TikTok", icon: SiTiktok, color: "text-black dark:text-white", maxDuration: 60, format: "9:16 Vertikal" },
  { id: "reels", label: "Instagram Reels", icon: SiInstagram, color: "text-pink-500", maxDuration: 90, format: "9:16 Vertikal" },
  { id: "shorts", label: "YouTube Shorts", icon: SiYoutube, color: "text-red-500", maxDuration: 60, format: "9:16 Vertikal" },
];

const videoObjectives = [
  { id: "viral", label: "🔥 Viral / Entertainment", desc: "Konten menghibur yang berpotensi viral" },
  { id: "edukasi", label: "📚 Edukasi / Tips", desc: "Konten informatif & tutorial" },
  { id: "jualan", label: "💰 Jualan / Promosi", desc: "Promosi produk atau jasa" },
  { id: "awareness", label: "📢 Brand Awareness", desc: "Kenalkan brand / personal branding" },
  { id: "review", label: "⭐ Review / Testimoni", desc: "Ulasan jujur produk" },
  { id: "challenge", label: "🎯 Challenge / Trend", desc: "Ikuti trend atau bikin challenge" },
  { id: "story", label: "📖 Storytelling", desc: "Cerita inspiratif atau pengalaman" },
];

const videoStyles = [
  { id: "talking_head", label: "🎤 Talking Head", desc: "Ngomong langsung ke kamera" },
  { id: "voiceover", label: "🎙️ Voiceover + Visual", desc: "Narasi dengan footage/gambar" },
  { id: "text_visual", label: "📝 Text + Visual", desc: "Teks berjalan + visual/footage" },
  { id: "tutorial", label: "🖥️ Tutorial / Demo", desc: "Screen record atau demo langsung" },
  { id: "pov", label: "👁️ POV / Lifestyle", desc: "Point of view, aktivitas sehari-hari" },
];

const durations = [
  { id: "15", label: "15 detik", desc: "Super pendek, hook driven" },
  { id: "30", label: "30 detik", desc: "Sweet spot TikTok/Reels" },
  { id: "45", label: "45 detik", desc: "Konten sedang" },
  { id: "60", label: "60 detik", desc: "Penjelasan lengkap" },
];

interface SceneItem {
  timestamp: string;
  visual: string;
  narasi: string;
  textOverlay: string;
  broll: string;
}

interface VideoScript {
  judul: string;
  platform: string;
  durasi: string;
  hook: {
    teks: string;
    visual: string;
    alasan: string;
  };
  scenes: SceneItem[];
  cta: {
    teks: string;
    visual: string;
    action: string;
  };
  caption: string;
  hashtags: string[];
  tips: string[];
  hookAlternatives: string[];
}

export default function VideoScript() {
  const [platform, setPlatform] = useState("tiktok");
  const [topik, setTopik] = useState("");
  const [produk, setProduk] = useState("");
  const [objective, setObjective] = useState("jualan");
  const [videoStyle, setVideoStyle] = useState("talking_head");
  const [duration, setDuration] = useState("30");
  const [targetAudience, setTargetAudience] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VideoScript | null>(null);
  const [activeTab, setActiveTab] = useState("script");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topik.trim()) {
      toast({ title: "Isi topik dulu", description: "Topik atau ide konten wajib diisi", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/generate-video-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, topik, produk, objective, videoStyle, duration, targetAudience }),
      });
      if (!response.ok) throw new Error("Gagal generate");
      const data = await response.json();
      setResult(data);
      setActiveTab("script");
    } catch {
      toast({ title: "Error", description: "Gagal generate script. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyFull = () => {
    if (!result) return;
    const text = [
      `=== ${result.judul} ===`,
      `Platform: ${result.platform} | Durasi: ${result.durasi}`,
      `\n--- HOOK (0-3 detik) ---`,
      result.hook.teks,
      `Visual: ${result.hook.visual}`,
      `\n--- SCENE BREAKDOWN ---`,
      ...result.scenes.map((s) => `[${s.timestamp}]\nNarasi: ${s.narasi}\nVisual: ${s.visual}\nText Overlay: ${s.textOverlay}\nB-roll: ${s.broll}`),
      `\n--- CTA ---`,
      result.cta.teks,
      `\n--- CAPTION ---`,
      result.caption,
      `\n--- HASHTAG ---`,
      result.hashtags.join(" "),
    ].join("\n\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: "Script lengkap berhasil disalin" });
  };

  const downloadScript = () => {
    if (!result) return;
    const text = [
      `VIDEO SCRIPT: ${result.judul}`,
      `Platform: ${result.platform} | Durasi: ${result.durasi}`,
      `Dibuat: ${new Date().toLocaleString("id-ID")}`,
      `\n${"=".repeat(50)}`,
      `\n[HOOK - 0 sampai 3 detik]`,
      `NARASI: ${result.hook.teks}`,
      `VISUAL: ${result.hook.visual}`,
      `KENAPA HOOK INI: ${result.hook.alasan}`,
      `\nALTERNATIF HOOK:`,
      ...result.hookAlternatives.map((h, i) => `${i + 1}. ${h}`),
      `\n${"=".repeat(50)}`,
      `\n[SCENE BREAKDOWN]`,
      ...result.scenes.map((s) => [
        `\n⏱️ ${s.timestamp}`,
        `NARASI: ${s.narasi}`,
        `VISUAL: ${s.visual}`,
        `TEXT OVERLAY: ${s.textOverlay}`,
        `B-ROLL: ${s.broll}`,
      ].join("\n")),
      `\n${"=".repeat(50)}`,
      `\n[CTA]`,
      `NARASI: ${result.cta.teks}`,
      `VISUAL: ${result.cta.visual}`,
      `ACTION: ${result.cta.action}`,
      `\n${"=".repeat(50)}`,
      `\n[CAPTION POSTING]`,
      result.caption,
      `\n[HASHTAG PACK]`,
      result.hashtags.join(" "),
      `\n${"=".repeat(50)}`,
      `\n[TIPS PRODUKSI]`,
      ...result.tips.map((t, i) => `${i + 1}. ${t}`),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `script-${topik.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const platformInfo = platforms.find((p) => p.id === platform);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Clapperboard className="h-6 w-6 text-primary" />
              AI Video Script Generator
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Generate script lengkap TikTok/Reels/Shorts — hook 3 detik, storyboard visual, caption & hashtag
            </p>
          </div>
          <Badge className="hidden md:flex items-center gap-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-0">
            <Film className="h-3 w-3" />
            Short-Form Video
          </Badge>
        </div>

        {/* Platform Selector */}
        <div className="grid grid-cols-3 gap-3">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isActive = platform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                data-testid={`button-platform-${p.id}`}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                  isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <Icon className={`h-5 w-5 ${p.color} flex-shrink-0`} />
                <div>
                  <p className={`text-sm font-semibold ${isActive ? "text-primary" : ""}`}>{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.format}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          {/* Form */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Ide Konten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Topik / Ide Konten *</Label>
                  <Input
                    placeholder="contoh: Tips jualan online modal HP, 3 kesalahan pemula di Meta Ads..."
                    value={topik}
                    onChange={(e) => setTopik(e.target.value)}
                    data-testid="input-script-topik"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Produk / Brand (opsional)</Label>
                  <Input
                    placeholder="contoh: Kelas Online Marketing Pro, Skincare Brand X..."
                    value={produk}
                    onChange={(e) => setProduk(e.target.value)}
                    data-testid="input-script-produk"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Target Audiens</Label>
                  <Input
                    placeholder="contoh: Pebisnis online pemula, Ibu muda 25-35 tahun..."
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    data-testid="input-script-audience"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" />
                  Format Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Tujuan Konten</Label>
                  <Select value={objective} onValueChange={setObjective}>
                    <SelectTrigger data-testid="select-objective">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {videoObjectives.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          <div>
                            <span className="font-medium">{o.label}</span>
                            <span className="text-muted-foreground text-xs ml-2">{o.desc}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Style Video</Label>
                  <Select value={videoStyle} onValueChange={setVideoStyle}>
                    <SelectTrigger data-testid="select-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {videoStyles.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <div>
                            <span className="font-medium">{s.label}</span>
                            <span className="text-muted-foreground text-xs ml-2">{s.desc}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Durasi Target</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {durations.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDuration(d.id)}
                        data-testid={`button-dur-${d.id}`}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          duration === d.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                        }`}
                      >
                        <p className={`text-xs font-semibold ${duration === d.id ? "text-primary" : ""}`}>{d.label}</p>
                        <p className="text-xs text-muted-foreground">{d.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={isLoading || !topik.trim()}
              className="w-full"
              size="lg"
              data-testid="button-generate-script"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Script...</>
              ) : (
                <><Clapperboard className="mr-2 h-4 w-4" />Generate Script {duration}s<ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>

          {/* Output */}
          <div className="xl:col-span-3">
            {result ? (
              <Card className="h-full">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Script Siap
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{result.judul}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleGenerate} data-testid="button-regen-script">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={copyFull} data-testid="button-copy-script">
                        <Copy className="h-3.5 w-3.5 mr-1" />Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadScript} data-testid="button-dl-script">
                        <Download className="h-3.5 w-3.5 mr-1" />Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="px-4 pt-2 border-b">
                      <TabsList className="h-8 bg-transparent gap-1">
                        {[
                          { id: "script", label: "🎬 Script", icon: Film },
                          { id: "hook", label: "⚡ Hook", icon: Zap },
                          { id: "caption", label: "📝 Caption", icon: MessageSquare },
                          { id: "hashtag", label: "#️⃣ Hashtag", icon: Hash },
                          { id: "tips", label: "💡 Tips", icon: List },
                        ].map((t) => (
                          <TabsTrigger
                            key={t.id}
                            value={t.id}
                            data-testid={`tab-vs-${t.id}`}
                            className="text-xs h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            {t.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    {/* Script Tab */}
                    <TabsContent value="script" className="p-4 mt-0">
                      <ScrollArea className="h-[480px]">
                        <div className="space-y-3">
                          {/* Duration info */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Durasi: {result.durasi}</span>
                            <span>•</span>
                            <span>{platformInfo?.format}</span>
                            <span>•</span>
                            <span>{result.scenes.length} scene</span>
                          </div>

                          {/* Hook */}
                          <div className="rounded-lg border-2 border-orange-300 bg-orange-50 dark:bg-orange-950/20 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-orange-500 text-white text-xs">HOOK 0-3 detik</Badge>
                              <span className="text-xs text-muted-foreground">Penentu viewer lanjut atau scroll</span>
                            </div>
                            <p className="font-bold text-sm">{result.hook.teks}</p>
                            <div className="mt-2 flex items-start gap-1.5 text-xs text-orange-700 dark:text-orange-400">
                              <Eye className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>{result.hook.visual}</span>
                            </div>
                          </div>

                          {/* Scenes */}
                          {result.scenes.map((scene, i) => (
                            <div key={i} className="rounded-lg border bg-card p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs font-mono">{scene.timestamp}</Badge>
                                <span className="text-xs text-muted-foreground">Scene {i + 1}</span>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                  <Volume2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">NARASI</p>
                                    <p className="font-medium">{scene.narasi}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Camera className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">VISUAL / SHOOT</p>
                                    <p className="text-foreground/80">{scene.visual}</p>
                                  </div>
                                </div>
                                {scene.textOverlay && (
                                  <div className="flex items-start gap-2">
                                    <MessageSquare className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-0.5">TEXT OVERLAY</p>
                                      <p className="text-foreground/80">{scene.textOverlay}</p>
                                    </div>
                                  </div>
                                )}
                                {scene.broll && (
                                  <div className="flex items-start gap-2">
                                    <Film className="h-3.5 w-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-0.5">B-ROLL</p>
                                      <p className="text-foreground/80">{scene.broll}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* CTA */}
                          <div className="rounded-lg border-2 border-green-300 bg-green-50 dark:bg-green-950/20 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-green-500 text-white text-xs">CTA</Badge>
                            </div>
                            <p className="font-bold text-sm">{result.cta.teks}</p>
                            <p className="text-xs text-green-700 dark:text-green-400 mt-1">{result.cta.visual}</p>
                            <p className="text-xs text-muted-foreground mt-1">Action: {result.cta.action}</p>
                          </div>
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    {/* Hook Tab */}
                    <TabsContent value="hook" className="p-4 mt-0">
                      <div className="space-y-4">
                        <div className="rounded-lg border-2 border-primary p-4 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">HOOK UTAMA (Recommended)</p>
                          <p className="text-lg font-bold">{result.hook.teks}</p>
                          <p className="text-sm text-muted-foreground">{result.hook.visual}</p>
                          <div className="bg-primary/10 rounded p-2 mt-2">
                            <p className="text-xs font-medium text-primary">Mengapa efektif:</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{result.hook.alasan}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold mb-3">3 Alternatif Hook Lainnya</p>
                          <div className="space-y-2">
                            {result.hookAlternatives.map((h, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                <div className="flex-1">
                                  <p className="text-sm">{h}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 text-xs flex-shrink-0"
                                  onClick={() => { navigator.clipboard.writeText(h); toast({ title: "Disalin!" }); }}
                                  data-testid={`copy-hook-alt-${i}`}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Caption Tab */}
                    <TabsContent value="caption" className="p-4 mt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">Caption untuk {platformInfo?.label}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { navigator.clipboard.writeText(result.caption); toast({ title: "Disalin!", description: "Caption berhasil disalin" }); }}
                            data-testid="copy-caption"
                          >
                            <Copy className="h-3.5 w-3.5 mr-1" />Copy
                          </Button>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 border">
                          <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{result.caption}</pre>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {result.caption.length} karakter
                        </p>
                      </div>
                    </TabsContent>

                    {/* Hashtag Tab */}
                    <TabsContent value="hashtag" className="p-4 mt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{result.hashtags.length} Hashtag Optimal</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { navigator.clipboard.writeText(result.hashtags.join(" ")); toast({ title: "Disalin!" }); }}
                            data-testid="copy-hashtags-script"
                          >
                            <Copy className="h-3.5 w-3.5 mr-1" />Copy All
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.hashtags.map((tag, i) => (
                            <button
                              key={i}
                              onClick={() => { navigator.clipboard.writeText(tag); toast({ title: "Disalin!", description: tag }); }}
                              className="px-2.5 py-1 rounded-full border text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                              data-testid={`hashtag-${i}`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tips Tab */}
                    <TabsContent value="tips" className="p-4 mt-0">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold">Tips Produksi & Optimasi</p>
                        <div className="space-y-2">
                          {result.tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                              <span className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                              <p className="text-sm">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full min-h-[500px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-5 max-w-sm">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Clapperboard className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Script Video Siap dalam 1 Klik</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Isi topik konten, pilih platform & durasi, dan AI generate script lengkap
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-left max-w-xs mx-auto">
                      {[
                        { icon: Zap, label: "Hook 3 detik yang scroll-stopping" },
                        { icon: Film, label: "Storyboard scene by scene" },
                        { icon: Volume2, label: "Narasi + arahan visual & B-roll" },
                        { icon: MessageSquare, label: "Text overlay per scene" },
                        { icon: Hash, label: "Hashtag pack optimal" },
                        { icon: Camera, label: "3 alternatif hook variations" },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2 text-sm">
                          <Icon className="h-4 w-4 text-primary flex-shrink-0" />
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
