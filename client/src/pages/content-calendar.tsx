import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Loader2, Copy, Sparkles, Download } from "lucide-react";
import { SiInstagram, SiTiktok, SiFacebook, SiYoutube, SiLinkedin } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

const platforms = [
  { id: "instagram", name: "Instagram", icon: SiInstagram, color: "bg-pink-500/10 text-pink-600" },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, color: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-200" },
  { id: "facebook", name: "Facebook", icon: SiFacebook, color: "bg-blue-500/10 text-blue-600" },
  { id: "youtube", name: "YouTube", icon: SiYoutube, color: "bg-red-500/10 text-red-600" },
  { id: "linkedin", name: "LinkedIn", icon: SiLinkedin, color: "bg-sky-500/10 text-sky-600" },
];

const pillarPresets = [
  "Edukasi",
  "Soft Selling",
  "Hard Selling",
  "Behind the Scenes",
  "Testimoni",
  "Inspiratif",
  "Trending / Viral",
  "Promo",
];

interface CalendarItem {
  day: number;
  pillar: string;
  format: string;
  topic: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
}

interface CalendarResponse {
  items: CalendarItem[];
  niche: string;
  platform: string;
}

export default function ContentCalendar() {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [pillars, setPillars] = useState<string[]>(["Edukasi", "Soft Selling", "Testimoni"]);
  const [extraContext, setExtraContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CalendarResponse | null>(null);
  const [history, setHistory] = useState<CalendarResponse[]>([]);
  const { toast } = useToast();

  const togglePillar = (pillar: string) => {
    setPillars((prev) =>
      prev.includes(pillar) ? prev.filter((p) => p !== pillar) : [...prev, pillar],
    );
  };

  const handleGenerate = async () => {
    if (!niche.trim()) {
      toast({ title: "Lengkapi data", description: "Niche / bisnis wajib diisi", variant: "destructive" });
      return;
    }
    if (pillars.length === 0) {
      toast({ title: "Pilih pillar", description: "Pilih minimal 1 content pillar", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-content-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, audience, platform, pillars, extraContext }),
      });

      if (!response.ok) throw new Error("Failed to generate");
      const data: CalendarResponse = await response.json();

      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 10));
      toast({ title: "Berhasil", description: `Kalender 30 hari siap` });
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Gagal", description: "Coba lagi sebentar lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!result) return;
    const header = "Hari,Pillar,Format,Topik,Hook,Caption,CTA,Hashtag\n";
    const rows = result.items
      .map((it) => {
        const esc = (s: string) => `"${(s || "").replace(/"/g, '""')}"`;
        return [it.day, it.pillar, it.format, it.topic, it.hook, it.caption, it.cta, it.hashtags]
          .map((v) => esc(String(v ?? "")))
          .join(",");
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-calendar-${result.platform}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Diunduh", description: "File CSV siap dibuka di Excel/Sheets" });
  };

  const copyDay = (item: CalendarItem) => {
    const text = `Hari ${item.day} — ${item.pillar} · ${item.format}\nTopik: ${item.topic}\n\nHook: ${item.hook}\n\n${item.caption}\n\nCTA: ${item.cta}\n\n${item.hashtags}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin", description: `Konten hari ${item.day} disalin` });
  };

  const platformInfo = (id: string) => platforms.find((p) => p.id === id);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Content Calendar 30 Hari
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Rencanakan konten 1 bulan penuh — siap posting tiap hari, lengkap dengan hook & CTA
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create" data-testid="tab-create">Buat Kalender</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History ({history.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {platforms.map((p) => (
                        <Button
                          key={p.id}
                          variant={platform === p.id ? "default" : "outline"}
                          className="h-auto flex-col gap-2 py-3"
                          onClick={() => setPlatform(p.id)}
                          data-testid={`button-platform-${p.id}`}
                        >
                          <p.icon className="h-4 w-4" />
                          <span className="text-xs">{p.name}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Pillars</CardTitle>
                    <CardDescription>Pilih 2-5 pillar untuk dikombinasikan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {pillarPresets.map((p) => (
                        <Badge
                          key={p}
                          variant={pillars.includes(p) ? "default" : "outline"}
                          className="cursor-pointer hover-elevate"
                          onClick={() => togglePillar(p)}
                          data-testid={`badge-pillar-${p}`}
                        >
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detail Bisnis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="niche">Niche / Produk *</Label>
                      <Input
                        id="niche"
                        placeholder="Contoh: skincare untuk kulit berjerawat"
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        data-testid="input-niche"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audience">Target Audience</Label>
                      <Input
                        id="audience"
                        placeholder="Contoh: wanita 20-30 tahun"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        data-testid="input-audience"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="extraContext">Konteks Tambahan</Label>
                      <Textarea
                        id="extraContext"
                        placeholder="Promo, event, USP, larangan tone..."
                        value={extraContext}
                        onChange={(e) => setExtraContext(e.target.value)}
                        className="min-h-[80px]"
                        data-testid="input-extra"
                      />
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isLoading || !niche.trim()}
                      className="w-full"
                      data-testid="button-generate"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Membuat 30 hari konten...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Kalender 30 Hari
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <CardTitle>Kalender Konten</CardTitle>
                        <CardDescription>
                          {result
                            ? `30 hari · ${platformInfo(result.platform)?.name ?? result.platform}`
                            : "Output akan muncul di sini"}
                        </CardDescription>
                      </div>
                      {result && (
                        <Button size="sm" variant="outline" onClick={downloadCSV} data-testid="button-download-csv">
                          <Download className="h-3 w-3 mr-1" />
                          Download CSV
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {result ? (
                      <div className="space-y-2 max-h-[700px] overflow-auto">
                        {result.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="rounded-md border p-3 hover-elevate"
                            data-testid={`day-item-${item.day}`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="default" className="text-xs">Hari {item.day}</Badge>
                                <Badge variant="secondary" className="text-xs">{item.pillar}</Badge>
                                <Badge variant="outline" className="text-xs">{item.format}</Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => copyDay(item)}
                                data-testid={`button-copy-day-${item.day}`}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm font-semibold">{item.topic}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <span className="font-medium">Hook:</span> {item.hook}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.caption}
                            </p>
                            <div className="flex items-center justify-between mt-2 gap-2 text-xs">
                              <span className="text-primary font-medium">→ {item.cta}</span>
                              <span className="text-muted-foreground truncate">{item.hashtags}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada kalender</p>
                        <p className="text-sm mt-1">Pilih platform, pillar, isi niche → Generate</p>
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
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada history</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {history.map((entry, idx) => (
                  <Card
                    key={idx}
                    className="hover-elevate cursor-pointer"
                    onClick={() => setResult(entry)}
                    data-testid={`history-item-${idx}`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-1">{entry.niche}</CardTitle>
                      <CardDescription className="text-xs">
                        {platformInfo(entry.platform)?.name ?? entry.platform} · 30 hari
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {entry.items[0]?.topic}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
