import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Loader2, Download, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedBanner {
  id: string;
  prompt: string;
  imageData: string;
  size: string;
  createdAt: Date;
}

const bannerSizes = [
  { id: "1024x1024", name: "Square (1:1)", desc: "Instagram, Facebook" },
  { id: "1200x630", name: "Landscape (1.9:1)", desc: "Facebook, LinkedIn" },
  { id: "1080x1920", name: "Portrait (9:16)", desc: "Stories, Reels" },
];

const bannerStyles = [
  { id: "modern", name: "Modern Minimal" },
  { id: "bold", name: "Bold & Vibrant" },
  { id: "elegant", name: "Elegant & Luxury" },
  { id: "playful", name: "Playful & Fun" },
  { id: "corporate", name: "Corporate & Professional" },
];

export default function AIBanners() {
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [brandName, setBrandName] = useState("");
  const [style, setStyle] = useState("modern");
  const [size, setSize] = useState("1024x1024");
  const [colorScheme, setColorScheme] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState<GeneratedBanner[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!headline.trim()) {
      toast({
        title: "Error",
        description: "Please enter a headline",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const selectedStyle = bannerStyles.find((s) => s.id === style);
      const prompt = `Professional marketing banner design, ${selectedStyle?.name} style, featuring headline "${headline}"${subheadline ? `, subheadline "${subheadline}"` : ""}${brandName ? `, brand "${brandName}"` : ""}${colorScheme ? `, ${colorScheme} color scheme` : ""}, clean layout, high quality, advertising design`;

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size }),
      });

      if (!response.ok) throw new Error("Failed to generate banner");

      const data = await response.json();
      const newBanner: GeneratedBanner = {
        id: Date.now().toString(),
        prompt: headline,
        imageData: data.b64_json,
        size,
        createdAt: new Date(),
      };

      setBanners((prev) => [newBanner, ...prev]);
      toast({
        title: "Success",
        description: "Banner generated successfully!",
      });
    } catch (error) {
      console.error("Error generating banner:", error);
      toast({
        title: "Error",
        description: "Failed to generate banner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageData: string, index: number) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `banner-${index + 1}.png`;
    link.click();
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            AI Banner Creator
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create stunning banners for your marketing campaigns
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create" data-testid="tab-create">Create</TabsTrigger>
            <TabsTrigger value="gallery" data-testid="tab-gallery">Gallery ({banners.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Banner Settings</CardTitle>
                  <CardDescription>Configure your banner design</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="headline">Headline *</Label>
                    <Input
                      id="headline"
                      placeholder="50% OFF Summer Sale"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      data-testid="input-headline"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subheadline">Subheadline</Label>
                    <Input
                      id="subheadline"
                      placeholder="Limited time offer"
                      value={subheadline}
                      onChange={(e) => setSubheadline(e.target.value)}
                      data-testid="input-subheadline"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input
                      id="brandName"
                      placeholder="Your Brand"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      data-testid="input-brand"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Style</Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger data-testid="select-style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {bannerStyles.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Size</Label>
                      <Select value={size} onValueChange={setSize}>
                        <SelectTrigger data-testid="select-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {bannerSizes.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="colorScheme">Color Scheme (optional)</Label>
                    <Input
                      id="colorScheme"
                      placeholder="e.g., blue and gold, pastel colors"
                      value={colorScheme}
                      onChange={(e) => setColorScheme(e.target.value)}
                      data-testid="input-colors"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading || !headline.trim()}
                    className="w-full"
                    data-testid="button-generate-banner"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Banner
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Your generated banner</CardDescription>
                </CardHeader>
                <CardContent>
                  {banners.length > 0 ? (
                    <div className="relative">
                      <img
                        src={`data:image/png;base64,${banners[0].imageData}`}
                        alt="Generated banner"
                        className="w-full rounded-lg"
                      />
                      <div className="absolute bottom-2 right-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(banners[0].imageData, 0)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleGenerate}
                          disabled={isLoading}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No banner generated yet</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gallery">
            {banners.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No banners generated yet</p>
                    <p className="text-sm mt-1">Your banners will appear here</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {banners.map((banner, index) => (
                  <Card key={banner.id} className="overflow-hidden">
                    <img
                      src={`data:image/png;base64,${banner.imageData}`}
                      alt={banner.prompt}
                      className="w-full aspect-video object-cover"
                    />
                    <CardContent className="p-3">
                      <p className="text-sm font-medium line-clamp-1">{banner.prompt}</p>
                      <p className="text-xs text-muted-foreground">{banner.size}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => handleDownload(banner.imageData, index)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
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
