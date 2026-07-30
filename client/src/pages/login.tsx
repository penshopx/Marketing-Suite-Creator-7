import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, LogIn, UserPlus, ArrowLeft, Eye, EyeOff, KeyRound, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/theme-toggle";

type Mode = "login" | "register" | "forgot" | "reset";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  // Login / Register fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Forgot / Reset fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ── Login ──────────────────────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login gagal");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Login berhasil!", description: "Selamat datang di AI Marketing Tools" });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({ title: "Login gagal", description: error.message, variant: "destructive" });
    },
  });

  // ── Register ───────────────────────────────────────────────────────────────
  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; name: string; password: string }) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registrasi gagal");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Registrasi berhasil!", description: "Akun Anda telah dibuat. Selamat datang!" });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({ title: "Registrasi gagal", description: error.message, variant: "destructive" });
    },
  });

  // ── Forgot Password ────────────────────────────────────────────────────────
  const forgotMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengirim kode");
      }
      return response.json() as Promise<{ success: boolean; token?: string }>;
    },
    onSuccess: (data) => {
      if (data.token) {
        // Token shown on screen (no email service)
        toast({
          title: `Kode reset: ${data.token}`,
          description: "Salin kode ini sebelum mengisi form di bawah. Berlaku 15 menit.",
          duration: 60000,
        });
        setResetToken(data.token);
      } else {
        toast({ title: "Jika email terdaftar, kode telah dibuat", duration: 5000 });
      }
      setMode("reset");
    },
    onError: (error: Error) => {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    },
  });

  // ── Reset Password ─────────────────────────────────────────────────────────
  const resetMutation = useMutation({
    mutationFn: async (data: { email: string; token: string; newPassword: string }) => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Reset gagal");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Password berhasil diubah!", description: "Silakan login dengan password baru Anda." });
      setMode("login");
      setPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setResetToken("");
    },
    onError: (error: Error) => {
      toast({ title: "Reset gagal", description: error.message, variant: "destructive" });
    },
  });

  // ── Form submit handlers ───────────────────────────────────────────────────
  const handleLoginRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Email diperlukan", variant: "destructive" }); return;
    }
    if (!password) {
      toast({ title: "Password diperlukan", variant: "destructive" }); return;
    }
    if (mode === "register") {
      if (!name.trim()) { toast({ title: "Nama diperlukan", variant: "destructive" }); return; }
      if (password.length < 6) { toast({ title: "Password minimal 6 karakter", variant: "destructive" }); return; }
      if (password !== confirmPassword) { toast({ title: "Password tidak cocok", variant: "destructive" }); return; }
      registerMutation.mutate({ email: email.trim(), name: name.trim(), password });
    } else {
      loginMutation.mutate({ email: email.trim(), password });
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast({ title: "Email diperlukan", variant: "destructive" }); return;
    }
    forgotMutation.mutate({ email: forgotEmail.trim() });
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !resetToken.trim() || !newPassword) {
      toast({ title: "Lengkapi semua kolom", variant: "destructive" }); return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password minimal 6 karakter", variant: "destructive" }); return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Password tidak cocok", variant: "destructive" }); return;
    }
    resetMutation.mutate({ email: forgotEmail.trim(), token: resetToken.trim(), newPassword });
  };

  const isPending = loginMutation.isPending || registerMutation.isPending
    || forgotMutation.isPending || resetMutation.isPending;

  // ── UI ─────────────────────────────────────────────────────────────────────
  const titles: Record<Mode, string> = {
    login: "Login ke AI Marketing Tools",
    register: "Daftar Akun Baru",
    forgot: "Lupa Password",
    reset: "Reset Password",
  };
  const descs: Record<Mode, string> = {
    login: "Masukkan email dan password Anda",
    register: "Buat akun untuk mengakses semua fitur marketing AI",
    forgot: "Masukkan email Anda untuk mendapatkan kode reset",
    reset: "Masukkan kode reset dan password baru Anda",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {mode === "forgot" || mode === "reset"
                ? <KeyRound className="h-8 w-8 text-primary" />
                : <Sparkles className="h-8 w-8 text-primary" />}
            </div>
          </div>
          <CardTitle className="text-2xl">{titles[mode]}</CardTitle>
          <CardDescription>{descs[mode]}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* ── Login / Register form ── */}
          {(mode === "login" || mode === "register") && (
            <form onSubmit={handleLoginRegister} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" type="text" placeholder="Nama Anda"
                    value={name} onChange={(e) => setName(e.target.value)} required data-testid="input-name" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="input-email" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" && (
                    <button type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => { setForgotEmail(email); setMode("forgot"); }}>
                      Lupa password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"}
                    placeholder={mode === "register" ? "Minimal 6 karakter" : "Masukkan password"}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required data-testid="input-password" />
                  <Button type="button" variant="ghost" size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)} data-testid="button-toggle-password">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Ulangi password"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    required data-testid="input-confirm-password" />
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={isPending}
                data-testid={mode === "register" ? "button-submit-register" : "button-submit-login"}>
                {isPending
                  ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                  : mode === "register" ? <UserPlus className="h-5 w-5 mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
                {isPending ? (mode === "register" ? "Mendaftar..." : "Logging in...") : (mode === "register" ? "Daftar" : "Login")}
              </Button>
            </form>
          )}

          {/* ── Forgot Password form ── */}
          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgotEmail">Email</Label>
                <Input id="forgotEmail" type="email" placeholder="email@example.com"
                  value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending
                  ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                  : <KeyRound className="h-5 w-5 mr-2" />}
                {isPending ? "Memproses..." : "Kirim Kode Reset"}
              </Button>
            </form>
          )}

          {/* ── Reset Password form ── */}
          {mode === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300">
                Kode reset ditampilkan di notifikasi pop-up di atas. Salin sebelum menutupnya. Berlaku 15 menit.
              </div>
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <Input id="resetEmail" type="email" placeholder="email@example.com"
                  value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resetToken">Kode Reset (6 karakter)</Label>
                <Input id="resetToken" type="text" placeholder="A3F9C2"
                  value={resetToken} onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                  maxLength={6} className="font-mono tracking-widest text-center text-lg" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <div className="relative">
                  <Input id="newPassword" type={showNewPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  <Button type="button" variant="ghost" size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Konfirmasi Password Baru</Label>
                <Input id="confirmNewPassword" type="password" placeholder="Ulangi password baru"
                  value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending
                  ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                  : <RotateCcw className="h-5 w-5 mr-2" />}
                {isPending ? "Menyimpan..." : "Simpan Password Baru"}
              </Button>
            </form>
          )}

          {/* ── Bottom navigation ── */}
          <div className="mt-4 space-y-2 text-center">
            {(mode === "login" || mode === "register") && (
              <button type="button"
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setPassword(""); setConfirmPassword(""); }}
                className="block w-full text-sm text-primary hover:underline"
                data-testid="button-toggle-mode">
                {mode === "register" ? "Sudah punya akun? Login di sini" : "Belum punya akun? Daftar di sini"}
              </button>
            )}
            {(mode === "forgot" || mode === "reset") && (
              <button type="button"
                onClick={() => setMode("login")}
                className="block w-full text-sm text-primary hover:underline">
                Kembali ke Login
              </button>
            )}
            <a href="/"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              data-testid="link-back-home">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke halaman utama
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
