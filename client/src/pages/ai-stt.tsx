import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Loader2, Copy, FileAudio, Upload, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TranscriptionItem {
  id: string;
  text: string;
  source: "recording" | "upload";
  createdAt: Date;
}

export default function AISTT() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [history, setHistory] = useState<TranscriptionItem[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise<Blob>((resolve) => {
      mediaRecorderRef.current!.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        mediaRecorderRef.current!.stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        resolve(blob);
      };

      mediaRecorderRef.current!.stop();
    });
  };

  const handleRecordClick = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      await processAudio(blob, "recording");
    } else {
      await startRecording();
    }
  };

  const processAudio = async (blob: Blob, source: "recording" | "upload") => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      const base64Audio = await new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
      });

      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64Audio }),
      });

      if (!response.ok) throw new Error("Failed to transcribe audio");

      const data = await response.json();
      setTranscription(data.text);

      const newItem: TranscriptionItem = {
        id: Date.now().toString(),
        text: data.text,
        source,
        createdAt: new Date(),
      };

      setHistory((prev) => [newItem, ...prev]);

      toast({
        title: "Success",
        description: "Audio transcribed successfully!",
      });
    } catch (error) {
      console.error("Error transcribing audio:", error);
      toast({
        title: "Error",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await processAudio(file, "upload");
    e.target.value = "";
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Transcription copied to clipboard",
    });
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Mic className="h-6 w-6 text-primary" />
            AI Speech to Text
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Convert audio recordings to text
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Record or Upload</CardTitle>
              <CardDescription>Record your voice or upload an audio file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center py-8">
                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  className="h-24 w-24 rounded-full"
                  onClick={handleRecordClick}
                  disabled={isProcessing}
                  data-testid="button-record"
                >
                  {isProcessing ? (
                    <Loader2 className="h-10 w-10 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="h-10 w-10" />
                  ) : (
                    <Mic className="h-10 w-10" />
                  )}
                </Button>
                <p className="mt-4 text-sm text-muted-foreground">
                  {isProcessing
                    ? "Processing..."
                    : isRecording
                    ? "Click to stop recording"
                    : "Click to start recording"}
                </p>
                {isRecording && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-sm text-red-500">Recording...</span>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing || isRecording}
                  data-testid="button-upload-audio"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Audio File
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Transcription</CardTitle>
                <CardDescription>
                  {transcription ? "Your transcribed text" : "Result will appear here"}
                </CardDescription>
              </div>
              {transcription && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(transcription)}
                  data-testid="button-copy-transcription"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {transcription ? (
                <Textarea
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  className="min-h-[200px]"
                  data-testid="textarea-transcription"
                />
              ) : (
                <div className="h-[200px] flex items-center justify-center text-center text-muted-foreground bg-muted/50 rounded-lg">
                  <div>
                    <FileAudio className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No transcription yet</p>
                    <p className="text-xs mt-1">Record or upload audio to transcribe</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transcription History</CardTitle>
            <CardDescription>Your recent transcriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileAudio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transcriptions yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-muted/50 hover-elevate"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm line-clamp-2">{item.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.source === "recording" ? "Voice Recording" : "Uploaded File"} - {item.createdAt.toLocaleTimeString()}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopy(item.text)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
