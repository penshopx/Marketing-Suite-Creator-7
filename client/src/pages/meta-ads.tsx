import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Megaphone, Target, Users, BarChart3, DollarSign, 
  CheckCircle2, Zap, Copy, TrendingUp, AlertTriangle, Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const campaignTypes = [
  {
    name: "Traffic Campaign",
    objective: "Mendatangkan pengunjung ke halaman produk",
    bestFor: "Pemula yang baru mulai",
    budgetMin: "Rp 30.000/hari",
    tips: "Gunakan untuk warming up pixel dan kumpulkan data. Bukan untuk closing langsung.",
    settings: {
      "Campaign Objective": "Traffic",
      "Budget": "Rp 30.000 - Rp 50.000/hari",
      "Placement": "Automatic Placements",
      "Optimization": "Link Clicks",
      "Bid Strategy": "Lowest Cost",
    },
  },
  {
    name: "Conversion Campaign",
    objective: "Mendapatkan penjualan langsung",
    bestFor: "Yang sudah punya pixel dengan minimal 50 events",
    budgetMin: "Rp 50.000/hari",
    tips: "Setup ini WAJIB punya Facebook Pixel dengan minimal 50 Purchase events agar bisa optimize dengan baik.",
    settings: {
      "Campaign Objective": "Conversions",
      "Conversion Event": "Purchase",
      "Budget": "Rp 50.000 - Rp 150.000/hari",
      "Placement": "Advantage+ Placements",
      "Optimization": "Conversions",
      "Bid Strategy": "Cost Cap atau Lowest Cost",
    },
  },
  {
    name: "Advantage+ Shopping",
    objective: "Meta AI otomatis cari pembeli terbaik untukmu",
    bestFor: "Yang sudah berpengalaman dan punya budget lebih besar",
    budgetMin: "Rp 200.000/hari",
    tips: "Campaign paling canggih. Meta AI otomatis menentukan audience, placement, dan creative. Butuh data pixel yang banyak.",
    settings: {
      "Campaign Objective": "Sales",
      "Campaign Type": "Advantage+ Shopping",
      "Budget": "Rp 200.000+/hari",
      "Audience": "Biarkan Meta yang menentukan",
      "Creative": "Upload 5-10 variasi, Meta akan pilih terbaik",
    },
  },
];

const audienceTypes = [
  {
    name: "Interest-Based Audience",
    description: "Target berdasarkan minat dan perilaku pengguna",
    whoBest: "Pemula, produk baru, belum ada data customer",
    howTo: [
      "Masuk ke Ad Set > Audience",
      "Pilih lokasi: Indonesia",
      "Atur usia sesuai target market (misal 22-45 tahun)",
      "Di bagian Detailed Targeting, masukkan minat yang relevan",
      "Ukuran ideal: 500.000 - 3.000.000 orang",
    ],
    interestExamples: [
      "Produk digital: 'Digital marketing', 'Online business', 'Entrepreneurship'",
      "E-commerce: 'Online shopping', 'Shopping', kategori produk spesifik",
      "Kesehatan: 'Fitness', 'Healthy lifestyle', 'Weight loss'",
      "Keuangan: 'Personal finance', 'Investment', 'Saving money'",
    ],
  },
  {
    name: "Lookalike Audience",
    description: "Target orang yang mirip dengan pembeli atau pelanggan existing",
    whoBest: "Yang sudah punya data customer minimal 100-1000 orang",
    howTo: [
      "Masuk ke Audiences di Business Manager",
      "Klik 'Create Audience' > 'Lookalike Audience'",
      "Pilih source: Custom Audience dari data pembeli",
      "Pilih lokasi: Indonesia",
      "Pilih ukuran 1-3% untuk kualitas terbaik",
    ],
    interestExamples: [
      "1% Lookalike dari Customer List = paling mirip pembeli kamu",
      "1% Lookalike dari Purchase Events (via Pixel)",
      "1% Lookalike dari Email Subscribers",
      "Combinasi: Lookalike + Interest untuk volume lebih besar",
    ],
  },
  {
    name: "Retargeting Audience",
    description: "Target ulang orang yang sudah berinteraksi dengan bisnis kamu",
    whoBest: "Semua level - hasilnya paling tinggi karena sudah kenal produk",
    howTo: [
      "Buat Custom Audience dari Website Visitors",
      "Segmentasi: Semua pengunjung (30 hari), View Content, Add to Cart",
      "Kecualikan yang sudah Purchase dari target",
      "Budget lebih kecil karena audiencenya lebih sempit tapi panas",
    ],
    interestExamples: [
      "Pengunjung website 30 hari tapi belum beli → Prioritas tertinggi",
      "Yang lihat video iklan 75%+ → Minat tinggi",
      "Engagement Instagram/Facebook Page dalam 30 hari",
      "Yang klik link tapi tidak sampai halaman pembayaran",
    ],
  },
];

const advancedSettings = [
  {
    setting: "Budget Optimization",
    value: "Campaign Budget Optimization (CBO)",
    explanation: "Biarkan Meta distribusikan budget secara otomatis ke ad set terbaik. Lebih efisien daripada set manual per ad set.",
  },
  {
    setting: "Bid Strategy untuk Konversi",
    value: "Lowest Cost dengan Bid Cap",
    explanation: "Mulai dengan Lowest Cost. Setelah stabil, set Bid Cap = rata-rata CPA yang masih profitable bagimu.",
  },
  {
    setting: "Ad Scheduling",
    value: "Run Ads All the Time (awal)",
    explanation: "Biarkan dulu Meta running 24 jam di awal untuk kumpulkan data. Setelah 14+ hari, analisis jam terbaik dan schedule.",
  },
  {
    setting: "Frequency Cap",
    value: "Retargeting: max 3x/minggu",
    explanation: "Untuk retargeting, batasi frekuensi agar tidak annoying. Audience kecil yang kena iklan terus-menerus akan menyembunyikan iklan.",
  },
  {
    setting: "Attribution Window",
    value: "7-day click, 1-day view",
    explanation: "Setting standar yang direkomendasikan. Ini berarti konversi dihitung jika terjadi dalam 7 hari setelah klik atau 1 hari setelah lihat iklan.",
  },
  {
    setting: "Advantage+ Creative",
    value: "Aktifkan semua opsi",
    explanation: "Aktifkan Advantage+ Creative Enhancements. Meta akan otomatis adjust brightness, tambah musik, dan buat variasi untuk maximize performa.",
  },
];

