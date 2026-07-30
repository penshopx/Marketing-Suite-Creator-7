import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Target,
  Megaphone,
  Palette,
  MapPin,
  DollarSign,
  TrendingUp,
  Users,
  Swords,
  FileText,
  Save,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface BusinessProfile {
  businessName: string;
  businessType: string;
  industry: string;
  productsServices: string;
  targetAudience: string;
  valueProposition: string;
  tone: string;
  location: string;
  monthlyBudget: string;
  goals: string;
  competitors: string;
  additionalContext: string;
}

const EMPTY_PROFILE: BusinessProfile = {
  businessName: "",
  businessType: "",
  industry: "",
  productsServices: "",
  targetAudience: "",
  valueProposition: "",
  tone: "",
  location: "",
  monthlyBudget: "",
  goals: "",
  competitors: "",
  additionalContext: "",
};

const BUSINESS_TYPES = [
  "E-commerce (Jualan Produk Fisik)",
  "Produk Digital / Info-produk",
  "Jasa / Freelance",
  "SaaS / Software",
  "Dropship / Reseller",
  "Restoran / F&B",
  "Retail / Toko Offline",
  "Konsultasi / Coaching",
  "Properti / Agen",
  "Kesehatan & Kecantikan",
  "Lainnya",
];

const TONES = ["Formal & Profesional", "Santai & Bersahabat", "Playful & Fun", "Inspiratif & Motivasi", "Edukasi & Informatif", "Eksklusif & Luxury"];

