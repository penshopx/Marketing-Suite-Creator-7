import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, Copy, RefreshCw, Star, CheckCircle2, 
  TrendingUp, MessageSquare, Instagram, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contentTemplates = [
  {
    id: "review",
    name: "Review Produk",
    platform: "Semua Platform",
    description: "Template review jujur yang membangun kepercayaan",
    template: (product: string, benefit: string, price: string) => 
`Jujur ya, gue sempat ragu beli [${product}] karena harganya ${price}.

Tapi setelah coba? WOW.

Yang bikin gue terkesan:
✅ ${benefit}
✅ Langsung bisa dipraktikkan (gak perlu ribet setup)
✅ Support responsif banget

Minus-nya (karena gue mau jujur):
⚠️ Butuh konsistensi untuk lihat hasil optimal

Overall? Worth it banget untuk harganya.

Kalau kamu lagi cari [solusi yang dicari], ini salah satu yang paling actionable yang pernah gue coba.

Link di bio 👆`,
  },
  {
    id: "transformation",
    name: "Before-After Story",
    platform: "Instagram & TikTok",
    description: "Template cerita transformasi yang emosional",
    template: (product: string, benefit: string, price: string) =>
`SEBELUM pakai [${product}]:
❌ [masalah yang dulu dihadapi]
❌ Buang waktu berjam-jam untuk hasil yang biasa aja
❌ Frustasi karena gak tau harus mulai dari mana

SESUDAH pakai [${product}]:
✅ ${benefit}
✅ Lebih produktif dan punya arah yang jelas
✅ [hasil spesifik yang sudah dicapai]

Investasi ${price} yang paling worth it yang pernah gue lakuin.

Kalau kamu lagi di titik yang sama seperti gue dulu, coba deh. Link di bio 👆

#affiliatemarketing #produkdigital #bisnisonline`,
  },
  {
    id: "educational",
    name: "Konten Edukatif + Soft Sell",
    platform: "LinkedIn & Facebook",
    description: "Berikan nilai dulu, baru promosi di akhir",
    template: (product: string, benefit: string, price: string) =>
`3 Kesalahan yang Bikin Orang Gagal [topik relevan]:

1. [Kesalahan pertama]
Solusi: [solusi singkat]

2. [Kesalahan kedua]  
Solusi: [solusi singkat]

3. [Kesalahan ketiga]
Solusi: [solusi singkat]

---
Ngomong-ngomong, kalau kamu mau ${benefit} tanpa harus trial error lama, gue punya rekomendasi resource yang bagus.

[${product}] — ${price}

Sudah bantu banyak orang [hasil yang dicapai]. Cek link di bio kalau tertarik 👆`,
  },
  {
    id: "urgency",
    name: "Flash Sale / Penawaran Terbatas",
    platform: "WhatsApp & Story",
    description: "Template untuk mendorong keputusan beli cepat",
    template: (product: string, benefit: string, price: string) =>
`🚨 LAST CALL 🚨

[${product}] masih bisa diambil dengan harga ${price} sampai [waktu].

Setelah itu harga naik jadi [harga lebih tinggi].

Apa yang kamu dapat:
⚡ ${benefit}
⚡ [manfaat 2]
⚡ [manfaat 3]

Sudah [jumlah] orang yang ambil sejak [periode].

Mau ikut atau menyesal nanti?

Link di bio 👆 (atau DM gue kalau ada pertanyaan)`,
  },
];

const contentCalendar = [
  { week: 1, theme: "Awareness", contents: ["Posting masalah umum yang dialami target market", "Tips gratis yang relate dengan produk affiliate", "Poll atau pertanyaan untuk engagement"], ratio: "80% value : 20% promosi" },
  { week: 2, theme: "Trust Building", contents: ["Cerita personal tentang masalah yang sama", "Testimoni atau hasil nyata orang lain", "Behind the scenes penggunaan produk"], ratio: "70% value : 30% promosi" },
  { week: 3, theme: "Consideration", contents: ["Review jujur produk (plus minus)", "Perbandingan dengan alternatif lain", "FAQ yang sering ditanyakan"], ratio: "60% value : 40% promosi" },
  { week: 4, theme: "Conversion", contents: ["Penawaran terbatas / flash sale", "Last reminder dengan social proof", "Personal recommendation yang kuat"], ratio: "30% value : 70% promosi" },
];

