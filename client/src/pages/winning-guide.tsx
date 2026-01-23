import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Trophy, Target, Users, Lightbulb, TrendingUp, CheckCircle2, 
  ArrowRight, Zap, Brain, Eye, Heart, MessageSquare, DollarSign,
  BarChart3, Rocket, Shield, Clock, Star, AlertTriangle
} from "lucide-react";

export default function WinningGuide() {
  const principles = [
    {
      icon: Target,
      title: "1. Kenali Target Market Seperti Sahabat",
      description: "Winning advertiser tahu persis siapa yang mereka ajak bicara",
      tips: [
        "Buat buyer persona detail: usia, pekerjaan, masalah, impian",
        "Riset di mana mereka nongkrong online (IG, TikTok, FB, LinkedIn)",
        "Pahami bahasa sehari-hari mereka, gunakan dalam copy",
        "Identifikasi 3 pain point utama yang bisa kamu selesaikan",
        "Cari tahu kapan mereka paling aktif scrolling",
      ],
      actionable: "Gunakan Audience Builder untuk membuat persona detail",
      link: "/audience-builder",
    },
    {
      icon: Lightbulb,
      title: "2. Hook yang Menghentikan Scroll",
      description: "3 detik pertama menentukan nasib iklanmu",
      tips: [
        "Mulai dengan pertanyaan yang relate: 'Pernah gak sih...'",
        "Gunakan angka spesifik: '7 hari', 'Rp 50rb', '3 langkah'",
        "Pattern interrupt: hal tak terduga yang bikin berhenti",
        "Speak to pain point langsung: 'Capek jerawatan terus?'",
        "Hindari opening generik seperti 'Hai guys' atau 'Halo semuanya'",
      ],
      examples: [
        "❌ 'Produk skincare terbaik untuk kulit bermasalah'",
        "✅ 'Jerawat hilang dalam 7 hari atau uang kembali'",
        "❌ 'Kami menjual sepatu berkualitas'",
        "✅ 'Sepatu ini dipakai 10.000+ pelari marathon Indonesia'",
      ],
    },
    {
      icon: Heart,
      title: "3. Emotional Trigger yang Tepat",
      description: "Orang membeli dengan emosi, justify dengan logika",
      tips: [
        "Fear of Missing Out (FOMO): 'Hanya 24 jam' atau 'Sisa 5 slot'",
        "Aspirasi: Tunjukkan hasil yang mereka inginkan",
        "Social proof: Testimoni, jumlah pembeli, rating",
        "Pain agitation: Perjelas masalah sebelum kasih solusi",
        "Transformation story: Before-after yang dramatis",
      ],
      emotions: [
        { name: "Fear", use: "Takut ketinggalan, takut rugi" },
        { name: "Greed", use: "Ingin lebih, ingin untung" },
        { name: "Pride", use: "Ingin terlihat baik, sukses" },
        { name: "Desire", use: "Impian, keinginan mendalam" },
      ],
    },
    {
      icon: Eye,
      title: "4. Visual yang Stop-Scrolling",
      description: "Visual buruk = skip langsung, visual bagus = baca lanjut",
      tips: [
        "Wajah manusia dengan ekspresi kuat selalu menarik",
        "Kontras warna tinggi untuk stand out di feed",
        "Text overlay yang readable (max 20% area gambar)",
        "Before-after side by side untuk produk transformasi",
        "Video: gerakan di 2 detik pertama adalah kunci",
      ],
      donts: [
        "Jangan pakai stock photo yang terlihat palsu",
        "Jangan terlalu banyak text di gambar",
        "Jangan pakai kualitas rendah atau blur",
        "Jangan copy visual kompetitor 100%",
      ],
    },
    {
      icon: MessageSquare,
      title: "5. Copywriting Formula yang Proven",
      description: "Struktur copy yang sudah terbukti convert",
      formulas: [
        {
          name: "PAS (Problem-Agitate-Solution)",
          steps: ["Sebutkan masalah", "Perbesar rasa sakit", "Tawarkan solusi"],
          example: "Jerawat bikin gak pede? → Apalagi kalau ada acara penting → Serum X hilangkan jerawat dalam 3 hari",
        },
        {
          name: "AIDA (Attention-Interest-Desire-Action)",
          steps: ["Hook perhatian", "Bangun ketertarikan", "Ciptakan keinginan", "Ajak action"],
          example: "STOP! → Ini rahasia kulit glass skin → Bayangkan punya kulit seperti artis Korea → Klik link sekarang",
        },
        {
          name: "BAB (Before-After-Bridge)",
          steps: ["Kondisi sebelum", "Kondisi setelah", "Produk sebagai jembatan"],
          example: "Dulu BB cream luntur 2 jam → Sekarang tahan 12 jam flawless → Berkat cushion waterproof ini",
        },
      ],
    },
    {
      icon: Zap,
      title: "6. CTA yang Memaksa Action",
      description: "CTA lemah = konversi rendah, CTA kuat = sales naik",
      tips: [
        "Specific action: 'Klik link di bio' bukan 'Cek produk kami'",
        "Urgency: 'Promo berakhir malam ini' atau 'Stok terbatas'",
        "Benefit-oriented: 'Dapatkan kulit glowing' bukan 'Beli sekarang'",
        "Risk reversal: 'Garansi uang kembali 100%'",
        "Social proof in CTA: 'Gabung 10.000+ customer puas'",
      ],
      examples: [
        "❌ 'Beli sekarang'",
        "✅ 'Klaim diskon 50% sebelum habis (sisa 23 pcs)'",
        "❌ 'Hubungi kami'",
        "✅ 'Chat sekarang, free konsultasi 15 menit'",
      ],
    },
    {
      icon: BarChart3,
      title: "7. Testing & Optimization",
      description: "Winning ads lahir dari testing, bukan keberuntungan",
      tips: [
        "Test 3-5 variasi hook untuk setiap campaign",
        "A/B test satu elemen per waktu (hook, visual, atau CTA)",
        "Beri waktu 3-5 hari dan minimal 1000 impressions sebelum judge",
        "Kill ads dengan CTR < 1% setelah 48 jam",
        "Scale winning ads dengan duplicate, bukan increase budget drastis",
      ],
      metrics: [
        { name: "CTR", target: "> 2%", meaning: "Hook & visual menarik" },
        { name: "CPC", target: "< Rp 1000", meaning: "Targeting tepat" },
        { name: "CPM", target: "< Rp 30.000", meaning: "Konten engaging" },
        { name: "ROAS", target: "> 3x", meaning: "Campaign profitable" },
      ],
    },
    {
      icon: DollarSign,
      title: "8. Budget Strategy yang Smart",
      description: "Uang besar tidak menjamin hasil besar",
      tips: [
        "Mulai kecil (Rp 50-100rb/hari) untuk testing",
        "Jangan scale sebelum punya winning creative",
        "Rule 3x: Scale budget max 20-30% per 3 hari",
        "Diversifikasi: Jangan taruh semua budget di 1 ad set",
        "Retargeting budget: 20-30% dari total untuk warm audience",
      ],
      phases: [
        { phase: "Testing", budget: "Rp 50-100rb/hari", duration: "7-14 hari" },
        { phase: "Validation", budget: "Rp 200-500rb/hari", duration: "7 hari" },
        { phase: "Scaling", budget: "Rp 1jt+/hari", duration: "Ongoing" },
      ],
    },
  ];

  const commonMistakes = [
    { mistake: "Tidak testing, langsung scale", fix: "Test dulu dengan budget kecil" },
    { mistake: "Hook terlalu panjang", fix: "Sampaikan value dalam 3 detik" },
    { mistake: "Targeting terlalu luas", fix: "Narrowing dengan interest stacking" },
    { mistake: "CTA tidak jelas", fix: "Satu CTA spesifik per iklan" },
    { mistake: "Tidak pakai social proof", fix: "Tambah testimoni, jumlah buyer" },
    { mistake: "Copy sama untuk semua platform", fix: "Customize per platform" },
  ];

  const platformTips = [
    { platform: "Meta (FB/IG)", tips: ["Video 15-30 detik optimal", "Carousel untuk multiple products", "Stories untuk urgency/promo"] },
    { platform: "TikTok", tips: ["Native look, jangan terlalu polished", "Hook dalam 1 detik pertama", "Trending sound untuk reach"] },
    { platform: "Google Ads", tips: ["Keyword intent tinggi", "Ad copy match search query", "Extensions untuk CTR boost"] },
    { platform: "YouTube", tips: ["Skip button di detik 5, hook sebelumnya", "Bumper 6 detik untuk awareness", "Tutorial format untuk trust"] },
  ];

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
              <Trophy className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold">Panduan Praktis Winning Ads</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            8 prinsip fundamental yang membedakan iklan biasa dengan iklan yang menghasilkan
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Badge variant="secondary" className="text-sm py-1 px-3">
              <Clock className="h-3 w-3 mr-1" />
              15 menit baca
            </Badge>
            <Badge variant="secondary" className="text-sm py-1 px-3">
              <Star className="h-3 w-3 mr-1" />
              Proven strategies
            </Badge>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Mindset Winning Advertiser</h3>
                <p className="text-muted-foreground">
                  Iklan yang winning bukan soal keberuntungan. Ini soal memahami psikologi audiens, 
                  testing sistematis, dan optimasi berkelanjutan. Setiap iklan adalah eksperimen, 
                  dan setiap data adalah pelajaran.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {principles.map((principle, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <principle.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{principle.title}</CardTitle>
                  <CardDescription className="text-base mt-1">{principle.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {principle.tips && (
                <div className="space-y-2">
                  {principle.tips.map((tip, tipIndex) => (
                    <div key={tipIndex} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {principle.examples && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium mb-2">Contoh:</h4>
                  {principle.examples.map((example, exIndex) => (
                    <p key={exIndex} className={example.startsWith("❌") ? "text-red-500" : "text-green-600"}>
                      {example}
                    </p>
                  ))}
                </div>
              )}

              {principle.emotions && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {principle.emotions.map((emotion, emIndex) => (
                    <div key={emIndex} className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="font-semibold text-primary">{emotion.name}</div>
                      <div className="text-sm text-muted-foreground">{emotion.use}</div>
                    </div>
                  ))}
                </div>
              )}

              {principle.formulas && (
                <div className="space-y-4">
                  {principle.formulas.map((formula, fIndex) => (
                    <div key={fIndex} className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold text-primary mb-2">{formula.name}</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formula.steps.map((step, sIndex) => (
                          <Badge key={sIndex} variant="outline">{sIndex + 1}. {step}</Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground italic">"{formula.example}"</p>
                    </div>
                  ))}
                </div>
              )}

              {principle.donts && (
                <div className="bg-red-500/10 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-red-500 mb-2">Hindari:</h4>
                  {principle.donts.map((dont, dIndex) => (
                    <div key={dIndex} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{dont}</span>
                    </div>
                  ))}
                </div>
              )}

              {principle.metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {principle.metrics.map((metric, mIndex) => (
                    <div key={mIndex} className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="font-bold text-lg text-primary">{metric.name}</div>
                      <div className="text-sm font-medium text-green-500">{metric.target}</div>
                      <div className="text-xs text-muted-foreground">{metric.meaning}</div>
                    </div>
                  ))}
                </div>
              )}

              {principle.phases && (
                <div className="grid grid-cols-3 gap-3">
                  {principle.phases.map((phase, pIndex) => (
                    <div key={pIndex} className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="font-semibold text-primary">{phase.phase}</div>
                      <div className="text-sm font-medium">{phase.budget}</div>
                      <div className="text-xs text-muted-foreground">{phase.duration}</div>
                    </div>
                  ))}
                </div>
              )}

              {principle.actionable && (
                <Link href={principle.link || "#"}>
                  <Button className="w-full mt-2" data-testid={`button-action-${index}`}>
                    {principle.actionable}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Kesalahan Umum & Cara Fix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {commonMistakes.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <div className="text-red-500 text-sm line-through">{item.mistake}</div>
                    <div className="text-green-600 font-medium">{item.fix}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Tips per Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {platformTips.map((platform, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-primary mb-2">{platform.platform}</h4>
                  <ul className="space-y-1">
                    {platform.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-green-500/20">
                <Rocket className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold">Siap Membuat Iklan Winning?</h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Gunakan tools AI kami untuk menerapkan semua prinsip di atas. 
              Dari riset audience sampai analisis iklan, semuanya ada.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link href="/campaign-wizard">
                <Button size="lg" data-testid="button-start-campaign">
                  <Zap className="mr-2 h-5 w-5" />
                  Mulai Campaign Wizard
                </Button>
              </Link>
              <Link href="/campaign-analyzer">
                <Button size="lg" variant="outline" data-testid="button-analyze">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Analisis Iklanmu
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
