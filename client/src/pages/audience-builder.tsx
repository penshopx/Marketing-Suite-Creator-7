import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Users, Sparkles, Loader2, Plus, X, Target, Brain, Heart, ShoppingBag, MapPin, Calendar, DollarSign, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAIAutoFill } from "@/lib/use-ai-autofill";
import { AIAutoFillButton, AI_FIELD_CLASS } from "@/components/ai-autofill-button";

interface AudiencePersona {
  name: string;
  demographics: {
    ageRange: string;
    gender: string;
    location: string;
    income: string;
    education: string;
    occupation: string;
  };
  psychographics: {
    interests: string[];
    values: string[];
    painPoints: string[];
    goals: string[];
    behaviors: string[];
  };
  buyingBehavior: {
    triggers: string[];
    objections: string[];
    preferredChannels: string[];
  };
}

export default function AudienceBuilder() {
  const [productDescription, setProductDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [personas, setPersonas] = useState<AudiencePersona[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [ageRange, setAgeRange] = useState([25, 45]);
  const [workroomBanner, setWorkroomBanner] = useState<string | null>(null);
  const { isAutoFilling, aiFilledFields, triggerAutoFill, markManualEdit } = useAIAutoFill();

  // Read pre-fill data from Workroom export
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("workroom_prefill");
      if (!raw) return;
      sessionStorage.removeItem("workroom_prefill");
      const { deliverableType, content, projectName, title } = JSON.parse(raw) as {
        deliverableType: string; content: string; projectName: string; title: string;
      };
      if (deliverableType === "audience_persona") {
        // Put the persona content as product description context so AI Auto-Fill can work from it
        setProductDescription(`[Dari Workroom: ${projectName}]\n${content}`);
        // Try to extract interests from "Contoh minat spesifik" or last section
        const minatMatch = content.match(/Contoh minat spesifik[:\s]+([^\n]+(?:\n[^\n]+)*)/i);
        if (minatMatch) {
          const extracted = minatMatch[1]
            .split(/[,;]/)
            .map((s) => s.trim().replace(/^[-•*]\s*/, "").split(/[|(]/)[0].trim())
            .filter((s) => s.length > 2 && s.length < 60)
            .slice(0, 10);
          if (extracted.length > 0) setInterests(extracted);
        }
        // Try to extract age from "Demografi" section
        const ageMatch = content.match(/(\d{2})[–\-–](\d{2})\s*tahun/i);
        if (ageMatch) {
          const min = Math.max(18, Math.min(65, parseInt(ageMatch[1])));
          const max = Math.max(min, Math.min(65, parseInt(ageMatch[2])));
          setAgeRange([min, max]);
        }
        setWorkroomBanner(`${projectName} — ${title}`);
      }
    } catch {
      // Silently ignore parse errors
    }
  }, []);

  const handleAutoFill = (fields: Record<string, string>) => {
    if (fields.productDescription) {
      setProductDescription(fields.productDescription);
    }
    if (fields.ageRange) {
      const match = fields.ageRange.match(/(\d+)\D+(\d+)/);
      if (match) {
        const min = Math.max(18, Math.min(65, parseInt(match[1])));
        const max = Math.max(min, Math.min(65, parseInt(match[2])));
        setAgeRange([min, max]);
      }
    }
    if (fields.interests) {
      const newInterests = fields.interests
        .split(",")
        .map((i: string) => i.trim())
        .filter(Boolean);
      setInterests(newInterests);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const getFallbackPersona = (): AudiencePersona => ({
    name: "Profesional Muda Ambisius",
    demographics: {
      ageRange: `${ageRange[0]}-${ageRange[1]} tahun`,
      gender: "Pria/Wanita",
      location: "Jakarta, Surabaya, Bandung",
      income: "Rp 10-20 juta/bulan",
      education: "S1/S2",
      occupation: "Manager/Supervisor",
    },
    psychographics: {
      interests: ["Karir", "Self-improvement", "Teknologi"],
      values: ["Efisiensi", "Kualitas", "Pertumbuhan"],
      painPoints: ["Waktu terbatas", "Kompetisi tinggi", "Stress kerja"],
      goals: ["Promosi", "Work-life balance", "Financial freedom"],
      behaviors: ["Research online sebelum beli", "Aktif di sosial media"],
    },
    buyingBehavior: {
      triggers: ["Testimoni positif", "Diskon terbatas", "Rekomendasi peer"],
      objections: ["Harga", "Waktu", "Tidak yakin efektif"],
      preferredChannels: ["Instagram", "LinkedIn", "Google Search"],
    },
  });

  const generatePersonas = async () => {
    if (!productDescription.trim()) return;

    setIsGenerating(true);
    setPersonas([]);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    
    try {
      const response = await fetch("/api/generate-audience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productDescription,
          interests,
          ageRange: `${ageRange[0]}-${ageRange[1]}`,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed to generate personas");
      }

      const data = await response.json();
      
      if (data.error || !data.personas || data.personas.length === 0) {
        throw new Error(data.error || "No personas returned");
      }
      
      setPersonas(data.personas);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error generating personas:", error);
      setPersonas([getFallbackPersona()]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                Audience Builder
              </h1>
              <p className="text-muted-foreground">
                Bangun dan pahami target audience ideal Anda untuk kampanye yang winning
              </p>
            </div>
            <AIAutoFillButton
              toolName="audience-builder"
              onFill={handleAutoFill}
              isAutoFilling={isAutoFilling}
              triggerAutoFill={triggerAutoFill}
            />
          </div>

          {/* Workroom pre-fill banner */}
          {workroomBanner && (
            <div className="flex items-center gap-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 px-4 py-3 text-sm">
              <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-purple-700 dark:text-purple-300">Data dari Workroom termuat:</span>{" "}
                <span className="text-purple-600 dark:text-purple-400 truncate">{workroomBanner}</span>
                <span className="text-muted-foreground ml-2 text-xs">— Form sudah terisi, klik Buat Persona atau sesuaikan terlebih dahulu.</span>
              </div>
              <button onClick={() => setWorkroomBanner(null)} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Input Data</CardTitle>
              <CardDescription>Jelaskan produk dan target Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product">Deskripsi Produk/Layanan</Label>
                <Textarea
                  id="product"
                  data-testid="input-audience-product"
                  placeholder="Jelaskan produk atau layanan Anda..."
                  value={productDescription}
                  onChange={(e) => { setProductDescription(e.target.value); markManualEdit("productDescription"); }}
                  rows={4}
                  className={cn(aiFilledFields.has("productDescription") && AI_FIELD_CLASS)}
                />
              </div>

              <div className="space-y-2">
                <Label>Range Usia: {ageRange[0]} - {ageRange[1]} tahun</Label>
                <Slider
                  value={ageRange}
                  onValueChange={setAgeRange}
                  min={18}
                  max={65}
                  step={1}
                  data-testid="slider-age-range"
                />
              </div>

              <div className="space-y-2">
                <Label>Minat & Interest</Label>
                <div className="flex gap-2">
                  <Input
                    data-testid="input-add-interest"
                    placeholder="Tambah interest..."
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addInterest()}
                  />
                  <Button size="icon" variant="outline" onClick={addInterest} data-testid="button-add-interest">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="gap-1">
                      {interest}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={generatePersonas}
                disabled={isGenerating || !productDescription.trim()}
                data-testid="button-generate-personas"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Buyer Personas
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {personas.length > 0 ? (
              personas.map((persona, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      {persona.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Usia
                        </div>
                        <p className="text-sm text-muted-foreground">{persona.demographics.ageRange}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          Lokasi
                        </div>
                        <p className="text-sm text-muted-foreground">{persona.demographics.location}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          Income
                        </div>
                        <p className="text-sm text-muted-foreground">{persona.demographics.income}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          Pekerjaan
                        </div>
                        <p className="text-sm text-muted-foreground">{persona.demographics.occupation}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Heart className="h-4 w-4 text-primary" />
                        Interests & Values
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {persona.psychographics.interests.map((interest, i) => (
                          <Badge key={i} variant="outline">{interest}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Brain className="h-4 w-4 text-primary" />
                        Pain Points
                      </div>
                      <ul className="space-y-1">
                        {persona.psychographics.painPoints.map((point, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 font-medium">
                        <Target className="h-4 w-4 text-primary" />
                        Goals & Motivations
                      </div>
                      <ul className="space-y-1">
                        {persona.psychographics.goals.map((goal, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 font-medium">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        Buying Triggers
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {persona.buyingBehavior.triggers.map((trigger, i) => (
                          <Badge key={i} variant="secondary">{trigger}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="py-16 text-center">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Belum Ada Buyer Persona</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Masukkan deskripsi produk dan generate buyer personas untuk memahami target audience ideal Anda.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
