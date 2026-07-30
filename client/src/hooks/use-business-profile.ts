import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Matches actual DB columns in business_profiles table.
// isDefault is a virtual field added server-side (most-recently-updated profile = active).
export interface BusinessProfile {
  id: number;
  userId: string;
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
  isDefault: boolean; // virtual — computed server-side
  createdAt: string;
  updatedAt: string;
}

export interface UpsertBusinessProfile {
  businessName: string;
  businessType?: string;
  industry?: string;
  productsServices?: string;
  targetAudience?: string;
  valueProposition?: string;
  tone?: string;
  location?: string;
  monthlyBudget?: string;
  goals?: string;
  competitors?: string;
  additionalContext?: string;
}

// Get all profiles for the current user
export function useBusinessProfiles() {
  return useQuery<BusinessProfile[]>({
    queryKey: ["/api/business-profiles"],
    staleTime: 5 * 60 * 1000,
  });
}

// Get the default/active profile
export function useActiveBusinessProfile() {
  return useQuery<BusinessProfile | null>({
    queryKey: ["/api/business-profile"],
    staleTime: 5 * 60 * 1000,
  });
}

// Create a new profile
export function useCreateBusinessProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpsertBusinessProfile) => {
      const res = await fetch("/api/business-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal menyimpan profil");
      return res.json() as Promise<BusinessProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/business-profile"] });
      toast({ title: "Profil disimpan", description: "Profil bisnis berhasil dibuat." });
    },
    onError: () => {
      toast({ title: "Gagal", description: "Tidak bisa menyimpan profil bisnis.", variant: "destructive" });
    },
  });
}

// Update an existing profile
export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpsertBusinessProfile }) => {
      const res = await fetch(`/api/business-profiles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal memperbarui profil");
      return res.json() as Promise<BusinessProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/business-profile"] });
      toast({ title: "Profil diperbarui", description: "Profil bisnis berhasil diperbarui." });
    },
    onError: () => {
      toast({ title: "Gagal", description: "Tidak bisa memperbarui profil bisnis.", variant: "destructive" });
    },
  });
}

// Delete a profile
export function useDeleteBusinessProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/business-profiles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus profil");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/business-profile"] });
      toast({ title: "Profil dihapus", description: "Profil bisnis berhasil dihapus." });
    },
    onError: () => {
      toast({ title: "Gagal", description: "Tidak bisa menghapus profil bisnis.", variant: "destructive" });
    },
  });
}

// Set a profile as active (touches updatedAt so it sorts first = becomes active)
export function useSetDefaultProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/business-profiles/${id}/set-default`, { method: "POST" });
      if (!res.ok) throw new Error("Gagal mengatur profil default");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/business-profile"] });
      toast({ title: "Profil diaktifkan", description: "Profil ini sekarang aktif untuk semua AI tools." });
    },
    onError: () => {
      toast({ title: "Gagal", description: "Tidak bisa mengubah profil aktif.", variant: "destructive" });
    },
  });
}
