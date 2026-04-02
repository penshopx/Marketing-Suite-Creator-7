import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Hash, Loader2, Sparkles, ChevronRight, Copy,
  CheckCircle2, RefreshCw, Zap, TrendingUp, Target,
  BarChart2,
} from "lucide-react";
import { SiTiktok, SiInstagram, SiYoutube, SiX, SiLinkedin, SiFacebook } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

const platforms = [
  { id: "tiktok", label: "TikTok", icon: SiTiktok, maxHashtag: 30, iconClass: "text-black dark:text-white" },
  { id: "instagram", label: "Instagram", icon: SiInstagram, maxHashtag: 30, iconClass: "text-pink-500" },
  { id: "youtube", label: "YouTube Shorts", icon: SiYoutube, maxHashtag: 15, iconClass: "text-red-500" },
  { id: "facebook", label: "Facebook", icon: SiFacebook, maxHashtag: 10, iconClass: "text-blue-500" },
  { id: "twitter", label: "X / Twitter", icon: SiX, maxHashtag: 5, iconClass: "text-black dark:text-white" },
  { id: "linkedin", label: "LinkedIn", icon: SiLinkedin, maxHashtag: 10, iconClass: "text-blue-600" },
];

const contentTypes = [
  "Promosi Produk", "Konten Edukasi", "Behind The Scenes",
  "Tutorial / How-to", "Motivasi / Inspirasi", "Review",
  "Lifestyle / Daily", "Humor / Entertainment", "News / Info",
  "Personal Branding",
];

const niches = [
  "Bisnis & Marketing", "Kecantikan & Skincare", "Fashion & Style",
  "Makanan & Kuliner", "Fitness & Kesehatan", "Teknologi & Gadget",
  "Properti & Investasi", "Parenting & Keluarga", "Travel & Lifestyle",
  "Pendidikan & Karir", "Hiburan & Gaming", "UMKM & Wirausaha",
];

interface HashtagTier {
  tier: "viral" | "medium" | "niche";
  label: string;
  desc: string;
  tags: string[];
  avgReach: string;
}

interface HashtagResult {
  platform: string;
  niche: string;
  tiers: HashtagTier[];
  recommended: string[];
  caption: string;
  strategy: string;
}

