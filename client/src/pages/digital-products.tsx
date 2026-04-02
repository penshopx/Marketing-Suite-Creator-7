import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Package, Star, TrendingUp, Users, CheckCircle2, Copy, 
  ArrowRight, DollarSign, Zap, Globe, BookOpen, Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const products = [
  {
    id: "1",
    name: "Blueprint Penghasilan Digital",
    category: "E-Book & Guide",
    icon: BookOpen,
    iconBg: "bg-blue-100 dark:bg-blue-900",
    iconColor: "text-blue-600 dark:text-blue-400",
    price: "Rp 97.000",
    suggestedPrice: "Rp 150.000 - Rp 297.000",
    commission: "100%",
    badgeText: "Best Seller",
    badgeColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    description: "Panduan lengkap membangun penghasilan digital dari nol. Cocok untuk pemula yang ingin memulai bisnis online.",
    features: [
      "Framework 14 hari mulai dari nol",
      "4 model bisnis digital yang terbukti",
      "Template konten siap pakai",
      "Checklist harian untuk eksekusi",
      "Bonus: Daftar tools gratis terbaik",
    ],
    targetMarket: "Pemula yang ingin mulai bisnis online, fresh graduate, ibu rumah tangga",
    salesAngle: "Cara realistis dapat penghasilan pertama dari internet dalam 14 hari",
    hak: "Hak Jual Kembali (Resell Rights) - 100% keuntungan untuk kamu",
  },
  {
    id: "2",
    name: "Masterclass TikTok Ads untuk Pemula",
    category: "Video Course",
    icon: TrendingUp,
    iconBg: "bg-red-100 dark:bg-red-900",
    iconColor: "text-red-600 dark:text-red-400",
    price: "Rp 197.000",
    suggestedPrice: "Rp 297.000 - Rp 497.000",
    commission: "100%",
    badgeText: "Hot 🔥",
    badgeColor: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    description: "Kursus video komprehensif tentang cara menggunakan TikTok Ads untuk dropship dan produk digital dengan budget minimal.",
    features: [
      "Setup akun TikTok Ads step-by-step",
      "Riset produk winning dengan TikTok",
      "Membuat konten iklan yang convert",
      "Strategi bidding budget kecil",
      "Optimasi campaign untuk scale",
      "Studi kasus nyata dengan ROAS 3-5x",
    ],
    targetMarket: "Dropshipper, reseller, penjual produk digital, marketer",
    salesAngle: "Cara dapat purchase jutaan dari TikTok Ads dengan modal ratusan ribu",
    hak: "Hak Jual Kembali (Resell Rights) - 100% keuntungan untuk kamu",
  },
  {
    id: "3",
    name: "AI Command Framework: Hack ChatGPT",
    category: "Template & Tools",
    icon: Zap,
    iconBg: "bg-purple-100 dark:bg-purple-900",
    iconColor: "text-purple-600 dark:text-purple-400",
    price: "Rp 77.000",
    suggestedPrice: "Rp 99.000 - Rp 199.000",
    commission: "100%",
    badgeText: "Trending",
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    description: "Koleksi 100+ prompt ChatGPT yang sudah terbukti untuk marketing, copywriting, riset, dan otomasi bisnis online.",
    features: [
      "100+ prompt siap pakai untuk marketing",
      "Framework RISEN untuk prompt sempurna",
      "Template konten viral media sosial",
      "Prompt riset produk & kompetitor",
      "Prompt membuat sales page yang convert",
      "Update bulanan prompt terbaru",
    ],
    targetMarket: "Marketer, content creator, pengusaha online, freelancer",
    salesAngle: "Hemat 10 jam kerja per minggu dengan prompt AI yang tepat",
    hak: "Hak Jual Kembali (Resell Rights) - 100% keuntungan untuk kamu",
  },
  {
    id: "4",
    name: "Affiliate Content System",
    category: "Sistem & Framework",
    icon: Globe,
    iconBg: "bg-green-100 dark:bg-green-900",
    iconColor: "text-green-600 dark:text-green-400",
    price: "Rp 127.000",
    suggestedPrice: "Rp 197.000 - Rp 397.000",
    commission: "100%",
    badgeText: "Baru",
    badgeColor: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    description: "Sistem konten lengkap untuk affiliate marketer. Dari riset produk, buat konten, sampai closing otomatis.",
    features: [
      "Sistem konten 30 hari affiliate",
      "Template caption untuk semua platform",
      "Framework review produk yang convert",
      "Strategi bangun trust sebelum jualan",
      "Cara memilih produk affiliate yang profitable",
      "Funnel sederhana tanpa website",
    ],
    targetMarket: "Affiliate marketer, influencer, content creator yang mau monetisasi",
    salesAngle: "Sistem otomatis dapat komisi affiliate tanpa keluar modal besar",
    hak: "Hak Jual Kembali (Resell Rights) - 100% keuntungan untuk kamu",
  },
];

