import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  User, 
  Loader2, 
  Trophy, 
  GraduationCap,
  Play,
  Target,
  Users,
  BarChart3,
  MessageSquare,
  Sparkles,
  Image,
  FileText,
  Palette,
  Video,
  Volume2,
  Mic,
  Megaphone,
  BookOpen,
  BookMarked,
  Globe,
  HelpCircle
} from "lucide-react";
import { Link } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickQuestions = [
  "Apa saja fitur yang tersedia di aplikasi ini?",
  "Bagaimana cara membuat iklan yang winning?",
  "Jelaskan langkah-langkah Campaign Wizard",
  "Bagaimana cara menggunakan Audience Builder?",
  "Apa perbedaan AI Chat dan AI Expert?",
  "Bagaimana cara membuat landing page?",
];

const featureCards = [
  {
    title: "Winning Campaign",
    description: "Sistem lengkap untuk membuat campaign iklan yang sukses",
    icon: Trophy,
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    features: [
      { name: "Roadmap Winning", path: "/winning-dashboard", icon: Trophy },
      { name: "Panduan Praktis", path: "/winning-guide", icon: GraduationCap },
      { name: "Simulasi Beriklan", path: "/ad-simulation", icon: Play },
      { name: "Campaign Wizard", path: "/campaign-wizard", icon: Target },
      { name: "Audience Builder", path: "/audience-builder", icon: Users },
      { name: "Ad Analyzer", path: "/campaign-analyzer", icon: BarChart3 },
    ],
  },
  {
    title: "AI Assistant",
    description: "Konsultasi dan bantuan dari AI",
    icon: MessageSquare,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    features: [
      { name: "AI Chat", path: "/ai-chat", icon: MessageSquare },
      { name: "AI Expert Chat", path: "/ai-expert", icon: Sparkles },
    ],
  },
  {
    title: "AI Creator",
    description: "Generate konten marketing dengan AI",
    icon: Image,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    features: [
      { name: "Image Creator", path: "/ai-images", icon: Image },
      { name: "Article Creator", path: "/ai-articles", icon: FileText },
      { name: "Banner Creator", path: "/ai-banners", icon: Palette },
      { name: "Video Creator", path: "/ai-video", icon: Video },
    ],
  },
  {
    title: "AI Audio",
    description: "Konversi suara dan teks",
    icon: Volume2,
    color: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    features: [
      { name: "Text to Speech", path: "/ai-tts", icon: Volume2 },
      { name: "Speech to Text", path: "/ai-stt", icon: Mic },
    ],
  },
  {
    title: "Marketing Tools",
    description: "Tools untuk pembuatan konten marketing",
    icon: Megaphone,
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    features: [
      { name: "Ad Creator", path: "/ad-creator", icon: Megaphone },
      { name: "Story Telling", path: "/story-telling", icon: BookOpen },
      { name: "AI Templates", path: "/ai-templates", icon: BookMarked },
      { name: "Landing Page", path: "/landing-page", icon: Globe },
    ],
  },
];

export default function GuideChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Halo! Saya adalah Asisten Panduan untuk aplikasi Marketing Tools AI. Saya siap membantu Anda memahami dan menggunakan semua fitur yang ada. Silakan tanyakan apa saja, atau pilih pertanyaan cepat di bawah!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/guide-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: updatedHistory.slice(0, -1),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      let assistantMessage = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
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
                  assistantMessage += data.content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                      role: "assistant",
                      content: assistantMessage,
                    };
                    return newMessages;
                  });
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error instanceof Error 
            ? `Maaf, terjadi kesalahan: ${error.message}` 
            : "Maaf, terjadi kesalahan. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Panduan Fitur</h1>
            <p className="text-muted-foreground">
              Chatbot AI untuk membantu Anda memahami dan menggunakan fitur aplikasi
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Asisten Panduan</CardTitle>
                </div>
                <CardDescription>
                  Tanyakan apa saja tentang fitur-fitur di aplikasi ini
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                        data-testid={`message-${message.role}-${index}`}
                      >
                        {message.role === "assistant" && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.role === "user" && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="p-4 border-t space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.slice(0, 3).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage(question)}
                        disabled={isLoading}
                        className="text-xs"
                        data-testid={`button-quick-question-${index}`}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Tanyakan tentang fitur aplikasi..."
                      className="min-h-[44px] max-h-[120px] resize-none"
                      disabled={isLoading}
                      data-testid="input-message"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!input.trim() || isLoading}
                      data-testid="button-send"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Daftar Fitur</h2>
            {featureCards.map((category, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${category.color}`}>
                      <category.icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm">{category.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {category.features.map((feature, fIndex) => (
                      <Link key={fIndex} href={feature.path}>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer text-xs"
                          data-testid={`badge-feature-${feature.path.replace(/\//g, '-').slice(1)}`}
                        >
                          <feature.icon className="h-3 w-3 mr-1" />
                          {feature.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Pertanyaan Populer
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-2 text-left"
                      onClick={() => sendMessage(question)}
                      disabled={isLoading}
                      data-testid={`button-popular-question-${index}`}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
