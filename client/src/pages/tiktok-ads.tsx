import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Play, TrendingUp, Target, DollarSign, CheckCircle2, 
  Zap, BarChart3, Eye, Copy, AlertTriangle, Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const setupSteps = [
  {
    step: 1,
    title: "Buat Akun TikTok Ads Manager",
    duration: "15 menit",
    tasks: [
      "Kunjungi ads.tiktok.com dan daftar akun bisnis",
      "Verifikasi nomor HP dan email kamu",
      "Isi informasi bisnis (boleh nama pribadi dulu)",
      "Pilih mata uang IDR (Indonesian Rupiah)",
      "Tambahkan metode pembayaran (kartu kredit/debit atau transfer bank)",
    ],
  },
  {
    step: 2,
    title: "Setup TikTok Pixel",
    duration: "20 menit",
    tasks: [
      "Di Ads Manager, masuk ke Assets > Events",
      "Klik 'Create Pixel' dan pilih 'Manually Install Pixel Code'",
      "Salin kode pixel dan pasang di halaman produk kamu",
      "Aktifkan event 'Purchase' untuk tracking konversi",
      "Test pixel menggunakan TikTok Pixel Helper (Chrome Extension)",
    ],
  },
  {
    step: 3,
    title: "Riset Produk & Konten Winning",
    duration: "30 menit",
    tasks: [
      "Buka TikTok Creative Center (ads.tiktok.com/business/creativecenter)",
      "Filter kategori produk yang mau kamu jual",
      "Analisis iklan dengan engagement tertinggi",
      "Catat hook, struktur, dan angle yang digunakan",
      "Buat 3 variasi konten berdasarkan formula iklan terbaik",
    ],
  },
  {
    step: 4,
    title: "Buat Campaign Pertama",
    duration: "30 menit",
    tasks: [
      "Pilih objective: 'Product Sales' atau 'Conversions'",
      "Atur budget harian minimum Rp 50.000 - Rp 100.000",
      "Set target audience: usia 18-35, minat sesuai produk",
      "Upload 3 variasi creative (video 9:16, durasi 15-30 detik)",
      "Set bid optimization: oCPM untuk jangkauan maksimal",
    ],
  },
  {
    step: 5,
    title: "Optimasi & Scale",
    duration: "Ongoing",
    tasks: [
      "Pantau CTR (target minimal 1.5% untuk video)",
      "Matikan creative dengan CTR di bawah 0.8% setelah 1000 tayangan",
      "Naikkan budget 20-30% setiap 2-3 hari jika profitable",
      "Buat Lookalike Audience dari pembeli yang sudah ada",
      "Test angle baru setiap minggu untuk refresh creative",
    ],
  },
];

const contentFormulas = [
  {
    name: "Hook → Problem → Solution",
    description: "Formula paling umum dan efektif untuk produk digital",
    structure: [
      "0-3 detik: Hook yang menarik perhatian (pertanyaan, fakta mengejutkan)",
      "3-10 detik: Perjelas masalah yang dialami target market",
      "10-20 detik: Tunjukkan solusi (produk kamu)",
      "20-30 detik: CTA yang jelas dengan urgensi",
    ],
    example: "Hook: 'Kenapa iklan kamu sepi padahal sudah keluar budget besar?'\nMasalah: Tampilkan konten iklan yang tidak convert\nSolusi: Tunjukkan hasil sebelum-sesudah menggunakan produk\nCTA: 'Link di bio, hanya hari ini!'",
  },
  {
    name: "Testimoni + Demo",
    description: "Social proof yang kuat + bukti nyata produk bekerja",
    structure: [
      "0-3 detik: Tampilkan hasil/testimoni klien (angka spesifik)",
      "3-15 detik: Demo cara kerja produk secara singkat",
      "15-25 detik: Tambahkan 2-3 testimoni pendek lainnya",
      "25-30 detik: CTA dengan penawaran terbatas",
    ],
    example: "Hook: 'Dia dapat Rp 3 juta pertama dalam 5 hari pakai sistem ini'\nDemo: Screen recording cara menggunakan produk\nTestimoni: Tampilkan 2-3 komentar positif\nCTA: 'Ambil sekarang sebelum harga naik'",
  },
  {
    name: "Tutorial + Soft-Sell",
    description: "Berikan nilai dulu, jual kemudian — cocok untuk membangun kepercayaan",
    structure: [
      "0-5 detik: Teaser 'Cara [hasil yang diinginkan] dalam [waktu]'",
      "5-20 detik: Tutorial singkat yang benar-benar bermanfaat",
      "20-27 detik: Transisi ke produk 'Mau lebih lengkap?'",
      "27-30 detik: CTA halus ke produk premium",
    ],
    example: "Hook: 'Cara nulis caption yang bikin orang langsung beli (3 tips)'\nTutorial: Tips 1, 2, 3 yang actionable\nTransisi: 'Ini baru 3 dari 50 template yang ada di [nama produk]'\nCTA: 'Cek link bio untuk akses semua templatenya'",
  },
];

