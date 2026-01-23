import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Volume2, Loader2, Play, Pause, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioItem {
  id: string;
  text: string;
  audioUrl: string;
  voice: string;
  createdAt: Date;
}

const voices = [
  { id: "alloy", name: "Alloy", description: "Neutral, balanced" },
  { id: "echo", name: "Echo", description: "Clear, articulate" },
  { id: "fable", name: "Fable", description: "Warm, expressive" },
  { id: "onyx", name: "Onyx", description: "Deep, authoritative" },
  { id: "nova", name: "Nova", description: "Bright, energetic" },
  { id: "shimmer", name: "Shimmer", description: "Soft, gentle" },
];

export default function AITTS() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioHistory, setAudioHistory] = useState<AudioItem[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) throw new Error("Failed to generate audio");

      const data = await response.json();
      const audioUrl = `data:audio/wav;base64,${data.audio}`;

      const newItem: AudioItem = {
        id: Date.now().toString(),
        text: text.slice(0, 100),
        audioUrl,
        voice,
        createdAt: new Date(),
      };

      setAudioHistory((prev) => [newItem, ...prev]);
      setCurrentAudioUrl(audioUrl);

      // Auto-play
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      setCurrentAudio(audio);
      audio.play();
      setIsPlaying(true);

      toast({
        title: "Success",
        description: "Audio generated successfully!",
      });
    } catch (error) {
      console.error("Error generating audio:", error);
      toast({
        title: "Error",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!currentAudio) return;

    if (isPlaying) {
      currentAudio.pause();
    } else {
      currentAudio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = (audioUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `audio-${index + 1}.wav`;
    link.click();
  };

  const playHistoryItem = (item: AudioItem) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(item.audioUrl);
    audio.onended = () => setIsPlaying(false);
    setCurrentAudio(audio);
    setCurrentAudioUrl(item.audioUrl);
    audio.play();
    setIsPlaying(true);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Volume2 className="h-6 w-6 text-primary" />
            AI Text to Speech
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Convert your text to natural-sounding voice
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Text Input</CardTitle>
              <CardDescription>Enter the text you want to convert to speech</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">Text</Label>
                <Textarea
                  id="text"
                  placeholder="Enter your text here... (max 4096 characters)"
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 4096))}
                  className="min-h-[200px]"
                  data-testid="input-tts-text"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {text.length}/4096 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>Voice</Label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger data-testid="select-voice">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        <span className="font-medium">{v.name}</span>
                        <span className="text-muted-foreground ml-2">- {v.description}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading || !text.trim()}
                className="w-full"
                data-testid="button-generate-audio"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Audio
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audio Player</CardTitle>
              <CardDescription>
                {currentAudioUrl ? "Playing audio" : "No audio generated"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentAudioUrl ? (
                <>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-20 w-20 rounded-full"
                      onClick={handlePlayPause}
                      data-testid="button-play-pause"
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8" />
                      ) : (
                        <Play className="h-8 w-8 ml-1" />
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleDownload(currentAudioUrl, 0)}
                    data-testid="button-download-audio"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Audio
                  </Button>
                </>
              ) : (
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Volume2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No audio yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Audio History</CardTitle>
            <CardDescription>Your recently generated audio</CardDescription>
          </CardHeader>
          <CardContent>
            {audioHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Volume2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audio generated yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {audioHistory.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                    onClick={() => playHistoryItem(item)}
                  >
                    <Button size="icon" variant="ghost" className="shrink-0">
                      <Play className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.text}...</p>
                      <p className="text-xs text-muted-foreground">
                        {voices.find((v) => v.id === item.voice)?.name} - {item.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item.audioUrl, index);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