const platforms = [
  { name: "Instagram", tips: ["Gunakan 3-5 hashtag relevan", "Post di jam 7-9 pagi atau 7-9 malam", "Story setiap hari untuk keep engagement"] },
  { name: "TikTok", tips: ["Hook kuat di 3 detik pertama", "Durasi optimal 15-30 detik", "Reply komentar untuk boost algoritma"] },
  { name: "WhatsApp", tips: ["Kirim ke broadcast list, bukan grup", "Jadwal pesan pagi hari sebelum jam kerja", "Personalisasi pesan, jangan copy-paste massal"] },
  { name: "Facebook", tips: ["Group posting lebih organik dari page", "Konten panjang dengan value tinggi lebih baik", "Engage di komentar dalam 1 jam pertama"] },
];

export default function AffiliateContent() {
  const [productName, setProductName] = useState("");
  const [benefit, setBenefit] = useState("");
  const [price, setPrice] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("review");
  const [generatedContent, setGeneratedContent] = useState("");
  const { toast } = useToast();

  const generateContent = () => {
    if (!productName || !benefit || !price) {
      toast({ title: "Lengkapi dulu!", description: "Isi nama produk, benefit utama, dan harga.", variant: "destructive" });
      return;
    }
    const template = contentTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      setGeneratedContent(template.template(productName, benefit, price));
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({ title: "Disalin!", description: "Konten berhasil disalin ke clipboard." });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Affiliate Content System</h1>
          <p className="text-muted-foreground">Generator konten affiliate marketing untuk semua platform media sosial</p>
        </div>
      </div>

      <Tabs defaultValue="generator" data-testid="tabs-affiliate">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator" data-testid="tab-generator">Generator Konten</TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-calendar">Kalender Konten</TabsTrigger>
          <TabsTrigger value="platform" data-testid="tab-platform">Tips Per Platform</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Produk Affiliate</CardTitle>
              <CardDescription>Isi detail produk untuk generate konten yang dipersonalisasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Nama Produk / Brand</Label>
                  <Input
                    id="product-name"
                    placeholder="contoh: Blueprint Penghasilan Digital"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    data-testid="input-product-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Harga Produk</Label>
                  <Input
                    id="price"
                    placeholder="contoh: Rp 97.000"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    data-testid="input-price"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="benefit">Benefit / Hasil Utama</Label>
                <Input
                  id="benefit"
                  placeholder="contoh: bisa dapat penghasilan pertama dalam 14 hari tanpa buat produk sendiri"
                  value={benefit}
                  onChange={e => setBenefit(e.target.value)}
                  data-testid="input-benefit"
                />
              </div>
              <div className="space-y-2">
                <Label>Jenis Konten</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate} data-testid="select-template">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTemplates.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} — {t.platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generateContent} className="w-full" data-testid="button-generate">
                <Zap className="h-4 w-4 mr-2" />
                Generate Konten
              </Button>
            </CardContent>
          </Card>

          {generatedContent && (
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Konten yang Dihasilkan</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={generateContent} data-testid="button-regenerate">
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                      Buat Ulang
                    </Button>
                    <Button size="sm" onClick={copyContent} data-testid="button-copy-content">
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Salin
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={generatedContent}
                  onChange={e => setGeneratedContent(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  data-testid="textarea-generated-content"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Teks dalam [kurung siku] perlu kamu ganti dengan informasi spesifik sesuai pengalaman/produkmu.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentTemplates.map(t => (
              <Card key={t.id} className="cursor-pointer hover:border-primary/40 transition-colors" data-testid={`card-template-${t.id}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{t.platform}</Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full"
                    onClick={() => setSelectedTemplate(t.id)}
                    data-testid={`button-select-template-${t.id}`}
                  >
                    Gunakan Template Ini
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm">
            <strong>Strategi Kalender 30 Hari:</strong> Mulai dengan membangun awareness dan kepercayaan, 
            baru dorong ke konversi di minggu ke-4. Jangan langsung hard-sell dari hari pertama.
          </div>
          {contentCalendar.map((week, i) => (
            <Card key={i} data-testid={`card-week-${week.week}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Minggu {week.week}: {week.theme}</CardTitle>
                  <Badge variant="outline">{week.ratio}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {week.contents.map((content, ci) => (
                    <li key={ci} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {content}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="platform" className="space-y-4 mt-4">
          {platforms.map((platform, i) => (
            <Card key={i} data-testid={`card-platform-${i}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  {platform.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {platform.tips.map((tip, ti) => (
                    <li key={ti} className="flex items-start gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
