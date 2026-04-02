import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles, MessageCircle, Loader2, Copy, CheckCircle2,
  Download, Calendar, ChevronRight, Send, Info, ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCampaignStore } from "@/hooks/use-campaign-store";
import { CampaignContextBar } from "@/components/campaign-context-bar";

interface BroadcastMessage {
  day: number;
  timing: string;
  label: string;
  tujuan: string;
  pesan: string;
  emoji: string;
  catatan?: string;
}

interface BroadcastResult {
  segmen: string;
  totalHari: number;
  ringkasan: string;
  sequence: BroadcastMessage[];
  tipsUmum: string[];
  bestPractice: string[];
}

const segmenOptions = [
  { value: "new_lead", label: "🆕 New Lead — baru masuk dari iklan" },
  { value: "warm_lead", label: "🔥 Warm Lead — sudah tanya tapi belum beli" },
  { value: "hot_lead", label: "⚡ Hot Lead — sudah hampir deal" },
  { value: "past_buyer", label: "🛒 Pembeli Lama — sudah pernah beli" },
  { value: "inactive", label: "😴 Pelanggan Tidak Aktif — dulu aktif, sekarang hilang" },
  { value: "cart_abandon", label: "🛒 Abandon Cart — add to cart tapi tidak checkout" },
];

const durasiOptions = [
  { value: "7", label: "7 Hari — Sequence Singkat" },
  { value: "14", label: "14 Hari — Sequence Standar" },
  { value: "21", label: "21 Hari — Sequence Lengkap" },
  { value: "30", label: "30 Hari — Sequence Intensif" },
];

