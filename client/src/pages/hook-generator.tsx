import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Anchor, Loader2, Copy, Sparkles } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiYoutube } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

const platforms = [
  { id: "tiktok", name: "TikTok", icon: SiTiktok, color: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-200" },
  { id: "instagram", name: "Instagram Reels", icon: SiInstagram, color: "bg-pink-500/10 text-pink-600" },
  { id: "meta", name: "Meta Ads", icon: SiFacebook, color: "bg-blue-500/10 text-blue-600" },
  { id: "youtube", name: "YouTube Shorts", icon: SiYoutube, color: "bg-red-500/10 text-red-600" },
  { id: "general", name: "Umum", icon: Sparkles, color: "bg-purple-500/10 text-purple-600" },
];

const hookStyles = [
  { id: "question", name: "Pertanyaan", desc: "Hook berupa pertanyaan yang relevan" },
  { id: "shocking_stat", name: "Statistik Mengejutkan", desc: "Angka atau fakta yang bikin kaget" },
  { id: "story", name: "Pembuka Cerita", desc: "Cerita pendek yang relate" },
  { id: "controversial", name: "Kontroversial", desc: "Pernyataan berani / counter-intuitive" },
  { id: "problem", name: "Problem Agitation", desc: "Sebut masalah yang menyakitkan" },
  { id: "curiosity", name: "Curiosity Gap", desc: "Bikin penasaran ingin tahu lanjutannya" },
  { id: "mixed", name: "Campuran (Recommended)", desc: "Variasi semua gaya sekaligus" },
];

interface GeneratedHook {
  style: string;
  text: string;
}

interface HookResponse {
  hooks: GeneratedHook[];
  platform: string;
  topic: string;
}

export default function HookGenerator() {
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [keyMessage, setKeyMessage] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [style, setStyle] = useState("mixed");
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HookResponse | null>(null);
  const [history, setHistory] = useState<HookResponse[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Lengkapi data",
        description: "Topik / produk wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-hook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetAudience,
          keyMessage,
          platform,
          style,
          language,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate hooks");
      const data: HookResponse = await response.json();

      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 20));
      toast({
        title: "Berhasil",
        description: `${data.hooks.length} hook siap dipakai`,
      });
    } catch (error) {
      console.error("Error generating hooks:", error);
      toast({
        title: "Gagal generate",
        description: "Coba lagi sebentar lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin", description: "Hook disalin ke clipboard" });
  };

  const handleCopyAll = () => {
    if (!result) return;
    const all = result.hooks
      .map((h, i) => `${i + 1}. [${h.style}] ${h.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(all);
    toast({ title: "Disalin semua", description: "Semua hook disalin ke clipboard" });
  };

  const platformInfo = (id: string) => platforms.find((p) => p.id === id);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Anchor className="h-6 w-6 text-primary" />
            Hook Generator
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Buat 6 variasi hook yang menghentikan scroll dalam 3 detik pertama
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create" data-testid="tab-create">Buat Hook</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              History ({history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pilih Platform</CardTitle>
                    <CardDescription>Hook akan disesuaikan dengan platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {platforms.map((p) => (
                        <Button
                          key={p.id}
                          variant={platform === p.id ? "default" : "outline"}
                          className="h-auto flex-col gap-2 py-4"
                          onClick={() => setPlatform(p.id)}
                          data-testid={`button-platform-${p.id}`}
                        >
                          <p.icon className="h-5 w-5" />
                          <span className="text-xs">{p.name}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gaya Hook</CardTitle>
                    <CardDescription>Pilih satu gaya atau campuran</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {hookStyles.map((s) => (
                        <Button
                          key={s.id}
                          variant={style === s.id ? "default" : "outline"}
                          className="h-auto flex-col items-start gap-1 py-3 px-3 text-left"
                          onClick={() => setStyle(s.id)}
                          data-testid={`button-style-${s.id}`}
                        >
                          <span className="text-sm font-medium">{s.name}</span>
                          <span className="text-xs opacity-70 font-normal whitespace-normal">
                            {s.desc}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detail Konten</CardTitle>
                    <CardDescription>Isi minimal topik / produknya</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Topik / Produk *</Label>
                      <Input
                        id="topic"
                        placeholder="Contoh: skincare untuk kulit berjerawat"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        data-testid="input-topic"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">Target Audience</Label>
                      <Input
                        id="targetAudience"
                        placeholder="Contoh: wanita 20-30 tahun, ibu muda"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        data-testid="input-target-audience"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="keyMessage">Pesan / Penawaran Utama</Label>
                      <Textarea
                        id="keyMessage"
                        placeholder="Contoh: serum vitamin C yang menghilangkan jerawat dalam 7 hari"
                        value={keyMessage}
                        onChange={(e) => setKeyMessage(e.target.value)}
                        className="min-h-[80px]"
                        data-testid="input-key-message"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Bahasa</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={language === "id" ? "default" : "outline"}
                          onClick={() => setLanguage("id")}
                          className="flex-1"
                          data-testid="button-lang-id"
                        >
                          Indonesia
                        </Button>
                        <Button
                          variant={language === "en" ? "default" : "outline"}
                          onClick={() => setLanguage("en")}
                          className="flex-1"
                          data-testid="button-lang-en"
                        >
                          English
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isLoading || !topic.trim()}
                      className="w-full"
                      data-testid="button-generate-hook"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Membuat hook...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate 6 Hook
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="sticky top-6">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <CardTitle>Hasil Hook</CardTitle>
                        <CardDescription>
                          {result
                            ? `${result.hooks.length} variasi untuk ${platformInfo(result.platform)?.name ?? result.platform}`
                            : "Hook akan muncul di sini"}
                        </CardDescription>
                      </div>
                      {result && (
                        <Badge className={platformInfo(result.platform)?.color}>
                          {platformInfo(result.platform)?.name ?? result.platform}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {result ? (
                      <div className="space-y-3">
                        {result.hooks.map((hook, idx) => (
                          <div
                            key={idx}
                            className="rounded-md border p-3 space-y-2 hover-elevate"
                            data-testid={`hook-item-${idx}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                                {hook.style}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => handleCopy(hook.text)}
                                data-testid={`button-copy-hook-${idx}`}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm leading-relaxed font-medium">{hook.text}</p>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleCopyAll}
                          data-testid="button-copy-all"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Salin Semua Hook
                        </Button>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        <Anchor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada hook</p>
                        <p className="text-sm mt-1">Isi data lalu klik Generate</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {history.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Anchor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada history</p>
                    <p className="text-sm mt-1">Hook yang sudah Anda buat akan muncul di sini</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {history.map((entry, idx) => {
                  const info = platformInfo(entry.platform);
                  return (
                    <Card
                      key={idx}
                      className="hover-elevate cursor-pointer"
                      onClick={() => setResult(entry)}
                      data-testid={`history-item-${idx}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base line-clamp-1">{entry.topic}</CardTitle>
                          <Badge className={info?.color}>{info?.name ?? entry.platform}</Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {entry.hooks.length} hook
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {entry.hooks[0]?.text}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
