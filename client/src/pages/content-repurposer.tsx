import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RefreshCw, Loader2, Sparkles, ChevronRight, Copy,
  CheckCircle2, Download, Repeat2, Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SiTiktok, SiInstagram, SiWhatsapp, SiYoutube, SiX, SiLinkedin } from "react-icons/si";

const contentTypes = [
  { id: "ad_copy", label: "Copy Iklan (FB/IG)" },
  { id: "testimonial", label: "Testimoni Pelanggan" },
  { id: "article", label: "Artikel / Blog Post" },
  { id: "product_desc", label: "Deskripsi Produk" },
  { id: "story", label: "Cerita / Storytelling" },
  { id: "tips", label: "Tips / How-to Content" },
  { id: "announcement", label: "Pengumuman / Promo" },
  { id: "any", label: "Konten Lainnya" },
];

const outputFormats = [
  { id: "fb_ad", label: "Facebook Ad", icon: "📱", platform: "Meta Ads", color: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800" },
  { id: "ig_caption", label: "Instagram Caption", icon: null, siIcon: SiInstagram, platform: "Instagram", color: "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800" },
  { id: "tiktok_hook", label: "TikTok Script", icon: null, siIcon: SiTiktok, platform: "TikTok", color: "bg-black/5 border-gray-200 dark:bg-gray-900/30 dark:border-gray-700" },
  { id: "wa_broadcast", label: "WA Broadcast", icon: null, siIcon: SiWhatsapp, platform: "WhatsApp", color: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" },
  { id: "yt_shorts", label: "YouTube Shorts Script", icon: null, siIcon: SiYoutube, platform: "YouTube", color: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800" },
  { id: "twitter_thread", label: "X / Twitter Thread", icon: null, siIcon: SiX, platform: "Twitter/X", color: "bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:border-gray-700" },
  { id: "linkedin_post", label: "LinkedIn Post", icon: null, siIcon: SiLinkedin, platform: "LinkedIn", color: "bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700" },
  { id: "email_blast", label: "Email Broadcast", icon: "📧", platform: "Email", color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800" },
  { id: "seo_meta", label: "SEO Meta Description", icon: "🔍", platform: "Google / SEO", color: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800" },
];

interface RepurposedContent {
  formatId: string;
  content: string;
  tips: string;
  charCount?: number;
}

interface RepurposeResult {
  originalSummary: string;
  repurposed: RepurposedContent[];
}

export default function ContentRepurposer() {
  const [originalContent, setOriginalContent] = useState("");
  const [contentType, setContentType] = useState("ad_copy");
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["fb_ad", "ig_caption", "tiktok_hook", "wa_broadcast", "email_blast"]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RepurposeResult | null>(null);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleFormat = (id: string) => {
    setSelectedFormats((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleRepurpose = async () => {
    if (!originalContent.trim()) {
      toast({ title: "Masukkan konten dulu", description: "Konten asal wajib diisi", variant: "destructive" });
      return;
    }
    if (selectedFormats.length === 0) {
      toast({ title: "Pilih format", description: "Pilih minimal satu format output", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/repurpose-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalContent, contentType, selectedFormats }),
      });
      if (!response.ok) throw new Error("Gagal repurpose");
      const data = await response.json();
      setResult(data);
      setActiveFormat(selectedFormats[0] || null);
    } catch {
      toast({ title: "Error", description: "Gagal repurpose konten. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyAll = () => {
    if (!result) return;
    const text = result.repurposed.map((r) => {
      const fmt = outputFormats.find((f) => f.id === r.formatId);
      return `===== ${fmt?.label || r.formatId} =====\n${r.content}\n\n💡 Tips: ${r.tips}`;
    }).join("\n\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Semua disalin!", description: `${result.repurposed.length} versi konten berhasil disalin` });
  };

  const downloadAll = () => {
    if (!result) return;
    const text = [
      `CONTENT REPURPOSER OUTPUT`,
      `Dibuat: ${new Date().toLocaleString("id-ID")}`,
      `Ringkasan: ${result.originalSummary}`,
      "",
      ...result.repurposed.map((r) => {
        const fmt = outputFormats.find((f) => f.id === r.formatId);
        return `\n===== ${fmt?.label?.toUpperCase() || r.formatId} (${fmt?.platform}) =====\n\n${r.content}\n\n💡 Tips: ${r.tips}`;
      }),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repurposed-content-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeResult = result?.repurposed.find((r) => r.formatId === activeFormat);
  const activeFormatInfo = outputFormats.find((f) => f.id === activeFormat);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Repeat2 className="h-6 w-6 text-primary" />
              Content Repurposer
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              1 konten → repurpose otomatis ke 9 platform/format berbeda dalam sekali klik
            </p>
          </div>
          <Badge className="hidden md:flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-0">
            <Zap className="h-3 w-3" />
            AI Auto-Repurpose
          </Badge>
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          {/* Input */}
          <div className="xl:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Konten Asal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Jenis Konten Asal</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger data-testid="select-content-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Paste Konten di Sini *</Label>
                    <span className="text-xs text-muted-foreground">{originalContent.length} karakter</span>
                  </div>
                  <Textarea
                    placeholder="Paste copy iklan, artikel, testimoni, atau konten apapun yang ingin direpurpose..."
                    value={originalContent}
                    onChange={(e) => setOriginalContent(e.target.value)}
                    className="min-h-[180px] resize-none text-sm"
                    data-testid="textarea-original-content"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Pilih Format Output</CardTitle>
                  <div className="flex gap-1.5">
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={() => setSelectedFormats(outputFormats.map((f) => f.id))}
                    >Semua</button>
                    <span className="text-muted-foreground">·</span>
                    <button
                      className="text-xs text-muted-foreground hover:underline"
                      onClick={() => setSelectedFormats([])}
                    >Reset</button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {outputFormats.map((f) => {
                  const isSelected = selectedFormats.includes(f.id);
                  const SiIcon = f.siIcon;
                  return (
                    <button
                      key={f.id}
                      onClick={() => toggleFormat(f.id)}
                      data-testid={`toggle-format-${f.id}`}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {isSelected
                          ? <CheckCircle2 className="h-3.5 w-3.5" />
                          : SiIcon
                          ? <SiIcon className="h-3 w-3 text-muted-foreground" />
                          : <span className="text-xs">{f.icon}</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-medium block ${isSelected ? "text-primary" : ""}`}>{f.label}</span>
                        <span className="text-xs text-muted-foreground">{f.platform}</span>
                      </div>
                    </button>
                  );
                })}
                <p className="text-xs text-muted-foreground text-center pt-1">
                  {selectedFormats.length} format dipilih
                </p>
              </CardContent>
            </Card>

            <Button
              onClick={handleRepurpose}
              disabled={isLoading || !originalContent.trim() || selectedFormats.length === 0}
              className="w-full"
              size="lg"
              data-testid="button-repurpose"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sedang Repurpose {selectedFormats.length} Format...</>
              ) : (
                <><Repeat2 className="mr-2 h-4 w-4" />Repurpose ke {selectedFormats.length} Format<ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>

          {/* Output */}
          <div className="xl:col-span-3">
            {isLoading ? (
              <Card className="h-full min-h-[500px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                    <p className="text-sm font-medium">AI sedang repurpose ke {selectedFormats.length} format...</p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-xs mx-auto">
                      {selectedFormats.map((id) => {
                        const fmt = outputFormats.find((f) => f.id === id);
                        return (
                          <Badge key={id} variant="outline" className="text-xs animate-pulse">
                            {fmt?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : result ? (
              <Card className="h-full">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {result.repurposed.length} Versi Siap
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{result.originalSummary}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={copyAll} data-testid="button-copy-all-repurposed">
                        <Copy className="h-3.5 w-3.5 mr-1" />All
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadAll} data-testid="button-download-repurposed">
                        <Download className="h-3.5 w-3.5 mr-1" />Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleRepurpose} data-testid="button-re-repurpose">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Format Selector */}
                  <div className="flex flex-wrap gap-2">
                    {result.repurposed.map((r) => {
                      const fmt = outputFormats.find((f) => f.id === r.formatId);
                      const SiIcon = fmt?.siIcon;
                      return (
                        <button
                          key={r.formatId}
                          onClick={() => setActiveFormat(r.formatId)}
                          data-testid={`select-repurposed-${r.formatId}`}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                            activeFormat === r.formatId
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          {SiIcon ? <SiIcon className="h-3 w-3" /> : <span>{fmt?.icon}</span>}
                          {fmt?.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Content */}
                  {activeResult && activeFormatInfo && (
                    <div className={`rounded-lg border p-4 ${activeFormatInfo.color}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{activeFormatInfo.platform}</Badge>
                          <span className="text-xs text-muted-foreground">{activeResult.content.length} karakter</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(activeResult.content);
                            toast({ title: "Disalin!", description: `${activeFormatInfo.label} berhasil disalin` });
                          }}
                          data-testid="button-copy-active"
                        >
                          <Copy className="h-3 w-3 mr-1" />Copy
                        </Button>
                      </div>
                      <ScrollArea className="h-[280px]">
                        <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{activeResult.content}</pre>
                      </ScrollArea>
                      {activeResult.tips && (
                        <div className="mt-3 pt-3 border-t border-current/20">
                          <p className="text-xs font-medium flex items-center gap-1 mb-1">
                            <Sparkles className="h-3 w-3" />Tips untuk {activeFormatInfo.label}:
                          </p>
                          <p className="text-xs opacity-80">{activeResult.tips}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full min-h-[500px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-5 max-w-sm">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Repeat2 className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">1 Konten, Banyak Platform</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Paste konten apapun di kiri, pilih format target, dan AI repurpose semuanya secara otomatis
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {outputFormats.map((f) => {
                        const SiIcon = f.siIcon;
                        return (
                          <Badge key={f.id} variant="outline" className="text-xs flex items-center gap-1">
                            {SiIcon ? <SiIcon className="h-2.5 w-2.5" /> : <span className="text-xs">{f.icon}</span>}
                            {f.label}
                          </Badge>
                        );
                      })}
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