const copywritingAngles = [
  {
    angle: "Pain Point",
    template: "Capek [masalah]? Ini solusinya: [nama produk] - [benefit utama] dalam [waktu/langkah]",
    example: "Capek konten sepi? Ini solusinya: AI Command Framework - ratusan konten viral dalam hitungan menit",
  },
  {
    angle: "Curiosity",
    template: "Cara [hasil yang diinginkan] tanpa [hambatan umum] yang selama ini bikin kamu nyerah",
    example: "Cara dapat Rp 5 juta pertama tanpa modal besar yang selama ini bikin kamu nyerah",
  },
  {
    angle: "Social Proof",
    template: "[Jumlah] orang sudah [hasil], sekarang giliran kamu. [Nama produk] - [CTA]",
    example: "500+ orang sudah pecah telor dari produk digital, sekarang giliran kamu. Blueprint Digital - Mulai sekarang!",
  },
  {
    angle: "Scarcity",
    template: "[Nama produk] hanya Rp [harga] sampai [waktu]. Setelah itu naik jadi Rp [harga lebih tinggi]",
    example: "AI Command Framework hanya Rp 77.000 sampai Jumat. Setelah itu naik jadi Rp 149.000",
  },
];

export default function DigitalProducts() {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const { toast } = useToast();

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: "Teks berhasil disalin ke clipboard." });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Katalog Produk Digital</h1>
          <p className="text-muted-foreground">4 produk winning dengan hak jual kembali - 100% keuntungan untuk kamu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Hak Jual Kembali - 100% profit untuk kamu</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Tidak perlu buat produk dari nol</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Materi sudah terbukti laku di market</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">Langsung bisa dijual hari ini</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map(product => (
          <Card key={product.id} className="hover:border-primary/40 transition-colors cursor-pointer" data-testid={`card-product-${product.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${product.iconBg}`}>
                    <product.icon className={`h-5 w-5 ${product.iconColor}`} />
                  </div>
                  <div>
                    <Badge className={`text-xs mb-1 ${product.badgeColor}`}>{product.badgeText}</Badge>
                    <CardTitle className="text-base leading-tight">{product.name}</CardTitle>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Package className="h-3 w-3" />
                <span>{product.category}</span>
              </div>
              <CardDescription className="text-sm">{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Harga Modal</p>
                  <p className="font-bold text-lg text-primary">{product.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Harga Jual</p>
                  <p className="font-medium text-sm">{product.suggestedPrice}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">{product.hak}</span>
              </div>
              <Button 
                className="w-full" 
                onClick={() => setSelectedProduct(product)}
                data-testid={`button-detail-${product.id}`}
              >
                Lihat Detail & Strategi Jual
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Template Copywriting untuk Semua Produk
          </CardTitle>
          <CardDescription>Gunakan template ini untuk caption, iklan, atau bio kamu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {copywritingAngles.map((item, i) => (
            <div key={i} className="p-4 rounded-lg border space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{item.angle}</Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyText(item.template)}
                  data-testid={`button-copy-angle-${i}`}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Salin
                </Button>
              </div>
              <p className="text-sm font-mono bg-muted p-2 rounded">{item.template}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Contoh:</span> {item.example}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${selectedProduct.iconBg}`}>
                    <selectedProduct.icon className={`h-5 w-5 ${selectedProduct.iconColor}`} />
                  </div>
                  <div>
                    <DialogTitle>{selectedProduct.name}</DialogTitle>
                    <DialogDescription>{selectedProduct.category}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-5 mt-2">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Yang Ada di Dalam Produk
                  </h4>
                  <ul className="space-y-2">
                    {selectedProduct.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-1 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Users className="h-4 w-4" />
                    Target Market
                  </h4>
                  <p className="text-sm text-muted-foreground">{selectedProduct.targetMarket}</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold mb-1 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                    <TrendingUp className="h-4 w-4" />
                    Sales Angle (Sudut Jualan)
                  </h4>
                  <p className="text-sm text-muted-foreground">{selectedProduct.salesAngle}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => copyText(selectedProduct.salesAngle)}
                    data-testid="button-copy-sales-angle"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Salin untuk caption
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Hak Jual</p>
                    <p className="text-xs text-muted-foreground">{selectedProduct.hak}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Potensi Keuntungan</p>
                    <p className="font-bold text-green-700 dark:text-green-300">{selectedProduct.suggestedPrice}</p>
                    <p className="text-xs text-muted-foreground">per penjualan</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