const tierConfig = {
  viral: { color: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800", badge: "bg-red-500", label: "🔥 Viral / Trending", desc: "100M+ post — jangkauan luas, kompetisi tinggi" },
  medium: { color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800", badge: "bg-yellow-500", label: "⚡ Medium", desc: "1M–100M post — sweet spot engagement" },
  niche: { color: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800", badge: "bg-green-500", label: "🎯 Niche / Spesifik", desc: "<1M post — audiens tertarget, kompetisi rendah" },
};

export default function HashtagGenerator() {
  const [platform, setPlatform] = useState("tiktok");
  const [niche, setNiche] = useState("Bisnis & Marketing");
  const [contentType, setContentType] = useState("Promosi Produk");
  const [keywords, setKeywords] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<HashtagResult | null>(null);
  const [copiedTier, setCopiedTier] = useState<string | null>(null);
  const { toast } = useToast();

  const platformInfo = platforms.find((p) => p.id === platform);

  const handleGenerate = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/generate-hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, niche, contentType, keywords }),
      });
      if (!response.ok) throw new Error("Gagal generate");
      const data = await response.json();
      setResult(data);
    } catch {
      toast({ title: "Error", description: "Gagal generate hashtag. Coba lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyTier = (tier: HashtagTier) => {
    navigator.clipboard.writeText(tier.tags.join(" "));
    setCopiedTier(tier.tier);
    toast({ title: "Disalin!", description: `${tier.tags.length} hashtag ${tier.tier} berhasil disalin` });
    setTimeout(() => setCopiedTier(null), 2000);
  };

  const copyRecommended = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.recommended.join(" "));
    toast({ title: "Disalin!", description: `${result.recommended.length} hashtag rekomendasi disalin` });
  };

  const copyAll = () => {
    if (!result) return;
    const all = result.tiers.flatMap((t) => t.tags).join(" ");
    navigator.clipboard.writeText(all);
    toast({ title: "Semua Disalin!", description: `Total ${result.tiers.reduce((a, t) => a + t.tags.length, 0)} hashtag disalin` });
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Hash className="h-6 w-6 text-primary" />
              Hashtag Generator
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Generate paket hashtag 3-tier (viral/medium/niche) yang dioptimalkan per platform
            </p>
          </div>
          <Badge className="hidden md:flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0">
            <TrendingUp className="h-3 w-3" />
            Platform-Optimized
          </Badge>
        </div>

        {/* Platform Selector */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isActive = platform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                data-testid={`button-ht-platform-${p.id}`}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                  isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <Icon className={`h-5 w-5 ${p.iconClass}`} />
                <span className={`text-xs font-medium ${isActive ? "text-primary" : ""}`}>{p.label}</span>
                <span className="text-xs text-muted-foreground">max {p.maxHashtag}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Form */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Parameter Konten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Niche / Industri</Label>
                  <Select value={niche} onValueChange={setNiche}>
                    <SelectTrigger data-testid="select-ht-niche">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {niches.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Jenis Konten</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger data-testid="select-ht-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Keyword Tambahan (opsional)</Label>
                  <Input
                    placeholder="contoh: jual kaos, UMKM Bandung, skincare BPOM..."
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    data-testid="input-ht-keywords"
                  />
                  <p className="text-xs text-muted-foreground">Keyword spesifik untuk hasil lebih relevan</p>
                </div>
              </CardContent>
            </Card>

            {/* Strategy info */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-3 pb-3">
                <p className="text-xs font-semibold text-primary mb-2">Strategi 3 Tier</p>
                <div className="space-y-2">
                  {[
                    { icon: "🔥", label: "Viral", desc: "Jangkauan luas, potensi discover baru" },
                    { icon: "⚡", label: "Medium", desc: "Sweet spot — engagement terbaik" },
                    { icon: "🎯", label: "Niche", desc: "Audiens tertarget, konversi lebih tinggi" },
                  ].map(({ icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-2">
                      <span className="text-sm">{icon}</span>
                      <div>
                        <p className="text-xs font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full"
              size="lg"
              data-testid="button-generate-hashtags"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Hashtag...</>
              ) : (
                <><Hash className="mr-2 h-4 w-4" />Generate Hashtag Pack<ChevronRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>

          {/* Output */}
          <div className="md:col-span-3">
            {isLoading ? (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">Menganalisis trending hashtag untuk {platformInfo?.label}...</p>
                </CardContent>
              </Card>
            ) : result ? (
              <div className="space-y-4">
                {/* Recommended Pack */}
                <Card className="border-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">✨ Paket Rekomendasi ({result.recommended.length} hashtag)</CardTitle>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={handleGenerate} data-testid="button-regen-ht">
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" onClick={copyRecommended} data-testid="button-copy-recommended">
                          <Copy className="h-3.5 w-3.5 mr-1" />Copy
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {result.recommended.map((tag, i) => (
                        <button
                          key={i}
                          onClick={() => { navigator.clipboard.writeText(tag); toast({ title: "Disalin!", description: tag }); }}
                          className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                          data-testid={`rec-tag-${i}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{result.strategy}</p>
                  </CardContent>
                </Card>

                {/* Tier Breakdown */}
                <ScrollArea className="h-[360px]">
                  <div className="space-y-3 pr-1">
                    {result.tiers.map((tier) => {
                      const config = tierConfig[tier.tier];
                      return (
                        <Card key={tier.tier} className={`border ${config.color}`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${config.badge} text-white text-xs`}>{config.label}</Badge>
                                  <span className="text-xs text-muted-foreground">{tier.tags.length} hashtag</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{tier.avgReach} · {config.desc}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => copyTier(tier)}
                                data-testid={`copy-tier-${tier.tier}`}
                              >
                                {copiedTier === tier.tier ? <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                                Copy
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <div className="flex flex-wrap gap-1.5">
                              {tier.tags.map((tag, i) => (
                                <button
                                  key={i}
                                  onClick={() => { navigator.clipboard.writeText(tag); toast({ title: "Disalin!", description: tag }); }}
                                  className="px-2 py-0.5 rounded-full border text-xs hover:bg-foreground hover:text-background transition-colors"
                                  data-testid={`tier-tag-${tier.tier}-${i}`}
                                >
                                  {tag}
                                </button>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {/* Caption dengan hashtag */}
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-primary" />
                            Caption Siap Posting
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => { navigator.clipboard.writeText(result.caption); toast({ title: "Caption disalin!" }); }}
                            data-testid="copy-ht-caption"
                          >
                            <Copy className="h-3 w-3 mr-1" />Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed text-muted-foreground">{result.caption}</pre>
                      </CardContent>
                    </Card>

                    <Button variant="outline" className="w-full" onClick={copyAll} data-testid="button-copy-all-ht">
                      <Copy className="h-4 w-4 mr-2" />Copy Semua Hashtag ({result.tiers.reduce((a, t) => a + t.tags.length, 0)} total)
                    </Button>
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <Card className="h-full min-h-[400px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4 max-w-xs">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Hash className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Hashtag 3-Tier Pack</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Pilih platform & niche, lalu generate paket hashtag yang sudah dikategorikan berdasarkan tingkat kompetisi
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 text-left">
                      {[
                        { icon: Zap, label: "Rekomendasi campuran terbaik" },
                        { icon: TrendingUp, label: "3 tier: viral, medium, niche" },
                        { icon: Target, label: "Dioptimalkan per platform" },
                        { icon: BarChart2, label: "Caption siap posting" },
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
