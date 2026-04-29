import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Loader2, Copy, Sparkles, Heart, Zap, ShoppingCart, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const sequenceTypes = [
  { id: "welcome", name: "Welcome Series", desc: "Onboarding subscriber baru", icon: Heart, count: 5 },
  { id: "nurturing", name: "Lead Nurturing", desc: "Bangun trust sebelum jual", icon: TrendingUp, count: 7 },
  { id: "promo", name: "Promo Campaign", desc: "Push penjualan / launch", icon: Zap, count: 5 },
  { id: "abandoned_cart", name: "Abandoned Cart", desc: "Recover keranjang tertinggal", icon: ShoppingCart, count: 3 },
];

interface EmailItem {
  day: number;
  subject: string;
  preview: string;
  body: string;
  cta: string;
}

interface SequenceResponse {
  emails: EmailItem[];
  type: string;
  product: string;
}

export default function EmailSequence() {
  const [sequenceType, setSequenceType] = useState("welcome");
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("ramah");
  const [extraContext, setExtraContext] = useState("");
  const [language, setLanguage] = useState<"id" | "en">("id");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SequenceResponse | null>(null);
  const [history, setHistory] = useState<SequenceResponse[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!product.trim()) {
      toast({ title: "Lengkapi data", description: "Produk / brand wajib diisi", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-email-sequence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sequenceType, product, audience, tone, extraContext, language }),
      });

      if (!response.ok) throw new Error("Failed to generate");
      const data: SequenceResponse = await response.json();

      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 20));
      toast({ title: "Berhasil", description: `${data.emails.length} email siap dipakai` });
    } catch (error) {
      console.error("Error generating sequence:", error);
      toast({ title: "Gagal", description: "Coba lagi sebentar lagi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Disalin", description: `${label} disalin ke clipboard` });
  };

  const handleCopyAll = () => {
    if (!result) return;
    const all = result.emails
      .map(
        (e) =>
          `=== EMAIL HARI ${e.day} ===\nSubject: ${e.subject}\nPreview: ${e.preview}\n\n${e.body}\n\nCTA: ${e.cta}`,
      )
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(all);
    toast({ title: "Disalin semua", description: `${result.emails.length} email disalin` });
  };

  const typeInfo = (id: string) => sequenceTypes.find((t) => t.id === id);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Email Sequence Generator
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Bangun sequence email yang menjual — Welcome, Nurturing, Promo, atau Abandoned Cart
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create" data-testid="tab-create">Buat Sequence</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History ({history.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Jenis Sequence</CardTitle>
                    <CardDescription>Pilih tujuan email kamu</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {sequenceTypes.map((t) => (
                        <Button
                          key={t.id}
                          variant={sequenceType === t.id ? "default" : "outline"}
                          className="h-auto flex-col items-start gap-1 py-3 px-3 text-left"
                          onClick={() => setSequenceType(t.id)}
                          data-testid={`button-type-${t.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <t.icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{t.name}</span>
                          </div>
                          <span className="text-xs opacity-70 font-normal whitespace-normal">
                            {t.desc} · {t.count} email
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detail Bisnis</CardTitle>
                    <CardDescription>Isi info produk dan audience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="product">Produk / Brand *</Label>
                      <Input
                        id="product"
                        placeholder="Contoh: Skincare GlowPro — serum vitamin C"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        data-testid="input-product"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="audience">Target Audience</Label>
                      <Input
                        id="audience"
                        placeholder="Contoh: wanita 25-35, urban, peduli skincare"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        data-testid="input-audience"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tone">Tone Komunikasi</Label>
                      <Input
                        id="tone"
                        placeholder="Contoh: ramah, profesional, kasual, asik"
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        data-testid="input-tone"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="extraContext">Konteks Tambahan (opsional)</Label>
                      <Textarea
                        id="extraContext"
                        placeholder="Promo, USP, deadline, social proof..."
                        value={extraContext}
                        onChange={(e) => setExtraContext(e.target.value)}
                        className="min-h-[80px]"
                        data-testid="input-extra"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Bahasa</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={language === "id" ? "default" : "outline"}
                          onClick={() => setLanguage("id")}
                          className="flex-1"
                          data-testid="button-lang-id"
                        >
                          Indonesia
                        </Button>
                        <Button
                          variant={language === "en" ? "default" : "outline"}
                          onClick={() => setLanguage("en")}
                          className="flex-1"
                          data-testid="button-lang-en"
                        >
                          English
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isLoading || !product.trim()}
                      className="w-full"
                      data-testid="button-generate"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Membuat sequence...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Email Sequence
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <CardTitle>Hasil Sequence</CardTitle>
                        <CardDescription>
                          {result
                            ? `${result.emails.length} email — ${typeInfo(result.type)?.name ?? result.type}`
                            : "Email akan muncul di sini"}
                        </CardDescription>
                      </div>
                      {result && (
                        <Button size="sm" variant="outline" onClick={handleCopyAll} data-testid="button-copy-all">
                          <Copy className="h-3 w-3 mr-1" />
                          Salin Semua
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {result ? (
                      <div className="space-y-4">
                        {result.emails.map((email, idx) => (
                          <div
                            key={idx}
                            className="rounded-md border p-4 space-y-3"
                            data-testid={`email-item-${idx}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant="secondary">Hari {email.day}</Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() =>
                                  handleCopy(
                                    `Subject: ${email.subject}\nPreview: ${email.preview}\n\n${email.body}\n\nCTA: ${email.cta}`,
                                    `Email hari ${email.day}`,
                                  )
                                }
                                data-testid={`button-copy-${idx}`}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div>
                              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Subject</Label>
                              <p className="text-sm font-semibold">{email.subject}</p>
                            </div>
                            <div>
                              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Preview</Label>
                              <p className="text-xs text-muted-foreground italic">{email.preview}</p>
                            </div>
                            <div>
                              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Body</Label>
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{email.body}</p>
                            </div>
                            <div className="pt-2 border-t">
                              <Button size="sm" className="w-full">{email.cta}</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada sequence</p>
                        <p className="text-sm mt-1">Isi data lalu klik Generate</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {history.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada history</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {history.map((entry, idx) => (
                  <Card
                    key={idx}
                    className="hover-elevate cursor-pointer"
                    onClick={() => setResult(entry)}
                    data-testid={`history-item-${idx}`}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-1">{entry.product}</CardTitle>
                      <CardDescription className="text-xs">
                        {typeInfo(entry.type)?.name ?? entry.type} · {entry.emails.length} email
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {entry.emails[0]?.subject}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
