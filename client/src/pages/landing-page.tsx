import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Loader2, Copy, Download, Sparkles, Eye, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const landingStyles = [
  { id: "modern", name: "Modern SaaS" },
  { id: "startup", name: "Startup" },
  { id: "corporate", name: "Corporate" },
  { id: "creative", name: "Creative Agency" },
  { id: "ecommerce", name: "E-commerce" },
];

interface GeneratedLP {
  id: string;
  title: string;
  html: string;
  createdAt: Date;
}

export default function LandingPageCreator() {
  const [productName, setProductName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [style, setStyle] = useState("modern");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLP, setGeneratedLP] = useState<GeneratedLP | null>(null);
  const [lpHistory, setLpHistory] = useState<GeneratedLP[]>([]);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!productName.trim() || !tagline.trim()) {
      toast({
        title: "Error",
        description: "Please enter product name and tagline",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          tagline,
          description,
          features,
          style,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate landing page");

      const data = await response.json();
      const newLP: GeneratedLP = {
        id: Date.now().toString(),
        title: productName,
        html: data.html,
        createdAt: new Date(),
      };

      setGeneratedLP(newLP);
      setLpHistory((prev) => [newLP, ...prev]);
      toast({
        title: "Success",
        description: "Landing page generated successfully!",
      });
    } catch (error) {
      console.error("Error generating landing page:", error);
      toast({
        title: "Error",
        description: "Failed to generate landing page. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedLP) {
      navigator.clipboard.writeText(generatedLP.html);
      toast({
        title: "Copied",
        description: "HTML code copied to clipboard",
      });
    }
  };

  const handleDownload = () => {
    if (generatedLP) {
      const blob = new Blob([generatedLP.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${generatedLP.title.toLowerCase().replace(/\s/g, "-")}-landing-page.html`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            AI Landing Page Creator
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate high-converting landing pages with AI
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create" data-testid="tab-create">Create</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History ({lpHistory.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-5">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Page Details</CardTitle>
                  <CardDescription>Enter your landing page information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product/Service Name *</Label>
                    <Input
                      id="productName"
                      placeholder="e.g., TaskFlow Pro"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      data-testid="input-product-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline *</Label>
                    <Input
                      id="tagline"
                      placeholder="e.g., Manage tasks 10x faster"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      data-testid="input-tagline"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your product/service..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[80px]"
                      data-testid="input-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="features">Key Features (one per line)</Label>
                    <Textarea
                      id="features"
                      placeholder="AI-powered automation&#10;Real-time collaboration&#10;Advanced analytics"
                      value={features}
                      onChange={(e) => setFeatures(e.target.value)}
                      className="min-h-[80px]"
                      data-testid="input-features"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger data-testid="select-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {landingStyles.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading || !productName.trim() || !tagline.trim()}
                    className="w-full"
                    data-testid="button-generate-lp"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Landing Page
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle>
                      {generatedLP ? generatedLP.title : "Preview"}
                    </CardTitle>
                    <CardDescription>
                      {generatedLP ? "Your generated landing page" : "Result will appear here"}
                    </CardDescription>
                  </div>
                  {generatedLP && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={viewMode === "preview" ? "default" : "outline"}
                        onClick={() => setViewMode("preview")}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={viewMode === "code" ? "default" : "outline"}
                        onClick={() => setViewMode("code")}
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {generatedLP ? (
                    <ScrollArea className="h-[500px] border rounded-lg">
                      {viewMode === "preview" ? (
                        <iframe
                          srcDoc={generatedLP.html}
                          className="w-full h-[500px] border-0"
                          title="Landing Page Preview"
                        />
                      ) : (
                        <pre className="text-xs p-4 overflow-auto">{generatedLP.html}</pre>
                      )}
                    </ScrollArea>
                  ) : (
                    <div className="h-[500px] flex items-center justify-center text-center text-muted-foreground bg-muted/50 rounded-lg">
                      <div>
                        <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">No landing page generated yet</p>
                        <p className="text-xs mt-1">Fill in the details and click generate</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {lpHistory.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No landing pages generated yet</p>
                    <p className="text-sm mt-1">Your generated pages will appear here</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lpHistory.map((lp) => (
                  <Card
                    key={lp.id}
                    className="hover-elevate cursor-pointer"
                    onClick={() => setGeneratedLP(lp)}
                  >
                    <CardHeader>
                      <CardTitle className="text-base">{lp.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {lp.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <iframe
                          srcDoc={lp.html}
                          className="w-full h-full border-0 pointer-events-none"
                          title={lp.title}
                        />
                      </div>
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
