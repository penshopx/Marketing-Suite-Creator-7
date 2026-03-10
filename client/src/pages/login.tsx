import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, LogIn, UserPlus, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Login() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      toast({
        title: "Login berhasil!",
        description: "Selamat datang di AI Marketing Tools",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Login gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
      toast({
        title: "Registrasi berhasil!",
        description: "Akun Anda telah dibuat. Selamat datang!",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Registrasi gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Email diperlukan", description: "Masukkan email Anda", variant: "destructive" });
      return;
    }
    if (!password) {
      toast({ title: "Password diperlukan", description: "Masukkan password Anda", variant: "destructive" });
      return;
    }

    if (isRegisterMode) {
      if (!name.trim()) {
        toast({ title: "Nama diperlukan", description: "Masukkan nama Anda", variant: "destructive" });
        return;
      }
      if (password.length < 6) {
        toast({ title: "Password terlalu pendek", description: "Password minimal 6 karakter", variant: "destructive" });
        return;
      }
      if (password !== confirmPassword) {
        toast({ title: "Password tidak cocok", description: "Konfirmasi password harus sama", variant: "destructive" });
        return;
      }
      registerMutation.mutate({ email: email.trim(), name: name.trim(), password });
    } else {
      loginMutation.mutate({ email: email.trim(), password });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {isRegisterMode ? "Daftar Akun Baru" : "Login ke AI Marketing Tools"}
          </CardTitle>
          <CardDescription>
            {isRegisterMode 
              ? "Buat akun untuk mengakses semua fitur marketing AI"
              : "Masukkan email dan password Anda"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="input-name"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isRegisterMode ? "Minimal 6 karakter" : "Masukkan password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {isRegisterMode && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  data-testid="input-confirm-password"
                />
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isPending}
              data-testid={isRegisterMode ? "button-submit-register" : "button-submit-login"}
            >
              {isPending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
              ) : isRegisterMode ? (
                <UserPlus className="h-5 w-5 mr-2" />
              ) : (
                <LogIn className="h-5 w-5 mr-2" />
              )}
              {isPending 
                ? (isRegisterMode ? "Mendaftar..." : "Logging in...") 
                : (isRegisterMode ? "Daftar" : "Login")
              }
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-sm text-primary hover:underline"
              data-testid="button-toggle-mode"
            >
              {isRegisterMode 
                ? "Sudah punya akun? Login di sini" 
                : "Belum punya akun? Daftar di sini"
              }
            </button>
          </div>

          <div className="mt-4 text-center">
            <a 
              href="/" 
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              data-testid="link-back-home"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke halaman utama
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
