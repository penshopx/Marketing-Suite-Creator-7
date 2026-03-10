import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Video, Loader2, Play, Sparkles, Film, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const videoTypes = [
  { id: "text-to-video", name: "Text to Video", desc: "Create video from text description" },
  { id: "image-to-video", name: "Image to Video", desc: "Animate static images" },
  { id: "product-video", name: "Product Video", desc: "Showcase your products" },
];

const videoStyles = [
  { id: "cinematic", name: "Cinematic" },
  { id: "minimal", name: "Minimal" },
  { id: "dynamic", name: "Dynamic" },
  { id: "elegant", name: "Elegant" },
  { id: "modern", name: "Modern" },
];

export default function AIVideo() {
  const [videoType, setVideoType] = useState("text-to-video");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [duration, setDuration] = useState("6");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    
    // Simulated video generation (actual video generation would need additional API)
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Info",
        description: "Video generation is a premium feature. Contact us to enable it.",
      });
    }, 2000);
  };

  return (
    <>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Video className="h-6 w-6 text-primary" />
              AI Video Creator
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Create engaging videos for your marketing campaigns
            </p>
          </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create" data-testid="tab-create">Create Video</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History (0)</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Video Type</CardTitle>
                    <CardDescription>Choose how to create your video</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {videoTypes.map((type) => (
                        <Button
                          key={type.id}
                          variant={videoType === type.id ? "default" : "outline"}
                          className="h-auto flex-col items-start gap-1 p-4 text-left"
                          onClick={() => setVideoType(type.id)}
                          data-testid={`button-video-type-${type.id}`}
                        >
                          <span className="font-medium">{type.name}</span>
                          <span className="text-xs text-muted-foreground">{type.desc}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Video Details</CardTitle>
                    <CardDescription>Describe your video</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="prompt">Description *</Label>
                      <Textarea
                        id="prompt"
                        placeholder="Describe the video you want to create..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[100px]"
                        data-testid="input-video-prompt"
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
                            {videoStyles.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger data-testid="select-duration">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4">4 seconds</SelectItem>
                            <SelectItem value="6">6 seconds</SelectItem>
                            <SelectItem value="8">8 seconds</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isLoading || !prompt.trim()}
                      className="w-full"
                      data-testid="button-generate-video"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Video
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Your generated video will appear here</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Film className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-medium mb-2">No video generated yet</p>
                      <p className="text-xs">Enter a description and click generate</p>
                      <Badge variant="secondary" className="mt-4">
                        <Clock className="h-3 w-3 mr-1" />
                        Coming Soon
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Video Ideas</CardTitle>
                <CardDescription>Click to use these templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    "Product showcase with smooth camera movement and studio lighting",
                    "Animated logo reveal with particle effects",
                    "Social media intro with dynamic text animations",
                    "Before and after transformation video",
                    "Testimonial video with text overlays",
                    "Brand story video with cinematic visuals",
                  ].map((idea) => (
                    <Button
                      key={idea}
                      variant="outline"
                      className="h-auto text-left justify-start p-3"
                      onClick={() => setPrompt(idea)}
                    >
                      <span className="text-sm">{idea}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No videos generated yet</p>
                  <p className="text-sm mt-1">Your generated videos will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}