export default function WaBroadcast() {
  const [produk, setProduk] = useState("");
  const [harga, setHarga] = useState("");
  const [segmen, setSegmen] = useState("new_lead");
  const [durasi, setDurasi] = useState("14");
  const [usp, setUsp] = useState("");
  const [tone, setTone] = useState("santai");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BroadcastResult | null>(null);
  const [copiedDay, setCopiedDay] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const { toast } = useToast();
  const { campaign, save, markToolUsed } = useCampaignStore();
  const [, navigate] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("produk") || params.get("niche");
    const h = params.get("harga");
    const t = params.get("target");
    const s = params.get("segmen");
    if (p) setProduk(p);
    else if (campaign.produk) setProduk(campaign.produk);
    if (h) setHarga(h);
    else if (campaign.harga) setHarga(campaign.harga);
    if (t) { }
    if (s && segmenOptions.find((o) => o.value === s)) setSegmen(s);
    if (campaign.usp) setUsp(campaign.usp);
  }, []);

  const handleGenerate = async () => {
    if (!produk.trim()) {
      toast({ title: "Nama produk wajib diisi", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate-wa-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produk, harga, segmen, durasi, usp, tone }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
      markToolUsed("wa-broadcast");
      save({ produk, harga, usp });
    } catch {
      toast({ title: "Error", description: "Gagal generate broadcast sequence", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (msg: BroadcastMessage) => {
    navigator.clipboard.writeText(msg.pesan);
    setCopiedDay(msg.day);
    setTimeout(() => setCopiedDay(null), 2000);
    toast({ title: `Pesan Hari ${msg.day} disalin!` });
  };

  const copyAll = () => {
    if (!result) return;
    const text = result.sequence
      .map((m) => `=== Hari ${m.day}: ${m.label} (${m.timing}) ===\n${m.pesan}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    toast({ title: "Semua pesan disalin!", description: `${result.sequence.length} pesan WA ready to blast` });
  };

  const downloadSequence = () => {
    if (!result) return;
    const text = [
      `BROADCAST SEQUENCE: ${produk}`,
      `Segmen: ${result.segmen}`,
      `Durasi: ${result.totalHari} hari`,
      `\n${"=".repeat(60)}\n`,
      result.sequence
        .map((m) => `HARI ${m.day}: ${m.label}\nWaktu: ${m.timing}\nTujuan: ${m.tujuan}\n\n${m.pesan}${m.catatan ? `\n\n📝 Catatan: ${m.catatan}` : ""}`)
        .join("\n\n" + "-".repeat(50) + "\n\n"),
      `\n${"=".repeat(60)}\n`,
      "TIPS UMUM:\n" + result.tipsUmum.map((t, i) => `${i + 1}. ${t}`).join("\n"),
      "\nBEST PRACTICE:\n" + result.bestPractice.map((t, i) => `${i + 1}. ${t}`).join("\n"),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wa-broadcast-${produk.slice(0, 20).replace(/\s/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const segmenLabel = segmenOptions.find((s) => s.value === segmen)?.label || segmen;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-green-600" />
            WA Broadcast Sequence
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Generate urutan pesan follow-up otomatis 7–30 hari siap blast ke WhatsApp
          </p>
        </div>
        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
          Terinspirasi Cekat.AI
        </Badge>
      </div>

      <CampaignContextBar
        toolId="wa-broadcast"
        onAutoFill={(c) => {
          if (c.produk) setProduk(c.produk);
          if (c.harga) setHarga(c.harga);
          if (c.usp) setUsp(c.usp);
        }}
        currentValues={{ produk, harga, usp }}
        onSave={() => save({ produk, harga, usp })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Parameter Sequence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nama Produk / Layanan *</Label>
              <Input
                placeholder="e.g. Serum Wajah Glowing, Kursus Meta Ads"
                value={produk}
                onChange={(e) => setProduk(e.target.value)}
                data-testid="input-produk-broadcast"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Harga Produk</Label>
              <Input
                placeholder="e.g. Rp 149.000 / Rp 299.000/bulan"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                data-testid="input-harga-broadcast"
                className="mt-1"
              />
            </div>
            <div>
              <Label>USP / Keunggulan Produk</Label>
              <Textarea
                placeholder="Apa yang membuat produk ini berbeda? Garansi? Terbukti?"
                value={usp}
                onChange={(e) => setUsp(e.target.value)}
                data-testid="input-usp-broadcast"
                className="mt-1 h-16 resize-none"
              />
            </div>
            <div>
              <Label>Segmen Lead</Label>
              <Select value={segmen} onValueChange={setSegmen}>
                <SelectTrigger data-testid="select-segmen-broadcast" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {segmenOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Durasi Sequence</Label>
              <Select value={durasi} onValueChange={setDurasi}>
                <SelectTrigger data-testid="select-durasi-broadcast" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durasiOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tone / Gaya Bahasa</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger data-testid="select-tone-broadcast" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="santai">😊 Santai — akrab, seperti teman</SelectItem>
                  <SelectItem value="profesional">💼 Profesional — formal tapi friendly</SelectItem>
                  <SelectItem value="gaul">🤙 Gaul — slang, kekinian</SelectItem>
                  <SelectItem value="formal">👔 Formal — resmi, korporat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleGenerate}
              disabled={isLoading}
              data-testid="btn-generate-broadcast"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Sequence...</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />Generate Broadcast Sequence</>
              )}
            </Button>

            {result && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAll}
                  data-testid="btn-copy-all-broadcast"
                >
                  {copiedAll ? <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  Copy Semua
                </Button>
                <Button variant="outline" size="sm" onClick={downloadSequence} data-testid="btn-dl-broadcast">
                  <Download className="h-3.5 w-3.5 mr-1" />Download
                </Button>
              </div>
            )}

            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-xs text-green-700 dark:text-green-400 space-y-1">
              <p className="font-medium flex items-center gap-1"><Info className="h-3 w-3" />Tips blast WA:</p>
              <p>• Jangan blast lebih dari 50 kontak/hari</p>
              <p>• Gunakan WA Business atau Fonnte/Wablas</p>
              <p>• Personalisasi nama penerima jika bisa</p>
              <p>• Kirim pagi (8–10) atau sore (16–18)</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {!result && !isLoading && (
            <div className="flex flex-col items-center justify-center h-72 text-center border-2 border-dashed rounded-xl">
              <MessageCircle className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="font-semibold text-muted-foreground">Belum ada sequence</p>
              <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs">
                Pilih segmen lead, isi produk, dan generate urutan pesan WA otomatis
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {segmenOptions.slice(0, 4).map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSegmen(s.value)}
                    className={`px-3 py-1 rounded-full border text-xs transition-colors ${segmen === s.value ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "hover:border-primary/50"}`}
                  >
                    {s.label.split("—")[0].trim()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-72 border-2 border-dashed rounded-xl">
              <div className="relative mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-green-600" />
                <MessageCircle className="h-5 w-5 text-green-500 absolute -top-1 -right-1" />
              </div>
              <p className="font-semibold">AI sedang merancang sequence...</p>
              <p className="text-sm text-muted-foreground mt-1">Menyusun {durasi} hari pesan WA untuk {segmenLabel.split("—")[0].trim()}</p>
            </div>
          )}

          {result && (
            <>
              <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10">
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm">{result.segmen}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {result.totalHari} Hari
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {result.sequence.length} Pesan
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.ringkasan}</p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {result.sequence.map((msg) => (
                  <Card key={msg.day} className="hover:shadow-sm transition-shadow">
                    <CardHeader className="py-2.5 px-4 flex-row items-start justify-between space-y-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold">{msg.day}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{msg.emoji}</span>
                            <p className="font-semibold text-sm">{msg.label}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{msg.timing} — {msg.tujuan}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs flex-shrink-0"
                        onClick={() => copyMessage(msg)}
                        data-testid={`btn-copy-day-${msg.day}`}
                      >
                        {copiedDay === msg.day ? (
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 mr-1" />
                        )}
                        Copy
                      </Button>
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                      <div className="bg-[#e8f8e0] dark:bg-[#1a3a1a] rounded-xl rounded-tl-none p-3 border border-green-200 dark:border-green-900">
                        <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
                          {msg.pesan}
                        </pre>
                      </div>
                      {msg.catatan && (
                        <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1">
                          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {msg.catatan}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {result.tipsUmum?.length > 0 && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="py-3 px-4 space-y-0">
                    <CardTitle className="text-sm text-primary flex items-center gap-1.5">
                      <Send className="h-4 w-4" />
                      Tips Pengiriman & Optimasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-2 space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1.5">Tips Umum:</p>
                      <ul className="space-y-1">
                        {result.tipsUmum.map((t, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1.5">Best Practice:</p>
                      <ul className="space-y-1">
                        {result.bestPractice.map((t, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-2 border-dashed border-green-300/50 bg-gradient-to-br from-green-500/5 to-primary/5">
                <CardHeader className="pb-2 pt-3 px-4 space-y-0">
                  <CardTitle className="text-sm text-green-700 dark:text-green-400 flex items-center gap-1.5">
                    <ArrowRight className="h-4 w-4" />
                    Lanjutkan ke Fitur Berikutnya
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button variant="outline" size="sm"
                      className="border-blue-300 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 justify-start h-auto py-2.5 px-3"
                      onClick={() => navigate(`/cs-bot-script?produk=${encodeURIComponent(produk)}&harga=${encodeURIComponent(harga)}`)}
                      data-testid="btn-broadcast-to-csbot">
                      <div className="flex flex-col items-start text-left gap-0.5">
                        <span className="font-semibold text-xs flex items-center gap-1">CS Bot Script <ArrowRight className="h-3 w-3" /></span>
                        <span className="text-xs opacity-70 font-normal">Script Q&A untuk follow-up ini</span>
                      </div>
                    </Button>
                    <Button variant="outline" size="sm"
                      className="border-purple-300 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 justify-start h-auto py-2.5 px-3"
                      onClick={() => navigate(`/customer-journey?produk=${encodeURIComponent(produk)}&harga=${encodeURIComponent(harga)}`)}
                      data-testid="btn-broadcast-to-journey">
                      <div className="flex flex-col items-start text-left gap-0.5">
                        <span className="font-semibold text-xs flex items-center gap-1">Customer Journey <ArrowRight className="h-3 w-3" /></span>
                        <span className="text-xs opacity-70 font-normal">Petakan journey dari broadcast ini</span>
                      </div>
                    </Button>
                    <Button variant="outline" size="sm"
                      className="border-orange-300 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 justify-start h-auto py-2.5 px-3"
                      onClick={() => navigate(`/interest-finder?niche=${encodeURIComponent(produk)}`)}
                      data-testid="btn-broadcast-to-interests">
                      <div className="flex flex-col items-start text-left gap-0.5">
                        <span className="font-semibold text-xs flex items-center gap-1">Interest Finder <ArrowRight className="h-3 w-3" /></span>
                        <span className="text-xs opacity-70 font-normal">Riset audience untuk produk ini</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
