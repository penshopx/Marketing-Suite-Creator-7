import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  Plus,
  Trash2,
  Star,
  StarOff,
  Pencil,
  Sparkles,
  CheckCircle2,
  Loader2,
  X,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBusinessProfiles, useCreateBusinessProfile, useUpdateBusinessProfile, useDeleteBusinessProfile, useSetDefaultProfile, type BusinessProfile, type UpsertBusinessProfile } from "@/hooks/use-business-profile";

const PLATFORMS = [
  { id: "meta_ads", label: "Meta Ads" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "google_ads", label: "Google Ads" },
  { id: "youtube", label: "YouTube" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "shopee", label: "Shopee" },
  { id: "tokopedia", label: "Tokopedia" },
];

const PRODUCT_CATEGORIES = [
  "Produk Digital (kursus, ebook, template)",
  "Software / SaaS",
  "Produk Fisik",
  "Jasa / Layanan",
  "E-Commerce / Marketplace",
  "Afiliasi / Dropship",
  "Fashion & Lifestyle",
  "Kesehatan & Kecantikan",
  "Makanan & Minuman",
  "Lainnya",
];

interface ProfileFormData {
  profileName: string;
  businessName: string;
  productCategory: string;
  usp: string;
  targetAudience: string;
  monthlyBudget: string;
  mainPlatforms: string[];
  isDefault: boolean;
}

const emptyForm: ProfileFormData = {
  profileName: "Profil Utama",
  businessName: "",
  productCategory: "",
  usp: "",
  targetAudience: "",
  monthlyBudget: "",
  mainPlatforms: [],
  isDefault: true,
};