const kpiTargets = [
  { metric: "CTR (Click-Through Rate)", poor: "< 0.5%", average: "0.5% - 1.5%", good: "> 1.5%", action: "Di bawah 0.5%? Ganti creative atau audience" },
  { metric: "CPM (Cost per 1000 Impressions)", poor: "> Rp 80.000", average: "Rp 30.000 - 80.000", good: "< Rp 30.000", action: "CPM tinggi = audience terlalu kompetitif, coba audience lain" },
  { metric: "CPC (Cost per Click)", poor: "> Rp 5.000", average: "Rp 2.000 - 5.000", good: "< Rp 2.000", action: "CPC tinggi = CTR rendah, perbaiki visual atau copy" },
  { metric: "Conversion Rate", poor: "< 1%", average: "1% - 3%", good: "> 3%", action: "Rendah? Perbaiki landing page atau penawaran kamu" },
  { metric: "ROAS (Return on Ad Spend)", poor: "< 1x", average: "1x - 2x", good: "> 2x", action: "ROAS < 1x = rugi. Stop campaign dan evaluasi ulang" },
];

export default function MetaAds() {
  const { toast } = useToast();

  const copySettings = (settings: Record<string, string>) => {
    const text = Object.entries(settings).map(([k, v]) => `${k}: ${v}`).join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: "Pengaturan berhasil disalin." });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Megaphone className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Meta Ads Advanced</h1>
          <p className="text-muted-foreground">Panduan setting Meta Ads (Facebook & Instagram) untuk penjualan produk digital</p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Syarat utama:</strong> Pastikan Facebook Pixel sudah terpasang di halaman produk kamu sebelum mulai beriklan. 
          Tanpa pixel, kamu tidak bisa mengoptimalkan iklan untuk konversi/penjualan.
        </div>
      </div>

      <Tabs defaultValue="campaign" data-testid="tabs-meta">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaign" data-testid="tab-campaign">Jenis Campaign</TabsTrigger>
          <TabsTrigger value="audience" data-testid="tab-audience">Audience</TabsTrigger>
          <TabsTrigger value="advanced" data-testid="tab-advanced">Setting Lanjut</TabsTrigger>
          <TabsTrigger value="kpi" data-testid="tab-kpi">KPI Target</TabsTrigger>
        </TabsList>

        <TabsContent value="campaign" className="space-y-4 mt-4">
          {campaignTypes.map((campaign, i) => (
            <Card key={i} data-testid={`card-campaign-${i}`}>
              <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    <CardDescription>{campaign.objective}</CardDescription>
                  </div>
                  <Badge variant="outline">{campaign.bestFor}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Budget minimal: <span className="font-medium text-foreground">{campaign.budgetMin}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">💡 {campaign.tips}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Pengaturan yang Disarankan:</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copySettings(campaign.settings)}
                      data-testid={`button-copy-settings-${i}`}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Salin
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(campaign.settings).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2 text-sm p-2 rounded bg-muted">
                        <span className="font-medium text-muted-foreground min-w-fit">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="audience" className="space-y-4 mt-4">
          {audienceTypes.map((audience, i) => (
            <Card key={i} data-testid={`card-audience-${i}`}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  {audience.name}
                </CardTitle>
                <CardDescription>{audience.description}</CardDescription>
                <Badge variant="secondary" className="w-fit">Terbaik untuk: {audience.whoBest}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Cara Setup:</p>
                  <ul className="space-y-1">
                    {audience.howTo.map((step, si) => (
                      <li key={si} className="flex items-start gap-2 text-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs flex-shrink-0">{si + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Contoh & Tips:</p>
                  <ul className="space-y-1">
                    {audience.interestExamples.map((ex, ei) => (
                      <li key={ei} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">→</span>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-3 mt-4">
          {advancedSettings.map((s, i) => (
            <Card key={i} data-testid={`card-advanced-${i}`}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <Settings className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{s.setting}</p>
                    <Badge variant="outline" className="mt-1 mb-2">{s.value}</Badge>
                    <p className="text-sm text-muted-foreground">{s.explanation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="kpi" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Target KPI Meta Ads
              </CardTitle>
              <CardDescription>Benchmark performa iklan untuk produk digital di Indonesia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpiTargets.map((kpi, i) => (
                  <div key={i} className="space-y-2" data-testid={`kpi-row-${i}`}>
                    <p className="text-sm font-medium">{kpi.metric}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded bg-red-50 dark:bg-red-950 text-center border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">Buruk</p>
                        <p className="text-sm font-bold text-red-700 dark:text-red-300">{kpi.poor}</p>
                      </div>
                      <div className="p-2 rounded bg-yellow-50 dark:bg-yellow-950 text-center border border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Rata-rata</p>
                        <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300">{kpi.average}</p>
                      </div>
                      <div className="p-2 rounded bg-green-50 dark:bg-green-950 text-center border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">Bagus</p>
                        <p className="text-sm font-bold text-green-700 dark:text-green-300">{kpi.good}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {kpi.action}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
