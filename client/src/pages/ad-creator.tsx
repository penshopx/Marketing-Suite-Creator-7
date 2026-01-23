import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Megaphone, Loader2, Copy, Sparkles, Target, Users, DollarSign } from "lucide-react";
import { SiFacebook, SiInstagram, SiTiktok, SiYoutube, SiLinkedin, SiGoogle } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

const platforms = [
  { id: "meta_ads", name: "Meta Ads", icon: SiFacebook, color: "bg-blue-500/10 text-blue-600" },
  { id: "instagram", name: "Instagram", icon: SiInstagram, color: "bg-pink-500/10 text-pink-600" },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, color: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300" },
  { id: "youtube", name: "YouTube", icon: SiYoutube, color: "bg-red-500/10 text-red-600" },
  { id: "linkedin", name: "LinkedIn", icon: SiLinkedin, color: "bg-sky-500/10 text-sky-600" },
  { id: "google_ads", name: "Google Ads", icon: SiGoogle, color: "bg-green-500/10 text-green-600" },
];

const objectives = [
  { id: "awareness", name: "Brand Awareness", icon: Users },
  { id: "traffic", name: "Website Traffic", icon: Target },
  { id: "conversions", name: "Conversions", icon: DollarSign },
];

interface GeneratedAd {
  id: string;
  platform: string;
  objective: string;
  headline: string;
  primaryText: string;
  description: string;
  callToAction: string;
  createdAt: Date;
}

export default function AdCreator() {
  const [selectedPlatform, setSelectedPlatform] = useState("meta_ads");
  const [objective, setObjective] = useState("awareness");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [uniqueValue, setUniqueValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
  const [adHistory, setAdHistory] = useState<GeneratedAd[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!productName.trim() || !productDescription.trim()) {
      toast({
        title: "Error",
        description: "Please fill in product name and description",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selectedPlatform,
          objective,
          productName,
          productDescription,
          targetAudience,
          uniqueValue,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate ad");

      const data = await response.json();
      const newAd: GeneratedAd = {
        id: Date.now().toString(),
        platform: selectedPlatform,
        objective,
        headline: data.headline,
        primaryText: data.primaryText,
        description: data.description,
        callToAction: data.callToAction,
        createdAt: new Date(),
      };

      setGeneratedAd(newAd);
      setAdHistory((prev) => [newAd, ...prev]);
      toast({
        title: "Success",
        description: "Ad copy generated successfully!",
      });
    } catch (error) {
      console.error("Error generating ad:", error);
      toast({
        title: "Error",
        description: "Failed to generate ad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const getPlatformInfo = (id: string) => platforms.find((p) => p.id === id);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            AI Ad Creator
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create winning ad copy for all major platforms
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create" data-testid="tab-create">Create Ad</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History ({adHistory.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Platform</CardTitle>
                    <CardDescription>Choose where your ad will run</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {platforms.map((platform) => (
                        <Button
                          key={platform.id}
                          variant={selectedPlatform === platform.id ? "default" : "outline"}
                          className="h-auto flex-col gap-2 py-4"
                          onClick={() => setSelectedPlatform(platform.id)}
                          data-testid={`button-platform-${platform.id}`}
                        >
                          <platform.icon className="h-5 w-5" />
                          <span className="text-xs">{platform.name}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Objective</CardTitle>
                    <CardDescription>What do you want to achieve?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {objectives.map((obj) => (
                        <Button
                          key={obj.id}
                          variant={objective === obj.id ? "default" : "outline"}
                          className="h-auto flex-col gap-2 py-4"
                          onClick={() => setObjective(obj.id)}
                          data-testid={`button-objective-${obj.id}`}
                        >
                          <obj.icon className="h-5 w-5" />
                          <span className="text-xs">{obj.name}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                    <CardDescription>Tell us about your product or service</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName">Product/Service Name *</Label>
                      <Input
                        id="productName"
                        placeholder="e.g., FitPro Smartwatch"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        data-testid="input-product-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productDescription">Description *</Label>
                      <Textarea
                        id="productDescription"
                        placeholder="Describe your product and its key features..."
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        className="min-h-[100px]"
                        data-testid="input-product-description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">Target Audience</Label>
                      <Input
                        id="targetAudience"
                        placeholder="e.g., Health-conscious professionals 25-45"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        data-testid="input-target-audience"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="uniqueValue">Unique Value Proposition</Label>
                      <Input
                        id="uniqueValue"
                        placeholder="e.g., 30-day battery life, water resistant"
                        value={uniqueValue}
                        onChange={(e) => setUniqueValue(e.target.value)}
                        data-testid="input-unique-value"
                      />
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isLoading || !productName.trim() || !productDescription.trim()}
                      className="w-full"
                      data-testid="button-generate-ad"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Ad Copy
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="sticky top-6">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <CardTitle>Generated Ad Copy</CardTitle>
                        <CardDescription>
                          {generatedAd
                            ? `For ${getPlatformInfo(generatedAd.platform)?.name}`
                            : "Your ad will appear here"}
                        </CardDescription>
                      </div>
                      {generatedAd && (
                        <Badge className={getPlatformInfo(generatedAd.platform)?.color}>
                          {getPlatformInfo(generatedAd.platform)?.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {generatedAd ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">HEADLINE</Label>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => handleCopy(generatedAd.headline, "Headline")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="font-semibold">{generatedAd.headline}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">PRIMARY TEXT</Label>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => handleCopy(generatedAd.primaryText, "Primary text")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm">{generatedAd.primaryText}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">DESCRIPTION</Label>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => handleCopy(generatedAd.description, "Description")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">{generatedAd.description}</p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">CALL TO ACTION</Label>
                          <Button className="w-full">{generatedAd.callToAction}</Button>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() =>
                            handleCopy(
                              `Headline: ${generatedAd.headline}\n\nPrimary Text: ${generatedAd.primaryText}\n\nDescription: ${generatedAd.description}\n\nCTA: ${generatedAd.callToAction}`,
                              "Full ad copy"
                            )
                          }
                          data-testid="button-copy-all"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy All
                        </Button>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No ad generated yet</p>
                        <p className="text-sm mt-1">Fill in the details and click generate</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {adHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No ads generated yet</p>
                    <p className="text-sm mt-1">Your generated ads will appear here</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {adHistory.map((ad) => {
                  const platformInfo = getPlatformInfo(ad.platform);
                  return (
                    <Card key={ad.id} className="hover-elevate cursor-pointer" onClick={() => setGeneratedAd(ad)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base line-clamp-1">{ad.headline}</CardTitle>
                          <Badge size="sm" className={platformInfo?.color}>
                            {platformInfo?.name}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {ad.createdAt.toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">{ad.primaryText}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
