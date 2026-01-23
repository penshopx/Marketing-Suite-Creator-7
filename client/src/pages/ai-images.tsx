import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Loader2, Download, Sparkles, Wand2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedImage {
  id: string;
  prompt: string;
  imageData: string;
  createdAt: Date;
}

export default function AIImages() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [style, setStyle] = useState("realistic");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const { toast } = useToast();

  const stylePrompts: Record<string, string> = {
    realistic: "photorealistic, high quality, detailed",
    artistic: "artistic, creative, beautiful colors",
    minimalist: "minimalist, clean, simple design",
    cartoon: "cartoon style, vibrant, fun",
    "3d": "3D render, volumetric lighting, cinema quality",
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const fullPrompt = `${prompt}, ${stylePrompts[style]}`;
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt, size }),
      });

      if (!response.ok) throw new Error("Failed to generate image");

      const data = await response.json();
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt,
        imageData: data.b64_json,
        createdAt: new Date(),
      };

      setGeneratedImages((prev) => [newImage, ...prev]);
      toast({
        title: "Success",
        description: "Image generated successfully!",
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageData: string, index: number) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `generated-image-${index + 1}.png`;
    link.click();
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Image className="h-6 w-6 text-primary" />
            AI Image Creator
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate stunning images with AI for your marketing campaigns
          </p>
        </div>

        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList>
            <TabsTrigger value="generator" data-testid="tab-generator">Generator</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History ({generatedImages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Create Image
                  </CardTitle>
                  <CardDescription>
                    Describe the image you want to create
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder="A professional product photo of a modern smartphone on a clean white background..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px]"
                      data-testid="input-image-prompt"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Size</Label>
                      <Select value={size} onValueChange={setSize}>
                        <SelectTrigger data-testid="select-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1024x1024">1024x1024 (Square)</SelectItem>
                          <SelectItem value="512x512">512x512 (Small)</SelectItem>
                          <SelectItem value="256x256">256x256 (Thumbnail)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Style</Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger data-testid="select-style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realistic">Realistic</SelectItem>
                          <SelectItem value="artistic">Artistic</SelectItem>
                          <SelectItem value="minimalist">Minimalist</SelectItem>
                          <SelectItem value="cartoon">Cartoon</SelectItem>
                          <SelectItem value="3d">3D Render</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full"
                    data-testid="button-generate-image"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Image
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Your generated image will appear here</CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedImages.length > 0 ? (
                    <div className="relative">
                      <img
                        src={`data:image/png;base64,${generatedImages[0].imageData}`}
                        alt="Generated"
                        className="w-full rounded-lg"
                      />
                      <div className="absolute bottom-2 right-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(generatedImages[0].imageData, 0)}
                          data-testid="button-download-image"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleGenerate}
                          disabled={isLoading}
                          data-testid="button-regenerate"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No image generated yet</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Prompt Ideas</CardTitle>
                <CardDescription>Click to use these templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    "Professional headshot for LinkedIn profile with soft lighting",
                    "Product mockup on clean white background for e-commerce",
                    "Social media banner with modern abstract gradient design",
                    "Instagram story background with trendy aesthetic vibes",
                    "Logo mockup on business card with elegant gold foil",
                    "YouTube thumbnail with bold text and vibrant colors",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      className="h-auto text-left justify-start p-3"
                      onClick={() => setPrompt(suggestion)}
                      data-testid={`button-prompt-${suggestion.slice(0, 15).toLowerCase().replace(/\s/g, '-')}`}
                    >
                      <span className="text-sm">{suggestion}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            {generatedImages.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No images generated yet</p>
                    <p className="text-sm mt-1">Your generated images will appear here</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {generatedImages.map((image, index) => (
                  <Card key={image.id} className="overflow-hidden">
                    <img
                      src={`data:image/png;base64,${image.imageData}`}
                      alt={image.prompt}
                      className="w-full aspect-square object-cover"
                    />
                    <CardContent className="p-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">{image.prompt}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => handleDownload(image.imageData, index)}
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
