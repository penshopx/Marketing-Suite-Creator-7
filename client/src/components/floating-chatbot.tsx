import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useGuideContext, type GuideContext } from "@/hooks/use-guide-context";
import { 
  Bot, 
  Send, 
  User, 
  Loader2,
  MessageCircle,
  Minimize2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();
  const context = useGuideContext();
  const prevLocationRef = useRef(location);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const getProactiveGreeting = useCallback((ctx: GuideContext): string => {
    const { currentPage, userName, isAuthenticated } = ctx;
    const name = userName ? `, ${userName}` : "";
    
    if (!isAuthenticated) {
      return `Halo${name}! Saya AI Assistant untuk Marketing Tools. Kamu sedang di halaman ${currentPage.title}. Untuk mengakses semua fitur, silakan login atau daftar terlebih dahulu. Ada yang bisa saya bantu?`;
    }

    return `Halo${name}! Saya AI Assistant siap membantu. Kamu sedang di ${currentPage.title} - ${currentPage.description}. Semua fitur tersedia untukmu. Apa yang ingin kamu lakukan?`;
  }, []);

  useEffect(() => {
    if (!hasInitialized && isOpen) {
      const greeting = getProactiveGreeting(context);
      setMessages([{ role: "assistant", content: greeting }]);
      setHasInitialized(true);
    }
  }, [isOpen, hasInitialized, context, getProactiveGreeting]);

  useEffect(() => {
    if (hasInitialized && prevLocationRef.current !== location && isOpen) {
      const pageChangeMessage = `Kamu berpindah ke halaman ${context.currentPage.title}. ${context.currentPage.description}. Ada yang bisa saya bantu di halaman ini?`;
      setMessages(prev => [...prev, { role: "assistant", content: pageChangeMessage }]);
    }
    prevLocationRef.current = location;
  }, [location, hasInitialized, context, isOpen]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/guide-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: updatedHistory.slice(0, -1),
          context: {
            isAuthenticated: context.isAuthenticated,
            userName: context.userName,
            currentPage: context.currentPage.path,
            currentPageTitle: context.currentPage.title,
            availableFeatures: context.availableFeatures,
          },
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

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  assistantMessage += parsed.text;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                      role: "assistant",
                      content: assistantMessage,
                    };
                    return newMessages;
                  });
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Maaf, terjadi kesalahan: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = context.currentPage.suggestedActions.slice(0, 3);

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full shadow-xl"
          data-testid="button-open-chatbot"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[380px] h-[520px] shadow-2xl z-[9999] flex flex-col overflow-hidden" data-testid="floating-chatbot">
      <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between gap-2 bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Attentive AI Guide</CardTitle>
            <p className="text-xs text-muted-foreground">
              {context.currentPage.title}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            data-testid="button-close-chatbot"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
                data-testid={`message-${message.role}-${index}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-3 border-t space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs gap-1"
                onClick={() => sendMessage(action)}
                disabled={isLoading}
                data-testid={`button-quick-${index}`}
              >
                <ArrowRight className="h-3 w-3" />
                {action}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pertanyaan atau perintah..."
              className="min-h-[40px] max-h-[80px] text-sm resize-none"
              disabled={isLoading}
              data-testid="input-chat"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="flex-shrink-0"
              data-testid="button-send"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
