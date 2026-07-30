import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Trash2,
  Star,
  Pencil,
  Sparkles,
  CheckCircle2,
  Loader2,
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
import { useToast } from "@/hooks/use-toast";

interface WRProject { id: number; name: string; brief: string; }
interface WRProjectWithCount extends WRProject { deliverableCount?: number; }

const BUSINESS_TYPES = [
  "E-commerce (Jualan Produk Fisik)",
  "Produk Digital (kursus, ebook, template)",
  "Software / SaaS",
  "Jasa / Layanan Profesional",
  "Afiliasi / Dropship",
  "Marketplace / Platform",
  "Lainnya",
];

interface ProfileFormData {
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

const emptyForm: ProfileFormData = {
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
  const set = (k: keyof ProfileFormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row 1: Nama bisnis + Tipe bisnis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="space-y-1.5">
          <Label htmlFor="businessType">Tipe Bisnis</Label>
          <select
            id="businessType"
            value={form.businessType}
            onChange={(e) => set("businessType", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">-- Pilih tipe --</option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Industri + Produk/Layanan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="industry">Industri / Niche</Label>
          <Input
            id="industry"
            value={form.industry}
            onChange={(e) => set("industry", e.target.value)}
            placeholder="e.g. Kopi specialty, Fashion muslimah, SaaS HR"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="productsServices">Produk / Layanan Utama</Label>
          <Input
            id="productsServices"
            value={form.productsServices}
            onChange={(e) => set("productsServices", e.target.value)}
            placeholder="e.g. Kopi arabika single origin 250g"
          />
        </div>
      </div>

      {/* Target Audience */}
      <div className="space-y-1.5">
        <Label htmlFor="targetAudience">Target Audience</Label>
        <Textarea
          id="targetAudience"
          value={form.targetAudience}
          onChange={(e) => set("targetAudience", e.target.value)}
          placeholder="e.g. Pria/Wanita 25-40 tahun, pekerja kantoran, income Rp 5-20jt/bulan, suka kopi berkualitas"
          rows={2}
        />
      </div>

      {/* Value Proposition */}
      <div className="space-y-1.5">
        <Label htmlFor="valueProposition">Value Proposition / USP</Label>
        <Textarea
          id="valueProposition"
          value={form.valueProposition}
          onChange={(e) => set("valueProposition", e.target.value)}
          placeholder="Apa keunggulan utama yang membedakan dari kompetitor? (1-3 kalimat)"
          rows={2}
        />
      </div>

      {/* Row: Tone + Lokasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="tone">Tone Komunikasi</Label>
          <Input
            id="tone"
            value={form.tone}
            onChange={(e) => set("tone", e.target.value)}
            placeholder="e.g. Profesional tapi hangat, casual & fun, edukatif"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Lokasi / Area Pasar</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. Indonesia (nasional), Jabodetabek, Southeast Asia"
          />
        </div>
      </div>

      {/* Row: Budget + Goals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="monthlyBudget">Budget Bulanan Iklan</Label>
          <Input
            id="monthlyBudget"
            value={form.monthlyBudget}
            onChange={(e) => set("monthlyBudget", e.target.value)}
            placeholder="e.g. Rp 3.000.000 / bulan"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="goals">Goals / Tujuan Marketing</Label>
          <Input
            id="goals"
            value={form.goals}
            onChange={(e) => set("goals", e.target.value)}
            placeholder="e.g. Awareness, first purchase, repeat order"
          />
        </div>
      </div>

      {/* Competitors */}
      <div className="space-y-1.5">
        <Label htmlFor="competitors">Kompetitor Utama</Label>
        <Input
          id="competitors"
          value={form.competitors}
          onChange={(e) => set("competitors", e.target.value)}
          placeholder="e.g. Kopi Kenangan, Fore Coffee, Starbucks"
        />
      </div>

      {/* Additional Context */}
      <div className="space-y-1.5">
        <Label htmlFor="additionalContext">Konteks Tambahan (opsional)</Label>
        <Textarea
          id="additionalContext"
          value={form.additionalContext}
          onChange={(e) => set("additionalContext", e.target.value)}
          placeholder="Info lain yang penting bagi AI: promo aktif, seasonal campaign, produk baru, dll."
          rows={2}
        />
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
        {profile.businessType && (
          <CardDescription className="text-xs">{profile.businessType}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {profile.industry && (
          <div>
            <span className="text-muted-foreground">Industri: </span>
            <span>{profile.industry}</span>
          </div>
        )}
        {profile.valueProposition && (
          <div>
            <span className="text-muted-foreground">USP: </span>
            <span className="line-clamp-2">{profile.valueProposition}</span>
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
  // Task #39 — prefill from Workroom
  const [createInitial, setCreateInitial] = useState<ProfileFormData | null>(null);
  const [prefillDialogOpen, setPrefillDialogOpen] = useState(false);
  const [wrProjects, setWrProjects] = useState<WRProjectWithCount[]>([]);
  const [wrLoading, setWrLoading] = useState(false);
  const [prefillPending, setPrefillPending] = useState(false);
  const { toast } = useToast();

  const openPrefillDialog = async () => {
    setWrLoading(true);
    setPrefillDialogOpen(true);
    try {
      const r = await fetch("/api/workroom/projects", { credentials: "include" });
      if (r.ok) setWrProjects(await r.json());
    } finally {
      setWrLoading(false);
    }
  };

  const handlePrefillSelect = async (projectId: number) => {
    setPrefillPending(true);
    try {
      const r = await fetch("/api/business-profiles/prefill-from-workroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId }),
      });
      if (!r.ok) throw new Error("Failed");
      const { fields, source } = await r.json() as { fields: Partial<ProfileFormData>; source: string };
      const merged: ProfileFormData = {
        businessName: fields.businessName || "",
        businessType: fields.businessType || "",
        industry: fields.industry || "",
        productsServices: fields.productsServices || "",
        targetAudience: fields.targetAudience || "",
        valueProposition: fields.valueProposition || "",
        tone: fields.tone || "",
        location: fields.location || "",
        monthlyBudget: fields.monthlyBudget || "",
        goals: fields.goals || "",
        competitors: fields.competitors || "",
        additionalContext: fields.additionalContext || "",
      };
      setCreateInitial(merged);
      setPrefillDialogOpen(false);
      setEditingProfile(null);
      setDialogOpen(true);
      toast({ title: `Pre-fill dari "${source}" selesai ✓`, description: "Tinjau dan simpan profil yang sudah diisi AI.", duration: 4000 });
    } catch {
      toast({ title: "Gagal mengekstrak data dari Workroom", variant: "destructive" });
    } finally {
      setPrefillPending(false);
    }
  };

  const openCreate = () => {
    setCreateInitial(null);
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
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button onClick={openPrefillDialog} variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Pre-fill dari Workroom
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Profil
          </Button>
        </div>
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
              Kalau kamu punya beberapa produk/brand, buat profil terpisah dan klik <strong>Aktifkan</strong> pada profil yang relevan sebelum mulai bekerja.
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
                {activeProfile.businessName}
                {activeProfile.industry ? ` — ${activeProfile.industry}` : ""}
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

      {/* Task #39 — Pre-fill from Workroom dialog */}
      <Dialog open={prefillDialogOpen} onOpenChange={setPrefillDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Pre-fill dari Workroom
            </DialogTitle>
            <DialogDescription>
              Pilih proyek Workroom. AI akan mengekstrak informasi bisnis dari campaign brief dan deliverable-nya.
            </DialogDescription>
          </DialogHeader>
          {wrLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : wrProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Belum ada proyek Workroom. Buat dulu di MultiClaw Workroom.
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {wrProjects.map((p) => (
                <button
                  key={p.id}
                  className="w-full text-left border rounded-lg p-3 hover:bg-muted/50 transition-colors disabled:opacity-60 space-y-0.5"
                  disabled={prefillPending}
                  onClick={() => handlePrefillSelect(p.id)}
                >
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.brief}</p>
                  {prefillPending && (
                    <div className="flex items-center gap-1 text-[11px] text-primary mt-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Mengekstrak dengan AI...
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                    businessName: editingProfile.businessName,
                    businessType: editingProfile.businessType || "",
                    industry: editingProfile.industry || "",
                    productsServices: editingProfile.productsServices || "",
                    targetAudience: editingProfile.targetAudience || "",
                    valueProposition: editingProfile.valueProposition || "",
                    tone: editingProfile.tone || "",
                    location: editingProfile.location || "",
                    monthlyBudget: editingProfile.monthlyBudget || "",
                    goals: editingProfile.goals || "",
                    competitors: editingProfile.competitors || "",
                    additionalContext: editingProfile.additionalContext || "",
                  }
                : (createInitial ?? emptyForm)
            }
            onSubmit={handleSave}
            onCancel={() => { setDialogOpen(false); setCreateInitial(null); }}
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
