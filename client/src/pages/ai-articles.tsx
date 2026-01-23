import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2, Copy, Download, Sparkles, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedArticle {
  id: string;
  title: string;
  content: string;
  topic: string;
  createdAt: Date;
}

export default function AIArticles() {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [isLoading, setIsLoading] = useState(false);
  const [articles, setArticles] = useState<GeneratedArticle[]>([]);
  const [currentArticle, setCurrentArticle] = useState<GeneratedArticle | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCurrentArticle(null);

    try {
      const response = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, keywords, tone, length }),
      });

      if (!response.ok) throw new Error("Failed to generate article");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const newArticle: GeneratedArticle = {
        id: Date.now().toString(),
        title: topic,
        content: "",
        topic,
        createdAt: new Date(),
      };
      setCurrentArticle(newArticle);

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
                setCurrentArticle((prev) =>
                  prev ? { ...prev, content: prev.content + data.content } : prev
                );
              }
              if (data.title) {
                setCurrentArticle((prev) =>
                  prev ? { ...prev, title: data.title } : prev
                );
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setCurrentArticle((prev) => {
        if (prev) {
          setArticles((articles) => [prev, ...articles]);
        }
        return prev;
      });

      toast({
        title: "Success",
        description: "Article generated successfully!",
      });
    } catch (error) {
      console.error("Error generating article:", error);
      toast({
        title: "Error",
        description: "Failed to generate article. Please try again.",
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
      description: "Article copied to clipboard",
    });
  };

  const handleDownload = (article: GeneratedArticle) => {
    const blob = new Blob([`# ${article.title}\n\n${article.content}`], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${article.title.slice(0, 30)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            AI Article Creator
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate SEO-optimized articles for your blog or website
          </p>
        </div>

        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList>
            <TabsTrigger value="generator" data-testid="tab-generator">Generator</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History ({articles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-5">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Article Settings
                  </CardTitle>
                  <CardDescription>Configure your article parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic / Title</Label>
                    <Input
                      id="topic"
                      placeholder="10 Tips for Effective Digital Marketing"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      data-testid="input-article-topic"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords (optional)</Label>
                    <Input
                      id="keywords"
                      placeholder="SEO, marketing, social media"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      data-testid="input-article-keywords"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tone</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger data-testid="select-tone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="persuasive">Persuasive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Length</Label>
                      <Select value={length} onValueChange={setLength}>
                        <SelectTrigger data-testid="select-length">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short (500 words)</SelectItem>
                          <SelectItem value="medium">Medium (1000 words)</SelectItem>
                          <SelectItem value="long">Long (2000 words)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading || !topic.trim()}
                    className="w-full"
                    data-testid="button-generate-article"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Article
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div>
                    <CardTitle>Generated Article</CardTitle>
                    <CardDescription>
                      {currentArticle ? currentArticle.title : "Your article will appear here"}
                    </CardDescription>
                  </div>
                  {currentArticle && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(currentArticle.content)}
                        data-testid="button-copy-article"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(currentArticle)}
                        data-testid="button-download-article"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {currentArticle ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap">{currentArticle.content}</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No article generated yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Enter a topic and click generate
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {articles.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No articles generated yet</p>
                    <p className="text-sm mt-1">Your generated articles will appear here</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Card key={article.id} className="hover-elevate cursor-pointer" onClick={() => setCurrentArticle(article)}>
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-2">{article.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {article.createdAt.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {article.content.slice(0, 150)}...
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(article.content);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(article);
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
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
