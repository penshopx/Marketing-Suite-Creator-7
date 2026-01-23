import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Sparkles, Trash2, Target, TrendingUp, Megaphone, PenTool, Search, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const expertTypes = [
  { id: "marketing", name: "Marketing Expert", icon: Megaphone, prompt: "You are a senior marketing expert with 20 years of experience in digital marketing, brand strategy, and customer acquisition." },
  { id: "copywriting", name: "Copywriting Pro", icon: PenTool, prompt: "You are a world-class copywriter specialized in persuasive writing, sales copy, and conversion optimization." },
  { id: "seo", name: "SEO Specialist", icon: Search, prompt: "You are an SEO expert with deep knowledge of search algorithms, keyword research, and technical SEO." },
  { id: "analytics", name: "Analytics Guru", icon: BarChart, prompt: "You are a data analytics expert specialized in marketing metrics, conversion tracking, and data-driven decision making." },
  { id: "growth", name: "Growth Hacker", icon: TrendingUp, prompt: "You are a growth hacking expert specialized in rapid experimentation, viral marketing, and scalable growth strategies." },
  { id: "strategy", name: "Strategy Consultant", icon: Target, prompt: "You are a business strategy consultant specialized in market analysis, competitive positioning, and go-to-market strategies." },
];

export default function AIExpert() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(expertTypes[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/expert-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          expertType: selectedExpert.id,
          systemPrompt: selectedExpert.prompt,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);

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
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === "assistant") {
                    lastMessage.content += data.content;
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleExpertChange = (expert: typeof expertTypes[0]) => {
    setSelectedExpert(expert);
    setMessages([]);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6">
      <div className="max-w-5xl mx-auto w-full flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Expert Chat
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Get advice from specialized AI experts
            </p>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear} data-testid="button-clear-chat">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {expertTypes.map((expert) => (
              <Button
                key={expert.id}
                variant={selectedExpert.id === expert.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleExpertChange(expert)}
                data-testid={`button-expert-${expert.id}`}
              >
                <expert.icon className="h-4 w-4 mr-2" />
                {expert.name}
              </Button>
            ))}
          </div>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <selectedExpert.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{selectedExpert.name}</CardTitle>
                <CardDescription className="text-xs">
                  Ready to help with your questions
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <selectedExpert.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Chat with {selectedExpert.name}</h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    I'm specialized in helping you with expert-level insights and strategies.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-md">
                    {[
                      "How can I improve my conversion rate?",
                      "Best practices for social media ads",
                      "Content marketing strategy tips",
                    ].map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="secondary"
                        className="cursor-pointer hover-elevate"
                        onClick={() => setInput(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <selectedExpert.icon className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2 max-w-[80%]",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <selectedExpert.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="rounded-lg px-4 py-2 bg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask the ${selectedExpert.name}...`}
                  className="resize-none min-h-[44px] max-h-32"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  data-testid="input-expert-message"
                />
                <Button type="submit" disabled={isLoading || !input.trim()} data-testid="button-send-message">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
