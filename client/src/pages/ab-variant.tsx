import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shuffle, Loader2, Copy, Sparkles, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Variant {
  label: string;
  changeType: string;
  rationale: string;
  headline: string;
  body: string;
  cta: string;
}

interface VariantResponse {
  variants: Variant[];
  recommendation: string;
  testMetric: string;
  original: { headline: string; body: string; cta: string };
}

export default function AbVariant() {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("Meta Ads");
  const [count, setCount] = useState<3 | 5 | 7>(5);
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VariantResponse | null>(null);
  const [history, setHistory] = useState<VariantResponse[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!headline.trim() || !body.trim()) {
      toast({ title: "Lengkapi data", description: "Headline dan body wajib diisi", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-ab-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline, body, cta, audience, platform, count, language }),
      });

      if (!response.ok) throw new Error("Failed to generate");
      const data: VariantResponse = await response.json();

      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 20));
      toast({ title: "Berhasil", description: `${data.variants.length} varian siap di-test` });
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Gagal", description: "Coba lagi sebentar lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyVariant = (v: Variant) => {
    const text = `[${v.label} — ${v.changeType}]\n\nHeadline: ${v.headline}\n\nBody: ${v.body}\n\nCTA: ${v.cta}\n\nKenapa: ${v.rationale}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin", description: `Varian ${v.label} disalin` });
  };

  const handleCopyAll = () => {
    if (!result) return;
    const text = result.variants
      .map(
        (v) =>
          `=== VARIAN ${v.label} (${v.changeType}) ===\nHeadline: ${v.headline}\nBody: ${v.body}\nCTA: ${v.cta}\nRasional: ${v.rationale}`,
      )
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(`REKOMENDASI: ${result.recommendation}\nMETRIK: ${result.testMetric}\n\n${text}`);
    toast({ title: "Disalin semua", description: `${result.variants.length} varian disalin` });
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shuffle className="h-6 w-6 text-primary" />
            A/B Variant Generator
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ubah 1 copy iklan jadi 3-7 varian terkontrol — siap di-test untuk cari pemenang
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create" data-testid="tab-create">Buat Varian</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History ({history.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Copy Iklan Asli</CardTitle>
                    <CardDescription>Tempel copy yang ingin ditesting variannya</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="headline">Headline *</Label>
                      <Input
                        id="headline"
                        placeholder="Contoh: Glowing Skin dalam 7 Hari"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        data-testid="input-headline"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="body">Body / Primary Text *</Label>
                      <Textarea
                        id="body"
                        placeholder="Tempel body iklan asli kamu di sini..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="min-h-[120px]"
                        data-testid="input-body"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cta">Call to Action</Label>
                      <Input
                        id="cta"
                        placeholder="Contoh: Coba Sekarang"
                        value={cta}
                        onChange={(e) => setCta(e.target.value)}
                        data-testid="input-cta"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Setting Test</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform">Platform</Label>
                      <Input
                        id="platform"
                        placeholder="Meta Ads / TikTok / Google Ads"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        data-testid="input-platform"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="audience">Target Audience</Label>
                      <Input
                        id="audience"
                        placeholder="Contoh: wanita 25-35, peduli skincare"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        data-testid="input-audience"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Jumlah Varian</Label>
                      <div className="flex gap-2">
                        {[3, 5, 7].map((n) => (
                          <Button
                            key={n}
                            variant={count === n ? "default" : "outline"}
                            onClick={() => setCount(n as 3 | 5 | 7)}
                            className="flex-1"
                            data-testid={`button-count-${n}`}
                          >
                            {n}
                          </Button>
                        ))}
                      </div>
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
                      disabled={isLoading || !headline.trim() || !body.trim()}
                      className="w-full"
                      data-testid="button-generate"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Membuat varian...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate {count} Varian
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <CardTitle>Hasil Varian</CardTitle>
                        <CardDescription>
                          {result ? `${result.variants.length} varian siap di-test` : "Varian akan muncul di sini"}
                        </CardDescription>
                      </div>
                      {result && (
                        <Button size="sm" variant="outline" onClick={handleCopyAll} data-testid="button-copy-all">
                          <Copy className="h-3 w-3 mr-1" />
                          Salin Semua
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {result ? (
                      <div className="space-y-3">
                        <div className="rounded-md bg-primary/10 border border-primary/20 p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold">Rekomendasi Test</span>
                          </div>
                          <p className="text-xs">{result.recommendation}</p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Metrik utama:</span> {result.testMetric}
                          </p>
                        </div>

                        {result.variants.map((v, idx) => (
                          <div
                            key={idx}
                            className="rounded-md border p-4 space-y-2 hover-elevate"
                            data-testid={`variant-item-${idx}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="default">{v.label}</Badge>
                                <Badge variant="secondary" className="text-[10px]">
                                  {v.changeType}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => handleCopyVariant(v)}
                                data-testid={`button-copy-variant-${idx}`}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div>
                              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Headline</Label>
                              <p className="text-sm font-semibold">{v.headline}</p>
                            </div>
                            <div>
                              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Body</Label>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{v.body}</p>
                            </div>
                            <div>
                              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">CTA</Label>
                              <p className="text-sm font-medium text-primary">{v.cta}</p>
                            </div>
                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground italic">
                                <span className="font-medium not-italic">Kenapa varian ini:</span> {v.rationale}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-16 text-center text-muted-foreground">
                        <Shuffle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada varian</p>
                        <p className="text-sm mt-1">Tempel copy asli, set audience → Generate</p>
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
                    <Shuffle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada history</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {history.map((entry, idx) => (
                  <Card
                    key={idx}
                    className="hover-elevate cursor-pointer"
                    onClick={() => setResult(entry)}
                    data-testid={`history-item-${idx}`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-1">{entry.original.headline}</CardTitle>
                      <CardDescription className="text-xs">
                        {entry.variants.length} varian
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {entry.recommendation}
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