function ProfileForm({
  initial,
  onSubmit,
  onCancel,
  isSaving,
}: {
  initial: ProfileFormData;
  onSubmit: (data: UpsertBusinessProfile) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<ProfileFormData>(initial);

  const set = (k: keyof ProfileFormData, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const togglePlatform = (id: string) => {
    set(
      "mainPlatforms",
      form.mainPlatforms.includes(id)
        ? form.mainPlatforms.filter((p) => p !== id)
        : [...form.mainPlatforms, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="profileName">Nama Profil</Label>
          <Input
            id="profileName"
            value={form.profileName}
            onChange={(e) => set("profileName", e.target.value)}
            placeholder="e.g. Produk A, Brand B..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="businessName">
            Nama Bisnis / Produk <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            value={form.businessName}
            onChange={(e) => set("businessName", e.target.value)}
            placeholder="e.g. Kursus Digital Marketing Pro"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="productCategory">Kategori Produk</Label>
        <select
          id="productCategory"
          value={form.productCategory}
          onChange={(e) => set("productCategory", e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">-- Pilih kategori --</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="usp">
          USP — Unique Selling Proposition
        </Label>
        <Textarea
          id="usp"
          value={form.usp}
          onChange={(e) => set("usp", e.target.value)}
          placeholder="Apa yang paling membedakan produk/bisnis ini dari kompetitor? (1-3 kalimat)"
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="targetAudience">Target Audience</Label>
        <Textarea
          id="targetAudience"
          value={form.targetAudience}
          onChange={(e) => set("targetAudience", e.target.value)}
          placeholder="e.g. Pria/Wanita 25-40 tahun, pebisnis online, tertarik digital marketing, income Rp 5-20jt/bulan"
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="monthlyBudget">Budget Bulanan Iklan</Label>
        <Input
          id="monthlyBudget"
          value={form.monthlyBudget}
          onChange={(e) => set("monthlyBudget", e.target.value)}
          placeholder="e.g. Rp 3.000.000 / bulan"
        />
      </div>

      <div className="space-y-2">
        <Label>Platform Utama</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PLATFORMS.map((p) => (
            <label
              key={p.id}
              className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={form.mainPlatforms.includes(p.id)}
                onCheckedChange={() => togglePlatform(p.id)}
              />
              <span className="text-sm">{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id="isDefault"
          checked={form.isDefault}
          onCheckedChange={(v) => set("isDefault", Boolean(v))}
        />
        <Label htmlFor="isDefault" className="cursor-pointer font-normal">
          Jadikan profil aktif (digunakan oleh semua AI tools)
        </Label>
      </div>

      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Batal
        </Button>
        <Button type="submit" disabled={isSaving || !form.businessName.trim()}>
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Simpan Profil
        </Button>
      </DialogFooter>
    </form>
  );
}

function ProfileCard({
  profile,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  profile: BusinessProfile;
  onEdit: (p: BusinessProfile) => void;
  onDelete: (p: BusinessProfile) => void;
  onSetDefault: (id: number) => void;
}) {
  const platforms = Array.isArray(profile.mainPlatforms) ? profile.mainPlatforms : [];

  return (
    <Card className={`relative ${profile.isDefault ? "border-primary/60 bg-primary/5" : ""}`}>
      {profile.isDefault && (
        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground gap-1">
          <Star className="h-3 w-3" /> Aktif
        </Badge>
      )}
      <CardHeader className="pb-2 pr-24">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          {profile.businessName || "(tanpa nama)"}
        </CardTitle>
        <CardDescription className="text-xs">{profile.profileName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {profile.productCategory && (
          <div>
            <span className="text-muted-foreground">Kategori: </span>
            <span>{profile.productCategory}</span>
          </div>
        )}
        {profile.usp && (
          <div>
            <span className="text-muted-foreground">USP: </span>
            <span className="line-clamp-2">{profile.usp}</span>
          </div>
        )}
        {profile.targetAudience && (
          <div>
            <span className="text-muted-foreground">Target: </span>
            <span className="line-clamp-2">{profile.targetAudience}</span>
          </div>
        )}
        {profile.monthlyBudget && (
          <div>
            <span className="text-muted-foreground">Budget: </span>
            <span>{profile.monthlyBudget}</span>
          </div>
        )}
        {platforms.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {platforms.map((p) => (
              <Badge key={p} variant="secondary" className="text-xs">
                {PLATFORMS.find((x) => x.id === p)?.label ?? p}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {!profile.isDefault && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => onSetDefault(profile.id)}
            >
              <Star className="h-3 w-3" /> Aktifkan
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => onEdit(profile)}
          >
            <Pencil className="h-3 w-3" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(profile)}
          >
            <Trash2 className="h-3 w-3" /> Hapus
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BusinessProfilePage() {
  const { data: profiles = [], isLoading } = useBusinessProfiles();
  const createMutation = useCreateBusinessProfile();
  const updateMutation = useUpdateBusinessProfile();
  const deleteMutation = useDeleteBusinessProfile();
  const setDefaultMutation = useSetDefaultProfile();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BusinessProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessProfile | null>(null);

  const openCreate = () => {
    setEditingProfile(null);
    setDialogOpen(true);
  };

  const openEdit = (p: BusinessProfile) => {
    setEditingProfile(p);
    setDialogOpen(true);
  };

  const handleSave = (data: UpsertBusinessProfile) => {
    if (editingProfile) {
      updateMutation.mutate(
        { id: editingProfile.id, data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const activeProfile = profiles.find((p) => p.isDefault);

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Profil Bisnis
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Simpan informasi bisnis agar AI bisa personalisasi semua output secara otomatis.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 flex-shrink-0">
          <Plus className="h-4 w-4" />
          Tambah Profil
        </Button>
      </div>

      {/* Info banner */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
        <CardContent className="py-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p className="font-medium">Bagaimana profil bisnis bekerja?</p>
            <p>
              Setiap kali kamu menggunakan AI tool — dari Ad Creator, Email Sequence, Audience Builder, sampai MultiClaw Workroom — AI akan membaca profil bisnis aktif (<strong>ditandai bintang</strong>) sebagai konteks.
              Tidak perlu lagi menjelaskan produk dari awal setiap sesi.
            </p>
            <p>
              Kalau kamu punya beberapa produk/brand, buat profil terpisah dan aktifkan yang relevan sebelum mulai bekerja.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active profile summary */}
      {activeProfile && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
          <CardContent className="py-3 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-green-800 dark:text-green-200">
                Profil aktif:{" "}
              </span>
              <span className="text-green-700 dark:text-green-300">
                {activeProfile.businessName} ({activeProfile.profileName})
              </span>
              <span className="text-green-600 dark:text-green-400 ml-1">
                — AI tools akan menggunakan profil ini.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : profiles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center gap-4 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/40" />
            <div>
              <p className="font-medium">Belum ada profil bisnis</p>
              <p className="text-sm text-muted-foreground mt-1">
                Buat profil pertamamu agar AI bisa mengenal bisnis kamu.
              </p>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Buat Profil Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {profiles.map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onSetDefault={(id) => setDefaultMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProfile ? "Edit Profil Bisnis" : "Tambah Profil Bisnis"}
            </DialogTitle>
            <DialogDescription>
              Informasi ini akan digunakan AI sebagai konteks untuk semua tool.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm
            initial={
              editingProfile
                ? {
                    profileName: editingProfile.profileName,
                    businessName: editingProfile.businessName,
                    productCategory: editingProfile.productCategory || "",
                    usp: editingProfile.usp || "",
                    targetAudience: editingProfile.targetAudience || "",
                    monthlyBudget: editingProfile.monthlyBudget || "",
                    mainPlatforms: Array.isArray(editingProfile.mainPlatforms)
                      ? editingProfile.mainPlatforms
                      : [],
                    isDefault: editingProfile.isDefault,
                  }
                : {
                    ...emptyForm,
                    isDefault: profiles.length === 0,
                  }
            }
            onSubmit={handleSave}
            onCancel={() => setDialogOpen(false)}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus profil ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Profil <strong>{deleteTarget?.businessName}</strong> akan dihapus permanen. Tindakan ini
              tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
                setDeleteTarget(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
