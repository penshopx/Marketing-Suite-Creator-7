import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, Copy, Sparkles, Heart, Zap, Trophy, Users, Target, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const storyTypes = [
  { id: "hero_journey", name: "Hero's Journey", icon: Trophy, description: "Customer as the hero overcoming challenges" },
  { id: "problem_solution", name: "Problem-Solution", icon: Target, description: "Present problem and your solution" },
  { id: "before_after", name: "Before & After", icon: Zap, description: "Transformation story" },
  { id: "testimonial", name: "Testimonial", icon: Users, description: "Real customer success story" },
  { id: "origin_story", name: "Origin Story", icon: Lightbulb, description: "How your brand started" },
  { id: "educational", name: "Educational", icon: BookOpen, description: "Teach while promoting" },
];

const emotions = [
  { id: "inspirational", name: "Inspirational", color: "bg-yellow-500/10 text-yellow-600" },
  { id: "empowering", name: "Empowering", color: "bg-purple-500/10 text-purple-600" },
  { id: "heartwarming", name: "Heartwarming", color: "bg-pink-500/10 text-pink-600" },
  { id: "exciting", name: "Exciting", color: "bg-orange-500/10 text-orange-600" },
  { id: "trustworthy", name: "Trustworthy", color: "bg-blue-500/10 text-blue-600" },
  { id: "urgent", name: "Urgent", color: "bg-red-500/10 text-red-600" },
];

interface GeneratedStory {
  id: string;
  title: string;
  content: string;
  storyType: string;
  emotion: string;
  createdAt: Date;
}

export default function StoryTelling() {
  const [storyType, setStoryType] = useState("hero_journey");
  const [emotion, setEmotion] = useState("inspirational");
  const [productName, setProductName] = useState("");
  const [productBenefit, setProductBenefit] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStory, setCurrentStory] = useState<GeneratedStory | null>(null);
  const [stories, setStories] = useState<GeneratedStory[]>([]);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!productName.trim() || !productBenefit.trim()) {
      toast({
        title: "Error",
        description: "Please fill in product name and benefit",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCurrentStory(null);

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyType,
          emotion,
          productName,
          productBenefit,
          targetAudience,
          additionalContext,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate story");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const newStory: GeneratedStory = {
        id: Date.now().toString(),
        title: `${productName} Story`,
        content: "",
        storyType,
        emotion,
        createdAt: new Date(),
      };
      setCurrentStory(newStory);

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                setCurrentStory((prev) =>
                  prev ? { ...prev, content: prev.content + data.content } : prev
                );
              }
              if (data.title) {
                setCurrentStory((prev) =>
                  prev ? { ...prev, title: data.title } : prev
                );
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setCurrentStory((prev) => {
        if (prev) {
          setStories((stories) => [prev, ...stories]);
        }
        return prev;
      });

      toast({
        title: "Success",
        description: "Story generated successfully!",
      });
    } catch (error) {
      console.error("Error generating story:", error);
      toast({
        title: "Error",
        description: "Failed to generate story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Story copied to clipboard",
    });
  };

  const getStoryTypeInfo = (id: string) => storyTypes.find((s) => s.id === id);
  const getEmotionInfo = (id: string) => emotions.find((e) => e.id === id);

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Story Telling Promosi
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create compelling promotional stories that connect with your audience
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create" data-testid="tab-create">Create Story</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History ({stories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Story Framework</CardTitle>
                    <CardDescription>Choose your storytelling approach</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {storyTypes.map((type) => (
                        <Button
                          key={type.id}
                          variant={storyType === type.id ? "default" : "outline"}
                          className="h-auto flex-col items-start gap-1 p-3 text-left"
                          onClick={() => setStoryType(type.id)}
                          data-testid={`button-story-type-${type.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{type.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-1">{type.description}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Emotional Tone</CardTitle>
                    <CardDescription>What feeling should the story evoke?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {emotions.map((em) => (
                        <Badge
                          key={em.id}
                          variant={emotion === em.id ? "default" : "outline"}
                          className={`cursor-pointer ${emotion === em.id ? "" : em.color}`}
                          onClick={() => setEmotion(em.id)}
                          data-testid={`badge-emotion-${em.id}`}
                        >
                          {em.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Story Details</CardTitle>
                    <CardDescription>Provide information for your story</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName">Product/Brand Name *</Label>
                      <Input
                        id="productName"
                        placeholder="e.g., EcoBottle"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        data-testid="input-product-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productBenefit">Main Benefit/Value *</Label>
                      <Input
                        id="productBenefit"
                        placeholder="e.g., Helps reduce plastic waste while staying hydrated"
                        value={productBenefit}
                        onChange={(e) => setProductBenefit(e.target.value)}
                        data-testid="input-product-benefit"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">Target Audience</Label>
                      <Input
                        id="targetAudience"
                        placeholder="e.g., Environmentally conscious millennials"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        data-testid="input-target-audience"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalContext">Additional Context</Label>
                      <Textarea
                        id="additionalContext"
                        placeholder="Any specific details, scenarios, or elements to include..."
                        value={additionalContext}
                        onChange={(e) => setAdditionalContext(e.target.value)}
                        className="min-h-[80px]"
                        data-testid="input-additional-context"
                      />
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isLoading || !productName.trim() || !productBenefit.trim()}
                      className="w-full"
                      data-testid="button-generate-story"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Story...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Story
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="lg:sticky lg:top-6 h-fit">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle>{currentStory?.title || "Generated Story"}</CardTitle>
                      <CardDescription>
                        {currentStory
                          ? `${getStoryTypeInfo(currentStory.storyType)?.name} - ${getEmotionInfo(currentStory.emotion)?.name}`
                          : "Your story will appear here"}
                      </CardDescription>
                    </div>
                    {currentStory && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(currentStory.content)}
                        data-testid="button-copy-story"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {currentStory ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap">{currentStory.content}</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <Heart className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No story generated yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Fill in the details and click generate
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {stories.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No stories generated yet</p>
                    <p className="text-sm mt-1">Your generated stories will appear here</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stories.map((story) => (
                  <Card
                    key={story.id}
                    className="hover-elevate cursor-pointer"
                    onClick={() => setCurrentStory(story)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base line-clamp-1">{story.title}</CardTitle>
                        <Badge variant="secondary" size="sm">
                          {getStoryTypeInfo(story.storyType)?.name}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {story.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-4">{story.content}</p>
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