const budgetGuide = [
  {
    budget: "Rp 50.000 - Rp 100.000/hari",
    phase: "Testing",
    description: "Fase belajar & testing creative. Fokus pada data, bukan profit.",
    goals: ["Temukan 1-2 creative yang CTR > 1.5%", "Pahami behavior audience", "Bangun data pixel minimal"],
  },
  {
    budget: "Rp 100.000 - Rp 300.000/hari",
    phase: "Optimization",
    description: "Scale creative yang sudah terbukti. Mulai testing audience baru.",
    goals: ["ROAS minimal 1.5x", "Testing Lookalike Audience", "Buat variasi creative baru dari yang winning"],
  },
  {
    budget: "Rp 300.000 - Rp 1.000.000/hari",
    phase: "Scaling",
    description: "Scale agresif campaign yang sudah profitable. Tambah ad set baru.",
    goals: ["ROAS minimal 2x", "Ekspansi ke audience baru", "Target purchase harian yang konsisten"],
  },
];

const faqs = [
  {
    q: "Apakah perlu akun TikTok yang sudah banyak follower?",
    a: "Tidak! TikTok Ads berjalan terpisah dari akun organik. Kamu bisa mulai iklan TikTok meskipun akun baru dibuat dengan 0 follower.",
  },
  {
    q: "Produk apa yang paling mudah dijual via TikTok Ads?",
    a: "Produk dengan harga Rp 50.000 - Rp 300.000 paling mudah convert. Produk digital seperti e-book, template, dan kursus online sangat cocok karena tidak perlu ongkir.",
  },
  {
    q: "Berapa lama sebelum iklan menguntungkan?",
    a: "Rata-rata butuh 7-14 hari testing sebelum menemukan kombinasi yang profitable. Jangan putus asa jika 3-5 hari pertama belum ada penjualan.",
  },
  {
    q: "Apa yang harus dilakukan jika iklan di-reject?",
    a: "Cek kembali guidelines TikTok Ads. Hindari klaim berlebihan, kata-kata terlarang, dan gambar/video yang melanggar kebijakan. Edit konten dan submit ulang.",
  },
  {
    q: "Bisakah menggunakan video dari TikTok organik sebagai materi iklan?",
    a: "Bisa! Gunakan fitur 'Spark Ads' di TikTok Ads Manager untuk boost video organik kamu. Ini sering memberikan hasil lebih baik karena terlihat lebih natural.",
  },
];

export default function TikTokAds() {
  const { toast } = useToast();

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin!", description: "Teks berhasil disalin." });
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
          <Play className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">TikTok Ads untuk Produk Digital</h1>
          <p className="text-muted-foreground">Panduan lengkap setup, optimasi, dan scale iklan TikTok dengan budget minimal</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Budget Minimal", value: "Rp 50rb/hari", icon: DollarSign, color: "text-green-500" },
          { label: "Waktu Setup", value: "1-2 jam", icon: Zap, color: "text-blue-500" },
          { label: "Target CTR", value: "> 1.5%", icon: Target, color: "text-orange-500" },
          { label: "Target ROAS", value: "2-5x", icon: TrendingUp, color: "text-purple-500" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-4">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="setup" data-testid="tabs-tiktok">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup" data-testid="tab-setup">Setup Iklan</TabsTrigger>
          <TabsTrigger value="content" data-testid="tab-content">Formula Konten</TabsTrigger>
          <TabsTrigger value="budget" data-testid="tab-budget">Panduan Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4 mt-4">
          {setupSteps.map((step, i) => (
            <Card key={i} data-testid={`card-step-${step.step}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {step.step}
                  </div>
                  <div>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      {step.duration}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {step.tasks.map((task, ti) => (
                    <li key={ti} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {task}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="content" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Kunci sukses TikTok Ads:</strong> 3 detik pertama menentukan segalanya. 
              Jika penonton tidak tertarik dalam 3 detik, mereka swipe. Fokus buat hook yang kuat!
            </p>
          </div>
          {contentFormulas.map((formula, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {formula.name}
                </CardTitle>
                <CardDescription>{formula.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Struktur:</p>
                  <ul className="space-y-1">
                    {formula.structure.map((s, si) => (
                      <li key={si} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-medium flex-shrink-0">{si + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded bg-muted">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">Contoh Script:</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyText(formula.example)}
                      data-testid={`button-copy-formula-${i}`}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Salin
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-line text-muted-foreground">{formula.example}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="budget" className="space-y-4 mt-4">
          {budgetGuide.map((tier, i) => (
            <Card key={i} data-testid={`card-budget-${i}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{tier.budget}</CardTitle>
                  <Badge variant={i === 0 ? "secondary" : i === 1 ? "outline" : "default"}>
                    {tier.phase}
                  </Badge>
                </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-2">Target di fase ini:</p>
                <ul className="space-y-2">
                  {tier.goals.map((goal, gi) => (
                    <li key={gi} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            FAQ TikTok Ads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} data-testid={`faq-item-${i}`}>
                <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
