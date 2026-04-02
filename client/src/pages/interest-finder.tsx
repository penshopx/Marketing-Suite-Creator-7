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
  Sparkles, Search, Copy, Star, TrendingUp, Loader2,
  CheckCircle2, Download, Info, ArrowRight, Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCampaignStore } from "@/hooks/use-campaign-store";
import { CampaignContextBar } from "@/components/campaign-context-bar";

interface Interest {
  name: string;
  estimatedSize: string;
  competition: "Rendah" | "Sedang" | "Tinggi";
  relevansi: number;
  tip?: string;
}

interface InterestCategory {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  interests: Interest[];
}

interface InterestResult {
  totalCount: number;
  categories: InterestCategory[];
  topPicks: Interest[];
  strategyNotes: string[];
}

export default function InterestFinder() {
  const [keyword, setKeyword] = useState("");
  const [deskripsiAudience, setDeskripsiAudience] = useState("");
  const [platform, setPlatform] = useState("both");
  const [tipe, setTipe] = useState("produk");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InterestResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { campaign, save, addInterests, markToolUsed } = useCampaignStore();
  const [, navigate] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const niche = params.get("niche");
    const target = params.get("target");
    if (niche) setKeyword(niche);
    if (target) setDeskripsiAudience(target);
  }, []);

  const handleGenerate = async () => {
    if (!keyword.trim()) {
      toast({ title: "Keyword wajib diisi", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/find-interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, deskripsiAudience, platform, tipe }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
      markToolUsed("interest-finder");
    } catch {
      toast({ title: "Error", description: "Gagal generate interests", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndSendToOverlap = () => {
    if (!result) return;
    const allInterests = result.topPicks.slice(0, 10).map((i) => i.name);
    addInterests(allInterests);
    save({ niche: keyword, target: deskripsiAudience });
    navigate(`/audience-overlap?interests=${encodeURIComponent(allInterests.join(","))}&niche=${encodeURIComponent(keyword)}`);
    toast({ title: "Menuju Audience Overlap Analyzer →", description: `${allInterests.length} top interests dikirim` });
  };

  const handleSendToWaBroadcast = () => {
    save({ niche: keyword, target: deskripsiAudience });
    navigate(`/wa-broadcast?niche=${encodeURIComponent(keyword)}&target=${encodeURIComponent(deskripsiAudience)}`);
  };

  const handleSendToLpHtml = () => {
    navigate(`/lp-html-generator?niche=${encodeURIComponent(keyword)}`);
  };

  const copyInterests = (interests: Interest[], label: string) => {
    const text = interests.map((i) => i.name).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: "Disalin!", description: `${interests.length} interests dikopi ke clipboard` });
  };

  const toggleFavorite = (name: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const exportCSV = () => {
    if (!result) return;
    const rows = [["Interest", "Kategori", "Ukuran Audience", "Kompetisi", "Relevansi %"]];
    result.categories.forEach((cat) => {
      cat.interests.forEach((i) => {
        rows.push([i.name, cat.label, i.estimatedSize, i.competition, String(i.relevansi)]);
      });
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interests-${keyword.slice(0, 20).replace(/\s/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const competitionColor = (c: string) =>
    c === "Rendah"
      ? "text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-800"
      : c === "Sedang"
      ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      : "text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800";

  const allFavorites = Array.from(favorites)
    .map((name) => {
      for (const cat of result?.categories || []) {
        const found = cat.interests.find((i) => i.name === name);
        if (found) return found;
      }
      return null;
    })
    .filter(Boolean) as Interest[];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            Interest Finder AI
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Temukan 80+ interest tersembunyi FB/IG yang kompetitor tidak tahu — kurangi CPA hingga 90%
          </p>
        </div>
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-medium">
          Powered by AI
        </Badge>
      </div>

      <CampaignContextBar
        toolId="interest-finder"
        onAutoFill={(c) => {
          if (c.niche) setKeyword(c.niche);
          if (c.target) setDeskripsiAudience(c.target);
        }}
        currentValues={{ niche: keyword, target: deskripsiAudience }}
        onSave={() => save({ niche: keyword, target: deskripsiAudience })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Parameter Riset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Keyword Produk / Niche *</Label>
              <Input
                placeholder="e.g. skincare, kursus trading, dropship baju"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                data-testid="input-keyword-interest"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Deskripsi Target Audience</Label>
              <Textarea
                placeholder="Siapa target Anda? Umur, gender, masalah, kebiasaan..."
                value={deskripsiAudience}
                onChange={(e) => setDeskripsiAudience(e.target.value)}
                data-testid="input-audience-desc"
                className="mt-1 h-20 resize-none"
              />
            </div>
            <div>
              <Label>Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger data-testid="select-platform-interest" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Facebook & Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook only</SelectItem>
                  <SelectItem value="instagram">Instagram only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipe Bisnis</Label>
              <Select value={tipe} onValueChange={setTipe}>
                <SelectTrigger data-testid="select-tipe-interest" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produk">Produk Fisik / E-commerce</SelectItem>
                  <SelectItem value="digital">Produk Digital</SelectItem>
                  <SelectItem value="jasa">Jasa / Service</SelectItem>
                  <SelectItem value="kursus">Kursus / Edukasi</SelectItem>
                  <SelectItem value="aplikasi">Aplikasi / SaaS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isLoading}
              data-testid="btn-find-interests"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mencari Hidden Interests...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Temukan Hidden Interests</>
              )}
            </Button>

            {result && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyInterests(result.topPicks, "top")}
                  data-testid="btn-copy-top-interests"
                >
                  {copied === "top" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  Copy Top
                </Button>
                <Button variant="outline" size="sm" onClick={exportCSV} data-testid="btn-export-interests">
                  <Download className="h-3.5 w-3.5 mr-1" />Export CSV
                </Button>
              </div>
            )}

            {favorites.size > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {favorites.size} interest di-bookmark
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs mt-1 text-yellow-700 dark:text-yellow-400 px-0"
                  onClick={() => allFavorites.length > 0 && copyInterests(allFavorites, "fav")}
                >
                  {copied === "fav" ? "Tersalin!" : "Copy semua favorit"}
                </Button>
              </div>
            )}

            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-1">
              <p className="font-medium flex items-center gap-1"><Info className="h-3 w-3" />Tips penggunaan:</p>
              <p>• Klik interest untuk bookmark ⭐</p>
              <p>• Filter kompetisi: H=Tinggi, S=Sedang, R=Rendah</p>
              <p>• Export CSV untuk import ke Meta Ads Manager</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {!result && !isLoading && (
            <div className="flex flex-col items-center justify-center h-72 text-center border-2 border-dashed rounded-xl">
              <Search className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="font-semibold text-muted-foreground">Belum ada hasil riset</p>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs">
                Masukkan keyword produk/niche di sebelah kiri dan klik tombol "Temukan Hidden Interests"
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {["skincare", "kursus trading", "drone", "hijab fashion", "suplemen"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setKeyword(s)}
                    className="px-3 py-1 rounded-full border text-xs hover:border-primary hover:text-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-72 border-2 border-dashed rounded-xl">
              <div className="relative mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <Sparkles className="h-5 w-5 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <p className="font-semibold">AI sedang menganalisa...</p>
              <p className="text-sm text-muted-foreground mt-1">Mencari hidden interests dari jutaan data FB/IG</p>
            </div>
          )}

          {result && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center border-primary/20">
                  <p className="text-2xl font-bold text-primary">{result.totalCount}</p>
                  <p className="text-xs text-muted-foreground">Total Interests</p>
                </Card>
                <Card className="p-3 text-center border-yellow-200 dark:border-yellow-800">
                  <p className="text-2xl font-bold text-yellow-600">{result.topPicks.length}</p>
                  <p className="text-xs text-muted-foreground">Top Picks</p>
                </Card>
                <Card className="p-3 text-center border-green-200 dark:border-green-800">
                  <p className="text-2xl font-bold text-green-600">{result.categories.length}</p>
                  <p className="text-xs text-muted-foreground">Kategori</p>
                </Card>
              </div>

              <Tabs defaultValue="all">
                <div className="overflow-x-auto pb-1">
                  <TabsList className="inline-flex h-auto gap-1 bg-muted/50 flex-nowrap min-w-max">
                    <TabsTrigger value="all" className="text-xs">Semua ({result.totalCount})</TabsTrigger>
                    <TabsTrigger value="top" className="text-xs">⭐ Top ({result.topPicks.length})</TabsTrigger>
                    {result.categories.map((cat) => (
                      <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                        {cat.emoji} {cat.label} ({cat.interests.length})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent value="all" className="mt-3 space-y-3">
                  {result.categories.map((cat) => (
                    <Card key={cat.id}>
                      <CardHeader className="py-2.5 px-4 flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.emoji}</span>
                          <div>
                            <h3 className="font-semibold text-sm leading-none">{cat.label}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">{cat.interests.length}</Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs flex-shrink-0"
                          onClick={() => copyInterests(cat.interests, cat.id)}
                        >
                          {copied === cat.id ? (
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 mr-1" />
                          )}
                          Copy
                        </Button>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {cat.interests.map((interest) => (
                            <button
                              key={interest.name}
                              onClick={() => toggleFavorite(interest.name)}
                              data-testid={`interest-${interest.name.replace(/\s+/g, "-").toLowerCase()}`}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-all hover:shadow-sm ${
                                favorites.has(interest.name)
                                  ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400"
                                  : "hover:border-primary/50 hover:bg-primary/5"
                              }`}
                            >
                              <Star
                                className={`h-2.5 w-2.5 ${
                                  favorites.has(interest.name)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                              {interest.name}
                              <span className={`text-xs px-1 rounded border ${competitionColor(interest.competition)}`}>
                                {interest.competition[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="top" className="mt-3">
                  <Card>
                    <CardHeader className="py-2.5 px-4 flex-row items-center justify-between space-y-0">
                      <h3 className="font-semibold text-sm">⭐ Top Picks — Interest Paling Potensial</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => copyInterests(result.topPicks, "top")}
                      >
                        {copied === "top" ? <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        Copy All
                      </Button>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="space-y-2">
                        {result.topPicks.map((interest, i) => (
                          <div
                            key={interest.name}
                            className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => toggleFavorite(interest.name)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                                {i + 1}
                              </span>
                              <Star
                                className={`h-3.5 w-3.5 flex-shrink-0 ${
                                  favorites.has(interest.name)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/20"
                                }`}
                              />
                              <div className="min-w-0">
                                <span className="font-medium text-sm">{interest.name}</span>
                                {interest.tip && (
                                  <p className="text-xs text-muted-foreground truncate">{interest.tip}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="text-xs text-muted-foreground hidden sm:inline">{interest.estimatedSize}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${competitionColor(interest.competition)}`}>
                                {interest.competition}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {result.categories.map((cat) => (
                  <TabsContent key={cat.id} value={cat.id} className="mt-3">
                    <Card>
                      <CardHeader className="py-2.5 px-4 flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.emoji}</span>
                          <div>
                            <h3 className="font-semibold text-sm">{cat.label}</h3>
                            <p className="text-xs text-muted-foreground">{cat.desc}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => copyInterests(cat.interests, cat.id)}
                        >
                          {copied === cat.id ? <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                          Copy All
                        </Button>
                      </CardHeader>
                      <CardContent className="py-2 px-4 space-y-2">
                        {cat.interests.map((interest) => (
                          <div
                            key={interest.name}
                            className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => toggleFavorite(interest.name)}
                          >
                            <div className="flex items-center gap-2">
                              <Star
                                className={`h-3.5 w-3.5 flex-shrink-0 ${
                                  favorites.has(interest.name)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/20"
                                }`}
                              />
                              <span className="text-sm">{interest.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground hidden sm:inline">{interest.estimatedSize}</span>
                              <div className="w-12 bg-muted rounded-full h-1.5 hidden sm:block">
                                <div
                                  className="bg-primary h-1.5 rounded-full"
                                  style={{ width: `${interest.relevansi}%` }}
                                />
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${competitionColor(interest.competition)}`}>
                                {interest.competition}
                              </span>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>

              {result.strategyNotes?.length > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2 pt-3 px-4 space-y-0">
                    <CardTitle className="text-sm text-primary flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4" />
                      Strategi Targeting Rekomendasi AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <ul className="space-y-1.5">
                      {result.strategyNotes.map((note, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-blue-500/5">
                <CardHeader className="pb-2 pt-3 px-4 space-y-0">
                  <CardTitle className="text-sm text-primary flex items-center gap-1.5">
                    <ArrowRight className="h-4 w-4" />
                    Lanjutkan ke Fitur Berikutnya — Data Otomatis Terisi
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 justify-start h-auto py-2.5 px-3"
                      onClick={handleSaveAndSendToOverlap}
                      data-testid="btn-send-to-overlap"
                    >
                      <div className="flex flex-col items-start text-left gap-0.5">
                        <span className="font-semibold text-xs flex items-center gap-1">
                          Audience Overlap <ArrowRight className="h-3 w-3" />
                        </span>
                        <span className="text-xs opacity-70 font-normal">Analisis overlap Top Picks</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-300 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 justify-start h-auto py-2.5 px-3"
                      onClick={handleSendToWaBroadcast}
                      data-testid="btn-send-to-broadcast"
                    >
                      <div className="flex flex-col items-start text-left gap-0.5">
                        <span className="font-semibold text-xs flex items-center gap-1">
                          WA Broadcast <ArrowRight className="h-3 w-3" />
                        </span>
                        <span className="text-xs opacity-70 font-normal">Generate follow-up sequence</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-300 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 justify-start h-auto py-2.5 px-3"
                      onClick={handleSendToLpHtml}
                      data-testid="btn-send-to-lp"
                    >
                      <div className="flex flex-col items-start text-left gap-0.5">
                        <span className="font-semibold text-xs flex items-center gap-1">
                          LP HTML Builder <ArrowRight className="h-3 w-3" />
                        </span>
                        <span className="text-xs opacity-70 font-normal">Buat landing page niche ini</span>
                      </div>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Niche "{keyword}" akan otomatis terisi di semua halaman tujuan
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