const BUDGET_OPTIONS = [
  "< Rp 500.000/bulan",
  "Rp 500.000 – 2.000.000/bulan",
  "Rp 2.000.000 – 5.000.000/bulan",
  "Rp 5.000.000 – 15.000.000/bulan",
  "Rp 15.000.000 – 50.000.000/bulan",
  "> Rp 50.000.000/bulan",
];

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: profile, isLoading } = useQuery<BusinessProfile>({
    queryKey: ["/api/business-profile"],
    queryFn: async () => {
      const res = await fetch("/api/business-profile", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const [form, setForm] = useState<BusinessProfile>(EMPTY_PROFILE);

  // Sync server data into local form once loaded
  const [synced, setSynced] = useState(false);
  if (profile && !synced) {
    setForm(profile);
    setSynced(true);
  }

  const mutation = useMutation({
    mutationFn: async (data: BusinessProfile) => {
      const res = await fetch("/api/business-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profile"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({ title: "Profil bisnis disimpan ✓", description: "AI akan menggunakan data ini untuk semua output yang dipersonalisasi." });
    },
    onError: () => {
      toast({ title: "Gagal menyimpan", description: "Coba lagi sebentar.", variant: "destructive" });
    },
  });

  const set = (field: keyof BusinessProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setSelect = (field: keyof BusinessProfile) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const filledCount = Object.values(form).filter((v) => v.trim().length > 0).length;
  const totalFields = Object.keys(EMPTY_PROFILE).length;
  const completeness = Math.round((filledCount / totalFields) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Profil Bisnis</h1>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            Dipakai AI
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Isi sekali, AI akan mempersonalisasi semua output tool secara otomatis — dari copy iklan, audience persona, hook, hingga strategi kampanye.
        </p>
      </div>

      {/* Completeness bar */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Kelengkapan profil</span>
            <span className="text-sm font-semibold text-primary">{completeness}%</span>
          </div>
          <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {completeness < 50
              ? "Isi minimal 6 field agar AI punya cukup konteks untuk personalisasi."
              : completeness < 100
              ? "Bagus! Isi sisa field untuk hasil AI yang lebih akurat."
              : "Profil lengkap — AI akan memberikan output yang sangat personal."}
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identitas Bisnis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Identitas Bisnis
              </CardTitle>
              <CardDescription>Informasi dasar tentang bisnis Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="businessName">Nama Bisnis / Brand</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g. Kopi Nusantara, TechBoost ID"
                    value={form.businessName}
                    onChange={set("businessName")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="businessType">Jenis Bisnis</Label>
                  <Select value={form.businessType} onValueChange={setSelect("businessType")}>
                    <SelectTrigger id="businessType">
                      <SelectValue placeholder="Pilih jenis bisnis..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="industry">Industri / Niche</Label>
                <Input
                  id="industry"
                  placeholder="e.g. Kopi premium, Fashion wanita muslimah, Software HR, Properti Jabodetabek"
                  value={form.industry}
                  onChange={set("industry")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="productsServices">Produk / Layanan Utama</Label>
                <Textarea
                  id="productsServices"
                  rows={3}
                  placeholder="Jelaskan produk/layanan Anda: apa yang dijual, harga kisaran, keunggulan utama..."
                  value={form.productsServices}
                  onChange={set("productsServices")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Target & Posisi */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Target Pasar & Positioning
              </CardTitle>
              <CardDescription>Siapa pelanggan ideal Anda dan apa yang membedakan bisnis Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="targetAudience" className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Target Audience
                </Label>
                <Textarea
                  id="targetAudience"
                  rows={3}
                  placeholder="e.g. Perempuan 25-40 tahun, ibu muda, tinggal di kota besar, aktif di Instagram, suka belanja online, masalah utama: kurang waktu untuk diri sendiri"
                  value={form.targetAudience}
                  onChange={set("targetAudience")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="valueProposition">Unique Value Proposition (USP)</Label>
                <Textarea
                  id="valueProposition"
                  rows={2}
                  placeholder="e.g. Satu-satunya kopi specialty yang diantar dalam 30 menit ke kantor dengan SLA tepat waktu"
                  value={form.valueProposition}
                  onChange={set("valueProposition")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="competitors" className="flex items-center gap-1.5">
                  <Swords className="h-3.5 w-3.5" /> Kompetitor Utama
                </Label>
                <Input
                  id="competitors"
                  placeholder="e.g. Kopi Kenangan, Fore Coffee, Starbucks"
                  value={form.competitors}
                  onChange={set("competitors")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Brand Voice & Lokasi */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Brand Voice & Lokasi
              </CardTitle>
              <CardDescription>Gaya komunikasi dan area operasional bisnis Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tone" className="flex items-center gap-1.5">
                    <Megaphone className="h-3.5 w-3.5" /> Tone / Gaya Komunikasi
                  </Label>
                  <Select value={form.tone} onValueChange={setSelect("tone")}>
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Pilih tone..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Lokasi / Wilayah Target
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g. Jakarta, Jabodetabek, Seluruh Indonesia"
                    value={form.location}
                    onChange={set("location")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget & Goals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Budget & Tujuan Marketing
              </CardTitle>
              <CardDescription>Anggaran dan target yang ingin dicapai</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="monthlyBudget" className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Budget Iklan Bulanan
                </Label>
                <Select value={form.monthlyBudget} onValueChange={setSelect("monthlyBudget")}>
                  <SelectTrigger id="monthlyBudget">
                    <SelectValue placeholder="Pilih range budget..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_OPTIONS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goals">Tujuan Marketing Utama</Label>
                <Textarea
                  id="goals"
                  rows={2}
                  placeholder="e.g. Tingkatkan penjualan 30% dalam 3 bulan, bangun brand awareness di TikTok, dapatkan 100 leads/bulan"
                  value={form.goals}
                  onChange={set("goals")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Konteks Tambahan */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Konteks Tambahan
              </CardTitle>
              <CardDescription>Info lain yang penting agar AI lebih memahami bisnis Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="additionalContext"
                rows={4}
                placeholder="e.g. Kami sudah ada 3 tahun, punya 2.000 pelanggan loyal, sering collab dengan influencer micro (10k-50k followers), fokus platform utama Instagram dan TikTok, sudah punya ROAS rata-rata 3x di Meta Ads..."
                value={form.additionalContext}
                onChange={set("additionalContext")}
              />
            </CardContent>
          </Card>

          <Separator />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Data ini hanya digunakan untuk mempersonalisasi output AI Anda dan tidak dibagikan ke pihak lain.
            </p>
            <Button type="submit" disabled={mutation.isPending} className="gap-2 min-w-[140px]">
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                  Menyimpan...
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Tersimpan!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Profil
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
