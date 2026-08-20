import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  ArrowUpRight,
  Clipboard,
  FileClock,
  History,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface HistoryItem {
  id: number;
  toolId: string;
  toolName: string;
  toolPath: string;
  title: string;
  outputPreview: string;
  createdAt: string;
}

interface HistoryEntry extends HistoryItem {
  inputData: unknown;
  outputData: unknown;
}

interface ToolOption {
  toolId: string;
  toolName: string;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function readableData(data: unknown) {
  if (typeof data === "string") return data;
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return "Data tidak dapat ditampilkan.";
  }
}

export default function AIHistory() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<HistoryItem[]>([]);
  const [tools, setTools] = useState<ToolOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTool, setSelectedTool] = useState("__all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/ai-history/tools", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : []))
      .then(setTools)
      .catch(() => setTools([]));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedTool !== "__all") params.set("tool", selectedTool);
        if (search.trim()) params.set("q", search.trim());
        const response = await fetch(`/api/ai-history?${params.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Gagal memuat riwayat");
        setEntries(await response.json());
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast({ title: "Riwayat tidak dapat dimuat", variant: "destructive" });
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [search, selectedTool, toast]);

  const openEntry = async (item: HistoryItem) => {
    setIsDetailLoading(true);
    setSelectedEntry(null);
    try {
      const response = await fetch(`/api/ai-history/${item.id}`, { credentials: "include" });
      if (!response.ok) throw new Error("Riwayat tidak ditemukan");
      setSelectedEntry(await response.json());
    } catch {
      toast({ title: "Gagal membuka hasil", description: "Riwayat mungkin sudah dihapus.", variant: "destructive" });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const deleteEntry = async (item: HistoryItem | HistoryEntry) => {
    if (!window.confirm(`Hapus riwayat "${item.title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeletingId(item.id);
    try {
      const response = await fetch(`/api/ai-history/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error();
      setEntries((current) => current.filter((entry) => entry.id !== item.id));
      setSelectedEntry(null);
      toast({ title: "Riwayat dihapus" });
    } catch {
      toast({ title: "Gagal menghapus riwayat", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const copyOutput = async () => {
    if (!selectedEntry) return;
    await navigator.clipboard.writeText(readableData(selectedEntry.outputData));
    toast({ title: "Hasil disalin ke clipboard" });
  };

  const detailOpen = isDetailLoading || selectedEntry !== null;

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Riwayat AI Tools</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Semua hasil yang berhasil dibuat oleh AI tersimpan di sini dan hanya dapat dilihat dari akun Anda.
          </p>
        </div>

        <Card>
          <CardContent className="pt-5">
            <div className="grid gap-3 md:grid-cols-[1fr_240px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama hasil atau isi output..."
                  className="pl-9"
                  data-testid="input-history-search"
                />
              </div>
              <Select value={selectedTool} onValueChange={setSelectedTool}>
                <SelectTrigger data-testid="select-history-tool">
                  <SelectValue placeholder="Semua tool" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Semua tool</SelectItem>
                  {tools.map((tool) => (
                    <SelectItem key={tool.toolId} value={tool.toolId}>
                      {tool.toolName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid gap-3">
            {[0, 1, 2].map((index) => <Skeleton key={index} className="h-28 w-full" />)}
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileClock className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
              <h2 className="font-semibold">Belum ada hasil yang tersimpan</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Buat hasil dari salah satu AI Tool, lalu hasilnya akan muncul otomatis di sini.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {entries.map((item) => (
              <Card key={item.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <button
                  type="button"
                  className="group block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  onClick={() => openEntry(item)}
                  aria-label={`Buka riwayat ${item.title}`}
                  data-testid={`history-item-${item.id}`}
                >
                  <CardContent className="flex gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <History className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{item.toolName}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                      </div>
                      <h2 className="mt-1 truncate font-semibold">{item.title}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.outputPreview}</p>
                    </div>
                    <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </CardContent>
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        <DialogContent className="max-w-3xl">
          {isDetailLoading ? (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">Memuat detail riwayat</DialogTitle>
                <DialogDescription className="sr-only">
                  Menyiapkan detail hasil AI yang dipilih.
                </DialogDescription>
              </DialogHeader>
              <div className="flex min-h-64 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            </>
          ) : selectedEntry ? (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">{selectedEntry.title}</DialogTitle>
                <DialogDescription>
                  {selectedEntry.toolName} · {formatDate(selectedEntry.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={copyOutput} data-testid="button-copy-history-output">
                  <Clipboard className="mr-2 h-4 w-4" />
                  Salin hasil
                </Button>
                <Link href={selectedEntry.toolPath}>
                  <Button size="sm" variant="outline" data-testid="button-open-history-tool">
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Buka {selectedEntry.toolName}
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto text-destructive hover:text-destructive"
                  onClick={() => deleteEntry(selectedEntry)}
                  disabled={deletingId === selectedEntry.id}
                  data-testid="button-delete-history-entry"
                >
                  {deletingId === selectedEntry.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Hapus
                </Button>
              </div>

              <ScrollArea className="max-h-[60vh] pr-3">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Hasil AI</Label>
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed">
                      {readableData(selectedEntry.outputData)}
                    </pre>
                  </div>
                  <div className="space-y-2">
                    <Label>Input saat dibuat</Label>
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
                      {readableData(selectedEntry.inputData)}
                    </pre>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}