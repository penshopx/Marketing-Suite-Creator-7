import { createServer, type Server } from "http";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";
import { generateImageBuffer, openai as aiIntegrationsOpenai } from "./replit_integrations/image/client";
import { speechToText, textToSpeech, ensureCompatibleFormat } from "./replit_integrations/audio/client";
import { db } from "./db";
import { workroomProjects, workroomDeliverables, workroomDeliverableRevisions, businessProfiles, campaignWizardSessions, aiToolHistory } from "@shared/schema";
import { eq, desc, and, inArray, count, ilike, or, sql } from "drizzle-orm";
import type { Express, Request, Response, NextFunction } from "express";

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Use AI Integrations OpenAI client
const openai = aiIntegrationsOpenai;

// Qwen API client (OpenAI-compatible)
const qwenClient = process.env.QWEN_API_KEY
  ? new OpenAI({
      apiKey: process.env.QWEN_API_KEY,
      baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    })
  : null;

const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin2024";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

type AIToolHistoryConfig = {
  toolId: string;
  toolName: string;
  toolPath: string;
};

// This catalog is intentionally server-side: it makes activity tracking cover
// every supported generator, even when a page uses a different request pattern.
const AI_TOOL_HISTORY_ROUTES: Record<string, AIToolHistoryConfig> = {
  "/api/generate-image": { toolId: "ai-images", toolName: "Image Creator", toolPath: "/ai-images" },
  "/api/generate-article": { toolId: "ai-articles", toolName: "Article Creator", toolPath: "/ai-articles" },
  "/api/generate-email-sequence": { toolId: "email-sequence", toolName: "Email Sequence", toolPath: "/email-sequence" },
  "/api/generate-content-calendar": { toolId: "content-calendar", toolName: "Content Calendar 30 Hari", toolPath: "/content-calendar" },
  "/api/generate-ab-variants": { toolId: "ab-variant", toolName: "A/B Variant Generator", toolPath: "/ab-variant" },
  "/api/generate-hook": { toolId: "hook-generator", toolName: "Hook Generator", toolPath: "/hook-generator" },
  "/api/generate-ad": { toolId: "ad-creator", toolName: "Ad Creator", toolPath: "/ad-creator" },
  "/api/generate-story": { toolId: "story-telling", toolName: "Story Telling", toolPath: "/story-telling" },
  "/api/text-to-speech": { toolId: "ai-tts", toolName: "Text to Speech", toolPath: "/ai-tts" },
  "/api/speech-to-text": { toolId: "ai-stt", toolName: "Speech to Text", toolPath: "/ai-stt" },
  "/api/generate-landing-page": { toolId: "landing-page", toolName: "Landing Page", toolPath: "/landing-page" },
  "/api/research-product": { toolId: "product-research", toolName: "Riset Produk Digital", toolPath: "/product-research" },
  "/api/validate-product": { toolId: "product-validator", toolName: "Validasi Ide Produk", toolPath: "/product-validator" },
  "/api/generate-closing-script": { toolId: "cs-closing", toolName: "CS Closing Script", toolPath: "/cs-closing" },
  "/api/generate-funnel": { toolId: "funnel-planner", toolName: "Funnel Planner", toolPath: "/funnel-planner" },
  "/api/ad-scale-advisor": { toolId: "ad-scale-advisor", toolName: "Ad Scale Advisor", toolPath: "/ad-scale-advisor" },
  "/api/analyze-ad": { toolId: "campaign-analyzer", toolName: "Ad Analyzer", toolPath: "/campaign-analyzer" },
  "/api/generate-audience": { toolId: "audience-builder", toolName: "Audience Builder", toolPath: "/audience-builder" },
  "/api/launch-campaign": { toolId: "campaign-launcher", toolName: "Campaign Launcher", toolPath: "/campaign-launcher" },
  "/api/repurpose-content": { toolId: "content-repurposer", toolName: "Content Repurposer", toolPath: "/content-repurposer" },
  "/api/generate-lp-html": { toolId: "lp-html-generator", toolName: "LP HTML Builder", toolPath: "/lp-html-generator" },
  "/api/find-interests": { toolId: "interest-finder", toolName: "Interest Finder AI", toolPath: "/interest-finder" },
  "/api/audience-overlap": { toolId: "audience-overlap", toolName: "Audience Overlap", toolPath: "/audience-overlap" },
  "/api/generate-auto-rules": { toolId: "auto-rule", toolName: "Auto Rule Builder", toolPath: "/auto-rule" },
  "/api/improve-lp-html": { toolId: "lp-html-generator", toolName: "LP HTML Builder", toolPath: "/lp-html-generator" },
  "/api/generate-google-ads": { toolId: "google-ads", toolName: "Google Ads Creator", toolPath: "/google-ads" },
  "/api/generate-campaign-report": { toolId: "campaign-report", toolName: "Laporan Kampanye", toolPath: "/campaign-report" },
  "/api/riset-keyword-marketplace": { toolId: "keyword-marketplace", toolName: "Riset Keyword Marketplace", toolPath: "/keyword-marketplace" },
  "/api/spy-kompetitor": { toolId: "spy-kompetitor", toolName: "Spy Kompetitor", toolPath: "/spy-kompetitor" },
  "/api/generate-video-script": { toolId: "video-script", toolName: "Video Script", toolPath: "/video-script" },
  "/api/generate-hashtags": { toolId: "hashtag-generator", toolName: "Hashtag Generator", toolPath: "/hashtag-generator" },
  "/api/generate-wa-broadcast": { toolId: "wa-broadcast", toolName: "WA Broadcast Sequence", toolPath: "/wa-broadcast" },
  "/api/generate-cs-bot-script": { toolId: "cs-bot-script", toolName: "CS Bot Script Builder", toolPath: "/cs-bot-script" },
  "/api/generate-customer-journey": { toolId: "customer-journey", toolName: "Customer Journey Map", toolPath: "/customer-journey" },
};

const HISTORY_STRING_LIMIT = 15_000;
const HISTORY_PREVIEW_LIMIT = 300;
const HISTORY_ENTRY_LIMIT = 150;

function getRequestUserId(req: Request): string {
  return (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
}

function makeHistorySafe(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value ?? null;
  if (depth > 6) return "[Konten terlalu dalam untuk disimpan]";
  if (typeof value === "string") {
    if (value.startsWith("data:image") || value.startsWith("data:audio")) {
      return "[Media dibuat — data biner tidak disimpan di riwayat]";
    }
    return value.length > HISTORY_STRING_LIMIT
      ? `${value.slice(0, HISTORY_STRING_LIMIT)}\n\n[Output dipotong untuk riwayat]`
      : value;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => makeHistorySafe(item, depth + 1));
  if (typeof value === "object") {
    const safe: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>).slice(0, 80)) {
      if (/^(b64_json|imageData|audioData|buffer|file|audio)$/i.test(key)) {
        safe[key] = "[Media dibuat — data biner tidak disimpan di riwayat]";
      } else {
        safe[key] = makeHistorySafe(item, depth + 1);
      }
    }
    return safe;
  }
  return String(value);
}

function firstHistoryText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstHistoryText(item);
      if (found) return found;
    }
  }
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    for (const key of ["title", "headline", "content", "text", "result", "summary", "message", "output"]) {
      const found = firstHistoryText(object[key]);
      if (found) return found;
    }
    for (const item of Object.values(object)) {
      const found = firstHistoryText(item);
      if (found) return found;
    }
  }
  return "";
}

function getHistoryTitle(config: AIToolHistoryConfig, input: unknown): string {
  if (input && typeof input === "object") {
    const body = input as Record<string, unknown>;
    for (const key of ["productName", "product", "topic", "niche", "keyword", "prompt", "brief", "title", "brandName"]) {
      if (typeof body[key] === "string" && body[key].trim()) {
        return `${config.toolName}: ${body[key].trim().slice(0, 100)}`;
      }
    }
  }
  return `${config.toolName} — hasil baru`;
}

async function saveAIToolHistory(
  userId: string,
  config: AIToolHistoryConfig,
  input: unknown,
  output: unknown,
): Promise<void> {
  const safeInput = makeHistorySafe(input);
  const safeOutput = makeHistorySafe(output);
  const firstText = firstHistoryText(safeOutput);
  const outputPreview = firstText
    ? firstText.replace(/\s+/g, " ").slice(0, HISTORY_PREVIEW_LIMIT)
    : "Hasil berhasil dibuat. Buka detail untuk melihat konteksnya.";

  await db.transaction(async (tx) => {
    // Serialize cleanup per account so simultaneous completed requests cannot
    // leave extra rows beyond the retention cap.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${userId}))`);
    await tx.insert(aiToolHistory).values({
      userId,
      toolId: config.toolId,
      toolName: config.toolName,
      toolPath: config.toolPath,
      title: getHistoryTitle(config, safeInput),
      inputData: safeInput,
      outputData: safeOutput,
      outputPreview,
    });

    const staleRows = await tx
      .select({ id: aiToolHistory.id })
      .from(aiToolHistory)
      .where(eq(aiToolHistory.userId, userId))
      .orderBy(desc(aiToolHistory.createdAt), desc(aiToolHistory.id))
      .offset(HISTORY_ENTRY_LIMIT)
      .limit(20);
    if (staleRows.length > 0) {
      await tx.delete(aiToolHistory).where(inArray(aiToolHistory.id, staleRows.map((row) => row.id)));
    }
  });
}

function isAdminUser(req: Request): boolean {
  const user = (req as any).user;
  if (!user) return false;
  
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) return true;
  
  const adminHeader = req.headers["x-admin-key"];
  if (adminHeader === ADMIN_SECRET) return true;
  
  return false;
}

/** Returns the formatted business-profile context block to inject into AI system messages.
 *  Result is "" when the user has no saved profile or is not logged in. */
async function getBusinessProfileContext(req: Request): Promise<string> {
  const userId = (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
  if (!userId) return "";
  try {
    // Most-recently-updated profile is treated as active (no is_default column in DB)
    const rows = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .orderBy(desc(businessProfiles.updatedAt))
      .limit(1);
    if (rows.length === 0) return "";
    const p = rows[0];
    const lines: string[] = [];
    if (p.businessName) lines.push(`Nama Bisnis/Produk: ${p.businessName}`);
    if (p.businessType) lines.push(`Tipe Bisnis: ${p.businessType}`);
    if (p.industry) lines.push(`Industri: ${p.industry}`);
    if (p.productsServices) lines.push(`Produk/Layanan: ${p.productsServices}`);
    if (p.targetAudience) lines.push(`Target Audience: ${p.targetAudience}`);
    if (p.valueProposition) lines.push(`Value Proposition/USP: ${p.valueProposition}`);
    if (p.tone) lines.push(`Tone Komunikasi: ${p.tone}`);
    if (p.monthlyBudget) lines.push(`Budget Bulanan: ${p.monthlyBudget}`);
    if (p.goals) lines.push(`Goals: ${p.goals}`);
    if (p.competitors) lines.push(`Kompetitor: ${p.competitors}`);
    if (p.additionalContext) lines.push(`Konteks Tambahan: ${p.additionalContext}`);
    if (lines.length === 0) return "";
    return `\n\n[KONTEKS BISNIS PENGGUNA]\n${lines.join("\n")}\n[/KONTEKS]\nGunakan informasi bisnis di atas untuk mempersonalisasi semua output AI agar relevan dengan bisnis pengguna.`;
  } catch {
    return "";
  }
}
/**
 * Pipes an OpenAI streaming completion to an active SSE response.
 * Sends `data: {"content":"..."}` per token (or `{"<key>":"..."}` if payloadKey is set),
 * then terminates with `data: {"done":true}` and ends the response.
 *
 * Centralises the stream-loop so a fix here covers every SSE route. (Task #23)
 * Per-token timeout prevents silent hangs when the AI stream stalls mid-response. (Task #5)
 */
async function pipeStreamToSSE(
  stream: AsyncIterable<{ choices: Array<{ delta?: { content?: string | null } }> }>,
  res: Response,
  payloadKey = "content",
  tokenTimeoutMs = 45_000,
): Promise<void> {
  try {
    const iterator = stream[Symbol.asyncIterator]();
    while (true) {
      // Race each chunk against a per-token timeout so a stalled stream is
      // detected and surfaced rather than hanging the client indefinitely.
      let timeoutId: ReturnType<typeof setTimeout>;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(`SSE token timeout after ${tokenTimeoutMs}ms`)),
          tokenTimeoutMs,
        );
      });
      let result: IteratorResult<{ choices: Array<{ delta?: { content?: string | null } }> }>;
      try {
        result = await Promise.race([iterator.next(), timeoutPromise]);
      } finally {
        clearTimeout(timeoutId!);
      }
      if (result.done) break;
      const token = result.value.choices[0]?.delta?.content || "";
      if (token && !res.writableEnded) {
        res.write(`data: ${JSON.stringify({ [payloadKey]: token })}\n\n`);
      }
    }
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    }
  } catch (err) {
    // Headers already sent — can't switch to HTTP 500. Send an SSE error event
    // so the client can surface a message rather than hanging indefinitely. (Task #22)
    console.error("[SSE] Stream error:", err);
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: "Koneksi AI terputus — coba lagi." })}\n\n`);
      res.end();
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Middleware: in dev/simple-auth mode, sync session.simpleUser → req.user so that
  // (req as any).user?.id is available in all downstream route handlers (mirrors what
  // Replit OIDC middleware does automatically in production via getMiddleware()).
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const r = req as any;
    if (!r.user && r.session?.simpleUser) {
      r.user = r.session.simpleUser;
    }
    next();
  });

  // Middleware: attach business profile context to every request
  app.use(async (req: Request, _res: Response, next: NextFunction) => {
    const userId = (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
    if (userId) {
      try {
        // Most-recently-updated profile is treated as active (no is_default column in DB)
        const rows = await db
          .select()
          .from(businessProfiles)
          .where(eq(businessProfiles.userId, userId))
          .orderBy(desc(businessProfiles.updatedAt))
          .limit(1);
        if (rows.length > 0) {
          const p = rows[0];
          const lines: string[] = [];
          if (p.businessName) lines.push(`Nama Bisnis/Produk: ${p.businessName}`);
          if (p.businessType) lines.push(`Tipe Bisnis: ${p.businessType}`);
          if (p.industry) lines.push(`Industri: ${p.industry}`);
          if (p.productsServices) lines.push(`Produk/Layanan: ${p.productsServices}`);
          if (p.targetAudience) lines.push(`Target Audience: ${p.targetAudience}`);
          if (p.valueProposition) lines.push(`Value Proposition/USP: ${p.valueProposition}`);
          if (p.tone) lines.push(`Tone Komunikasi: ${p.tone}`);
          if (p.monthlyBudget) lines.push(`Budget Bulanan: ${p.monthlyBudget}`);
          if (p.goals) lines.push(`Goals: ${p.goals}`);
          if (p.competitors) lines.push(`Kompetitor: ${p.competitors}`);
          if (p.additionalContext) lines.push(`Konteks Tambahan: ${p.additionalContext}`);
          if (lines.length > 0) {
            (req as any).bpCtx = `\n\n[KONTEKS BISNIS PENGGUNA]\n${lines.join("\n")}\n[/KONTEKS]\nGunakan informasi bisnis di atas untuk mempersonalisasi semua output AI agar relevan dengan bisnis pengguna.`;
          }
        }
      } catch { /* non-blocking */ }
    }
    next();
  });

  // Capture successful AI generator responses centrally. Pages may use ordinary
  // JSON or SSE; this wrapper safely collects both without changing tool output.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const config = req.method === "POST" ? AI_TOOL_HISTORY_ROUTES[req.path] : undefined;
    const userId = getRequestUserId(req);
    if (!config || !userId) return next();

    let jsonPayload: unknown;
    const ssePayload: Record<string, unknown> = {};
    let streamFinished = false;
    let streamFailed = false;
    const originalJson = res.json.bind(res);
    const originalWrite = res.write.bind(res);

    (res as any).json = (body: unknown) => {
      jsonPayload = body;
      return originalJson(body);
    };

    (res as any).write = (chunk: unknown, ...args: unknown[]) => {
      const text = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : typeof chunk === "string" ? chunk : "";
      for (const line of text.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        try {
          const payload = JSON.parse(line.slice(6)) as Record<string, unknown>;
          if (payload.error) streamFailed = true;
          if (payload.done) streamFinished = true;
          for (const [key, value] of Object.entries(payload)) {
            if (key === "done" || key === "error") continue;
            if (typeof value === "string" && typeof ssePayload[key] === "string") {
              ssePayload[key] = `${ssePayload[key]}${value}`;
            } else {
              ssePayload[key] = value;
            }
          }
        } catch {
          // Non-history SSE payloads pass through unchanged.
        }
      }
      return (originalWrite as any)(chunk, ...args);
    };

    res.on("finish", () => {
      const output = jsonPayload ?? (streamFinished && !streamFailed ? ssePayload : undefined);
      if (res.statusCode < 200 || res.statusCode >= 300 || output === undefined || streamFailed) return;
      void saveAIToolHistory(userId, config, req.body ?? {}, output).catch((error) => {
        console.error("AI tool history save error:", error);
      });
    });

    next();
  });

  // AI Chat endpoint with streaming
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [] } = req.body;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const messages = [
        {
          role: "system" as const,
          content: `You are a helpful AI marketing assistant. You help with marketing strategy, content creation, ad copywriting, SEO, and business growth. Be concise, practical, and provide actionable advice.${(req as any).bpCtx || ""}`,
        },
        ...history.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: message },
      ];

      const stream = await openai.chat.completions.create({
        model: "gpt-5",
        messages,
        stream: true,
        max_completion_tokens: 8000,
      });

      await pipeStreamToSSE(stream, res);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // AI Expert Chat endpoint with streaming
  app.post("/api/expert-chat", async (req, res) => {
    try {
      const { message, expertType, systemPrompt, history = [] } = req.body;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const messages = [
        {
          role: "system" as const,
          content: (systemPrompt || "You are an expert marketing consultant providing professional advice.") + ((req as any).bpCtx || ""),
        },
        ...history.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: message },
      ];

      const stream = await openai.chat.completions.create({
        model: "gpt-5",
        messages,
        stream: true,
        max_completion_tokens: 8000,
      });

      await pipeStreamToSSE(stream, res);
    } catch (error) {
      console.error("Expert chat error:", error);
      res.status(500).json({ error: "Failed to process expert chat" });
    }
  });

  // Image generation endpoint
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, size = "1024x1024" } = req.body;

      const validSize = ["1024x1024", "512x512", "256x256"].includes(size)
        ? (size as "1024x1024" | "512x512" | "256x256")
        : "1024x1024";

      const imageBuffer = await generateImageBuffer(prompt, validSize);
      const b64_json = imageBuffer.toString("base64");

      res.json({ b64_json });
    } catch (error) {
      console.error("Image generation error:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  // Article generation endpoint with streaming (Pro+ only)
  app.post("/api/generate-article", async (req, res) => {
    try {
      const { topic, keywords = "", tone = "professional", length = "medium" } = req.body;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const wordCounts: Record<string, number> = {
        short: 500,
        medium: 1000,
        long: 2000,
      };
      const wordCount = wordCounts[length as string] || 1000;

      const prompt = `Write a ${tone} blog article about "${topic}".
${keywords ? `Include these keywords: ${keywords}` : ""}
The article should be approximately ${wordCount} words.
Include:
- An engaging title
- Clear introduction
- Well-structured body with subheadings
- Practical examples or tips
- Strong conclusion with call-to-action

Format: Start with the title, then the article content. Use markdown formatting for headings.`;

      const stream = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: `You are an expert content writer specializing in SEO-optimized articles that engage readers and rank well in search engines.${(req as any).bpCtx || ""}` },
          { role: "user", content: prompt },
        ],
        stream: true,
        max_completion_tokens: 4096,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Extract title from content
      const titleMatch = fullContent.match(/^#\s*(.+?)(\n|$)/);
      if (titleMatch) {
        res.write(`data: ${JSON.stringify({ title: titleMatch[1] })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Article generation error:", error);
      res.status(500).json({ error: "Failed to generate article" });
    }
  });

  // Ad generation endpoint
  app.post("/api/generate-email-sequence", async (req, res) => {
    try {
      const {
        sequenceType = "welcome",
        product,
        audience = "",
        tone = "ramah",
        extraContext = "",
        language = "id",
      } = req.body;

      if (!product || typeof product !== "string" || !product.trim()) {
        return res.status(400).json({ error: "Product is required" });
      }

      const sequenceSpec: Record<string, { count: number; goal: string; flow: string }> = {
        welcome: {
          count: 5,
          goal: "Membangun trust dengan subscriber baru, perkenalkan brand & value",
          flow: "Hari 0: Welcome + delivery hadiah/lead magnet | Hari 2: Cerita brand | Hari 4: Edukasi value | Hari 6: Soft pitch | Hari 8: Social proof + offer",
        },
        nurturing: {
          count: 7,
          goal: "Mendidik prospect dingin sampai siap beli",
          flow: "7 email berisi: pain awareness, edukasi solusi, testimoni, common objection handling, mini case study, soft offer, hard offer",
        },
        promo: {
          count: 5,
          goal: "Push penjualan untuk launch / promo / event",
          flow: "Hari 0: Tease/announce | Hari 1: Open + bonus | Hari 3: Social proof | Hari 5: Objection + FAQ | Hari 6: Last call urgency",
        },
        abandoned_cart: {
          count: 3,
          goal: "Recover keranjang yang ditinggalkan",
          flow: "Jam 1: Reminder ramah | Hari 1: Atasi objection + bonus kecil | Hari 3: Last chance + urgency",
        },
      };

      const spec = sequenceSpec[sequenceType] ?? sequenceSpec.welcome;
      const langInstruction = language === "en"
        ? "Write all emails in natural English."
        : "Tulis semua email dalam Bahasa Indonesia yang natural, hangat, dan tidak kaku.";

      const prompt = `Buat ${spec.count} email berurutan untuk sequence: ${sequenceType.toUpperCase()}.

Produk / Brand: ${product}
${audience ? `Target Audience: ${audience}` : ""}
Tone: ${tone}
${extraContext ? `Konteks tambahan: ${extraContext}` : ""}

Tujuan sequence: ${spec.goal}
Alur yang disarankan: ${spec.flow}

Aturan ketat:
- Setiap email harus punya: subject (max 50 karakter, bikin penasaran), preview text (max 90 karakter), body (200-400 kata, format paragraf pendek + bullet kalau perlu, gunakan placeholder [Nama] untuk personalisasi), dan CTA (1 frase singkat <8 kata).
- Subject jangan generik ("Halo!"), harus punya hook.
- Body harus mengalir natural, bukan brosur.
- ${langInstruction}

Jawab HANYA dalam bentuk JSON valid berikut:
{
  "emails": [
    { "day": 0, "subject": "...", "preview": "...", "body": "...", "cta": "..." }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: `You are a world-class email copywriter who writes high-converting email sequences. Always respond with valid JSON.${(req as any).bpCtx || ""}` },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 6000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      let parsed: { emails?: Array<Partial<{ day: number; subject: string; preview: string; body: string; cta: string }>> } = {};
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        parsed = JSON.parse(jsonMatch[1] || content);
      } catch {
        parsed = {};
      }

      const cleanEmails = Array.isArray(parsed.emails) ? parsed.emails : [];
      const emails = cleanEmails
        .map((e, idx) => ({
          day: typeof e?.day === "number" ? e.day : idx,
          subject: (e?.subject && String(e.subject).trim()) || `Email ${idx + 1}`,
          preview: (e?.preview && String(e.preview).trim()) || "",
          body: (e?.body && String(e.body).trim()) || "",
          cta: (e?.cta && String(e.cta).trim()) || "Pelajari Lebih Lanjut",
        }))
        .filter((e) => e.body.length > 0);

      if (emails.length === 0) {
        emails.push({
          day: 0,
          subject: `Selamat datang di ${product}`,
          preview: "Ada hadiah pembuka untukmu",
          body: `Hi [Nama],\n\nTerima kasih sudah bergabung dengan ${product}.\n\nKami akan kirim email berisi tips dan penawaran terbaik untuk kamu.\n\nSampai jumpa di email berikutnya!`,
          cta: "Mulai Sekarang",
        });
      }

      res.json({ emails, type: sequenceType, product });
    } catch (error) {
      console.error("Email sequence generation error:", error);
      res.status(500).json({ error: "Failed to generate email sequence" });
    }
  });

  app.post("/api/generate-content-calendar", async (req, res) => {
    try {
      const {
        niche,
        audience = "",
        platform = "instagram",
        pillars = [],
        extraContext = "",
      } = req.body;

      if (!niche || typeof niche !== "string" || !niche.trim()) {
        return res.status(400).json({ error: "Niche is required" });
      }
      const cleanPillars: string[] = Array.isArray(pillars) && pillars.length > 0
        ? pillars.map(String)
        : ["Edukasi", "Soft Selling", "Testimoni"];

      const platformGuidance: Record<string, string> = {
        instagram: "Instagram — format: Reels, Carousel, Single Post, Story. Caption 80-200 kata. Hashtag 5-15.",
        tiktok: "TikTok — semua Video pendek 15-60 detik. Hook di 1-2 detik. Caption singkat. Hashtag 3-8 termasuk trending.",
        facebook: "Facebook — format: Reels, Single Post, Carousel, Live. Caption boleh panjang 100-300 kata. Hashtag 3-5.",
        youtube: "YouTube — format: Shorts dan Long-form. Untuk kalender 30 hari fokuskan ke Shorts (campur 1-2 long-form).",
        linkedin: "LinkedIn — format: Text Post, Carousel, Article, Video. Tone profesional. Hashtag 3-5.",
      };

      const prompt = `Buat content calendar 30 hari (Hari 1-30) untuk platform ${platform}.

Niche / Bisnis: ${niche}
${audience ? `Target Audience: ${audience}` : ""}
Content Pillars yang dipakai (rotasi): ${cleanPillars.join(", ")}
${extraContext ? `Konteks tambahan: ${extraContext}` : ""}

Platform spec: ${platformGuidance[platform] ?? platformGuidance.instagram}

Aturan ketat:
- Buat TEPAT 30 item, hari 1 sampai 30.
- Rotasi pillar secara seimbang dari list yang diberikan.
- Setiap item harus berbeda topik (jangan duplikat).
- Topik: 1 kalimat (max 12 kata).
- Hook: max 12 kata, stop scroll.
- Caption: 1 kalimat preview (max 20 kata).
- CTA: max 5 kata.
- Hashtag: 5-8 tag, dipisah spasi, mulai dengan #.
- Tulis dalam Bahasa Indonesia natural.
- Output JSON saja, padat tanpa basa-basi.

Jawab HANYA dalam bentuk JSON valid berikut:
{
  "items": [
    {
      "day": 1,
      "pillar": "Edukasi",
      "format": "Reels",
      "topic": "...",
      "hook": "...",
      "caption": "...",
      "cta": "...",
      "hashtags": "#... #..."
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: `You are an expert content strategist for Indonesian social media brands. Always respond with valid JSON containing exactly 30 calendar items. Be concise.${(req as any).bpCtx || ""}` },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 16000,
        response_format: { type: "json_object" },
        reasoning_effort: "minimal",
      } as any);

      const content = response.choices[0]?.message?.content || "{}";
      let parsed: { items?: Array<Partial<{ day: number; pillar: string; format: string; topic: string; hook: string; caption: string; cta: string; hashtags: string }>> } = {};
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        parsed = JSON.parse(jsonMatch[1] || content);
      } catch {
        parsed = {};
      }

      const cleanItems = Array.isArray(parsed.items) ? parsed.items : [];
      const items = cleanItems
        .map((it, idx) => ({
          day: typeof it?.day === "number" ? it.day : idx + 1,
          pillar: (it?.pillar && String(it.pillar).trim()) || cleanPillars[idx % cleanPillars.length],
          format: (it?.format && String(it.format).trim()) || "Post",
          topic: (it?.topic && String(it.topic).trim()) || "",
          hook: (it?.hook && String(it.hook).trim()) || "",
          caption: (it?.caption && String(it.caption).trim()) || "",
          cta: (it?.cta && String(it.cta).trim()) || "Save & share",
          hashtags: (it?.hashtags && String(it.hashtags).trim()) || `#${niche.replace(/\s+/g, "")}`,
        }))
        .filter((it) => it.topic.length > 0)
        .slice(0, 30);

      if (items.length === 0) {
        for (let i = 1; i <= 30; i++) {
          items.push({
            day: i,
            pillar: cleanPillars[(i - 1) % cleanPillars.length],
            format: "Post",
            topic: `Konten hari ${i} untuk ${niche}`,
            hook: "Berhenti scroll — ini penting buatmu.",
            caption: "Caption ringkas tentang topik hari ini.",
            cta: "Save & share",
            hashtags: `#${niche.replace(/\s+/g, "")}`,
          });
        }
      }

      res.json({ items, niche, platform });
    } catch (error) {
      console.error("Content calendar generation error:", error);
      res.status(500).json({ error: "Failed to generate content calendar" });
    }
  });

  app.post("/api/generate-ab-variants", async (req, res) => {
    try {
      const {
        headline,
        body,
        cta = "",
        audience = "",
        platform = "Meta Ads",
        count = 5,
        language = "id",
      } = req.body;

      if (!headline || !body) {
        return res.status(400).json({ error: "Headline and body are required" });
      }

      const variantCount = [3, 5, 7].includes(count) ? count : 5;
      const langInstruction = language === "en"
        ? "Write all variants in English."
        : "Tulis semua varian dalam Bahasa Indonesia natural.";

      const prompt = `Saya punya satu copy iklan untuk ${platform}. Bantu buat ${variantCount} varian terkontrol untuk A/B test.

COPY ASLI:
Headline: ${headline}
Body: ${body}
CTA: ${cta || "(belum diisi, buatkan)"}

${audience ? `Target Audience: ${audience}` : ""}
Platform: ${platform}

Aturan ketat:
- Setiap varian ubah HANYA 1 elemen utama (hook angle, tone, CTA, length, atau angle benefit). Jangan ubah semuanya sekaligus — ini A/B test, bukan rewrite.
- Setiap varian punya: label (A, B, C, ...), changeType (jelaskan apa yang diubah dalam 3-5 kata), headline, body, cta, dan rationale (kenapa varian ini layak dites, 1 kalimat).
- Variasikan changeType lintas varian: misal "Hook: pertanyaan", "Hook: statistik", "Tone: kasual", "CTA: urgensi", "Angle: testimonial", "Length: pendek", "Angle: pain agitation".
- Pertahankan inti pesan dan produk yang sama.
- ${langInstruction}

Selain varian, beri:
- recommendation: 1-2 kalimat saran varian mana yang paling layak dites duluan dan kenapa.
- testMetric: metrik utama yang harus dipantau (CTR / CPL / ROAS / Hook rate, dll).

Jawab HANYA dalam bentuk JSON valid:
{
  "variants": [
    { "label": "A", "changeType": "...", "headline": "...", "body": "...", "cta": "...", "rationale": "..." }
  ],
  "recommendation": "...",
  "testMetric": "..."
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: `You are a senior performance marketer specialized in A/B testing ad creatives. Always respond with valid JSON.${(req as any).bpCtx || ""}` },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 6000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      let parsed: {
        variants?: Array<Partial<{ label: string; changeType: string; headline: string; body: string; cta: string; rationale: string }>>;
        recommendation?: string;
        testMetric?: string;
      } = {};
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        parsed = JSON.parse(jsonMatch[1] || content);
      } catch {
        parsed = {};
      }

      const cleanVariants = Array.isArray(parsed.variants) ? parsed.variants : [];
      const labels = ["A", "B", "C", "D", "E", "F", "G"];
      const variants = cleanVariants
        .map((v, idx) => ({
          label: (v?.label && String(v.label).trim()) || labels[idx] || `V${idx + 1}`,
          changeType: (v?.changeType && String(v.changeType).trim()) || "Variation",
          headline: (v?.headline && String(v.headline).trim()) || headline,
          body: (v?.body && String(v.body).trim()) || body,
          cta: (v?.cta && String(v.cta).trim()) || cta || "Pelajari Lebih Lanjut",
          rationale: (v?.rationale && String(v.rationale).trim()) || "Variasi tone untuk uji respon audience.",
        }))
        .filter((v) => v.headline.length > 0);

      if (variants.length === 0) {
        variants.push({
          label: "A",
          changeType: "Hook: pertanyaan",
          headline: `${headline} — kamu siap?`,
          body,
          cta: cta || "Coba Sekarang",
          rationale: "Hook berbentuk pertanyaan biasanya naikkan CTR pada audience dingin.",
        });
      }

      res.json({
        variants,
        recommendation: parsed.recommendation?.trim() || "Tes varian A vs B dulu (split 50/50, budget sama, durasi 3 hari).",
        testMetric: parsed.testMetric?.trim() || "CTR dan CPL",
        original: { headline, body, cta },
      });
    } catch (error) {
      console.error("A/B variant generation error:", error);
      res.status(500).json({ error: "Failed to generate variants" });
    }
  });

  app.post("/api/generate-hook", async (req, res) => {
    try {
      const {
        topic,
        targetAudience = "",
        keyMessage = "",
        platform = "tiktok",
        style = "mixed",
        language = "id",
      } = req.body;

      if (!topic || typeof topic !== "string" || !topic.trim()) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const platformGuidance: Record<string, string> = {
        tiktok: "TikTok / Reels — sangat casual, native, hook harus relate dalam 1-2 detik pertama, hindari bahasa iklan",
        instagram: "Instagram Reels — punchy, visual-first, emotional, gunakan kata-kata yang trendy tapi tetap clear",
        meta: "Meta Ads (Facebook/Instagram feed) — boleh sedikit lebih panjang, fokus benefit + curiosity",
        youtube: "YouTube Shorts — hook 1-3 detik sebelum skip button, langsung ke value",
        general: "General-purpose — bisa dipakai lintas platform, tetap singkat dan menarik",
      };

      const styleGuidance: Record<string, string> = {
        question: "Semua hook berupa pertanyaan yang relate ke pain audience.",
        shocking_stat: "Semua hook berupa angka / fakta / statistik mengejutkan (boleh dibumbui asal masuk akal).",
        story: "Semua hook berupa pembuka cerita pendek (POV, 'Dulu saya...', 'Kemarin...').",
        controversial: "Semua hook berupa pernyataan berani / counter-intuitive yang memancing debat sehat.",
        problem: "Semua hook menyebut masalah audience secara spesifik dan menyakitkan (problem agitation).",
        curiosity: "Semua hook membuka curiosity gap — bilang ada sesuatu, tapi tahan informasinya.",
        mixed: "Buat campuran 6 gaya berbeda: 1 pertanyaan, 1 statistik mengejutkan, 1 pembuka cerita, 1 kontroversial, 1 problem agitation, 1 curiosity gap.",
      };

      const langInstruction = language === "en"
        ? "Write all hooks in English."
        : "Tulis semua hook dalam Bahasa Indonesia yang natural dan kekinian (boleh sedikit slang sesuai platform).";

      const styleLabels: Record<string, string> = {
        question: "Question",
        shocking_stat: "Shocking Stat",
        story: "Story",
        controversial: "Controversial",
        problem: "Problem",
        curiosity: "Curiosity",
      };

      const prompt = `Buat 6 hook (kalimat pembuka penangkap perhatian) untuk konten/iklan.

Topik / Produk: ${topic}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${keyMessage ? `Pesan / Penawaran Utama: ${keyMessage}` : ""}

Platform: ${platformGuidance[platform] ?? platformGuidance.general}
Gaya: ${styleGuidance[style] ?? styleGuidance.mixed}

Aturan ketat:
- Setiap hook MAKSIMAL 1 kalimat (atau 2 kalimat sangat pendek).
- Maksimal 20 kata per hook.
- Tidak boleh klise umum ("Tahukah kamu...", "Apakah kamu pernah...").
- Harus spesifik ke topik dan audience yang diberikan.
- ${langInstruction}

Untuk setiap hook, beri label "style" salah satu dari: ${Object.values(styleLabels).join(", ")}.

Jawab HANYA dalam bentuk JSON valid berikut:
{
  "hooks": [
    { "style": "Question", "text": "..." },
    { "style": "Shocking Stat", "text": "..." },
    { "style": "Story", "text": "..." },
    { "style": "Controversial", "text": "..." },
    { "style": "Problem", "text": "..." },
    { "style": "Curiosity", "text": "..." }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content:
              `You are a world-class direct-response copywriter who writes scroll-stopping hooks for short-form video and ads. Always respond with valid JSON.${(req as any).bpCtx || ""}`,
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 4000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";

      let parsed: { hooks?: Array<{ style?: string; text?: string }> } = {};
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        parsed = JSON.parse(jsonMatch[1] || content);
      } catch {
        parsed = {};
      }

      const cleanHooks = Array.isArray(parsed.hooks) ? parsed.hooks : [];
      const hooks = cleanHooks
        .map((h) => ({
          style: (h?.style && String(h.style).trim()) || "Hook",
          text: (h?.text && String(h.text).trim()) || "",
        }))
        .filter((h) => h.text.length > 0);

      if (hooks.length === 0) {
        hooks.push(
          { style: "Question", text: `Pernah merasa stuck dengan ${topic}?` },
          { style: "Curiosity", text: `Ada satu cara mengubah ${topic} yang jarang dibahas — ini lengkapnya.` },
        );
      }

      res.json({
        hooks,
        platform,
        topic,
      });
    } catch (error) {
      console.error("Hook generation error:", error);
      res.status(500).json({ error: "Failed to generate hooks" });
    }
  });

  app.post("/api/generate-ad", async (req, res) => {
    try {
      const {
        platform,
        objective,
        productName,
        productDescription,
        targetAudience = "",
        uniqueValue = "",
      } = req.body;

      const platformGuidelines: Record<string, string> = {
        meta_ads: "Facebook/Instagram ad with engaging hook, 125 chars for primary text",
        instagram: "Instagram ad optimized for visual-first audience, use emotive language",
        tiktok: "TikTok ad with trendy, casual tone and hook in first 2 seconds concept",
        youtube: "YouTube ad with compelling hook for skippable ads",
        linkedin: "LinkedIn ad with professional tone for B2B audience",
        google_ads: "Google Ads with clear value prop and strong keywords",
      };

      const objectiveGoals: Record<string, string> = {
        awareness: "Focus on brand recognition and memorable messaging",
        traffic: "Include strong call-to-action to drive clicks",
        conversions: "Emphasize benefits, social proof, and urgency",
      };

      const prompt = `Create ad copy for ${platform.replace("_", " ")} advertising.

Product: ${productName}
Description: ${productDescription}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${uniqueValue ? `Unique Value: ${uniqueValue}` : ""}

Platform Guidelines: ${platformGuidelines[platform] || "General digital ad"}
Campaign Objective: ${objectiveGoals[objective] || "Drive engagement"}

Generate:
1. Headline (max 40 chars, attention-grabbing)
2. Primary Text (engaging copy that addresses pain points and presents solution)
3. Description (supporting text, max 90 chars)
4. Call to Action (action verb + benefit)

Return as JSON: { "headline": "", "primaryText": "", "description": "", "callToAction": "" }`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: `You are an expert advertising copywriter who creates high-converting ad copy. Always respond with valid JSON.${(req as any).bpCtx || ""}` },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 4000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";

      let adData: {
        headline?: string;
        primaryText?: string;
        description?: string;
        callToAction?: string;
      } = {};
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        adData = JSON.parse(jsonMatch[1] || content);
      } catch (e) {
        adData = {};
      }

      const safeAd = {
        headline: adData.headline?.trim() || `Discover ${productName}`,
        primaryText: adData.primaryText?.trim() || productDescription,
        description: adData.description?.trim() || (uniqueValue || "Limited time offer"),
        callToAction: adData.callToAction?.trim() || "Learn More",
      };

      res.json(safeAd);
    } catch (error) {
      console.error("Ad generation error:", error);
      res.status(500).json({ error: "Failed to generate ad" });
    }
  });

  // Story generation endpoint with streaming
  app.post("/api/generate-story", async (req, res) => {
    try {
      const {
        storyType,
        emotion,
        productName,
        productBenefit,
        targetAudience = "",
        additionalContext = "",
      } = req.body;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const storyFrameworks: Record<string, string> = {
        hero_journey: "Position the customer as the hero overcoming challenges with your product as their guide",
        problem_solution: "Start with a relatable problem, build tension, then reveal your solution",
        before_after: "Show the transformation - paint vivid pictures of life before and after your product",
        testimonial: "Create a realistic customer success story with specific details and emotions",
        origin_story: "Tell the founding story of the brand with passion, struggle, and mission",
        educational: "Teach valuable information while naturally integrating your product benefits",
      };

      const emotionalTones: Record<string, string> = {
        inspirational: "uplifting, motivating, empowering",
        empowering: "confident, strong, capable",
        heartwarming: "warm, caring, emotional connection",
        exciting: "energetic, dynamic, enthusiastic",
        trustworthy: "reliable, honest, professional",
        urgent: "time-sensitive, important, act now",
      };

      const prompt = `Create a compelling promotional story for "${productName}".

Story Framework: ${storyType} - ${storyFrameworks[storyType] || "engaging narrative"}
Emotional Tone: ${emotionalTones[emotion] || "engaging"}
Main Benefit: ${productBenefit}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Write a 400-600 word promotional story that:
1. Hooks the reader immediately
2. Creates emotional connection
3. Naturally incorporates the product/service
4. Ends with a compelling call-to-action

Use vivid language, sensory details, and authentic dialogue where appropriate.`;

      const stream = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: `You are a master storyteller who creates compelling brand narratives that connect with audiences emotionally and drive action.${(req as any).bpCtx || ""}` },
          { role: "user", content: prompt },
        ],
        stream: true,
        max_completion_tokens: 8000,
      });

      await pipeStreamToSSE(stream, res);
    } catch (error) {
      console.error("Story generation error:", error);
      res.status(500).json({ error: "Failed to generate story" });
    }
  });

  // Text-to-Speech endpoint (Pro+ only)
  app.post("/api/text-to-speech", async (req, res) => {
    try {
      const { text, voice = "alloy" } = req.body;

      const validVoice = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"].includes(voice) 
        ? (voice as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer")
        : "alloy";

      const audioBuffer = await textToSpeech(text, validVoice);
      const audioBase64 = audioBuffer.toString("base64");

      res.json({ audio: audioBase64 });
    } catch (error) {
      console.error("TTS error:", error);
      res.status(500).json({ error: "Failed to generate speech" });
    }
  });

  // Speech-to-Text endpoint (Pro+ only)
  app.post("/api/speech-to-text", async (req, res) => {
    try {
      const { audio } = req.body;
      const audioBuffer = Buffer.from(audio, "base64");

      // Convert WebM/MP4/OGG to compatible format (WAV/MP3)
      const { buffer: compatibleBuffer, format } = await ensureCompatibleFormat(audioBuffer);
      const text = await speechToText(compatibleBuffer, format);

      res.json({ text });
    } catch (error) {
      console.error("STT error:", error);
      res.status(500).json({ error: "Failed to transcribe audio" });
    }
  });

  // Landing page generation endpoint (Pro+ only)
  app.post("/api/generate-landing-page", async (req, res) => {
    try {
      const {
        productName,
        tagline,
        description = "",
        benefits = "",
        productType = "general",
        targetMarket = "",
        category = "",
        framework = "PAS",
        objective = "Penjualan Langsung (Direct Sales)",
        ctaType = "Beli Sekarang",
        pricingModel = "Sekali Bayar (One-time Payment)",
        productPrice = "",
        socialProof = "Testimoni pelanggan (teks)",
        urgency = "Batas waktu penawaran",
        uiTheme = "bold_modern",
        gayaBahasa = "santai",
        optionalSections = {},
      } = req.body;

      const productTypeLabels: Record<string, string> = {
        digital: "Produk Digital (ebook/course/template/software)",
        physical: "Produk Fisik (barang/merchandise)",
        service: "Jasa/Layanan (konsultasi/freelance/agency)",
        general: "Produk/Layanan Umum",
      };

      const themeGuides: Record<string, string> = {
        bold_modern: "Bold, strong colors with high contrast. Large impactful headlines. Dynamic sections with accent colors. Modern sans-serif fonts.",
        clean_minimal: "Clean white space, minimal design. Subtle borders. Light gray accents. Premium feel through simplicity.",
        dark_premium: "Dark background (#0f0f0f or #111827). Gold or electric blue accents. Premium, luxury feel. High contrast text.",
        warm_earthy: "Warm earth tones (cream, terracotta, warm brown). Organic feel. Rounded corners. Friendly and approachable.",
        tech_startup: "Gradient backgrounds (purple to blue). Glassmorphism effects. Futuristic feel. Tech-forward typography.",
        trust_corporate: "Navy blue and white. Professional and structured. Trust-building elements. Corporate but approachable.",
      };

      const frameworkGuides: Record<string, string> = {
        AIDA: "Structure: 1) Attention-grabbing headline, 2) Build Interest with benefits, 3) Create Desire with proof/results, 4) Strong Action CTA",
        PAS: "Structure: 1) Problem - identify pain points of target market, 2) Agitate - amplify the pain, 3) Solution - present product as the answer",
        BAB: "Structure: 1) Before - current painful state, 2) After - desired transformed state, 3) Bridge - how product gets them there",
        FAB: "Structure: 1) Features of the product, 2) Advantages over alternatives, 3) Benefits/transformation for the buyer",
        PASTOR: "Structure: 1) Problem, 2) Amplify pain, 3) Story/testimonial, 4) Transformation shown, 5) Offer details, 6) Response/CTA",
        "4U": "Every headline follows: Useful (practical value), Urgent (time pressure), Unique (different from alternatives), Ultra-specific (exact numbers/results)",
        SPIN: "Structure: 1) Situation (context), 2) Problem (pain), 3) Implication (consequences of not solving), 4) Need-payoff (value of solution)",
        storytelling: "Lead with an emotional story about transformation. Use narrative arc. Make reader the hero. Product is the guide/tool.",
        social_proof: "Lead with real results and proof. Number-heavy. Case studies first. Then offer. Trust before pitch.",
      };

      const benefitList = benefits.split("\n").filter((b: string) => b.trim());

      const prompt = `Kamu adalah expert copywriter dan web developer Indonesia yang membuat landing page high-converting.

Buat landing page LENGKAP dalam bahasa Indonesia untuk:

PRODUK: "${productName}"
JENIS: ${productTypeLabels[productType] || productType}
${category ? `KATEGORI: ${category}` : ""}
TAGLINE: "${tagline}"
${description ? `DESKRIPSI: ${description}` : ""}
${benefitList.length > 0 ? `MANFAAT UTAMA:\n${benefitList.map((b: string, i: number) => `${i + 1}. ${b}`).join("\n")}` : ""}
${targetMarket ? `TARGET MARKET: ${targetMarket}` : ""}
${productPrice ? `HARGA: ${productPrice}` : ""}

GAYA BAHASA: ${(() => {
        const g: Record<string, string> = {
          santai: "Santai & friendly. Gunakan kata 'kamu', 'aku', sapaan yang akrab. Mudah dipahami semua kalangan.",
          formal: "Formal & profesional. Gunakan kata 'Anda'. Kalimat terstruktur, sopan, dan terpercaya.",
          gaul: "Gaul & kasual. Boleh pakai slang anak muda (misal: 'wajib banget', 'langsung gaskeun', 'gak bakal nyesel'). Energik.",
          provokatif: "Provokatif & bold. Gunakan kalimat yang memancing emosi, FOMO tinggi, hard-selling. Berani dan percaya diri.",
          inspiratif: "Inspiratif & motivasional. Gunakan bahasa yang membangkitkan semangat, cerita transformasi, harapan.",
        };
        return g[gayaBahasa] || g.santai;
      })()}

STRATEGI COPYWRITING:
- Framework: ${framework} — ${frameworkGuides[framework] || ""}
- Tujuan LP: ${objective}
- CTA Utama: "${ctaType}"
- Model Harga: ${pricingModel}
- Social Proof: ${socialProof}
- Urgency: ${urgency}

VISUAL THEME: ${themeGuides[uiTheme] || "Modern, professional"}

STRUKTUR LANDING PAGE yang WAJIB ada (dalam bahasa Indonesia):
1. Navigation bar minimalis (nama produk + 1 CTA button)
2. HERO SECTION: Headline utama yang powerful (sesuai framework ${framework}), subheadline, 2 CTA buttons, social proof kecil (misal: "1.500+ seller sudah pakai")
3. MASALAH section: 3-4 pain point target market yang relatable
4. SOLUSI / PRODUK section: Apa yang didapat, dengan visual yang menarik
5. MANFAAT / FITUR section: List benefit dengan icon emoji, detail per manfaat
6. SOCIAL PROOF section: 3 testimoni placeholder (nama, role, quote yang relevan), ${socialProof}
7. CARA KERJA / HOW IT WORKS: 3 langkah mudah
8. PENAWARAN / PRICING section: Harga, model ${pricingModel}, apa yang didapat, ${urgency}
${(optionalSections as Record<string, boolean>).faq !== false ? "9. FAQ section: 4-5 pertanyaan yang mungkin ada di benak target market" : ""}
${(optionalSections as Record<string, boolean>).bonus ? "BONUS SECTION: Tampilkan 3-5 bonus eksklusif dengan nilai/harga masing-masing, desain menarik dengan badge" : ""}
${(optionalSections as Record<string, boolean>).comparison ? "COMPARISON TABLE: Tabel perbandingan vs cara lain (minimal 4 fitur), dengan checkmark visual" : ""}
${(optionalSections as Record<string, boolean>).countdown ? "COUNTDOWN TIMER: Tambahkan timer JavaScript aktif (countdown 24 jam) dengan visual urgency" : ""}
${(optionalSections as Record<string, boolean>).guarantee ? "GUARANTEE SECTION: Badge garansi uang kembali dengan desain yang meyakinkan dan trust-building" : ""}
${(optionalSections as Record<string, boolean>).whatsapp ? "WHATSAPP BUTTON: Floating WhatsApp button di kanan bawah yang selalu terlihat saat scroll" : ""}
${!(optionalSections as Record<string, boolean>).faq ? "" : ""}FINAL CTA section: Kuat dan urgency, CTA button "${ctaType}"
Footer

TEKNIS:
- HTML5 valid, self-contained, semua CSS inline/internal <style>
- FULLY responsive (mobile-first)
- Font: Google Fonts (load dari CDN: Inter atau Poppins)
- Smooth scroll, hover effects pada buttons dan cards
- CTA button: gradient, shadow, hover animation
- Section spacing yang nyaman
- Warna dan desain sesuai tema: ${uiTheme}

Tuliskan HANYA kode HTML lengkap. Tanpa penjelasan.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `Kamu adalah expert web developer dan copywriter Indonesia yang membuat landing page high-converting. Selalu gunakan bahasa Indonesia yang natural dan persuasif. Return HANYA kode HTML valid dan lengkap, tanpa markdown, tanpa penjelasan.${(req as any).bpCtx || ""}`,
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 12000,
      });

      let html = response.choices[0]?.message?.content || "";

      // Extract HTML if wrapped in code blocks
      const htmlMatch = html.match(/```(?:html)?\s*([\s\S]*?)```/);
      if (htmlMatch) {
        html = htmlMatch[1];
      }

      res.json({ html: html.trim() });
    } catch (error) {
      console.error("Landing page generation error:", error);
      res.status(500).json({ error: "Gagal generate landing page" });
    }
  });

  // Product Research endpoint
  app.post("/api/research-product", async (req, res) => {
    try {
      const { niche, format = "all", priceRange = "any" } = req.body;

      const nicheLabels: Record<string, string> = {
        bisnis_online: "Bisnis Online & E-Commerce",
        meta_ads: "Meta Ads & Digital Marketing",
        desain_grafis: "Desain Grafis & Kreatif",
        keuangan_pribadi: "Keuangan Pribadi & Investasi",
        produktivitas: "Produktivitas & Karir",
        parenting: "Parenting & Keluarga",
        kesehatan: "Kesehatan & Fitness",
        memasak: "Resep & Kuliner",
        konten_kreator: "Content Creator & Influencer",
        self_improvement: "Self Improvement & Mindset",
        fashion: "Fashion & Gaya Hidup",
        edukasi_anak: "Edukasi & Belajar Anak",
        hobi: "Hobi (Fotografi/Musik/Gaming)",
        hukum_pajak: "Hukum & Perpajakan UMKM",
        properti: "Properti & Real Estate",
        wedding: "Pernikahan & Event",
        travel: "Travel & Wisata",
        teknologi: "Teknologi & Programming",
        pertanian: "Pertanian & Agribisnis",
        kuliner_bisnis: "Bisnis Kuliner & F&B",
      };

      const priceGuide: Record<string, string> = {
        low: "Rp 10.000 - Rp 49.000",
        mid: "Rp 50.000 - Rp 149.000",
        high: "Rp 150.000 - Rp 499.000",
        any: "Fleksibel (sesuai nilai produk)",
      };

      const formatGuide: Record<string, string> = {
        ebook: "E-Book atau PDF Guide",
        template: "Template (Canva/Notion/Excel/Figma)",
        preset: "Preset, Filter, atau Aset Digital",
        course: "Mini Course atau Video Tutorial",
        toolkit: "Toolkit atau Bundle",
        spreadsheet: "Spreadsheet atau Kalkulator",
        prompt: "AI Prompt Pack",
        all: "Semua format (pilihkan yang paling cocok)",
      };

      const prompt = `Kamu adalah expert riset produk digital Indonesia yang sudah berpengalaman riset di Etsy, Gumroad, Tokopedia Digital, dan marketplace produk digital lainnya.

Lakukan RISET PRODUK DIGITAL untuk niche: "${nicheLabels[niche] || niche}"
${format !== "all" ? `Format yang diminati: ${formatGuide[format]}` : ""}
${priceRange !== "any" ? `Range harga: ${priceGuide[priceRange]}` : ""}

Berikan 6 ide produk digital yang:
1. SUDAH TERBUKTI LAKU di pasar Indonesia atau internasional (diinspirasi dari tren Etsy, bestseller Tokopedia Digital, dll)
2. Bisa dibuat oleh PEMULA dalam waktu 1-2 minggu
3. Ada DEMAND yang jelas dari target market Indonesia

Untuk setiap produk, berikan analisis mendalam dalam bahasa Indonesia:

Format JSON:
{
  "overview": "Analisis singkat niche ${nicheLabels[niche] || niche} dan peluangnya di pasar Indonesia (2-3 kalimat)",
  "topRecommendation": 0,
  "products": [
    {
      "name": "Nama produk yang spesifik dan menarik",
      "format": "Nama format lengkap (contoh: Template Canva, E-Book PDF, dll)",
      "formatType": "ebook|template|preset|course|toolkit|spreadsheet|prompt",
      "price": "Harga jual realistis di Indonesia (contoh: Rp 49.000)",
      "targetMarket": "Deskripsi spesifik target market (usia, profesi, situasi)",
      "painPoint": "Pain point utama yang diselesaikan produk ini (1-2 kalimat yang compelling)",
      "uniqueAngle": "Apa yang membedakan dari produk serupa yang sudah ada",
      "competition": "Rendah|Sedang|Tinggi",
      "demand": "Sangat Tinggi|Tinggi|Sedang|Rendah",
      "profitPotential": "Estimasi potensi penghasilan (contoh: 50 penjualan/bulan = Rp 2.450.000)",
      "quickWin": "Langkah konkret yang bisa dilakukan minggu ini untuk mulai bikin produk ini",
      "etsyInsight": "Insight dari pasar Etsy/internasional tentang produk sejenis (trend, jumlah penjual, harga di sana, dll)"
    }
  ]
}

PENTING:
- topRecommendation adalah index (0-5) dari produk yang paling kamu rekomendasikan
- Buat nama produk yang SPESIFIK, bukan generik (contoh: "Template Notion Weekly Planner untuk Mahasiswa" bukan hanya "Template Planner")
- Harga harus realistis untuk pasar Indonesia
- Setiap produk harus BENAR-BENAR BERBEDA satu sama lain`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `Kamu adalah product research expert Indonesia yang memahami pasar digital lokal dan internasional. Selalu respond dengan JSON valid.${(req as any).bpCtx || ""}`,
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 4000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      res.json(parsed);
    } catch (error) {
      console.error("Product research error:", error);
      res.status(500).json({ error: "Gagal riset produk" });
    }
  });

  // Product Validator endpoint
  app.post("/api/validate-product", async (req, res) => {
    try {
      const {
        productName,
        productDescription,
        targetMarket = "",
        platform = "WhatsApp / Telegram",
        adBudget = "Rp 50rb – 200rb",
        competitorInfo = "",
      } = req.body;

      const prompt = `Kamu adalah product validation expert dan digital marketing strategist Indonesia. Kamu sudah bantu ratusan seller digital produk mengevaluasi ide mereka.

Validasi ide produk digital berikut secara JUJUR dan AKURAT:

NAMA PRODUK: "${productName}"
DESKRIPSI: "${productDescription}"
${targetMarket ? `TARGET MARKET: ${targetMarket}` : ""}
PLATFORM JUAL: ${platform}
BUDGET IKLAN: ${adBudget}
${competitorInfo ? `INFO KOMPETITOR: ${competitorInfo}` : ""}

Berikan validasi yang JUJUR. Jangan terlalu optimis kalau memang ada masalah serius.

Format JSON:
{
  "productName": "${productName}",
  "overallScore": 72,
  "verdict": "go|cautious|pivot|no_go",
  "verdictLabel": "Label singkat verdict dalam bahasa Indonesia",
  "verdictReason": "Penjelasan 2-3 kalimat kenapa verdict ini, spesifik berdasarkan produk yang dinilai",
  "scores": {
    "marketDemand": { "label": "Market Demand", "score": 75, "color": "text-green-600 dark:text-green-400" },
    "competition": { "label": "Tingkat Kompetisi", "score": 60, "color": "text-yellow-600 dark:text-yellow-400" },
    "monetization": { "label": "Potensi Monetisasi", "score": 70, "color": "text-blue-600 dark:text-blue-400" },
    "productionEase": { "label": "Kemudahan Produksi", "score": 80, "color": "text-green-600 dark:text-green-400" },
    "targetClarity": { "label": "Kejelasan Target Market", "score": 65, "color": "text-yellow-600 dark:text-yellow-400" }
  },
  "strengths": ["kekuatan 1", "kekuatan 2", "kekuatan 3"],
  "weaknesses": ["kelemahan 1", "kelemahan 2"],
  "opportunities": ["peluang 1", "peluang 2"],
  "risks": ["risiko 1", "risiko 2"],
  "pricingRecommendation": "Rekomendasi harga spesifik dengan reasoning (contoh: Rp 49.000-97.000 — karena...)",
  "targetMarketBreakdown": "Deskripsi target market yang lebih spesifik dan tepat berdasarkan produk ini",
  "pivotSuggestion": "Saran pivot atau perbaikan jika verdict bukan GO (kosong jika verdict GO)",
  "actionPlan": [
    { "step": 1, "action": "Langkah pertama yang harus dilakukan", "timeline": "Hari ini" },
    { "step": 2, "action": "Langkah kedua", "timeline": "Minggu ini" },
    { "step": 3, "action": "Langkah ketiga", "timeline": "2 minggu ke depan" },
    { "step": 4, "action": "Langkah keempat", "timeline": "Bulan ini" }
  ],
  "similarProducts": "Produk serupa yang sudah ada di pasar Indonesia dan insight dari sana"
}

Gunakan skor yang REALISTIS:
- go: overallScore 75-100 (produk solid, layak dieksekusi)
- cautious: overallScore 55-74 (ada potensi tapi perlu perbaikan)
- pivot: overallScore 35-54 (ide ada tapi perlu perombakan besar)
- no_go: overallScore 0-34 (risiko terlalu tinggi, ganti ide)`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `Kamu adalah product validation expert Indonesia yang memberikan penilaian jujur dan akurat. Selalu respond dengan JSON valid.${(req as any).bpCtx || ""}`,
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 3000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      res.json(parsed);
    } catch (error) {
      console.error("Product validator error:", error);
      res.status(500).json({ error: "Gagal validasi produk" });
    }
  });

  // CS Closing Script Generator
  app.post("/api/generate-closing-script", async (req, res) => {
    try {
      const {
        productName,
        productPrice = "",
        productBenefit = "",
        stage = "warm",
        objection = "Harga terlalu mahal",
        technique = "fomo",
        funnelType = "full",
        platform = "whatsapp",
      } = req.body;

      const stageLabels: Record<string, string> = {
        cold: "Cold Prospect (belum kenal produk)",
        warm: "Warm Prospect (sudah tahu, belum beli)",
        hot: "Hot Prospect (sudah minat, tinggal closing)",
      };

      const techniqueGuides: Record<string, string> = {
        fomo: "FOMO: Gunakan batas waktu, stok terbatas, harga akan naik. Ciptakan rasa takut ketinggalan.",
        testimonial: "Testimonial: Ceritakan hasil nyata pembeli lain. Pakai nama, angka spesifik, dan transformasi.",
        guarantee: "Garansi: Hilangkan risiko dengan garansi uang kembali. Buat prospect merasa aman.",
        value_stack: "Value Stack: Tumpuk semua yang didapat vs harga yang dibayar. Buat terasa sangat worth it.",
        empathy: "Empati: Pahami pain point prospect, validasi perasaan mereka, lalu tawarkan solusi.",
        comparison: "Perbandingan: Bandingkan dengan biaya/cara lain yang lebih mahal atau tidak efektif.",
        question: "Question: Ajukan pertanyaan yang mengarahkan prospect untuk sendiri menyimpulkan harus beli.",
        story: "Story: Cerita yang relatable tentang seseorang dengan situasi serupa yang berhasil.",
      };

      const platformName: Record<string, string> = {
        whatsapp: "WhatsApp",
        instagram_dm: "Instagram DM",
        tiktok_dm: "TikTok DM",
        email: "Email",
      };

      const prompt = `Kamu adalah CS (Customer Service) jago closing yang sudah pengalaman bertahun-tahun jualan produk digital di Indonesia.

Buatkan SCRIPT CLOSING LENGKAP untuk:
- Produk: "${productName}"
${productPrice ? `- Harga: ${productPrice}` : ""}
${productBenefit ? `- Manfaat/Hasil: ${productBenefit}` : ""}
- Status Prospect: ${stageLabels[stage] || stage}
- Objeksi yang sering muncul: "${objection}"
- Teknik Closing: ${techniqueGuides[technique] || technique}
- Tipe Funnel: ${funnelType === "short" ? "Short Form (prospect dari iklan langsung ke WA)" : "Full Form (prospect dari LP → WA)"}
- Platform: ${platformName[platform] || platform}

Buatkan 5 script dalam BAHASA INDONESIA yang natural, tidak kaku, dan sesuai gaya ngobrol orang Indonesia:

1. OPENING MESSAGE - Pesan pertama untuk menyambut prospect yang baru masuk/menghubungi. Hangat, tidak langsung jualan, buat nyaman dulu.

2. CLOSING SCRIPT - Script closing utama menggunakan teknik ${technique}. Handle objeksi "${objection}". Persuasif tapi tidak memaksa. Sertakan semua elemen: masalah → solusi → bukti → penawaran → CTA.

3. FOLLOW-UP 1 (hari ke-1 setelah tidak ada respons) - Reminder yang ringan, tidak terkesan ngejar-ngejar. Tambahkan value baru.

4. FOLLOW-UP 2 (hari ke-2 atau ke-3) - Lebih direct, tampilkan urgency/benefit tambahan, ajak ambil keputusan.

5. FOLLOW-UP FINAL (hari ke-4 atau ke-5) - Final push. Bisa pakai urgency stok/harga naik atau cukup pamit dengan sopan.

Format respons: JSON dengan structure:
{
  "scripts": {
    "opening": "...",
    "closing": "...",
    "followUp1": "...",
    "followUp2": "...",
    "followUp3": "..."
  }
}

PENTING:
- Gunakan bahasa Indonesia yang natural, santai tapi tetap profesional
- Pakai sapaan "Kak" atau "Bro/Sis" sesuai konteks
- Sertakan emoji secukupnya (tidak berlebihan)
- Setiap script harus standalone (bisa dipahami tanpa konteks lain)
- Jangan template yang terlalu formal atau kaku`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `Kamu adalah CS expert yang ahli closing produk digital di Indonesia. Selalu respond dengan JSON valid.${(req as any).bpCtx || ""}`,
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 4000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      res.json(parsed);
    } catch (error) {
      console.error("Closing script error:", error);
      res.status(500).json({ error: "Gagal generate closing script" });
    }
  });

  // Funnel Planner endpoint
  app.post("/api/generate-funnel", async (req, res) => {
    try {
      const {
        productName,
        productType = "digital",
        productPrice = "",
        targetMarket,
        productBenefit = "",
        funnelModel = "ads_lp_wa",
        trafficSource = "Meta Ads (FB/IG)",
      } = req.body;

      const productTypeLabels: Record<string, string> = {
        digital: "Produk Digital (ebook/course/template/software)",
        physical: "Produk Fisik",
        service: "Jasa/Layanan",
        saas: "SaaS/Subscription",
      };

      const funnelModelLabels: Record<string, string> = {
        ads_lp_wa: "Ads → Landing Page → WhatsApp → Order",
        ads_lp_direct: "Ads → Landing Page → Checkout Langsung",
        ads_wa_direct: "Ads → WhatsApp Langsung",
        content_bio_lp: "Konten Organik → Bio Link → Landing Page",
        email_funnel: "Lead Magnet → Email Sequence → Penawaran",
        webinar: "Ads → Webinar/Live → Penawaran",
      };

      const prompt = `Kamu adalah digital marketing strategist Indonesia yang expert dalam merancang sales funnel untuk produk digital.

Rancang SALES FUNNEL LENGKAP untuk:
- Produk: "${productName}"
- Jenis: ${productTypeLabels[productType] || productType}
${productPrice ? `- Harga: ${productPrice}` : ""}
- Target Market: "${targetMarket}"
${productBenefit ? `- Manfaat Utama: ${productBenefit}` : ""}
- Model Funnel: ${funnelModelLabels[funnelModel] || funnelModel}
- Sumber Traffic: ${trafficSource}

Buat funnel dengan 5 tahap. Untuk setiap tahap, berikan detail dalam bahasa Indonesia:

Tahap-tahap WAJIB:
1. awareness - Kesadaran (menarik perhatian target market)
2. interest - Minat (membangun rasa tertarik)
3. consideration - Pertimbangan (meyakinkan untuk beli)
4. conversion - Konversi (closing/pembelian)
5. retention - Retensi (pembeli jadi repeat buyer / referral)

Format JSON:
{
  "summary": "Ringkasan strategi funnel 2-3 kalimat",
  "stages": [
    {
      "stage": "awareness",
      "label": "Nama Stage yang Menarik",
      "goal": "Tujuan spesifik tahap ini (1 kalimat)",
      "platform": "Platform/Channel yang digunakan",
      "message": "Pesan kunci yang ingin disampaikan di tahap ini",
      "copyExample": "Contoh copy/script nyata untuk tahap ini (bisa multi-line, cukup detail)",
      "metrics": "2-3 metrics yang harus dipantau",
      "tips": "1-2 tips praktis untuk optimasi tahap ini"
    }
  ]
}

Buat setiap stage SANGAT PRAKTIS dan ACTIONABLE. Copy example harus bisa langsung dipakai.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `Kamu adalah sales funnel expert Indonesia. Selalu respond dengan JSON valid sesuai format yang diminta.${(req as any).bpCtx || ""}`,
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 4000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      res.json(parsed);
    } catch (error) {
      console.error("Funnel planner error:", error);
      res.status(500).json({ error: "Gagal generate funnel" });
    }
  });

  // Ad Scale Advisor endpoint
  app.post("/api/ad-scale-advisor", async (req, res) => {
    try {
      const {
        platform = "meta",
        objective = "Konversi / Pembelian",
        status = "active_stable",
        dailyBudget,
        daysRunning,
        cpm = "",
        cpc = "",
        ctr = "",
        cpa = "",
        roas = "",
        conversionRate = "",
        totalSpend = "",
        totalConversions = "",
        productPrice = "",
        additionalContext = "",
      } = req.body;

      const platformNames: Record<string, string> = {
        meta: "Meta Ads (Facebook/Instagram)",
        tiktok: "TikTok Ads",
        google: "Google Ads",
      };

      const statusLabels: Record<string, string> = {
        learning: "Learning Phase",
        active_stable: "Aktif & Stabil",
        declining: "Performa Menurun",
        winning: "Winning (ROAS Tinggi)",
        new: "Baru Diluncurkan",
      };

      const prompt = `Kamu adalah expert digital advertising Indonesia yang sudah manage ratusan campaign Meta Ads, TikTok Ads, dan Google Ads dengan total budget miliaran rupiah.

Analisis data iklan berikut dan berikan rekomendasi SCALING:

PLATFORM: ${platformNames[platform] || platform}
TUJUAN: ${objective}
STATUS: ${statusLabels[status] || status}
BUDGET HARIAN: Rp ${dailyBudget}
SUDAH BERJALAN: ${daysRunning} hari
${productPrice ? `HARGA PRODUK: Rp ${productPrice}` : ""}

METRICS:
${cpm ? `• CPM: Rp ${cpm}` : ""}
${cpc ? `• CPC: Rp ${cpc}` : ""}
${ctr ? `• CTR: ${ctr}%` : ""}
${cpa ? `• CPA: Rp ${cpa}` : ""}
${roas ? `• ROAS: ${roas}x` : ""}
${conversionRate ? `• Conversion Rate: ${conversionRate}%` : ""}
${totalSpend ? `• Total Spend: Rp ${totalSpend}` : ""}
${totalConversions ? `• Total Konversi: ${totalConversions}` : ""}
${additionalContext ? `\nKONTEKS TAMBAHAN: ${additionalContext}` : ""}

Berikan analisis mendalam dan rekomendasi. Pilih SATU dari: scale_up (naikkan budget), scale_out (duplikasi/ekspansi), optimize (perbaiki dulu), kill (hentikan), wait (tunggu lebih lama).

Format respons JSON:
{
  "recommendation": "scale_up|scale_out|optimize|kill|wait",
  "confidence": 85,
  "summary": "Penjelasan singkat 2-3 kalimat kenapa rekomendasi ini",
  "reasons": [
    "Alasan 1 berdasarkan data",
    "Alasan 2 berdasarkan data",
    "Alasan 3 berdasarkan data"
  ],
  "actions": [
    {
      "priority": "high|medium|low",
      "action": "Judul action yang jelas",
      "detail": "Detail langkah spesifik yang harus dilakukan"
    }
  ],
  "scalingPlan": "Rencana scaling detail dan spesifik, step by step dengan angka konkret jika memungkinkan",
  "warningFlags": ["warning jika ada hal yang perlu diwaspadai, atau kosong array jika tidak ada"]
}

Berikan analisis yang JUJUR dan AKURAT berdasarkan data yang ada. Jika data kurang, tetap beri rekomendasi terbaik dengan asumsi yang logis.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `Kamu adalah ads scaling expert Indonesia. Selalu respond dengan JSON valid dan analisis yang akurat.${(req as any).bpCtx || ""}`,
          },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 3000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      res.json(parsed);
    } catch (error) {
      console.error("Ad scale advisor error:", error);
      res.status(500).json({ error: "Gagal analisis scaling" });
    }
  });

  // Ad analyzer endpoint (Pro+ only)
  app.post("/api/analyze-ad", async (req, res) => {
    try {
      const { adCopy, platform, objective } = req.body;

      const prompt = `Analisis iklan berikut untuk platform ${platform} dengan objective ${objective}:

"${adCopy}"

Berikan analisis dalam format JSON dengan struktur:
{
  "overallScore": (number 0-100),
  "categories": [
    {"name": "Hook Strength", "score": (0-100), "feedback": "...", "suggestions": ["...", "..."]},
    {"name": "Emotional Appeal", "score": (0-100), "feedback": "...", "suggestions": ["...", "..."]},
    {"name": "Value Proposition", "score": (0-100), "feedback": "...", "suggestions": ["...", "..."]},
    {"name": "Call to Action", "score": (0-100), "feedback": "...", "suggestions": ["...", "..."]},
    {"name": "Platform Fit", "score": (0-100), "feedback": "...", "suggestions": ["...", "..."]}
  ],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "actionItems": ["action1", "action2", "action3", "action4"]
}

Berikan feedback yang actionable dan spesifik untuk membuat iklan lebih winning.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: `You are an expert ad copywriter and marketing analyst. Analyze ads critically and provide actionable feedback. Always respond with valid JSON.${(req as any).bpCtx || ""}` },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 8000,
      });

      const content = response.choices[0]?.message?.content || "{}";
      
      let analysisData;
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        analysisData = JSON.parse(jsonMatch[1] || content);
      } catch (e) {
        analysisData = {
          overallScore: 65,
          categories: [
            { name: "Hook Strength", score: 60, feedback: "Hook bisa lebih kuat", suggestions: ["Tambahkan pertanyaan", "Gunakan angka spesifik"] },
            { name: "Emotional Appeal", score: 70, feedback: "Emosi cukup baik", suggestions: ["Tambah pain points"] },
            { name: "Value Proposition", score: 65, feedback: "Value proposition perlu diperkuat", suggestions: ["Highlight benefits"] },
            { name: "Call to Action", score: 60, feedback: "CTA perlu lebih compelling", suggestions: ["Tambah urgency"] },
            { name: "Platform Fit", score: 70, feedback: "Sesuai dengan platform", suggestions: ["Sesuaikan panjang copy"] },
          ],
          strengths: ["Copy cukup jelas", "Pesan utama tersampaikan"],
          weaknesses: ["Hook kurang kuat", "CTA bisa diperkuat"],
          actionItems: ["Perkuat hook di 3 kata pertama", "Tambahkan social proof", "Buat CTA lebih spesifik", "Test beberapa variasi"],
        };
      }

      res.json(analysisData);
    } catch (error) {
      console.error("Ad analysis error:", error);
      res.status(500).json({ error: "Failed to analyze ad" });
    }
  });

  // Audience generation endpoint (Pro+ only)
  app.post("/api/generate-audience", async (req, res) => {
    try {
      const { productDescription, interests = [], ageRange = "25-45" } = req.body;

      const prompt = `Berdasarkan produk berikut, buatkan 3 buyer persona yang detail:

Produk: ${productDescription}
Range Usia: ${ageRange}
${interests.length > 0 ? `Interests: ${interests.join(", ")}` : ""}

Untuk setiap persona, berikan dalam format JSON:
{
  "personas": [
    {
      "name": "Nama Persona (contoh: Sarah Si Profesional Muda)",
      "demographics": {
        "ageRange": "...",
        "gender": "...",
        "location": "...",
        "income": "...",
        "education": "...",
        "occupation": "..."
      },
      "psychographics": {
        "interests": ["...", "...", "..."],
        "values": ["...", "...", "..."],
        "painPoints": ["...", "...", "..."],
        "goals": ["...", "...", "..."],
        "behaviors": ["...", "..."]
      },
      "buyingBehavior": {
        "triggers": ["...", "...", "..."],
        "objections": ["...", "...", "..."],
        "preferredChannels": ["...", "...", "..."]
      }
    }
  ]
}

Buat persona yang realistis dan relevan dengan produk di Indonesia.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: `You are an expert marketing strategist who creates detailed buyer personas. Always respond with valid JSON.${(req as any).bpCtx || ""}` },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 4096,
      });

      const content = response.choices[0]?.message?.content || "{}";
      
      let personaData;
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        personaData = JSON.parse(jsonMatch[1] || content);
      } catch (e) {
        personaData = {
          personas: [
            {
              name: "Profesional Muda Ambisius",
              demographics: {
                ageRange: ageRange,
                gender: "Pria/Wanita",
                location: "Jakarta, Surabaya, Bandung",
                income: "Rp 10-20 juta/bulan",
                education: "S1/S2",
                occupation: "Manager/Supervisor",
              },
              psychographics: {
                interests: ["Karir", "Self-improvement", "Teknologi"],
                values: ["Efisiensi", "Kualitas", "Pertumbuhan"],
                painPoints: ["Waktu terbatas", "Kompetisi tinggi", "Stress kerja"],
                goals: ["Promosi", "Work-life balance", "Financial freedom"],
                behaviors: ["Research online sebelum beli", "Aktif di LinkedIn"],
              },
              buyingBehavior: {
                triggers: ["Testimoni positif", "Diskon terbatas", "Rekomendasi peer"],
                objections: ["Harga", "Waktu", "Tidak yakin efektif"],
                preferredChannels: ["Instagram", "LinkedIn", "Google Search"],
              },
            },
          ],
        };
      }

      res.json(personaData);
    } catch (error) {
      console.error("Audience generation error:", error);
      res.status(500).json({ error: "Failed to generate audience" });
    }
  });

  // Guide Chatbot endpoint using OpenAI (Replit AI Integration) - Attentive Agentic AI
  app.post("/api/guide-chat", async (req, res) => {
    try {
      const { message, history = [], context = {} } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required and must be a string" });
      }

      if (!Array.isArray(history)) {
        return res.status(400).json({ error: "History must be an array" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Build context-aware system prompt
      const contextInfo = `
KONTEKS USER SAAT INI:
- Status Login: ${context.isAuthenticated ? 'Sudah login' : 'Belum login (pengunjung)'}
- Nama User: ${context.userName || 'Pengunjung'}
- Halaman Saat Ini: ${context.currentPageTitle || 'Dashboard'} (${context.currentPage || '/'})
- Fitur yang Dapat Diakses: ${context.availableFeatures?.join(', ') || 'Semua fitur'}`;

      const systemPrompt = `Kamu adalah "Attentive Agentic AI" - asisten proaktif dan cerdas untuk aplikasi Marketing Tools AI. Kamu bukan hanya menjawab pertanyaan, tapi juga proaktif memberikan panduan, siap menerima tugas, dan mengarahkan user ke fitur yang tepat.

${contextInfo}

ALUR USER JOURNEY LENGKAP:

1. LANDING PAGE (untuk pengunjung belum login):
   - Pengunjung melihat halaman landing dengan penjelasan fitur
   - Ada tombol "Daftar Sekarang" dan "Login" untuk user yang sudah punya akun
   - Pengunjung bisa melihat daftar lengkap semua fitur dan testimoni

2. PROSES REGISTRASI & LOGIN:
   - User mendaftar dengan email, nama, dan password
   - Atau login dengan email dan password jika sudah punya akun
   - Setelah login, user masuk ke Dashboard utama dengan akses semua fitur

3. DASHBOARD (setelah login):
   - Halaman utama dengan akses cepat ke semua fitur
   - Menampilkan statistik penggunaan
   - Quick actions untuk fitur populer

DAFTAR LENGKAP FITUR APLIKASI:

A. WINNING CAMPAIGN SYSTEM (Sistem Iklan Sukses):
- Roadmap Winning (/winning-dashboard): Peta jalan lengkap untuk campaign iklan sukses dengan tracking progress. User bisa melihat tahapan dan progress mereka.
- Panduan Praktis (/winning-guide): 8 prinsip fundamental iklan winning:
  1. Hook yang menarik perhatian
  2. Emotional trigger yang tepat
  3. Value proposition yang jelas
  4. Call-to-Action yang kuat
  5. Targeting yang akurat
  6. Testing A/B
  7. Optimization berkelanjutan
  8. Scaling yang terukur
- Simulasi Beriklan (/ad-simulation): Simulasi interaktif untuk platform Meta Ads, Instagram, TikTok, LinkedIn, YouTube, Google Ads. Latihan beriklan tanpa keluar uang!
- Campaign Wizard (/campaign-wizard): Proses 5 langkah sistematis - Research, Audience, Competitors, Creative, Launch.
- Audience Builder (/audience-builder): Buat buyer persona detail dengan AI.
- Ad Analyzer (/campaign-analyzer): Analisis dan scoring copy iklan untuk improvement.

B. AI ASSISTANT:
- AI Chat (/ai-chat): Chat dengan AI untuk konsultasi marketing, brainstorming ide, dan strategi.
- AI Expert Chat (/ai-expert): Chat dengan AI persona spesialis (Marketing Expert, SEO Specialist, Copywriter Pro, Social Media Guru, dll).

C. AI CONTENT CREATOR:
- Image Creator (/ai-images): Generate gambar marketing berkualitas dengan AI.
- Article Creator (/ai-articles): Buat artikel SEO-optimized otomatis.
- Banner Creator (/ai-banners): Desain banner untuk iklan dan promosi.
- Video Creator (/ai-video): Pembuatan video marketing.

D. AI AUDIO:
- Text to Speech (/ai-tts): Konversi teks ke suara natural untuk voiceover.
- Speech to Text (/ai-stt): Transkripsi rekaman audio ke teks.

E. MARKETING TOOLS:
- Ad Creator (/ad-creator): Generate copy iklan untuk Meta, TikTok, Google, YouTube, LinkedIn.
- Story Telling (/story-telling): Buat narasi promosi yang engaging.
- AI Templates (/ai-templates): Library template marketing siap pakai.
- Landing Page Creator (/landing-page): Generate halaman landing HTML profesional.

CARA KAMU BEKERJA SEBAGAI ATTENTIVE AGENTIC AI:

1. PROAKTIF: Berikan saran dan langkah selanjutnya tanpa diminta
2. KONTEKSTUAL: Sesuaikan respons dengan halaman user saat ini dan fitur yang tersedia
3. SIAP TUGAS: Jika user minta bantuan tugas spesifik (buat iklan, analisis copy, dll), arahkan ke fitur yang tepat dan berikan panduan
4. JELASKAN ALUR: Selalu jelaskan proses dari awal sampai akhir dengan jelas

RESPONS BERDASARKAN KONTEKS:
- Jika user belum login: Jelaskan manfaat aplikasi dan arahkan untuk daftar/login
- Jika user sudah login: Semua fitur tersedia, bantu maksimalkan penggunaannya

CONTOH TUGAS YANG BISA KAMU BANTU:
- "Bantu saya buat iklan Facebook untuk produk skincare" -> Arahkan ke Ad Creator, berikan tips struktur iklan
- "Bagaimana cara meningkatkan konversi iklan saya?" -> Jelaskan prinsip dari Panduan Praktis, arahkan ke Ad Analyzer
- "Saya pemula, harus mulai dari mana?" -> Arahkan ke Winning Dashboard dan Simulasi Beriklan
- "Analisis copy iklan saya ini" -> Arahkan ke Ad Analyzer, jelaskan cara kerjanya

PENTING:
- Untuk user yang belum login, SELALU arahkan untuk daftar/login terlebih dahulu
- Semua fitur tersedia untuk user yang sudah login, tidak ada batasan

ATURAN FORMAT JAWABAN:
- JANGAN gunakan format markdown seperti **, *, #, ##, atau tanda formatting lainnya
- Gunakan teks biasa tanpa formatting khusus
- Untuk daftar, gunakan angka atau tanda hubung sederhana
- Jawab dengan paragraf yang rapi dan mudah dibaca
- Jawab dalam Bahasa Indonesia yang ramah dan profesional
- Berikan respons yang actionable dan praktis
- Sebutkan path/link ke fitur yang relevan agar user bisa langsung navigasi
- Berikan langkah konkret yang bisa langsung dilakukan user
- Jika fitur terkunci, SELALU tawarkan alternatif gratis dan arahkan ke upgrade`;

      // Build messages for OpenAI API
      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPrompt + ((req as any).bpCtx || "") },
      ];

      // Add history (filter out initial assistant greeting)
      for (const msg of history) {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          });
        }
      }

      // Add current user message
      messages.push({ role: "user", content: message });

      const stream = await openai.chat.completions.create({
        model: "gpt-5",
        messages,
        stream: true,
      });

      await pipeStreamToSSE(stream, res, "content");
    } catch (error) {
      console.error("Guide chat error:", error);
      res.status(500).json({ error: "Failed to process guide chat" });
    }
  });

  // Campaign Launcher - 1-click full marketing package
  app.post("/api/launch-campaign", async (req, res) => {
    try {
      const { productName, productType, productPrice, targetMarket, productBenefit, objective } = req.body;
      if (!productName || !productBenefit) {
        return res.status(400).json({ error: "productName dan productBenefit wajib diisi" });
      }

      const prompt = `Kamu adalah expert digital marketer Indonesia. Buat FULL CAMPAIGN PACKAGE untuk produk berikut:

Nama Produk: ${productName}
Jenis Produk: ${productType}
Harga: ${productPrice || "belum ditentukan"}
Target Market: ${targetMarket}
Manfaat/Hasil Utama: ${productBenefit}
Tujuan Campaign: ${objective}

Buat package lengkap dalam format JSON:
{
  "productName": "${productName}",
  "metaAds": [
    {
      "variation": 1,
      "hook": "Kalimat pembuka yang SANGAT menarik perhatian (1-2 kalimat, bisa pakai emoji)",
      "body": "Body copy iklan lengkap (3-5 paragraf, gunakan pain point, manfaat, social proof, FOMO)",
      "cta": "Teks CTA yang kuat + instruksi spesifik"
    },
    {
      "variation": 2,
      "hook": "Hook berbeda menggunakan pendekatan storytelling atau pertanyaan",
      "body": "Body dengan angle yang berbeda (fokus pada transformasi/hasil)",
      "cta": "CTA berbeda"
    },
    {
      "variation": 3,
      "hook": "Hook dengan social proof atau hasil nyata",
      "body": "Body dengan fokus pada urgency dan scarcity",
      "cta": "CTA berbeda"
    }
  ],
  "landingPage": {
    "headline": "Headline LP yang powerful (max 10 kata, bold promise)",
    "subheadline": "Sub-headline yang memperkuat headline (1-2 kalimat)",
    "bullets": ["benefit 1 spesifik", "benefit 2 spesifik", "benefit 3 spesifik", "benefit 4 spesifik", "benefit 5 spesifik"],
    "ctaText": "Teks tombol CTA",
    "urgency": "Kalimat urgency/scarcity untuk LP"
  },
  "whatsappBroadcast": {
    "cold": "WA broadcast untuk prospek dingin (yang belum kenal produk) - 150-200 kata, casual, buka dengan pertanyaan",
    "warm": "WA broadcast untuk prospek warm (sudah pernah interaksi) - 150-200 kata, lebih personal, follow up",
    "urgency": "WA blast urgency untuk closing - 100-150 kata, FOMO tinggi, deadline jelas"
  },
  "closingScript": "Script CS lengkap untuk WhatsApp/DM. Sertakan: greeting, qualifying questions, presentasi produk, handle objection (kemahalan, pikir2 dulu, nanti saja), dan closing hard. Format dialog [CS] dan [Prospek]. Min 400 kata.",
  "funnelSummary": "Rekomendasi alur funnel lengkap:\n1. Fase Awareness (traffic source & target audience)\n2. Fase Interest (konten yang menarik)\n3. Fase Consideration (nurturing & remarketing)\n4. Fase Conversion (closing strategy)\n5. Fase Retention (upsell & loyalty)\n\nSertakan estimasi budget awal dan KPI yang perlu dipantau.",
  "campaignTips": [
    "Tip optimasi spesifik 1 untuk ${objective}",
    "Tip optimasi spesifik 2 untuk target market ini",
    "Tip skala iklan setelah ada hasil",
    "Tip konten yang bekerja untuk produk ini",
    "Tip tracking & analisis performance"
  ]
}

PENTING: Semua konten dalam Bahasa Indonesia. Copy harus natural, persuasif, dan sesuai kultur marketing Indonesia. Gunakan kata-kata yang relate dengan target market.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah expert digital marketer Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      res.json(parsed);
    } catch (error) {
      console.error("Campaign launcher error:", error);
      res.status(500).json({ error: "Gagal generate campaign package" });
    }
  });

  // Content Repurposer - 1 content → many formats
  app.post("/api/repurpose-content", async (req, res) => {
    try {
      const { originalContent, contentType, selectedFormats } = req.body;
      if (!originalContent || !selectedFormats || selectedFormats.length === 0) {
        return res.status(400).json({ error: "originalContent dan selectedFormats wajib diisi" });
      }

      const formatInstructions: Record<string, string> = {
        fb_ad: "Facebook/Instagram Ad Copy: Hook kuat (1 kalimat), body 3 paragraf (pain-benefit-proof), CTA yang jelas. Sertakan emoji strategis. Max 300 kata.",
        ig_caption: "Instagram Caption: Pembuka menarik, storytelling singkat, value, hashtag relevan (10-15 hashtag). Max 150 kata + hashtag.",
        tiktok_hook: "TikTok/Video Short Script: Hook visual 3 detik pertama, script narasi 30-60 detik, ending dengan CTA. Format: [HOOK], [PROBLEM], [SOLUSI], [CTA]. Max 200 kata.",
        wa_broadcast: "WhatsApp Broadcast: Casual, personal, ada emoji, tidak terlalu formal. Buka dengan sapaan, sampaikan value, CTA ke link/reply. Max 200 kata.",
        yt_shorts: "YouTube Shorts Script: Hook verbal kuat (3 detik), konten edukasi/entertainment singkat, CTA subscribe/link. Format narasi dengan petunjuk visual. Max 200 kata.",
        twitter_thread: "Twitter/X Thread: Tweet 1 sebagai hook (max 280 karakter), lanjut 4-6 tweet sebagai isi, tweet terakhir sebagai CTA dan summary. Format: 1/ 2/ 3/ dst.",
        linkedin_post: "LinkedIn Post: Profesional tapi relatable, mulai dengan insight/fakta menarik, cerita pengalaman/case study, lesson learned, CTA untuk engage. Max 300 kata.",
        email_blast: "Email Broadcast: Subject line yang mengundang klik (max 50 karakter), preview text, opening yang personal, body dengan nilai tinggi, CTA jelas, signature. Max 300 kata total.",
        seo_meta: "SEO Meta Description: Ringkasan konten yang mengandung keyword utama, menarik untuk diklik dari hasil pencarian Google. Max 155 karakter. Sertakan juga 3 rekomendasi judul SEO.",
      };

      const formatsToGenerate = selectedFormats.filter((f: string) => formatInstructions[f]);
      const formatsStr = formatsToGenerate.map((f: string) => {
        return `"${f}": {
          "content": "${formatInstructions[f]}",
          "tips": "Tip spesifik untuk performa terbaik di platform ini (1 kalimat)"
        }`;
      }).join(",\n");

      const prompt = `Kamu adalah content marketing expert Indonesia yang ahli repurpose konten ke berbagai platform.

KONTEN ASAL (jenis: ${contentType}):
"""
${originalContent}
"""

Tugas: Repurpose konten di atas ke format-format berikut. Pertahankan INTI PESAN yang sama tapi sesuaikan gaya bahasa dan format untuk setiap platform.

Kembalikan dalam format JSON:
{
  "originalSummary": "Ringkasan 1 kalimat tentang inti konten asal",
  "repurposed": [
    ${formatsToGenerate.map((f: string) => `{
      "formatId": "${f}",
      "content": "[konten yang sudah direpurpose untuk ${f} - ${formatInstructions[f]}]",
      "tips": "[1 tip spesifik penggunaan di platform ini]"
    }`).join(",\n    ")}
  ]
}

PENTING: Semua konten dalam Bahasa Indonesia. Sesuaikan tone dan style untuk setiap platform. Pastikan konten terasa native di masing-masing platform, bukan copy-paste biasa.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah content strategist Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.75,
      });

      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      res.json(parsed);
    } catch (error) {
      console.error("Content repurposer error:", error);
      res.status(500).json({ error: "Gagal repurpose konten" });
    }
  });

  // ─── LP HTML Generator ────────────────────────────────────────────────────
  app.post("/api/generate-lp-html", async (req, res) => {
    try {
      const {
        template, gaya, warna, produk, tagline, target, offer,
        cta, noWa, harga, hargaCoret, enabledSections,
      } = req.body;
      if (!produk) return res.status(400).json({ error: "Produk wajib diisi" });

      const templateGuides: Record<string, string> = {
        product: "produk fisik e-commerce (fokus pada manfaat produk, social proof, COD/gratis ongkir jika ada, urgensi stok terbatas)",
        digital: "produk digital (ebook, template, software — fokus pada value delivered, akses instan, lifetime)",
        jasa: "jasa/service (fokus pada expertise, portofolio, proses kerja, garansi kepuasan)",
        kursus: "kursus/bootcamp online (fokus pada transformasi, kurikulum, mentor, alumni success story)",
        webinar: "webinar/event online (fokus pada tanggal, pembicara, what you'll learn, FOMO limited seats)",
        leadmagnet: "lead magnet/freebie (fokus pada gratis, nilai yang didapat, CTA ambil sekarang)",
      };

      const gayaGuides: Record<string, string> = {
        formal: "bahasa formal dan profesional, menggunakan 'Anda', tone terpercaya dan authority",
        santai: "bahasa santai dan friendly, menggunakan 'kamu', tone seperti teman yang membantu",
        gaul: "bahasa gaul dan relatable, menggunakan 'lo/gue', emoji sparingly, tone Gen-Z energy",
        provokatif: "bahasa provokatif dan challenging, buka dengan pertanyaan menantang, shock value tinggi",
        inspiratif: "bahasa inspiratif dan emosional, cerita transformasi, motivasi, harapan masa depan",
      };

      const activeSections = Object.entries(enabledSections || {})
        .filter(([, v]) => v)
        .map(([k]) => k);

      const sectionInstructions: Record<string, string> = {
        hero: `<HERO> Section: Headline utama yang powerful, subheadline yang menjelaskan benefit, CTA button yang bold`,
        masalah: `<MASALAH> Section: 3-4 pain points yang relatable untuk ${target || "target audiens"}, gunakan emoji, format list`,
        solusi: `<SOLUSI> Section: Perkenalkan produk sebagai solusi, benefit utama dalam format visual cards`,
        fitur: `<FITUR> Section: 4-6 fitur/detail produk dengan ikon dan deskripsi singkat`,
        bonus: `<BONUS> Section: Daftar bonus yang didapat, dengan nilai estimasi yang di-strikethrough`,
        testimoni: `<TESTIMONI> Section: 3-4 testimoni fiktif yang realistis dengan nama, foto placeholder, bintang rating`,
        harga: `<HARGA> Section: Pricing box yang eye-catching dengan harga coret, harga jual, list yang didapat, CTA button`,
        faq: `<FAQ> Section: 5-6 pertanyaan umum dengan jawaban yang meyakinkan, accordion style`,
        guarantee: `<GUARANTEE> Section: Badge/box garansi yang prominent, "no risk" messaging`,
        countdown: `<COUNTDOWN> Section: Urgency element dengan visual countdown timer (placeholder), teks batas waktu`,
        cta: `<CTA> Section: Final call-to-action yang kuat, summary singkat penawaran, tombol besar mencolok`,
      };

      const selectedSectionInstructions = activeSections
        .map((s) => sectionInstructions[s] || "")
        .filter(Boolean)
        .join("\n");

      const waLink = noWa ? `https://wa.me/${noWa.replace(/\D/g, "")}?text=Halo%2C%20saya%20tertarik%20dengan%20${encodeURIComponent(produk)}` : "#";
      const ctaText = cta || "PESAN SEKARANG";
      const primaryColor = warna?.hex || "#2563EB";
      const hargaDisplay = harga ? `Rp ${harga}` : "";
      const hargaCoretDisplay = hargaCoret ? `Rp ${hargaCoret}` : "";

      const prompt = `Kamu adalah web developer dan copywriter ahli Indonesia yang membuat landing page HTML berkualitas tinggi.

DETAIL PRODUK:
- Nama: ${produk}
- Tipe: ${templateGuides[template] || template}
- Tagline/Headline: ${tagline || "buat yang powerful dan sesuai produk"}
- Target Audiens: ${target || "pebisnis online Indonesia"}
- Penawaran/Offer: ${offer || "penawaran terbaik"}
- Harga Jual: ${hargaDisplay || "sesuaikan"}
- Harga Coret: ${hargaCoretDisplay || "tidak ada"}
- Teks CTA: ${ctaText}
- Link WhatsApp: ${waLink}
- Warna Tema Utama: ${primaryColor}

GAYA BAHASA: ${gayaGuides[gaya] || gayaGuides.santai}

SECTIONS YANG HARUS ADA (ikuti urutan ini):
${selectedSectionInstructions}

TUGAS: Buat COMPLETE HTML landing page yang:
1. Standalone (tidak butuh CDN/library external — CSS/JS inline semua)
2. Mobile-responsive (gunakan CSS flexbox/grid dengan media queries)
3. Desain profesional dan conversion-optimized
4. Copy persuasif dalam ${gayaGuides[gaya]}
5. Warna utama: ${primaryColor} (gunakan untuk buttons, highlights, accents)
6. CTA button link ke: ${waLink}
7. Smooth scroll, hover effects, dan animasi subtle

STRUKTUR HTML YANG DIHARAPKAN:
- <!DOCTYPE html> dengan meta viewport
- CSS inline di <style> tag (TIDAK ada link external, TIDAK ada CDN)
- JavaScript minimal inline untuk interaktivitas (FAQ accordion, smooth scroll)
- Responsive menggunakan media queries (breakpoint mobile: max-width 768px)
- Font: gunakan Google Fonts CDN (ini BOLEH: fonts.googleapis.com)
- Tidak ada gambar eksternal — gunakan background color/gradient sebagai pengganti foto produk
- Testimoni: gunakan initial-based avatar (div dengan background color dan huruf)

DESIGN GUIDELINES:
- Header sticky dengan nama produk/brand
- Hero section: full-width dengan gradient background, headline besar, CTA prominent
- Sections bergantian background: putih dan abu-abu muda (#f8f9fa)
- Cards dengan box-shadow halus
- Tombol CTA: background ${primaryColor}, hover lebih gelap, border-radius 8px, font-weight bold
- Footer dengan kontak dan copyright

RETURN: Hanya return raw HTML yang langsung bisa dipakai — dimulai dari <!DOCTYPE html> hingga </html>. JANGAN ada markdown code block (backtick), JANGAN ada penjelasan di luar HTML.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah web developer dan copywriter ahli. Gunakan konteks bisnis berikut untuk mempersonalisasi copy dan tone landing page:${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 8000,
      });

      let html = response.choices[0]?.message?.content || "";
      // Strip any accidental markdown fencing
      html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
      // Ensure it starts with DOCTYPE
      if (!html.startsWith("<!")) {
        const idx = html.indexOf("<!DOCTYPE");
        if (idx > 0) html = html.slice(idx);
      }
      res.json({ html });
    } catch (error) {
      console.error("LP HTML generator error:", error);
      res.status(500).json({ error: "Gagal generate landing page HTML" });
    }
  });

  // ─── Interest Finder AI ───────────────────────────────────────────────────
  app.post("/api/find-interests", async (req, res) => {
    try {
      const { keyword, deskripsiAudience, platform, tipe } = req.body;
      if (!keyword) return res.status(400).json({ error: "Keyword wajib diisi" });

      const prompt = `Kamu adalah pakar Facebook & Instagram Ads targeting untuk pasar Indonesia.

Produk/Niche: ${keyword}
Target audience: ${deskripsiAudience || "umum"}
Platform: ${platform || "Facebook & Instagram"}
Tipe bisnis: ${tipe || "produk"}

Tugas: Generate DAFTAR LENGKAP interest tersembunyi yang bisa digunakan untuk targeting iklan FB/IG.

Kategorikan dalam 5 kelompok:
1. direct — Interest langsung terkait produk (kata kunci eksak, brand kompetitor, nama produk)
2. adjacent — Interest yang adjacent/relevan (hobi, kebiasaan, lifestyle target audience)
3. behavioral — Behavioral & purchase behavior (online shopper, engaged shoppers, dll)
4. competitor — Brand kompetitor dan tokoh di niche tersebut
5. demographic — Interest demografis (pendidikan, pekerjaan, status, dll yang relevan)

Untuk setiap interest berikan:
- name: nama interest persis seperti di Meta Ads Manager (bahasa Indonesia atau Inggris)
- estimatedSize: estimasi ukuran audience Indonesia (e.g. "500K - 2M", "100K - 500K")
- competition: "Rendah" / "Sedang" / "Tinggi" (tinggi = banyak advertiser target ini)
- relevansi: angka 1-100 (seberapa relevan untuk produk ini)
- tip: (untuk top picks saja) kenapa interest ini potensial (1 kalimat)

Pilih juga 10 "topPicks" — interest dengan kombinasi relevansi tinggi + kompetisi rendah/sedang.

Berikan minimum 15 interest per kategori (total minimum 75 interests).

Sertakan juga 4-5 strategi targeting di "strategyNotes" dalam Bahasa Indonesia.

Format JSON:
{
  "totalCount": number,
  "topPicks": [{ "name": "...", "estimatedSize": "...", "competition": "...", "relevansi": number, "tip": "..." }],
  "categories": [
    {
      "id": "direct",
      "label": "Interest Langsung",
      "emoji": "🎯",
      "desc": "Interest eksak terkait produk/niche",
      "interests": [{ "name": "...", "estimatedSize": "...", "competition": "...", "relevansi": number }]
    },
    ... (4 kategori lain)
  ],
  "strategyNotes": ["...", "..."]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah Meta Ads interest research expert Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(data);
    } catch (error) {
      console.error("Interest finder error:", error);
      res.status(500).json({ error: "Gagal generate interests" });
    }
  });

  // ─── Audience Overlap Analyzer ────────────────────────────────────────────
  app.post("/api/audience-overlap", async (req, res) => {
    try {
      const { interests, negara } = req.body;
      if (!interests || interests.length < 2) return res.status(400).json({ error: "Minimal 2 interest" });

      const prompt = `Kamu adalah pakar Meta Ads targeting dan audience research untuk pasar Indonesia.

Daftar interests yang akan dianalisis:
${interests.map((i: string, idx: number) => `${idx + 1}. ${i}`).join("\n")}

Negara target: ${negara || "Indonesia"}

Analisis AUDIENCE OVERLAP antar interest-interest ini. Untuk setiap pasangan (pair) berikan:
- overlapPercent: estimasi persentase overlap (0-100)
- overlapSize: estimasi ukuran audience yang overlap
- risk: "Rendah" (<30%), "Sedang" (30-70%), "Tinggi" (>70%)
- action: rekomendasi tindakan (gabung / pisah / exclude)

Kemudian berikan:
1. Summary keseluruhan analisis (1-2 kalimat)
2. overallRisk: tingkat risiko keseluruhan
3. recommendedAdsets: rekomendasi struktur adset (bagaimana mengelompokkan interests ini)
4. interestsToExclude: interests yang sebaiknya di-exclude dari adset tertentu
5. optimizationTips: 4-5 tips optimasi budget iklan

Format JSON:
{
  "summary": "...",
  "overallRisk": "Rendah/Sedang/Tinggi",
  "pairs": [
    {
      "interest1": "...",
      "interest2": "...",
      "overlapPercent": number,
      "overlapSize": "...",
      "risk": "...",
      "action": "..."
    }
  ],
  "recommendedAdsets": [
    {
      "name": "...",
      "interests": ["...", "..."],
      "reason": "...",
      "estimatedReach": "...",
      "strategy": "..."
    }
  ],
  "interestsToExclude": [
    { "interest": "...", "from": "nama adset", "reason": "..." }
  ],
  "optimizationTips": ["...", "..."]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah Meta Ads targeting expert Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
        response_format: { type: "json_object" },
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(data);
    } catch (error) {
      console.error("Audience overlap error:", error);
      res.status(500).json({ error: "Gagal analisis overlap" });
    }
  });

  // ─── Auto Rule Builder ────────────────────────────────────────────────────
  app.post("/api/generate-auto-rules", async (req, res) => {
    try {
      const { objective, budget, targetCpa, targetRoas, platform, agresivitas, niche } = req.body;
      if (!budget) return res.status(400).json({ error: "Budget wajib diisi" });

      const prompt = `Kamu adalah pakar Facebook & Instagram Ads automation dan campaign optimization.

Parameter campaign:
- Niche/Produk: ${niche || "umum"}
- Objective: ${objective}
- Budget harian: Rp ${budget}
- Target ROAS: ${targetRoas || "tidak ditentukan"}
- Target CPA: Rp ${targetCpa || "tidak ditentukan"}
- Platform: ${platform}
- Agresivitas: ${agresivitas}

Generate 5 AUTOMATED RULES yang siap diimplementasikan di Meta Ads Manager untuk campaign ini.

Rules yang harus ada:
1. Stop Loss Rule — pause saat iklan boncos
2. Scale Winner Rule — naikkan budget saat ROAS/hasil bagus
3. Budget Protector Rule — lindungi budget dari pengeluaran berlebih
4. Frequency Cap Rule — pause saat frekuensi terlalu tinggi (audience fatigue)
5. Saturation Detector — duplicate atau adjust saat iklan mulai jenuh

Untuk setiap rule berikan detail yang SANGAT SPESIFIK dengan angka yang realistis sesuai budget dan objective.

Format JSON:
{
  "summary": "Ringkasan 5 rules yang dihasilkan untuk campaign ini",
  "rules": [
    {
      "id": "stop-loss",
      "name": "nama rule",
      "emoji": "emoji",
      "type": "stop-loss",
      "level": "Diterapkan di level: Campaign/Adset/Ad",
      "condition": "Kondisi lengkap dengan angka spesifik (IF CPA > Rp X DAN spend > Rp Y ...)",
      "action": "Aksi yang dilakukan (THEN: pause adset / kurangi budget X% / dll)",
      "why": "Penjelasan kenapa rule ini penting untuk campaign ini (2-3 kalimat)",
      "steps": [
        "Langkah 1: Buka Meta Ads Manager...",
        "Langkah 2: Klik tombol Automated Rules...",
        "... (5-7 langkah implementasi di UI Meta Ads Manager)"
      ],
      "metaConfig": {
        "applyTo": "All active adsets / specific campaign",
        "time": "Last 3 days / Last 7 days / etc",
        "conditions": [
          { "metric": "Cost per Result", "operator": "is greater than", "value": "Rp X", "window": "Last 3 days" }
        ],
        "actionType": "Turn off / Increase budget / Decrease budget",
        "actionValue": "20% / Rp 50000 / etc (jika applicable)",
        "notif": true
      }
    },
    ... (4 rules lainnya dengan type: "scale", "protector", "frequency", "saturation")
  ],
  "implementationOrder": [
    "Aktifkan rule X dulu karena...",
    ... (5 langkah urutan implementasi)
  ],
  "generalTips": [
    "Tips penting 1...",
    ... (5 tips)
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah Meta Ads automation expert Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
        response_format: { type: "json_object" },
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(data);
    } catch (error) {
      console.error("Auto rule builder error:", error);
      res.status(500).json({ error: "Gagal generate automation rules" });
    }
  });

  // ─── LP HTML Improve ──────────────────────────────────────────────────────
  app.post("/api/improve-lp-html", async (req, res) => {
    try {
      const { html, produk, template, warna } = req.body;
      if (!html) return res.status(400).json({ error: "HTML wajib ada" });

      const prompt = `Kamu adalah web developer dan conversion rate optimizer ahli Indonesia.

Berikut adalah HTML landing page yang sudah ada:
\`\`\`html
${html.slice(0, 12000)}
\`\`\`

TUGAS: Tingkatkan HTML landing page ini dengan cara:
1. Perkuat COPYWRITING — headline lebih punch, bullet points lebih benefit-focused, CTA lebih urgent
2. Perbaiki VISUAL DESIGN — spacing lebih konsisten, typography hierarchy lebih jelas, color contrast lebih baik
3. Tambahkan CONVERSION ELEMENTS — trust badges (pembeli, rating bintang), scarcity element, urgency messaging
4. Perkuat MOBILE EXPERIENCE — pastikan semua elemen perfect di layar kecil
5. Tambahkan SOCIAL PROOF — jumlah pembeli/pengguna di hero section, testimonial yang lebih compelling
6. Perbaiki FLOW — pastikan setiap section mengalir natural ke berikutnya dengan transition text

Produk: ${produk || "seperti di HTML"}
Template: ${template || "product"}
Warna utama: ${warna?.hex || "seperti di HTML"}

PENTING:
- Pertahankan semua section yang sudah ada
- Jangan hilangkan konten, hanya perkuat
- Tetap standalone HTML (tidak perlu CDN baru kecuali Google Fonts)
- Return HANYA raw HTML — tidak ada penjelasan, tidak ada markdown code block

Kembalikan versi HTML yang lebih baik dari original.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah web developer dan conversion rate optimizer Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 8000,
      });

      let improvedHtml = response.choices[0]?.message?.content || html;
      improvedHtml = improvedHtml.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
      if (!improvedHtml.startsWith("<!")) {
        const idx = improvedHtml.indexOf("<!DOCTYPE");
        if (idx > 0) improvedHtml = improvedHtml.slice(idx);
      }
      res.json({ html: improvedHtml });
    } catch (error) {
      console.error("LP improve error:", error);
      res.status(500).json({ error: "Gagal improve HTML" });
    }
  });

  // ─── Google Ads Creator ───────────────────────────────────────────────────
  app.post("/api/generate-google-ads", async (req, res) => {
    try {
      const { campaignType, objective, produk, url, keywords, targetAudience, usp, budget } = req.body;
      if (!produk) return res.status(400).json({ error: "Produk wajib diisi" });

      const typeGuides: Record<string, string> = {
        search: "Google Search Ads — RSA format, muncul di hasil pencarian, berbasis keyword intent",
        performance_max: "Performance Max — AI-driven, tampil di semua channel Google (Search, Display, YouTube, Gmail, Shopping)",
        display: "Google Display — banner visual di jutaan website Google Display Network",
        shopping: "Google Shopping — tampilkan produk dengan gambar, harga, dan nama toko di Google Search",
      };
      const objGuides: Record<string, string> = {
        sales: "Penjualan langsung — fokus pada strong CTA dan value proposition yang clear",
        leads: "Lead generation — fokus pada benefit dan low-friction CTA seperti 'Konsultasi Gratis'",
        traffic: "Website traffic — fokus pada curiosity dan informational angle",
        awareness: "Brand awareness — fokus pada memorable messaging dan brand nilai",
        app: "App downloads — fokus pada fitur unggulan dan benefit langsung",
      };

      const prompt = `Kamu adalah Google Ads specialist berpengalaman Indonesia yang ahli membuat iklan dengan Quality Score tinggi.

DETAIL KAMPANYE:
- Produk/Bisnis: ${produk}
- Tipe Kampanye: ${typeGuides[campaignType] || campaignType}
- Tujuan: ${objGuides[objective] || objective}
- URL: ${url || "tidak diisi"}
- Keyword utama: ${keywords || "belum ditentukan"}
- USP/Keunggulan: ${usp || "tidak disebutkan"}
- Target Audiens: ${targetAudience || "umum"}
- Budget harian: ${budget || "belum ditentukan"}

Buat kampanye Google Ads yang LENGKAP dan siap upload. PENTING: Headlines WAJIB max 30 karakter, descriptions WAJIB max 90 karakter. Hitung karakter dengan teliti!

KEMBALIKAN JSON dengan struktur TEPAT ini:
{
  "judulKampanye": "Nama kampanye yang deskriptif",
  "campaignType": "${campaignType}",
  "tujuan": "${objective}",
  "qualityScore": {
    "score": 8,
    "label": "Sangat Baik",
    "tips": [
      "Tip QS 1: pastikan keyword ada di headline",
      "Tip QS 2: landing page harus relevan dengan keyword",
      "Tip QS 3: gunakan ad extensions untuk boost CTR",
      "Tip QS 4: CTR yang tinggi meningkatkan Quality Score"
    ]
  },
  "adGroups": [
    {
      "nama": "Ad Group 1 — nama yang deskriptif",
      "keywords": [
        { "keyword": "keyword utama", "matchType": "Exact", "estimasiBid": "Rp 500–1.200/klik" },
        { "keyword": "keyword broad", "matchType": "Phrase", "estimasiBid": "Rp 300–800/klik" },
        { "keyword": "keyword lain", "matchType": "Broad", "estimasiBid": "Rp 200–600/klik" }
      ],
      "headlines": [
        { "teks": "Headline max 30 char", "karakter": 20, "pinned": "Posisi 1", "qsTip": "Mengandung keyword utama" },
        { "teks": "Headline 2", "karakter": 12, "qsTip": "Benefit statement" },
        { "teks": "Headline 3", "karakter": 10, "qsTip": "CTA yang jelas" }
      ],
      "descriptions": [
        { "teks": "Deskripsi pertama max 90 karakter dengan benefit utama dan CTA yang kuat", "karakter": 72, "qsTip": "Mengandung keyword dan CTA" },
        { "teks": "Deskripsi kedua max 90 karakter dengan social proof atau urgency element", "karakter": 73, "qsTip": "Menambah konteks dan urgensi" }
      ]
    }
  ],
  "extensions": [
    {
      "type": "Sitelinks",
      "items": ["Halaman 1 | URL sitelink 1", "Halaman 2 | URL sitelink 2", "Halaman 3 | URL sitelink 3", "Halaman 4 | URL sitelink 4"]
    },
    {
      "type": "Callouts",
      "items": ["Callout benefit 1", "Callout benefit 2", "Callout benefit 3", "Callout benefit 4", "Callout benefit 5"]
    },
    {
      "type": "Structured Snippets",
      "items": ["Header: Service", "Value 1", "Value 2", "Value 3"]
    }
  ],
  "negativeKeywords": ["negatif1", "negatif2", "negatif3", "negatif4", "negatif5", "negatif6", "negatif7", "negatif8"],
  "budgetStrategy": "Penjelasan strategi budget untuk ${budget || 'yang ditentukan'}: berapa budget recommended, distribusi waktu, dan cara scale up.",
  "biddingStrategy": "Penjelasan strategi bidding yang tepat: apakah Target CPA, Target ROAS, Maximize Conversions, atau Manual CPC — beserta alasannya untuk tujuan ${objective}.",
  "tips": [
    "Tip optimasi 1 spesifik untuk ${campaignType}",
    "Tip 2 tentang Quality Score dan Ad Rank",
    "Tip 3 tentang A/B testing headlines",
    "Tip 4 tentang monitoring dan negative keyword",
    "Tip 5 tentang koneksi dengan landing page"
  ]
}

ATURAN KERAS:
- SETIAP headline WAJIB ≤ 30 karakter (hitung ketat, tidak boleh lebih!)
- SETIAP description WAJIB ≤ 90 karakter (hitung ketat!)
- Buat minimal 2 ad groups dengan minimal 10 headlines dan 3 descriptions masing-masing
- "karakter" field harus sesuai dengan panjang teks sebenarnya
- Semua teks dalam Bahasa Indonesia yang natural dan persuasif`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah Google Ads specialist Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.75,
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      // Fix character counts server-side
      if (data.adGroups) {
        data.adGroups.forEach((group: any) => {
          group.headlines?.forEach((h: any) => { h.karakter = h.teks?.length || 0; });
          group.descriptions?.forEach((d: any) => { d.karakter = d.teks?.length || 0; });
        });
      }
      res.json(data);
    } catch (error) {
      console.error("Google ads error:", error);
      res.status(500).json({ error: "Gagal generate Google Ads" });
    }
  });

  // ─── Campaign Report Generator ────────────────────────────────────────────
  app.post("/api/generate-campaign-report", async (req, res) => {
    try {
      const { platform, period, namaBisnis, spend, revenue, impressions, clicks, conversions, ctr, cpc, cpa, roas, targetRoas, prevSpend, prevRevenue } = req.body;
      if (!spend && !revenue) return res.status(400).json({ error: "Minimal isi spend atau revenue" });

      const platformLabels: Record<string, string> = {
        meta: "Meta Ads (Facebook/Instagram)", google: "Google Ads",
        tiktok: "TikTok Ads", shopee: "Shopee Ads", multi: "Multi-Platform",
      };
      const periodLabels: Record<string, string> = {
        "7days": "7 Hari Terakhir", "14days": "14 Hari Terakhir",
        "30days": "30 Hari Terakhir", "90days": "90 Hari (1 Kuartal)",
      };

      const metrics = [
        spend && `Total Spend: Rp ${spend}`,
        revenue && `Total Revenue/Omset: Rp ${revenue}`,
        impressions && `Impressions: ${impressions}`,
        clicks && `Clicks: ${clicks}`,
        conversions && `Konversi/Order: ${conversions}`,
        ctr && `CTR: ${ctr}%`,
        cpc && `CPC: Rp ${cpc}`,
        cpa && `CPA: Rp ${cpa}`,
        roas && `ROAS Aktual: ${roas}x`,
        targetRoas && `Target ROAS: ${targetRoas}x`,
        prevSpend && `Spend Periode Sebelumnya: Rp ${prevSpend}`,
        prevRevenue && `Revenue Periode Sebelumnya: Rp ${prevRevenue}`,
      ].filter(Boolean).join("\n");

      const prompt = `Kamu adalah digital advertising analyst senior Indonesia yang ahli membuat laporan performa kampanye yang insightful dan actionable.

LAPORAN UNTUK:
- Bisnis/Brand: ${namaBisnis || "Tidak disebutkan"}
- Platform: ${platformLabels[platform] || platform}
- Periode Analisis: ${periodLabels[period] || period}

DATA METRIK:
${metrics}

Analisis data di atas secara mendalam dan hasilkan laporan performa kampanye yang komprehensif. Hitung semua turunan metrik yang bisa dihitung (misal: kalau ada spend dan revenue, hitung ROAS; kalau ada spend dan klik, hitung CPC; dll).

KEMBALIKAN JSON dengan struktur TEPAT ini:
{
  "judul": "Laporan Performa ${platformLabels[platform] || platform} — ${namaBisnis || 'Kampanye'}",
  "platform": "${platformLabels[platform] || platform}",
  "periode": "${periodLabels[period] || period}",
  "ringkasan": "Ringkasan eksekutif 3-4 kalimat yang menjelaskan performa keseluruhan, apa yang berjalan baik, dan apa yang perlu diperbaiki",
  "skor": {
    "total": 72,
    "label": "Cukup Baik",
    "keterangan": "Penjelasan singkat kenapa skor ini — apa yang mendorong dan menurunkan skor"
  },
  "kpis": [
    {
      "label": "ROAS",
      "nilai": "4.2x",
      "target": "5.0x",
      "perubahan": "+12% vs periode sebelumnya",
      "trend": "up",
      "status": "warning",
      "insight": "ROAS di bawah target tapi ada perbaikan. Perlu optimasi audience targeting."
    }
  ],
  "highlights": [
    { "tipe": "positive", "poin": "Hal positif yang terjadi dalam kampanye ini" },
    { "tipe": "negative", "poin": "Masalah atau area yang membutuhkan perhatian segera" },
    { "tipe": "neutral", "poin": "Insight informatif yang perlu diketahui" }
  ],
  "recommendations": [
    {
      "prioritas": "high",
      "kategori": "Bidding",
      "tindakan": "Tindakan konkret yang harus dilakukan",
      "dampak": "Estimasi dampak jika tindakan ini dilakukan",
      "cara": "Cara spesifik mengeksekusi tindakan ini di ${platformLabels[platform] || platform}"
    }
  ],
  "budgetAnalysis": {
    "total": "Rp ${spend || '0'}",
    "efisiensi": "Analisis seberapa efisien budget digunakan",
    "alokasi": "Saran alokasi budget yang lebih optimal",
    "rekomendasi": "Rekomendasi budget untuk periode berikutnya"
  },
  "nextSteps": [
    "Langkah prioritas 1 yang harus dilakukan dalam 1 minggu ke depan",
    "Langkah 2 untuk 2 minggu ke depan",
    "Langkah 3 untuk bulan depan",
    "Langkah 4 jangka menengah",
    "Langkah 5 strategis"
  ],
  "benchmarks": [
    {
      "metric": "ROAS",
      "nilaiKamu": "4.2x",
      "benchmark": "3.5-5x (${platformLabels[platform] || platform} e-commerce)",
      "status": "on"
    }
  ]
}

PANDUAN:
- Skor: 0-40 = Buruk, 41-60 = Perlu Perbaikan, 61-75 = Cukup Baik, 76-85 = Baik, 86-100 = Sangat Baik
- Trend: "up", "down", atau "flat"
- Status KPI: "good" (di atas target), "warning" (mendekati target/bisa lebih baik), "bad" (jauh dari target/bermasalah)
- Minimal 5 KPIs, 6 highlights (campuran positif/negatif/netral), 5 rekomendasi, 8 benchmarks
- Benchmark harus spesifik untuk ${platformLabels[platform] || platform} dan industri Indonesia
- Semua dalam Bahasa Indonesia yang profesional namun mudah dipahami
- Rekomendasi HARUS actionable, bukan sekedar saran umum`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah digital advertising analyst senior Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(data);
    } catch (error) {
      console.error("Campaign report error:", error);
      res.status(500).json({ error: "Gagal generate laporan" });
    }
  });

  // ─── Riset Keyword Marketplace ────────────────────────────────────────────
  app.post("/api/riset-keyword-marketplace", async (req, res) => {
    try {
      const { marketplace, produk, kategori, targetBuyer, budget } = req.body;
      if (!produk) return res.status(400).json({ error: "Nama produk wajib diisi" });

      const mpLabel: Record<string, string> = { shopee: "Shopee", tokopedia: "Tokopedia", both: "Shopee dan Tokopedia" };
      const budgetGuide: Record<string, string> = {
        low: "budget hemat <Rp 50.000/hari — prioritaskan keyword low & medium competition dengan long-tail",
        medium: "budget sedang Rp 50.000–200.000/hari — campuran medium dan beberapa high competition keyword",
        high: "budget besar >Rp 200.000/hari — bisa agresif bidding keyword high competition dan broad match",
      };

      const prompt = `Kamu adalah pakar iklan marketplace Indonesia yang sangat berpengalaman di ${mpLabel[marketplace] || marketplace}, Shopee Ads, dan Tokopedia Ads.

DETAIL PRODUK:
- Produk: ${produk}
- Kategori: ${kategori}
- Target Pembeli: ${targetBuyer || "umum"}
- Budget Iklan: ${budgetGuide[budget] || budgetGuide.medium}

Lakukan riset keyword yang komprehensif untuk produk ini. Buat keyword yang BENAR-BENAR dipakai orang Indonesia saat search di marketplace.

KEMBALIKAN JSON dengan struktur TEPAT ini:
{
  "produk": "${produk}",
  "marketplace": "${mpLabel[marketplace] || marketplace}",
  "kategori": "${kategori}",
  "summary": {
    "totalKeyword": 35,
    "estimasiBudgetMin": "Rp 30.000",
    "estimasiBudgetMax": "Rp 150.000",
    "strategi": "Penjelasan 2 kalimat strategi utama yang direkomendasikan untuk produk ini"
  },
  "groups": [
    {
      "label": "🎯 Keyword Utama (Generic)",
      "keywords": [
        {
          "keyword": "contoh keyword pendek umum",
          "tier": "high",
          "volume": "Sangat Tinggi (>100K/bln)",
          "competition": "Tinggi",
          "bidRange": "Rp 500–1.500/klik",
          "intent": "Browse / Discovery",
          "matchType": "Broad"
        }
      ]
    },
    {
      "label": "💡 Keyword Spesifik Produk",
      "keywords": []
    },
    {
      "label": "🔥 Keyword Branded / Varian",
      "keywords": []
    },
    {
      "label": "📍 Keyword Lokal / Geoterms",
      "keywords": []
    }
  ],
  "longTail": [
    "keyword long tail 1 yang spesifik dan intent beli",
    "keyword long tail 2",
    "minimal 12 keyword long tail"
  ],
  "negative": [
    "kata yang harus dihindari 1",
    "kata atau frasa negatif 2",
    "minimal 10 negative keyword"
  ],
  "bidStrategy": "Penjelasan lengkap strategi bidding yang direkomendasikan untuk budget ${budget}: kapan pakai manual bid vs auto bid, kapan naikkan bid, dan bagaimana struktur kampanye yang ideal. 3-4 kalimat.",
  "tips": [
    "Tip optimasi kampanye 1 spesifik untuk ${mpLabel[marketplace] || marketplace}",
    "Tip 2 tentang jadwal iklan (jam & hari terbaik)",
    "Tip 3 tentang struktur ad group",
    "Tip 4 tentang monitoring dan optimasi",
    "Tip 5 tentang A/B testing keyword"
  ]
}

PENTING:
- Setiap grup harus punya 5-10 keyword
- Tier: "high" = kompetisi tinggi bid mahal, "medium" = sweet spot, "low" = niche murah
- Keyword harus dalam Bahasa Indonesia yang natural, sesuai cara orang Indonesia search di marketplace
- bidRange dalam format Rupiah
- Total keyword groups + longTail harus sesuai totalKeyword
- Negative keyword harus spesifik dan relevan (hindari traffic tidak tertarget)`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah pakar iklan marketplace Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(data);
    } catch (error) {
      console.error("Keyword marketplace error:", error);
      res.status(500).json({ error: "Gagal generate keyword" });
    }
  });

  // ─── Spy Kompetitor ────────────────────────────────────────────────────────
  app.post("/api/spy-kompetitor", async (req, res) => {
    try {
      const { marketplace, produkKamu, kategori, infoKompetitor, keunggulanKamu, hargaKamu } = req.body;
      if (!produkKamu || !infoKompetitor) return res.status(400).json({ error: "Produk dan info kompetitor wajib diisi" });

      const mpLabel: Record<string, string> = {
        shopee: "Shopee", tokopedia: "Tokopedia", tiktokshop: "TikTok Shop",
        instagram: "Instagram/Facebook", umum: "marketplace umum",
      };

      const prompt = `Kamu adalah business intelligence analyst dan competitive strategy expert yang sangat berpengalaman di marketplace Indonesia.

PRODUK/BISNIS KAMU:
- Produk: ${produkKamu}
- Kategori: ${kategori}
- Harga: ${hargaKamu || "belum ditentukan"}
- Keunggulan/USP: ${keunggulanKamu || "belum disebutkan"}
- Platform: ${mpLabel[marketplace] || marketplace}

INFO KOMPETITOR YANG DIOBSERVASI:
"""
${infoKompetitor}
"""

Lakukan analisis kompetitor yang mendalam dan berikan competitive intelligence yang actionable.

KEMBALIKAN JSON dengan struktur TEPAT ini:
{
  "ringkasan": "Ringkasan eksekutif 2 kalimat tentang posisi kompetitor dan peluang untuk produk kamu",
  "positioningKompetitor": "Deskripsi positioning kompetitor: siapa target mereka, value prop utama, dan strategi jualan yang terlihat",
  "kekuatan": [
    {
      "poin": "Nama kekuatan singkat",
      "detail": "Penjelasan detail kenapa ini jadi kekuatan dan bagaimana dampaknya ke market"
    }
  ],
  "kelemahan": [
    {
      "poin": "Nama kelemahan singkat — ini celah untuk kamu!",
      "detail": "Penjelasan detail kelemahannya dan bagaimana kamu bisa manfaatkan celah ini"
    }
  ],
  "pricePositioning": {
    "label": "Posisi harga kompetitor (misal: Premium / Mid-range / Budget)",
    "rentang": "Estimasi atau info rentang harga berdasarkan data yang diberikan",
    "rekomendasi": "Rekomendasi strategi harga untuk produk kamu relative terhadap kompetitor, dengan penjelasan taktik (misal: price anchor, value bundling, dll)"
  },
  "differentiators": [
    {
      "angle": "Angle diferensiasi yang bisa digunakan (singkat, max 5 kata)",
      "taktik": "Cara konkret mengeksekusi angle ini di produk/toko kamu",
      "alasan": "Kenapa angle ini akan efektif vs kompetitor ini",
      "effort": "rendah"
    }
  ],
  "targetMarketInsight": "Analisis tentang target market kompetitor vs target market yang sebaiknya kamu bidik untuk menghindari head-to-head competition",
  "keywordKompetitor": [
    {
      "keyword": "keyword yang kemungkinan dipakai kompetitor",
      "context": "Kenapa keyword ini kemungkinan dipakai dan bagaimana kamu bisa pakai juga atau bidik versi long-tailnya"
    }
  ],
  "rekomendasi": [
    "Rekomendasi strategis jangka menengah 1",
    "Rekomendasi 2",
    "Rekomendasi 3",
    "Rekomendasi 4"
  ],
  "quickWins": [
    "Aksi konkret yang bisa dilakukan minggu ini untuk mulai mengungguli kompetitor",
    "Quick win 2",
    "Quick win 3",
    "Quick win 4",
    "Quick win 5"
  ],
  "warningFlags": [
    "Hal yang perlu diwaspadai dari kompetitor ini",
    "Warning flag 2 jika relevan"
  ]
}

PENTING:
- Minimal 4 kekuatan dan 4 kelemahan
- Minimal 5 differentiators dengan effort level: "rendah", "sedang", atau "tinggi"
- Minimal 8 keyword kompetitor
- Minimal 5 quick wins yang benar-benar actionable
- Semua analisis dalam Bahasa Indonesia yang natural
- Fokus pada insight yang ACTIONABLE, bukan sekadar deskriptif`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah competitive intelligence analyst Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.75,
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(data);
    } catch (error) {
      console.error("Spy kompetitor error:", error);
      res.status(500).json({ error: "Gagal analisis kompetitor" });
    }
  });

  // ─── Video Script Generator ───────────────────────────────────────────────
  app.post("/api/generate-video-script", async (req, res) => {
    try {
      const { platform, topik, produk, objective, videoStyle, duration, targetAudience } = req.body;
      if (!topik) return res.status(400).json({ error: "Topik wajib diisi" });

      const platformLabels: Record<string, string> = { tiktok: "TikTok", reels: "Instagram Reels", shorts: "YouTube Shorts" };
      const objectiveGuides: Record<string, string> = {
        viral: "konten hiburan mengejutkan / relatable yang memancing share dan comment",
        edukasi: "tips praktis yang memberikan value nyata, listicle atau step-by-step",
        jualan: "promosi produk dengan soft-selling yang natural, tidak terkesan pushy",
        awareness: "perkenalan brand dengan cerita yang memorable",
        review: "ulasan jujur dengan Pro dan Con yang balans",
        challenge: "ikut trend atau buat challenge yang mengundang partisipasi",
        story: "storytelling emosional dengan arc: masalah → titik balik → transformasi",
      };
      const styleGuides: Record<string, string> = {
        talking_head: "presenter berbicara langsung ke kamera, ekspresif, eye contact",
        voiceover: "narasi suara di atas footage/gambar, tanpa tampil di frame",
        text_visual: "teks berjalan di atas visual/footage, minimal atau tanpa suara vokal",
        tutorial: "screen recording atau demo langsung, show don't tell",
        pov: "sudut pandang orang pertama, casual, immersive",
      };

      const prompt = `Kamu adalah video content strategist dan scriptwriter viral Indonesia yang ahli bikin konten short-form untuk ${platformLabels[platform] || platform}.

BRIEF:
- Topik: ${topik}
- Produk/Brand: ${produk || "tidak ada"}
- Target Audiens: ${targetAudience || "umum"}
- Tujuan: ${objectiveGuides[objective] || objective}
- Style: ${styleGuides[videoStyle] || videoStyle}
- Durasi target: ${duration} detik

Buat script video yang SIAP PRODUKSI dengan struktur scene by scene. Bayangkan durasi ${duration} detik dibagi menjadi scene yang proporsional.

KEMBALIKAN JSON dengan struktur TEPAT ini:
{
  "judul": "Judul konten yang catchy (max 60 karakter)",
  "platform": "${platformLabels[platform] || platform}",
  "durasi": "${duration} detik",
  "hook": {
    "teks": "Kalimat/narasi hook 0-3 detik yang WAJIB buat orang stop scroll",
    "visual": "Deskripsi visual/aksi yang dilakukan di scene hook ini",
    "alasan": "Penjelasan singkat kenapa hook ini efektif secara psikologis"
  },
  "hookAlternatives": [
    "Alternatif hook versi 1 — format pertanyaan provokatif",
    "Alternatif hook versi 2 — format pernyataan shocking/bold",
    "Alternatif hook versi 3 — format POV atau relatable scenario"
  ],
  "scenes": [
    {
      "timestamp": "0-3 detik",
      "narasi": "Teks narasi/dialog yang diucapkan",
      "visual": "Arahan visual: framing, angle, aksi yang dilakukan",
      "textOverlay": "Teks yang muncul di layar (atau kosong jika tidak ada)",
      "broll": "Footage/gambar B-roll yang diperlukan (atau kosong)"
    }
  ],
  "cta": {
    "teks": "Narasi CTA di detik terakhir (maks 2 kalimat)",
    "visual": "Visual/gesture untuk CTA",
    "action": "Tindakan spesifik yang diinginkan dari penonton"
  },
  "caption": "Caption lengkap untuk posting di ${platformLabels[platform] || platform}, termasuk emoji, line break yang pas, dan hashtag di bagian bawah (10-15 hashtag)",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "tips": [
    "Tip produksi 1 untuk style ${videoStyle}",
    "Tip 2 tentang lighting/audio/editing untuk konten ini",
    "Tip 3 tentang waktu terbaik posting di ${platformLabels[platform] || platform}",
    "Tip 4 tentang cara meningkatkan engagement konten ini",
    "Tip 5 tentang optimasi algoritma ${platformLabels[platform] || platform}"
  ]
}

PENTING:
- Scenes harus total ~${duration} detik, bagi secara proporsional (biasanya 4-8 scenes untuk 30 detik)
- Narasi harus natural, bukan kaku
- Text overlay harus singkat dan impactful (max 5 kata per overlay)
- B-roll harus spesifik dan mudah dicari/dibuat
- Semua dalam Bahasa Indonesia yang sesuai dengan target audiens
- Hashtag harus mix antara trending dan niche`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah video content strategist Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(data);
    } catch (error) {
      console.error("Video script error:", error);
      res.status(500).json({ error: "Gagal generate script" });
    }
  });

  // ─── Hashtag Generator ─────────────────────────────────────────────────────
  app.post("/api/generate-hashtags", async (req, res) => {
    try {
      const { platform, niche, contentType, keywords } = req.body;

      const platformGuides: Record<string, string> = {
        tiktok: "TikTok: optimal 3-5 hashtag viral + 5-8 medium + 5-10 niche. Max 30. Gunakan mix bahasa Indonesia dan Inggris sesuai tren.",
        instagram: "Instagram: optimal 5-8 hashtag viral + 8-10 medium + 7-12 niche. Max 30. Lebih banyak niche untuk reach tertarget.",
        youtube: "YouTube Shorts: 3-5 hashtag saja, fokus pada discoverability dan SEO. Gunakan tag yang spesifik dan relevan.",
        facebook: "Facebook: 3-5 hashtag, tidak terlalu banyak. Fokus pada komunitas lokal Indonesia.",
        twitter: "X/Twitter: 1-3 hashtag yang trending, singkat dan tepat. Prioritaskan yang sedang viral.",
        linkedin: "LinkedIn: 3-5 hashtag profesional yang relevan dengan industri dan karir.",
      };

      const prompt = `Kamu adalah social media expert Indonesia yang sangat paham algoritma dan tren hashtag di berbagai platform.

BRIEF:
- Platform: ${platform}
- Niche/Industri: ${niche}
- Jenis Konten: ${contentType}
- Keyword tambahan: ${keywords || "tidak ada"}
- Panduan platform: ${platformGuides[platform] || "gunakan best practices umum"}

Generate paket hashtag yang dioptimalkan dengan strategi 3 tier:
- VIRAL: hashtag dengan jutaan post, jangkauan luas tapi kompetisi tinggi
- MEDIUM: hashtag 100rb-5jt post, sweet spot engagement
- NICHE: hashtag <100rb post, audiens spesifik dan tertarget

KEMBALIKAN JSON persis seperti ini:
{
  "platform": "${platform}",
  "niche": "${niche}",
  "tiers": [
    {
      "tier": "viral",
      "label": "Viral / Trending",
      "desc": "Jangkauan luas, banyak konten yang bersaing",
      "avgReach": "50M–500M+ post",
      "tags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5", "#Tag6", "#Tag7", "#Tag8"]
    },
    {
      "tier": "medium",
      "label": "Medium",
      "desc": "Sweet spot antara jangkauan dan relevansi",
      "avgReach": "1M–50M post",
      "tags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5", "#Tag6", "#Tag7", "#Tag8", "#Tag9", "#Tag10"]
    },
    {
      "tier": "niche",
      "label": "Niche / Spesifik",
      "desc": "Audiens tertarget, kompetisi rendah",
      "avgReach": "10K–1M post",
      "tags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5", "#Tag6", "#Tag7", "#Tag8", "#Tag9", "#Tag10", "#Tag11", "#Tag12"]
    }
  ],
  "recommended": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5", "#Tag6", "#Tag7", "#Tag8", "#Tag9", "#Tag10", "#Tag11", "#Tag12", "#Tag13", "#Tag14", "#Tag15", "#Tag16", "#Tag17", "#Tag18", "#Tag19", "#Tag20"],
  "caption": "Contoh caption singkat untuk ${contentType} di ${platform} dengan hashtag recommended di bawahnya. Tulis caption yang natural dan engaging, diakhiri dengan hashtag (pisahkan dengan line break).",
  "strategy": "Penjelasan 1-2 kalimat kenapa kombinasi hashtag ini optimal untuk ${platform} dan konten ${contentType}"
}

PENTING:
- Hashtag dalam Bahasa Indonesia DAN Inggris, disesuaikan dengan yang trending di Indonesia
- Semua hashtag harus relevan dengan niche ${niche} dan jenis konten ${contentType}
- recommended = campuran terbaik dari ketiga tier (balance antara reach dan konversi)
- Tidak ada hashtag duplikat antar tier
- Pastikan hashtag real dan lazim digunakan (bukan rekaan)`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah social media expert Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(data);
    } catch (error) {
      console.error("Hashtag generator error:", error);
      res.status(500).json({ error: "Gagal generate hashtag" });
    }
  });

  // WA Broadcast Sequence Generator
  app.post("/api/generate-wa-broadcast", async (req, res) => {
    try {
      const { produk, harga, segmen, durasi, usp, tone } = req.body;
      const segmenDesc: Record<string, string> = {
        new_lead: "lead baru yang baru masuk dari iklan, belum tahu banyak tentang produk",
        warm_lead: "lead hangat yang sudah tanya-tanya tapi belum memutuskan beli",
        hot_lead: "lead panas yang hampir deal, perlu sedikit dorongan untuk closing",
        past_buyer: "pembeli lama yang sudah pernah beli, potensi repeat order atau upsell",
        inactive: "pelanggan yang dulu aktif tapi sekarang sudah lama tidak berinteraksi",
        cart_abandon: "calon pembeli yang sudah tambah ke keranjang/cart tapi tidak checkout",
      };
      const prompt = `Kamu adalah pakar WhatsApp Marketing di Indonesia. Buat broadcast sequence lengkap untuk:
- Produk: ${produk}
- Harga: ${harga || "tidak disebutkan"}
- USP: ${usp || "tidak disebutkan"}
- Segmen: ${segmenDesc[segmen] || segmen}
- Durasi: ${durasi} hari
- Tone: ${tone}

Buat pesan follow-up yang natural, tidak spam, dan efektif untuk closing.

Balas dalam JSON PERSIS:
{
  "segmen": "nama segmen dalam Bahasa Indonesia yang deskriptif",
  "totalHari": ${durasi},
  "ringkasan": "strategi 1-2 kalimat untuk segmen ini",
  "sequence": [
    {
      "day": 1,
      "timing": "waktu optimal kirim, e.g. Senin pagi 09.00",
      "label": "nama fase, e.g. Perkenalan / Follow Up 1 / Last Chance",
      "tujuan": "tujuan pesan ini dalam 1 kalimat",
      "emoji": "1 emoji relevan",
      "pesan": "teks lengkap pesan WA, termasuk emoji, line break, dan CTA. Jangan lebih dari 200 kata. Tulis seperti pesan WA asli.",
      "catatan": "catatan opsional untuk pengirim (bisa null)"
    }
  ],
  "tipsUmum": ["tip 1", "tip 2", "tip 3", "tip 4"],
  "bestPractice": ["best practice 1", "best practice 2", "best practice 3"]
}

Buat ${Math.ceil(parseInt(durasi) / 2)} pesan dengan interval yang strategis (tidak setiap hari, ada jeda). Pastikan arc narasi: kenalan → nilai → sosial proof → urgensi → follow up terakhir.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah WhatsApp Marketing expert Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.75,
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(data);
    } catch (error) {
      console.error("WA Broadcast error:", error);
      res.status(500).json({ error: "Gagal generate WA broadcast sequence" });
    }
  });

  // CS Bot Script Builder
  app.post("/api/generate-cs-bot-script", async (req, res) => {
    try {
      const { produk, harga, deskripsiProduk, target, platform, tone } = req.body;
      const prompt = `Kamu adalah pakar CS automation dan chatbot WA terbaik di Indonesia. Buat script lengkap CS bot untuk:
- Produk/Bisnis: ${produk}
- Harga: ${harga || "belum disebutkan"}
- Deskripsi: ${deskripsiProduk || "tidak ada deskripsi tambahan"}
- Target customer: ${target || "umum"}
- Platform: ${platform}
- Kepribadian: ${tone}

Balas dalam JSON PERSIS:
{
  "pesanSelamatDatang": "pesan auto-reply pertama saat ada yang DM, 3-5 baris, natural, ada tombol menu (gunakan nomor 1. 2. 3.)",
  "pesanOffline": "pesan ketika di luar jam kerja, 2-3 baris",
  "pesanEskalasi": "pesan ketika CS bot tidak bisa jawab dan perlu eskalasi ke human, 2-3 baris",
  "qna": [
    {
      "pertanyaan": "pertanyaan yang sering diajukan",
      "jawaban": "jawaban lengkap yang bisa langsung dikirim oleh bot",
      "kategori": "Harga/Produk/Pengiriman/Garansi/Pembayaran/Lainnya",
      "prioritas": "Tinggi/Sedang/Rendah",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  "alurPercakapan": [
    {
      "step": 1,
      "trigger": "kondisi/trigger yang mengaktifkan step ini",
      "respon": "pesan yang dikirim bot",
      "nextStep": "nama step selanjutnya atau null",
      "isEscalation": false
    }
  ],
  "objeksiUmum": [
    {
      "objeksi": "keberatan yang sering diucapkan calon pembeli",
      "respon": "cara bot/CS merespons keberatan ini"
    }
  ],
  "platformRekomendasi": [
    {
      "nama": "nama platform",
      "fitur": "kenapa cocok untuk bisnis ini",
      "harga": "estimasi harga"
    }
  ],
  "tipsImplementasi": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]
}

Buat min 12 item Q&A, min 6 alur percakapan (termasuk 1 alur eskalasi), min 5 objeksi umum, 3 rekomendasi platform.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah CS automation expert Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(data);
    } catch (error) {
      console.error("CS Bot Script error:", error);
      res.status(500).json({ error: "Gagal generate CS bot script" });
    }
  });

  // Customer Journey Mapper
  app.post("/api/generate-customer-journey", async (req, res) => {
    try {
      const { produk, target, harga, model, kompetitor } = req.body;
      const prompt = `Kamu adalah pakar Customer Experience dan Marketing Strategy terbaik di Indonesia. Buat customer journey map lengkap untuk:
- Produk/Bisnis: ${produk}
- Target customer: ${target || "umum"}
- Harga: ${harga || "tidak disebutkan"}
- Model bisnis: ${model}
- Kompetitor: ${kompetitor || "tidak disebutkan"}

Buat 5 tahap journey yang komprehensif dan actionable.

Balas dalam JSON PERSIS:
{
  "produk": "${produk}",
  "ringkasan": "ringkasan strategi customer journey 2-3 kalimat",
  "stages": [
    {
      "id": "aware",
      "nama": "Aware",
      "emoji": "👀",
      "deskripsi": "deskripsi singkat tahap ini",
      "mindsetCustomer": "apa yang dipikirkan/dirasakan customer di tahap ini",
      "pertanyaanCustomer": ["pertanyaan 1", "pertanyaan 2", "pertanyaan 3"],
      "touchpoints": ["touchpoint1", "touchpoint2", "touchpoint3", "touchpoint4"],
      "konten": [
        {"tipe": "Video/Post/Story/dll", "contoh": "contoh konten spesifik"},
        {"tipe": "tipe2", "contoh": "contoh2"},
        {"tipe": "tipe3", "contoh": "contoh3"}
      ],
      "kpi": ["KPI 1", "KPI 2", "KPI 3"],
      "kesalahan": ["kesalahan 1", "kesalahan 2"],
      "peluang": "peluang utama di tahap ini yang bisa dioptimalkan"
    }
  ],
  "winningMoments": ["momen kritis 1", "momen kritis 2", "momen kritis 3", "momen kritis 4", "momen kritis 5"],
  "contentCalendar": [
    {
      "tahap": "nama tahap",
      "kontenIdea": "ide konten spesifik",
      "frekuensi": "berapa kali/minggu",
      "platform": "platform terbaik"
    }
  ],
  "bottlenecks": [
    {
      "tahap": "nama tahap",
      "masalah": "masalah umum di tahap ini",
      "solusi": "cara mengatasinya"
    }
  ]
}

5 stages wajib: aware, consideration, purchase, retention, advocacy. Buat sedetail dan seactionable mungkin, khusus untuk pasar Indonesia.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          ...((req as any).bpCtx ? [{ role: "system" as const, content: `Kamu adalah Customer Experience dan Marketing Strategy expert Indonesia.${(req as any).bpCtx}` }] : []),
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const data = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(data);
    } catch (error) {
      console.error("Customer Journey error:", error);
      res.status(500).json({ error: "Gagal generate customer journey map" });
    }
  });

  // --- WORKROOM: Agentic AI Marketing Team (MultiClaw + OpenClaw) ---

  const WORKROOM_AGENTS = [
    {
      id: "research",
      name: "OpenClaw-Research",
      role: "Riset & Intelijen Pasar",
      systemPrompt: `Kamu adalah OpenClaw-Research, Kepala Divisi Riset & Intelijen Pasar dalam AI Marketing Team bernama MultiClaw.
Kamu mengorkestrasi 4 sub-agen spesialis:
- **Audience Analyst**: Menganalisis profil, perilaku, dan psikografi target audience
- **Competitor Scout**: Memantau strategi, kelemahan, dan positioning kompetitor
- **Trend Watcher**: Mengidentifikasi tren pasar, viral content, dan peluang timing
- **Keyword Hunter**: Mencari keyword high-intent, volume tinggi, dan long-tail opportunities

Berikan laporan riset komprehensif dalam format:
## 👥 Audience Analyst
[laporan detail]
## 🔍 Competitor Scout
[laporan detail]
## 📈 Trend Watcher
[laporan detail]
## 🔑 Keyword Hunter
[laporan detail]

Bahasa Indonesia. Konkret, actionable, berbasis data. Maks 500 kata.`,
    },
    {
      id: "strategy",
      name: "OpenClaw-Strategy",
      role: "Strategi Marketing",
      systemPrompt: `Kamu adalah OpenClaw-Strategy, Kepala Divisi Strategi Marketing dalam AI Marketing Team bernama MultiClaw.
Kamu mengorkestrasi 4 sub-agen:
- **Campaign Strategist**: Merancang strategi campaign end-to-end
- **Funnel Architect**: Membangun dan mengoptimalkan marketing funnel
- **Budget Optimizer**: Mengalokasikan budget untuk ROI maksimal
- **A/B Test Designer**: Merancang eksperimen untuk validasi hipotesis

Format laporan:
## 🎯 Campaign Strategist
[laporan]
## 🏗️ Funnel Architect
[laporan]
## 💰 Budget Optimizer
[laporan]
## 🧪 A/B Test Designer
[laporan]

Bahasa Indonesia. Strategi spesifik, terukur, time-bound. Maks 500 kata.`,
    },
    {
      id: "creative",
      name: "OpenClaw-Creative",
      role: "Kreasi Konten & Iklan",
      systemPrompt: `Kamu adalah OpenClaw-Creative, Kepala Divisi Kreasi Konten & Iklan dalam AI Marketing Team bernama MultiClaw.
Kamu mengorkestrasi 4 sub-agen:
- **Copywriter Pro**: Membuat copy iklan persuasif dan sales copy yang convert
- **Visual Director**: Memberikan arahan visual, palet warna, dan konsep desain
- **Video Scripter**: Menulis script video ad, reel, dan konten video
- **Hook Specialist**: Menciptakan hook pembuka yang menarik perhatian dalam 3 detik

Format laporan:
## ✍️ Copywriter Pro
[laporan + contoh copy]
## 🎨 Visual Director
[laporan + arahan visual]
## 🎬 Video Scripter
[laporan + outline script]
## 🪝 Hook Specialist
[laporan + 3 contoh hook]

Sertakan contoh konkret. Bahasa Indonesia. Maks 500 kata.`,
    },
    {
      id: "media",
      name: "OpenClaw-Media",
      role: "Media Planning & Buying",
      systemPrompt: `Kamu adalah OpenClaw-Media, Kepala Divisi Media Planning & Buying dalam AI Marketing Team bernama MultiClaw.
Kamu mengorkestrasi 4 sub-agen:
- **Meta Ads Specialist**: Strategi Facebook/Instagram Ads, targeting, objective, placement
- **Google Ads Expert**: Search, Display, Shopping campaign strategy
- **TikTok Strategist**: TikTok Ads format, trend-jacking, organic + paid strategy
- **Influencer Coordinator**: Pemilihan KOL/KOC, brief, dan mekanisme kolaborasi

Format laporan:
## 📘 Meta Ads Specialist
[laporan]
## 🔍 Google Ads Expert
[laporan]
## 🎵 TikTok Strategist
[laporan]
## 🌟 Influencer Coordinator
[laporan]

Bahasa Indonesia. Spesifik per platform dengan targeting dan budget rekomendasi. Maks 500 kata.`,
    },
    {
      id: "analytics",
      name: "OpenClaw-Analytics",
      role: "Analitik & Performa",
      systemPrompt: `Kamu adalah OpenClaw-Analytics, Kepala Divisi Analitik & Performa dalam AI Marketing Team bernama MultiClaw.
Kamu mengorkestrasi 4 sub-agen:
- **Data Scientist**: Analisis data, segmentasi, dan pattern recognition
- **ROI Tracker**: Framework pengukuran ROI, ROAS, dan profitabilitas
- **Conversion Analyst**: Optimasi konversi, CRO, dan funnel analysis
- **Reporting Specialist**: Dashboard KPI, laporan performa, dan insight

Format laporan:
## 📊 Data Scientist
[laporan]
## 💹 ROI Tracker
[laporan + KPI table]
## 🎯 Conversion Analyst
[laporan]
## 📋 Reporting Specialist
[laporan + metric prioritas]

Bahasa Indonesia. Sertakan KPI spesifik, benchmark, dan threshold sukses. Maks 500 kata.`,
    },
    {
      id: "crm",
      name: "OpenClaw-CRM",
      role: "Customer Relationship",
      systemPrompt: `Kamu adalah OpenClaw-CRM, Kepala Divisi Customer Relationship Management dalam AI Marketing Team bernama MultiClaw.
Kamu mengorkestrasi 4 sub-agen:
- **Retention Specialist**: Strategi mempertahankan customer, churn prevention
- **Email Marketer**: Sequence email, automation, segmentasi, dan personalisasi
- **Community Manager**: Membangun dan mengelola komunitas brand
- **Loyalty Designer**: Program loyalitas, reward, dan gamifikasi

Format laporan:
## 🔄 Retention Specialist
[laporan]
## 📧 Email Marketer
[laporan + sequence outline]
## 👥 Community Manager
[laporan]
## 🏆 Loyalty Designer
[laporan + program outline]

Bahasa Indonesia. Fokus pada lifetime value dan customer advocacy. Maks 500 kata.`,
    },
    {
      id: "content",
      name: "OpenClaw-Content",
      role: "SEO & Konten Organik",
      systemPrompt: `Kamu adalah OpenClaw-Content, Kepala Divisi SEO & Konten Organik dalam AI Marketing Team bernama MultiClaw.
Kamu mengorkestrasi 4 sub-agen:
- **SEO Specialist**: On-page SEO, technical SEO, link building strategy
- **Blog Writer**: Topik artikel, content brief, dan editorial guideline
- **Social Media Manager**: Strategi organik per platform, content pillars, engagement
- **Content Planner**: Content calendar, content mix, dan distribusi konten

Format laporan:
## 🔎 SEO Specialist
[laporan]
## 📝 Blog Writer
[laporan + topik pilihan]
## 📱 Social Media Manager
[laporan]
## 📅 Content Planner
[laporan + calendar outline]

Bahasa Indonesia. Strategi organik jangka panjang yang berkelanjutan. Maks 500 kata.`,
    },
  ];

  const MULTICLAW_INTRO_PROMPT = `Kamu adalah MultiClaw, Master Orchestrator AI Marketing Team — sistem multi-agen marketing paling komprehensif.

Kamu memimpin 7 divisi OpenClaw yang masing-masing mengorkestrasi 4 sub-agen spesialis (total 28 agen aktif):
- OpenClaw-Research (Riset & Intelijen Pasar)
- OpenClaw-Strategy (Strategi Marketing)
- OpenClaw-Creative (Kreasi Konten & Iklan)
- OpenClaw-Media (Media Planning & Buying)
- OpenClaw-Analytics (Analitik & Performa)
- OpenClaw-CRM (Customer Relationship)
- OpenClaw-Content (SEO & Konten Organik)

Saat menerima brief marketing dari manusia, buka rapat koordinasi dengan authority. Jelaskan secara singkat:
1. Analisis brief tersebut
2. Divisi mana yang paling relevan dan mengapa
3. Kerangka besar strategi yang akan dijalankan

Gaya: profesional, tegas, visioner. Bahasa Indonesia. Maks 4 paragraf.`;

  const MULTICLAW_SYNTHESIS_PROMPT = `Kamu adalah MultiClaw, Master Orchestrator AI Marketing Team.

Seluruh 7 divisi OpenClaw telah menyelesaikan laporan mereka. Sekarang berikan MASTER ACTION PLAN yang mensintesis semua masukan menjadi langkah-langkah aksi yang terkoordinasi.

Format wajib:
## 🦂 MASTER ACTION PLAN — MULTICLAW

### ⚡ Quick Wins (7 Hari Pertama)
1. [aksi konkret + PIC divisi]
2. [aksi konkret + PIC divisi]
3. [aksi konkret + PIC divisi]

### 📅 Strategi 30 Hari
- [milestone + koordinasi antar divisi]

### 🎯 KPI Utama yang Harus Dicapai
- [metric spesifik]

### 🔗 Sinergi Antar Divisi
- [bagaimana divisi-divisi bekerja bersama]

Tegas, actionable, terkoordinasi. Bahasa Indonesia. Maks 400 kata.`;

  app.post("/api/workroom/session", async (req, res) => {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ error: "Brief tidak boleh kosong" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const write = (data: object) => {
      if (!res.writableEnded) res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      // Phase 1: MultiClaw intro
      const introStream = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: MULTICLAW_INTRO_PROMPT + ((req as any).bpCtx || "") },
          { role: "user", content: message },
        ],
        stream: true,
        max_completion_tokens: 8000,
      });

      for await (const chunk of introStream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) write({ agent: "multiclaw", phase: "intro", content });
      }
      write({ agent: "multiclaw", phase: "intro_done" });

      // Phase 2: All 7 OpenClaw agents in parallel
      const agentPromises = WORKROOM_AGENTS.map(async (agent) => {
        try {
          const agentStream = await openai.chat.completions.create({
            model: "gpt-5",
            messages: [
              { role: "system", content: agent.systemPrompt + ((req as any).bpCtx || "") },
              {
                role: "user",
                content: `Brief marketing dari klien:\n\n"${message}"\n\nBerikan laporan lengkap dari perspektif ${agent.role}. Aktifkan semua sub-agen kamu.`,
              },
            ],
            stream: true,
            max_completion_tokens: 8000,
          });

          for await (const chunk of agentStream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) write({ agent: agent.id, phase: "report", content });
          }
          write({ agent: agent.id, phase: "done" });
        } catch (err) {
          console.error(`OpenClaw ${agent.id} error:`, err);
          write({ agent: agent.id, phase: "error" });
        }
      });

      await Promise.all(agentPromises);

      // Phase 3: MultiClaw synthesis
      const synthesisStream = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: MULTICLAW_SYNTHESIS_PROMPT + ((req as any).bpCtx || "") },
          {
            role: "user",
            content: `Brief awal klien: "${message}"\n\nSemua 7 divisi OpenClaw telah melaporkan. Berikan sintesis dan Master Action Plan final.`,
          },
        ],
        stream: true,
        max_completion_tokens: 8000,
      });

      for await (const chunk of synthesisStream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) write({ agent: "multiclaw", phase: "synthesis", content });
      }

      write({ done: true });
      res.end();
    } catch (error) {
      console.error("Workroom session error:", error);
      write({ error: "Workroom session gagal. Coba lagi." });
      res.end();
    }
  });

  // --- WORKROOM: Campaign Project Hub (Persistent Projects + Deliverables) ---

  const PHASE_NAMES: Record<number, string> = {
    1: "Riset & Intelijen",
    2: "Kreasi Konten",
    3: "Campaign Launch",
    4: "Analitik & Konversi",
  };

  const PHASE_AGENTS: Record<number, Array<{
    id: string; name: string; emoji: string;
    deliverables: Array<{ type: string; targetTool: string; targetToolName: string }>;
    systemPrompt: string;
  }>> = {
    1: [
      {
        id: "research", name: "OpenClaw-Research", emoji: "🔬",
        deliverables: [
          { type: "audience_persona", targetTool: "/audience-builder", targetToolName: "Audience Builder" },
          { type: "interest_list", targetTool: "/interest-finder", targetToolName: "Interest Finder" },
        ],
        systemPrompt: `Kamu adalah OpenClaw-Research, spesialis riset & intelijen pasar dalam AI Marketing Team.
Berdasarkan brief kampanye yang diberikan, hasilkan 2 deliverable konkret dalam format JSON array berikut.
PENTING: Kembalikan HANYA JSON array, tanpa markdown, tanpa teks penjelasan.

Format:
[
  {
    "type": "audience_persona",
    "title": "Audience Persona: [nama persona]",
    "content": "[profil lengkap audience persona: demografi, psikografi, pain point, motivasi, platform favorit, behavior online, contoh minat spesifik]"
  },
  {
    "type": "interest_list",
    "title": "Interest & Keyword List untuk Targeting",
    "content": "[daftar 20-30 interest/keyword spesifik untuk Facebook/Instagram/TikTok targeting, beserta volume & relevansi]"
  }
]

Bahasa Indonesia. Konkret, spesifik, langsung bisa dipakai.`,
      },
    ],
    2: [
      {
        id: "creative", name: "OpenClaw-Creative", emoji: "🎨",
        deliverables: [
          { type: "ad_copy", targetTool: "/ad-creator", targetToolName: "Ad Creator" },
          { type: "hook", targetTool: "/hook-generator", targetToolName: "Hook Generator" },
          { type: "video_script", targetTool: "/video-script", targetToolName: "Video Script" },
        ],
        systemPrompt: `Kamu adalah OpenClaw-Creative, spesialis kreasi konten & iklan dalam AI Marketing Team.
Berdasarkan brief kampanye, hasilkan 3 deliverable dalam format JSON array.
PENTING: Kembalikan HANYA JSON array, tanpa markdown, tanpa teks penjelasan.

Format:
[
  {
    "type": "ad_copy",
    "title": "Ad Copy — [Platform]",
    "content": "[headline primary text, description, CTA lengkap untuk Meta Ads / TikTok. Sertakan 2-3 variasi]"
  },
  {
    "type": "hook",
    "title": "Hook Pembuka — 5 Variasi",
    "content": "[5 hook kuat untuk video/copy yang grab attention dalam 3 detik, dengan penjelasan mengapa efektif]"
  },
  {
    "type": "video_script",
    "title": "Video Script — [30/60 detik]",
    "content": "[script video ad lengkap: hook, problem, solusi, CTA, dengan catatan visual dan VO]"
  }
]

Bahasa Indonesia. Persuasif, conversion-focused.`,
      },
      {
        id: "crm", name: "OpenClaw-CRM", emoji: "🤝",
        deliverables: [
          { type: "wa_broadcast", targetTool: "/wa-broadcast", targetToolName: "WA Broadcast" },
          { type: "cs_bot_script", targetTool: "/cs-bot-script", targetToolName: "CS Bot Script" },
        ],
        systemPrompt: `Kamu adalah OpenClaw-CRM, spesialis customer relationship dalam AI Marketing Team.
Berdasarkan brief kampanye, hasilkan 2 deliverable dalam format JSON array.
PENTING: Kembalikan HANYA JSON array, tanpa markdown, tanpa teks penjelasan.

Format:
[
  {
    "type": "wa_broadcast",
    "title": "WA Broadcast Sequence — [Nama Kampanye]",
    "content": "[3-5 pesan WA broadcast yang berbeda untuk follow-up leads: welcome message, value message, offer message, urgency message, closing message]"
  },
  {
    "type": "cs_bot_script",
    "title": "CS Bot Script — FAQ & Handling Objection",
    "content": "[script lengkap untuk CS/bot: greeting, FAQ answers, handling 5 objeksi umum, closing script]"
  }
]

Bahasa Indonesia. Natural, conversational, high-converting.`,
      },
    ],
    3: [
      {
        id: "media", name: "OpenClaw-Media", emoji: "📡",
        deliverables: [
          { type: "media_plan", targetTool: "/meta-ads", targetToolName: "Meta Ads" },
          { type: "budget_allocation", targetTool: "/campaign-launcher", targetToolName: "Campaign Launcher" },
        ],
        systemPrompt: `Kamu adalah OpenClaw-Media, spesialis media planning & buying dalam AI Marketing Team.
Berdasarkan brief kampanye, hasilkan 2 deliverable dalam format JSON array.
PENTING: Kembalikan HANYA JSON array, tanpa markdown, tanpa teks penjelasan.

Format:
[
  {
    "type": "media_plan",
    "title": "Media Plan — [Nama Kampanye]",
    "content": "[rencana media lengkap: platform mix (Meta/TikTok/Google), objective per platform, format iklan, placement, targeting approach, timeline per minggu]"
  },
  {
    "type": "budget_allocation",
    "title": "Budget Allocation & Bidding Strategy",
    "content": "[alokasi budget per platform dalam persentase dan estimasi Rp, bidding strategy per campaign, KPI per budget, projected reach & conversion]"
  }
]

Bahasa Indonesia. Terstruktur, terukur, langsung implementable.`,
      },
      {
        id: "execution", name: "OpenClaw-Execution", emoji: "🚀",
        deliverables: [
          { type: "launch_checklist", targetTool: "/execution-plan", targetToolName: "Execution Plan" },
          { type: "campaign_brief", targetTool: "/campaign-launcher", targetToolName: "Campaign Launcher" },
        ],
        systemPrompt: `Kamu adalah OpenClaw-Execution, spesialis campaign launch dalam AI Marketing Team.
Kamu memastikan eksekusi kampanye berjalan sempurna dari pre-launch hingga go-live.
Berdasarkan brief kampanye, hasilkan 2 deliverable dalam format JSON array.
PENTING: Kembalikan HANYA JSON array, tanpa markdown, tanpa teks penjelasan.

Format:
[
  {
    "type": "launch_checklist",
    "title": "Launch Checklist — Pre, During & Post Launch",
    "content": "[checklist lengkap: pre-launch (tracking setup, creative approval, audience setup), D-day launch (monitoring, backup plan), post-launch (optimasi hari 1-7)]"
  },
  {
    "type": "campaign_brief",
    "title": "Campaign Launch Brief — [Nama Kampanye]",
    "content": "[brief lengkap kampanye: objective, target audience, USP, key message, timeline, success metrics, escalation protocol]"
  }
]

Bahasa Indonesia. Operasional, detail, actionable.`,
      },
    ],
    4: [
      {
        id: "analytics", name: "OpenClaw-Analytics", emoji: "📊",
        deliverables: [
          { type: "kpi_framework", targetTool: "/campaign-analyzer", targetToolName: "Campaign Analyzer" },
          { type: "tracking_setup", targetTool: "/campaign-report", targetToolName: "Campaign Report" },
        ],
        systemPrompt: `Kamu adalah OpenClaw-Analytics, spesialis analitik & performa dalam AI Marketing Team.
Berdasarkan brief kampanye, hasilkan 2 deliverable dalam format JSON array.
PENTING: Kembalikan HANYA JSON array, tanpa markdown, tanpa teks penjelasan.

Format:
[
  {
    "type": "kpi_framework",
    "title": "KPI Framework — [Nama Kampanye]",
    "content": "[framework KPI lengkap: KPI utama & secondary, target angka spesifik, benchmark industri, threshold untuk scale/stop campaign, ritme review (daily/weekly)]"
  },
  {
    "type": "tracking_setup",
    "title": "Tracking & Reporting Setup",
    "content": "[panduan setup tracking: Meta Pixel events, UTM parameters, custom conversions, dashboard reporting template, metric yang harus dipantau tiap hari]"
  }
]

Bahasa Indonesia. Berbasis data, dengan angka target spesifik.`,
      },
      {
        id: "conversion", name: "OpenClaw-Conversion", emoji: "💰",
        deliverables: [
          { type: "cs_closing", targetTool: "/cs-closing", targetToolName: "CS Closing" },
          { type: "customer_journey", targetTool: "/customer-journey", targetToolName: "Customer Journey" },
        ],
        systemPrompt: `Kamu adalah OpenClaw-Conversion, spesialis CS & closing dalam AI Marketing Team.
Kamu fokus mengoptimalkan konversi leads menjadi buyer melalui script closing dan customer journey optimization.
Berdasarkan brief kampanye, hasilkan 2 deliverable dalam format JSON array.
PENTING: Kembalikan HANYA JSON array, tanpa markdown, tanpa teks penjelasan.

Format:
[
  {
    "type": "cs_closing",
    "title": "CS Closing Script — [Nama Produk]",
    "content": "[script closing lengkap: opening yang warm, discovery questions, presenting solution, handling objeksi (harga/waktu/butuh pikir), closing technique, follow-up script]"
  },
  {
    "type": "customer_journey",
    "title": "Customer Journey Map — Awareness to Advocacy",
    "content": "[peta perjalanan customer: setiap touchpoint dari awareness → interest → desire → action → retention, pain point di setiap tahap, dan solusi optimasinya]"
  }
]

Bahasa Indonesia. Human, persuasif, conversion-focused.`,
      },
    ],
  };

  // GET /api/workroom/projects — list projects for the current user (with deliverable count)
  app.get("/api/workroom/projects", async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub ?? "";
      const projects = await db
        .select()
        .from(workroomProjects)
        .where(eq(workroomProjects.userId, userId))
        .orderBy(desc(workroomProjects.updatedAt));
      if (projects.length === 0) return res.json([]);
      // Attach deliverable counts in one query
      const counts = await db
        .select({ projectId: workroomDeliverables.projectId, total: count() })
        .from(workroomDeliverables)
        .where(inArray(workroomDeliverables.projectId, projects.map(p => p.id)))
        .groupBy(workroomDeliverables.projectId);
      const countMap = new Map(counts.map(c => [c.projectId, Number(c.total)]));
      res.json(projects.map(p => ({ ...p, deliverableCount: countMap.get(p.id) ?? 0 })));
    } catch (err) {
      console.error("Workroom list error:", err);
      res.status(500).json({ error: "Gagal memuat proyek" });
    }
  });

  // POST /api/workroom/projects — create project (scoped to current user)
  app.post("/api/workroom/projects", async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub ?? "";
      const { name, brief } = req.body;
      if (!name?.trim() || !brief?.trim()) {
        return res.status(400).json({ error: "Nama dan brief wajib diisi" });
      }
      const [project] = await db.insert(workroomProjects).values({
        userId,
        name: name.trim(),
        brief: brief.trim(),
        currentPhase: 0,
        status: "active",
      }).returning();
      res.json(project);
    } catch (err) {
      console.error("Workroom create error:", err);
      res.status(500).json({ error: "Gagal membuat proyek" });
    }
  });

  // GET /api/workroom/projects/:id — get project + deliverables (owner only)
  app.get("/api/workroom/projects/:id", async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub ?? "";
      const id = parseInt(req.params.id);
      const [project] = await db
        .select()
        .from(workroomProjects)
        .where(and(eq(workroomProjects.id, id), eq(workroomProjects.userId, userId)));
      if (!project) return res.status(404).json({ error: "Proyek tidak ditemukan" });
      const delivs = await db.select().from(workroomDeliverables)
        .where(eq(workroomDeliverables.projectId, id))
        .orderBy(workroomDeliverables.phase, workroomDeliverables.id);
      res.json({ project, deliverables: delivs });
    } catch (err) {
      console.error("Workroom get error:", err);
      res.status(500).json({ error: "Gagal memuat proyek" });
    }
  });

  // DELETE /api/workroom/projects/:id (owner only)
  app.delete("/api/workroom/projects/:id", async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub ?? "";
      const id = parseInt(req.params.id);
      const [project] = await db
        .select({ id: workroomProjects.id })
        .from(workroomProjects)
        .where(and(eq(workroomProjects.id, id), eq(workroomProjects.userId, userId)));
      if (!project) return res.status(404).json({ error: "Proyek tidak ditemukan" });
      await db.delete(workroomProjects).where(eq(workroomProjects.id, id));
      res.json({ ok: true });
    } catch (err) {
      console.error("Workroom delete error:", err);
      res.status(500).json({ error: "Gagal menghapus proyek" });
    }
  });

  // PATCH /api/workroom/deliverables/:id — update status or content
  app.patch("/api/workroom/deliverables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, content } = req.body;

      // Task #46: save a revision snapshot when content is being manually changed
      if (content) {
        const [current] = await db.select()
          .from(workroomDeliverables)
          .where(eq(workroomDeliverables.id, id));
        if (current && current.content !== content) {
          const existingRevs = await db
            .select({ id: workroomDeliverableRevisions.id })
            .from(workroomDeliverableRevisions)
            .where(eq(workroomDeliverableRevisions.deliverableId, id))
            .orderBy(workroomDeliverableRevisions.createdAt);
          await db.insert(workroomDeliverableRevisions).values({
            deliverableId: id,
            content: current.content,
            revisionInstructions: "Edit manual",
            versionNumber: existingRevs.length + 1,
          });
          // Keep at most 5 snapshots
          if (existingRevs.length >= 5 && existingRevs[0]) {
            await db.delete(workroomDeliverableRevisions)
              .where(eq(workroomDeliverableRevisions.id, existingRevs[0].id));
          }
        }
      }

      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (status) updates.status = status;
      if (content) updates.content = content;
      const [updated] = await db.update(workroomDeliverables)
        .set(updates as any)
        .where(eq(workroomDeliverables.id, id))
        .returning();
      res.json(updated);
    } catch (err) {
      console.error("Workroom deliverable patch error:", err);
      res.status(500).json({ error: "Gagal memperbarui deliverable" });
    }
  });

  // POST /api/workroom/deliverables/:id/revise — AI revision (Tasks #11 / #20 / #21)
  app.post("/api/workroom/deliverables/:id/revise", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { revisionInstructions } = req.body as { revisionInstructions?: string };
      if (!revisionInstructions?.trim()) {
        return res.status(400).json({ error: "Instruksi revisi tidak boleh kosong" });
      }

      // Load deliverable + its project for context
      const [deliverable] = await db
        .select()
        .from(workroomDeliverables)
        .where(eq(workroomDeliverables.id, id));
      if (!deliverable) return res.status(404).json({ error: "Deliverable tidak ditemukan" });

      const [project] = await db
        .select()
        .from(workroomProjects)
        .where(eq(workroomProjects.id, deliverable.projectId));

      const projectContext = project
        ? `Campaign: "${project.name}"\nBrief: ${project.brief}`
        : "";

      // Use gpt-5 for quality on par with original Workroom generation (Task #21, upgraded Task #44)
      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `Kamu adalah senior marketing copywriter Indonesia yang merevisi konten kampanye dengan kualitas tinggi. Pertahankan format, panjang, dan struktur asli kecuali instruksi meminta perubahan spesifik. Balas HANYA dengan konten yang sudah direvisi, tanpa penjelasan tambahan.${(req as any).bpCtx || ""}`,
          },
          {
            role: "user",
            content: `${projectContext ? projectContext + "\n\n" : ""}Tipe deliverable: ${deliverable.deliverableType}\nJudul: ${deliverable.title}\n\n---KONTEN ASLI---\n${deliverable.content}\n---AKHIR KONTEN---\n\nInstruksi revisi: ${revisionInstructions}`,
          },
        ],
        max_completion_tokens: 4000,
      });

      const revisedContent = completion.choices[0]?.message?.content?.trim() ?? deliverable.content;

      // Task #28: Save current content as a revision snapshot before overwriting
      const existingRevs = await db
        .select({ id: workroomDeliverableRevisions.id })
        .from(workroomDeliverableRevisions)
        .where(eq(workroomDeliverableRevisions.deliverableId, id))
        .orderBy(workroomDeliverableRevisions.createdAt);
      await db.insert(workroomDeliverableRevisions).values({
        deliverableId: id,
        content: deliverable.content,
        revisionInstructions: revisionInstructions ?? null,
        versionNumber: existingRevs.length + 1,
      });
      // Keep at most 5 snapshots — delete oldest if over limit
      if (existingRevs.length >= 5 && existingRevs[0]) {
        await db.delete(workroomDeliverableRevisions)
          .where(eq(workroomDeliverableRevisions.id, existingRevs[0].id));
      }

      const [updated] = await db
        .update(workroomDeliverables)
        .set({ content: revisedContent, status: "draft", updatedAt: new Date() } as any)
        .where(eq(workroomDeliverables.id, id))
        .returning();

      res.json(updated);
    } catch (err) {
      console.error("Workroom revise error:", err);
      res.status(500).json({ error: "Gagal merevisi deliverable" });
    }
  });

  // GET /api/workroom/deliverables/:id/revisions — list revision snapshots (Task #28)
  app.get("/api/workroom/deliverables/:id/revisions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req as any).user?.claims?.sub ?? "";
      const [deliverable] = await db.select({ projectId: workroomDeliverables.projectId })
        .from(workroomDeliverables).where(eq(workroomDeliverables.id, id));
      if (!deliverable) return res.status(404).json({ error: "Not found" });
      const [project] = await db.select({ userId: workroomProjects.userId })
        .from(workroomProjects).where(eq(workroomProjects.id, deliverable.projectId));
      if (!project || project.userId !== userId) return res.status(403).json({ error: "Forbidden" });
      const revisions = await db.select()
        .from(workroomDeliverableRevisions)
        .where(eq(workroomDeliverableRevisions.deliverableId, id))
        .orderBy(desc(workroomDeliverableRevisions.createdAt))
        .limit(5);
      res.json(revisions);
    } catch (err) {
      console.error("Get revisions error:", err);
      res.status(500).json({ error: "Gagal mengambil riwayat revisi" });
    }
  });

  // POST /api/workroom/deliverables/:id/revert/:revisionId — revert to a snapshot (Task #28)
  app.post("/api/workroom/deliverables/:id/revert/:revisionId", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const revisionId = parseInt(req.params.revisionId);
      const userId = (req as any).user?.claims?.sub ?? "";
      const [deliverable] = await db.select()
        .from(workroomDeliverables).where(eq(workroomDeliverables.id, id));
      if (!deliverable) return res.status(404).json({ error: "Not found" });
      const [project] = await db.select({ userId: workroomProjects.userId })
        .from(workroomProjects).where(eq(workroomProjects.id, deliverable.projectId));
      if (!project || project.userId !== userId) return res.status(403).json({ error: "Forbidden" });
      const [revision] = await db.select()
        .from(workroomDeliverableRevisions)
        .where(eq(workroomDeliverableRevisions.id, revisionId));
      if (!revision) return res.status(404).json({ error: "Revision not found" });
      // Save current as a snapshot before reverting
      const existingRevs = await db.select({ id: workroomDeliverableRevisions.id })
        .from(workroomDeliverableRevisions)
        .where(eq(workroomDeliverableRevisions.deliverableId, id));
      await db.insert(workroomDeliverableRevisions).values({
        deliverableId: id,
        content: deliverable.content,
        revisionInstructions: "Auto-saved sebelum revert",
        versionNumber: existingRevs.length + 1,
      });
      const [updated] = await db
        .update(workroomDeliverables)
        .set({ content: revision.content, status: "draft", updatedAt: new Date() } as any)
        .where(eq(workroomDeliverables.id, id))
        .returning();
      res.json(updated);
    } catch (err) {
      console.error("Revert error:", err);
      res.status(500).json({ error: "Gagal memulihkan revisi" });
    }
  });

  // DELETE /api/workroom/projects/:id/share — revoke the share link (Task #47)
  app.delete("/api/workroom/projects/:id/share", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req as any).user?.claims?.sub ?? "";
      if (!userId) return res.status(401).json({ error: "Login diperlukan" });
      const [project] = await db.select().from(workroomProjects)
        .where(eq(workroomProjects.id, id));
      if (!project) return res.status(404).json({ error: "Project tidak ditemukan" });
      if (project.userId !== userId) return res.status(403).json({ error: "Forbidden" });
      await db.update(workroomProjects).set({ shareToken: null } as any)
        .where(eq(workroomProjects.id, id));
      res.json({ ok: true });
    } catch (err) {
      console.error("Revoke share error:", err);
      res.status(500).json({ error: "Gagal mencabut link berbagi" });
    }
  });

  // POST /api/workroom/projects/:id/share — generate a shareable brief link (Task #30)
  app.post("/api/workroom/projects/:id/share", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
      if (!userId) return res.status(401).json({ error: "Login diperlukan" });
      const [project] = await db.select().from(workroomProjects)
        .where(eq(workroomProjects.id, id));
      if (!project) return res.status(404).json({ error: "Project tidak ditemukan" });
      if (project.userId !== userId) return res.status(403).json({ error: "Forbidden" });
      // Task #50: accept optional expiresInDays; 0 or missing = permanent
      const { expiresInDays } = req.body as { expiresInDays?: number };
      const shareExpiresAt = (expiresInDays && expiresInDays > 0)
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null;
      const token = require("crypto").randomUUID().replace(/-/g, "");
      await db.update(workroomProjects)
        .set({ shareToken: token, shareExpiresAt } as any)
        .where(eq(workroomProjects.id, id));
      res.json({ token, shareUrl: `/api/workroom/share/${token}`, shareExpiresAt });
    } catch (err) {
      console.error("Share project error:", err);
      res.status(500).json({ error: "Gagal membuat link berbagi" });
    }
  });

  // GET /api/workroom/share/:token — read-only public campaign brief (Task #30, no auth)
  app.get("/api/workroom/share/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const projects = await db.select().from(workroomProjects);
      const project = projects.find((p: any) => p.shareToken === token);
      if (!project) {
        return res.status(404).send("<!DOCTYPE html><html><body><h2>Brief tidak ditemukan</h2><p>Link mungkin sudah tidak valid atau dicabut oleh pemiliknya.</p></body></html>");
      }
      // Task #50: check expiry
      if ((project as any).shareExpiresAt && new Date() > new Date((project as any).shareExpiresAt)) {
        return res.status(410).send(`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/><title>Link Kedaluwarsa</title>
<style>body{font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;margin:0}
.box{text-align:center;padding:40px;background:#fff;border-radius:12px;box-shadow:0 1px 8px rgba(0,0,0,.08);max-width:400px}
h2{color:#ef4444;margin-bottom:12px}p{color:#64748b;font-size:14px}</style></head>
<body><div class="box"><h2>⏰ Link Sudah Kedaluwarsa</h2><p>Link campaign brief ini sudah tidak aktif karena melewati tanggal kedaluwarsa yang ditentukan oleh pemiliknya.</p></div></body></html>`);
      }
      const delivs = await db.select().from(workroomDeliverables)
        .where(eq(workroomDeliverables.projectId, project.id))
        .orderBy(workroomDeliverables.phase, workroomDeliverables.createdAt);
      const exportDate = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      const escHtml = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      const delivHTML = [1,2,3,4].map(phase => {
        const pd = delivs.filter((d: any) => d.phase === phase);
        if (!pd.length) return "";
        return `<h3 style="margin:24px 0 10px;font-size:15px;color:#3b82f6;border-bottom:2px solid #bfdbfe;padding-bottom:6px">Fase ${phase}</h3>
${pd.map((d: any) => `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:10px">
<strong style="font-size:13px">${escHtml(d.deliverableType)}</strong> <span style="color:#64748b;font-size:12px">${escHtml(d.title)}</span>
<pre style="font-family:inherit;font-size:12px;line-height:1.6;color:#334155;white-space:pre-wrap;word-break:break-word;background:#f8fafc;border-radius:6px;padding:10px;border:1px solid #e2e8f0;margin-top:8px">${escHtml(d.content)}</pre>
</div>`).join("")}`;
      }).join("");
      const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Campaign Brief — ${escHtml(project.name)}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;background:#f8fafc;padding:24px}
.wrap{max-width:860px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 8px rgba(0,0,0,.08)}
</style></head><body><div class="wrap">
<div style="font-size:11px;font-weight:700;color:#7c3aed;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">🦂 MultiClaw Campaign Brief (Read-only)</div>
<h1 style="font-size:24px;font-weight:800;margin-bottom:8px">${escHtml(project.name)}</h1>
<p style="color:#475569;font-size:14px;line-height:1.6;margin-bottom:16px">${escHtml(project.brief)}</p>
${delivHTML}
<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center">Dibagikan via AI Marketing Tools · ${exportDate}</div>
</div></body></html>`;
      res.setHeader("Content-Type", "text/html;charset=utf-8");
      res.send(html);
    } catch (err) {
      console.error("Public share error:", err);
      res.status(500).send("Error");
    }
  });

  // POST /api/business-profiles/prefill-from-workroom — AI-extract BP fields from Workroom (Task #39)
  app.post("/api/business-profiles/prefill-from-workroom", async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub ?? "";
      if (!userId) return res.status(401).json({ error: "Login diperlukan" });
      const { projectId } = req.body as { projectId: number };
      if (!projectId) return res.status(400).json({ error: "projectId diperlukan" });
      const [project] = await db.select().from(workroomProjects)
        .where(eq(workroomProjects.id, projectId));
      if (!project || project.userId !== userId) return res.status(403).json({ error: "Forbidden" });
      const delivs = await db.select().from(workroomDeliverables)
        .where(eq(workroomDeliverables.projectId, projectId))
        .orderBy(workroomDeliverables.phase);
      const PRIORITY_TYPES = ["campaign_brief", "strategy", "audience_persona", "ad_copy", "hook", "landing_page"];
      const prioritized = [...delivs].sort((a: any, b: any) => {
        const ai = PRIORITY_TYPES.indexOf(a.deliverableType);
        const bi = PRIORITY_TYPES.indexOf(b.deliverableType);
        return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
      });
      const snippets = prioritized.slice(0, 3).map((d: any) =>
        `[${d.deliverableType}] ${d.title}:\n${d.content.slice(0, 600)}`
      ).join("\n\n");
      const prompt = `Dari campaign berikut, ekstrak informasi bisnis sebagai JSON.\n\nCampaign: "${project.name}"\nBrief: ${project.brief}\n\n${snippets ? `Deliverables:\n${snippets}` : ""}\n\nEkstrak ke JSON (isi "" jika tidak ada informasi, JANGAN null):\n{"businessName":"","businessType":"","industry":"","productsServices":"","targetAudience":"","valueProposition":"","tone":"","location":"","monthlyBudget":"","goals":"","competitors":"","additionalContext":""}\n\nBalas HANYA JSON valid.`;
      const completion = await openai.chat.completions.create({
        model: "gpt-5.4-mini",
        messages: [
          { role: "system", content: "Ekstrak info bisnis dari dokumen kampanye. Balas hanya JSON valid." },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 800,
      });
      let fields: Record<string, string> = {};
      try {
        const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
        fields = JSON.parse(raw.replace(/^```json?\n?/, "").replace(/\n?```$/, ""));
      } catch {
        return res.status(500).json({ error: "Gagal parsing hasil AI" });
      }
      res.json({ fields, source: `${project.name} (${delivs.length} deliverables)` });
    } catch (err) {
      console.error("Prefill from workroom error:", err);
      res.status(500).json({ error: "Gagal mengekstrak data dari Workroom" });
    }
  });

  // ─── Unified AI Tool History ─────────────────────────────────────────────────
  app.get("/api/ai-history/tools", async (req, res) => {
    const userId = getRequestUserId(req);
    if (!userId) return res.status(401).json({ error: "Login diperlukan" });
    const tools = Object.values(AI_TOOL_HISTORY_ROUTES)
      .filter((tool, index, all) => all.findIndex((item) => item.toolId === tool.toolId) === index)
      .map(({ toolId, toolName }) => ({ toolId, toolName }));
    res.json(tools);
  });

  app.get("/api/ai-history", async (req, res) => {
    try {
      const userId = getRequestUserId(req);
      if (!userId) return res.status(401).json({ error: "Login diperlukan" });

      const toolId = typeof req.query.tool === "string" ? req.query.tool.trim().slice(0, 100) : "";
      const search = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";
      const conditions = [eq(aiToolHistory.userId, userId)];
      if (toolId) conditions.push(eq(aiToolHistory.toolId, toolId));
      if (search) {
        conditions.push(or(
          ilike(aiToolHistory.title, `%${search}%`),
          ilike(aiToolHistory.outputPreview, `%${search}%`),
        )!);
      }

      const entries = await db
        .select({
          id: aiToolHistory.id,
          toolId: aiToolHistory.toolId,
          toolName: aiToolHistory.toolName,
          toolPath: aiToolHistory.toolPath,
          title: aiToolHistory.title,
          outputPreview: aiToolHistory.outputPreview,
          createdAt: aiToolHistory.createdAt,
        })
        .from(aiToolHistory)
        .where(and(...conditions))
        .orderBy(desc(aiToolHistory.createdAt))
        .limit(100);
      res.json(entries);
    } catch (error) {
      console.error("AI tool history list error:", error);
      res.status(500).json({ error: "Gagal mengambil riwayat" });
    }
  });

  app.get("/api/ai-history/:id", async (req, res) => {
    try {
      const userId = getRequestUserId(req);
      if (!userId) return res.status(401).json({ error: "Login diperlukan" });
      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(id)) return res.status(400).json({ error: "ID riwayat tidak valid" });

      const [entry] = await db
        .select()
        .from(aiToolHistory)
        .where(and(eq(aiToolHistory.id, id), eq(aiToolHistory.userId, userId)));
      if (!entry) return res.status(404).json({ error: "Riwayat tidak ditemukan" });
      res.json(entry);
    } catch (error) {
      console.error("AI tool history detail error:", error);
      res.status(500).json({ error: "Gagal membuka riwayat" });
    }
  });

  app.delete("/api/ai-history/:id", async (req, res) => {
    try {
      const userId = getRequestUserId(req);
      if (!userId) return res.status(401).json({ error: "Login diperlukan" });
      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(id)) return res.status(400).json({ error: "ID riwayat tidak valid" });

      await db
        .delete(aiToolHistory)
        .where(and(eq(aiToolHistory.id, id), eq(aiToolHistory.userId, userId)));
      res.json({ ok: true });
    } catch (error) {
      console.error("AI tool history delete error:", error);
      res.status(500).json({ error: "Gagal menghapus riwayat" });
    }
  });

  // ─── Campaign Wizard Session History ─────────────────────────────────────────
  app.get("/api/campaign-wizard/sessions", async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
      if (!userId) return res.status(401).json({ error: "Login diperlukan" });
      const sessions = await db
        .select()
        .from(campaignWizardSessions)
        .where(eq(campaignWizardSessions.userId, userId))
        .orderBy(desc(campaignWizardSessions.createdAt))
        .limit(50);
      res.json(sessions);
    } catch (err) {
      console.error("Campaign wizard sessions list error:", err);
      res.status(500).json({ error: "Gagal mengambil riwayat" });
    }
  });

  app.post("/api/campaign-wizard/sessions", async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
      if (!userId) return res.status(401).json({ error: "Login diperlukan" });
      const { productName, campaignData, winningStrategy } = req.body as {
        productName: string;
        campaignData: Record<string, string>;
        winningStrategy: string;
      };
      if (!winningStrategy) return res.status(400).json({ error: "winningStrategy diperlukan" });
      const [session] = await db
        .insert(campaignWizardSessions)
        .values({ userId, productName: productName || "Tanpa Nama", campaignData, winningStrategy })
        .returning();
      res.json(session);
    } catch (err) {
      console.error("Campaign wizard session save error:", err);
      res.status(500).json({ error: "Gagal menyimpan sesi" });
    }
  });

  app.delete("/api/campaign-wizard/sessions/:id", async (req, res) => {
    try {
      const userId = (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
      if (!userId) return res.status(401).json({ error: "Login diperlukan" });
      const id = parseInt(req.params.id);
      await db
        .delete(campaignWizardSessions)
        .where(and(eq(campaignWizardSessions.id, id), eq(campaignWizardSessions.userId, userId)));
      res.json({ ok: true });
    } catch (err) {
      console.error("Campaign wizard session delete error:", err);
      res.status(500).json({ error: "Gagal menghapus sesi" });
    }
  });

  // POST /api/workroom/projects/:id/generate-phase — SSE generation for a phase
  app.post("/api/workroom/projects/:id/generate-phase", async (req, res) => {
    const projectId = parseInt(req.params.id);
    const { phase } = req.body;
    const phaseNum = parseInt(phase);

    if (!phaseNum || phaseNum < 1 || phaseNum > 4) {
      return res.status(400).json({ error: "Fase tidak valid (1-4)" });
    }

    const agents = PHASE_AGENTS[phaseNum];
    if (!agents) return res.status(400).json({ error: "Konfigurasi fase tidak ditemukan" });

    const [project] = await db.select().from(workroomProjects).where(eq(workroomProjects.id, projectId));
    if (!project) return res.status(404).json({ error: "Proyek tidak ditemukan" });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const write = (data: object) => {
      if (!res.writableEnded) res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Delete existing deliverables for this phase (allow regeneration)
    await db.delete(workroomDeliverables).where(
      and(
        eq(workroomDeliverables.projectId, projectId),
        eq(workroomDeliverables.phase, phaseNum)
      )
    );

    // Run all agents for this phase in parallel
    await Promise.all(agents.map(async (agent) => {
      write({ type: "agent_start", agentId: agent.id, agentName: agent.name });

      try {
        // Use streaming so the SSE connection stays alive during long AI generation
        const stream = await openai.chat.completions.create({
          model: "gpt-5",
          messages: [
            { role: "system", content: agent.systemPrompt + ((req as any).bpCtx || "") },
            { role: "user", content: `Brief kampanye:\n\n"${project.brief}"\n\nNama proyek: ${project.name}\n\nHasilkan deliverable konkret untuk kampanye ini.` },
          ],
          stream: true,
          max_completion_tokens: 8000,
        });

        let raw = "";
        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content || "";
          if (token) {
            raw += token;
            // Send periodic progress so the client stays alive
            write({ type: "agent_progress", agentId: agent.id, chars: raw.length });
          }
        }

        // If model produced nothing at all, emit a heartbeat so client doesn't hang
        if (!raw.trim()) {
          write({ type: "agent_progress", agentId: agent.id, chars: 0 });
        }
        
        // Extract JSON from response
        let deliverableData: Array<{ type: string; title: string; content: string }> = [];
        try {
          // Strip markdown code fences that reasoning models often add
          const stripped = raw
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .trim();

          // Find outermost JSON array
          const jsonMatch = stripped.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed) && parsed.length > 0) {
              deliverableData = parsed;
            }
          }
        } catch (parseErr) {
          console.error(`JSON parse error for ${agent.id}:`, parseErr);
        }

        // Fallback: if JSON extraction failed but we have raw content, save it as a single deliverable
        if (deliverableData.length === 0 && raw.trim().length > 0) {
          console.warn(`${agent.id}: falling back to raw content (${raw.length} chars)`);
          deliverableData = agent.deliverables.map((def) => ({
            type: def.type,
            title: `${agent.name} — ${def.type.replace(/_/g, " ")}`,
            content: raw,
          }));
        }

        // Save each deliverable to DB
        const saved = [];
        for (const d of deliverableData) {
          const delivDef = agent.deliverables.find((def) => def.type === d.type);
          const [row] = await db.insert(workroomDeliverables).values({
            projectId,
            phase: phaseNum,
            agentId: agent.id,
            agentName: agent.name,
            deliverableType: d.type,
            title: d.title,
            content: d.content,
            status: "draft",
            targetTool: delivDef?.targetTool ?? null,
            targetToolName: delivDef?.targetToolName ?? null,
          }).returning();
          saved.push(row);
        }

        write({ type: "agent_done", agentId: agent.id, deliverables: saved });
      } catch (err) {
        console.error(`OpenClaw ${agent.id} generation error:`, err);
        write({ type: "agent_error", agentId: agent.id, error: "Gagal generate" });
      }
    }));

    // Update project currentPhase
    await db.update(workroomProjects)
      .set({ currentPhase: Math.max(project.currentPhase, phaseNum), updatedAt: new Date() as any })
      .where(eq(workroomProjects.id, projectId));

    write({ type: "done", phase: phaseNum });
    res.end();
  });

  // AI Auto-Fill endpoint — fills any tool's form fields with AI
  app.post("/api/ai-autofill", async (req, res) => {
    try {
      const { toolName, userBrief = "", campaignContext = {}, workroomProjectId } = req.body as {
        toolName: string;
        userBrief?: string;
        campaignContext?: Record<string, string>;
        workroomProjectId?: number;
      };

      // Tool-specific field definitions
      const TOOL_CONFIGS: Record<string, { description: string; fields: Record<string, string> }> = {
        "campaign-wizard": {
          description: "Campaign Wizard untuk membuat kampanye iklan digital yang winning",
          fields: {
            productName: "Nama produk/layanan (singkat, max 5 kata)",
            productDescription: "Deskripsi produk yang detail dan menarik (2-3 kalimat)",
            uniqueValue: "Unique Selling Proposition — apa yang benar-benar membedakan produk ini",
            targetAge: "Range usia target audience (e.g. '25-45 tahun')",
            targetGender: "Gender target: Pria / Wanita / Semua",
            targetInterests: "Minat, jabatan & interest targeting (comma-separated, 8-12 items)",
            targetPainPoints: "3-5 pain point utama target audience yang paling terasa",
            competitors: "2-3 kompetitor atau solusi alternatif yang ada di pasaran",
            competitorWeakness: "Kelemahan kompetitor yang bisa dimanfaatkan produk ini",
            creativeAngle: "Angle kreatif utama untuk iklan (Problem → Consequence → Solution)",
            emotionalHook: "1 hook emosional yang kuat untuk opening iklan (max 12 kata)",
            campaignObjective: "Pilih salah satu: Sales (Purchase) / Traffic / Leads / Awareness / Engagement / Video Views / Messages (WA/Messenger)",
            platform: "Platform iklan utama: pilih salah satu: Meta Ads / Instagram / TikTok / YouTube / Google Ads / LinkedIn",
            budget: "Estimasi budget harian yang masuk akal (e.g. 'Rp 100.000')",
            duration: "Durasi kampanye yang direkomendasikan (e.g. '7 hari')",
          },
        },
        "audience-builder": {
          description: "Audience Builder untuk membangun buyer persona",
          fields: {
            productDescription: "Deskripsi produk/layanan yang lengkap untuk riset audience",
            ageRange: "Range usia dalam format 'MIN-MAX' (hanya angka, e.g. '25-45')",
            interests: "Daftar interest/minat yang relevan, comma-separated (8-12 items)",
          },
        },
        "ad-creator": {
          description: "Ad Creator untuk membuat copy iklan di berbagai platform",
          fields: {
            productName: "Nama produk/layanan",
            productDescription: "Deskripsi produk yang menarik untuk copy iklan",
            targetAudience: "Target audience utama (demografis + psikografis singkat)",
            uniqueValue: "Unique Value Proposition yang paling menjual",
          },
        },
        "wa-broadcast": {
          description: "WA Broadcast Sequence untuk follow-up WhatsApp",
          fields: {
            produk: "Nama produk/layanan",
            harga: "Harga produk (e.g. 'Rp 149.000' atau 'Rp 299.000/bulan')",
            usp: "USP/keunggulan produk yang membuat orang mau beli",
          },
        },
        "cs-bot-script": {
          description: "CS Bot Script untuk customer service otomatis",
          fields: {
            produk: "Nama produk/bisnis",
            harga: "Harga dan paket yang tersedia",
            deskripsiProduk: "Deskripsi produk lengkap + FAQ yang sering ditanya customer",
            target: "Target customer (e.g. 'Wanita 25-35, ibu muda, pebisnis online')",
          },
        },
        "google-ads": {
          description: "Google Ads campaign generator",
          fields: {
            produk: "Nama produk/layanan",
            url: "URL landing page (contoh: https://example.com)",
            keywords: "Kata kunci utama yang relevan (comma-separated, 5-8 keywords)",
            targetAudience: "Target audience utama",
            usp: "Unique Selling Proposition",
            budget: "Estimasi budget harian",
          },
        },
        "landing-page": {
          description: "Landing Page generator",
          fields: {
            productName: "Nama produk/layanan",
            tagline: "Tagline yang menarik dan memorable (max 8 kata)",
            description: "Deskripsi produk untuk landing page (2-3 kalimat)",
            benefits: "3-5 benefit utama produk (comma-separated)",
            targetMarket: "Target market utama",
          },
        },
        "email-sequence": {
          description: "Email sequence marketing generator",
          fields: {
            productName: "Nama produk/layanan",
            productDescription: "Deskripsi produk untuk email sequence",
            targetAudience: "Target audience",
            uniqueValue: "Unique Value Proposition",
          },
        },
        "hook-generator": {
          description: "Hook generator untuk content marketing",
          fields: {
            topic: "Topik atau produk yang akan dibuat hook-nya",
            audience: "Target audience yang akan membaca/melihat content",
            painPoint: "Pain point utama yang ingin disentuh",
          },
        },
        "content-calendar": {
          description: "Content calendar planning",
          fields: {
            brand: "Nama brand/bisnis",
            niche: "Niche atau industri bisnis",
            targetAudience: "Target audience konten",
            goals: "Tujuan konten (awareness/engagement/konversi)",
          },
        },
        "ab-variant": {
          description: "A/B variant generator untuk iklan dan landing page",
          fields: {
            headline: "Headline utama iklan atau halaman",
            bodyText: "Body copy/teks deskripsi produk atau tawaran",
            cta: "Call-to-action yang digunakan (misal: Beli Sekarang, Coba Gratis)",
            targetAudience: "Target audience yang dituju",
            platform: "Platform iklan (Meta Ads / Google Ads / TikTok Ads)",
          },
        },
        "ad-scale-advisor": {
          description: "Advisor untuk scaling budget iklan",
          fields: {
            platform: "Platform iklan yang digunakan (Meta/Google/TikTok)",
            objective: "Objective kampanye (traffic/konversi/awareness)",
            additionalContext: "Informasi tambahan produk atau kampanye",
          },
        },
        "ad-simulation": {
          description: "Simulasi performa iklan digital",
          fields: {
            platform: "Platform iklan (Meta Ads / Google Ads / TikTok Ads)",
            productName: "Nama produk yang diiklankan",
            productDescription: "Deskripsi singkat produk",
            targetAudience: "Target audience iklan",
            adBudget: "Budget iklan harian/bulanan dalam Rupiah",
          },
        },
        "affiliate-content": {
          description: "Generator konten untuk affiliate marketing",
          fields: {
            productName: "Nama produk yang dipromosikan sebagai afiliasi",
            niche: "Niche atau kategori produk",
            commission: "Komisi afiliasi (misal: 10% atau Rp 50.000/sale)",
          },
        },
        "ai-articles": {
          description: "Generator artikel SEO dengan AI",
          fields: {
            topic: "Topik utama artikel yang akan ditulis",
            keywords: "Kata kunci SEO (comma-separated)",
            tone: "Tone penulisan (profesional/santai/edukatif/persuasif)",
          },
        },
        "campaign-analyzer": {
          description: "Analyzer performa iklan dan kampanye",
          fields: {
            adCopy: "Teks iklan yang akan dianalisa",
            platform: "Platform iklan (Meta/Google/TikTok)",
            objective: "Objective kampanye yang ingin dicapai",
          },
        },
        "campaign-launcher": {
          description: "Campaign launcher checklist dan setup guide",
          fields: {
            productName: "Nama produk atau layanan",
            productType: "Tipe produk (fisik/digital/jasa)",
            targetMarket: "Target pasar dan segmen audience",
            productBenefit: "Benefit utama produk untuk audience",
            objective: "Objective kampanye (awareness/traffic/konversi/retargeting)",
          },
        },
        "campaign-report": {
          description: "Generator laporan performa kampanye",
          fields: {
            businessName: "Nama bisnis atau brand",
            platform: "Platform iklan yang dilaporkan",
            period: "Periode laporan (misal: Juli 2025 atau Q3 2025)",
          },
        },
        "content-repurposer": {
          description: "Repurpose konten ke berbagai format",
          fields: {
            originalContent: "Konten asli yang akan di-repurpose (artikel/caption/script)",
          },
        },
        "cs-closing": {
          description: "Script closing untuk customer service dan sales",
          fields: {
            productName: "Nama produk atau layanan",
            productPrice: "Harga produk",
            productBenefit: "Benefit utama produk",
            objection: "Keberatan umum yang sering muncul dari calon pembeli",
          },
        },
        "customer-journey": {
          description: "Customer journey map generator",
          fields: {
            productName: "Nama produk atau layanan",
            targetAudience: "Target audience utama",
            productPrice: "Harga produk",
            businessModel: "Model bisnis (B2C/B2B/D2C/marketplace)",
            competitors: "Kompetitor utama di pasar",
          },
        },
        "digital-products": {
          description: "Kalkulator dan planner produk digital",
          fields: {
            productName: "Nama produk digital yang akan dijual",
            sellPrice: "Harga jual produk digital dalam Rupiah",
          },
        },
        "funnel-planner": {
          description: "Marketing funnel planner dan builder",
          fields: {
            productName: "Nama produk atau layanan",
            targetAudience: "Target audience yang dituju funnel",
            platform: "Platform utama funnel (Meta/Google/TikTok/Organik)",
            cta: "Call-to-action utama funnel (Beli/Daftar/Download/Konsultasi)",
          },
        },
        "hashtag-generator": {
          description: "Generator hashtag untuk konten sosial media",
          fields: {
            platform: "Platform sosial media (Instagram/TikTok/Twitter/LinkedIn)",
            niche: "Niche atau topik konten",
            contentType: "Tipe konten (produk/edukatif/hiburan/promosi)",
            keywords: "Kata kunci utama konten",
          },
        },
        "interest-finder": {
          description: "Facebook/Meta interest targeting finder",
          fields: {
            keyword: "Kata kunci produk atau bisnis untuk mencari interest",
            audienceDescription: "Deskripsi singkat target audience yang dituju",
          },
        },
        "keyword-marketplace": {
          description: "Keyword research untuk marketplace (Tokopedia/Shopee/Lazada)",
          fields: {
            marketplace: "Marketplace target (Tokopedia/Shopee/Lazada/Tiktok Shop)",
            productName: "Nama produk yang dijual",
            category: "Kategori produk di marketplace",
            targetBuyer: "Deskripsi pembeli yang dituju",
          },
        },
        "lp-html-generator": {
          description: "Generator landing page HTML siap pakai",
          fields: {
            productName: "Nama produk yang dipromosikan",
            tagline: "Tagline landing page (max 10 kata)",
            targetAudience: "Target audience landing page",
            offer: "Penawaran utama atau promo yang ditawarkan",
            cta: "Teks tombol CTA (misal: Pesan Sekarang / Hubungi Kami)",
            price: "Harga produk (bisa include harga coret jika ada)",
          },
        },
        "product-research": {
          description: "Riset produk untuk dijual online",
          fields: {
            niche: "Niche atau kategori produk yang diriset",
            format: "Format produk (fisik/digital/jasa/dropship)",
            priceRange: "Range harga target produk dalam Rupiah",
          },
        },
        "product-validator": {
          description: "Validator kelayakan produk sebelum launch",
          fields: {
            productName: "Nama produk yang akan divalidasi",
            productDescription: "Deskripsi produk dan apa yang ditawarkan",
            targetMarket: "Target pasar yang dituju",
            platform: "Platform penjualan utama (marketplace/website/sosmed)",
          },
        },
        "profit-lab": {
          description: "Kalkulator profitabilitas dan break-even iklan",
          fields: {
            sellingPrice: "Harga jual produk dalam Rupiah",
            costPrice: "Harga modal/HPP produk dalam Rupiah",
            shippingCost: "Biaya ongkir rata-rata dalam Rupiah",
            adSpend: "Budget iklan yang direncanakan dalam Rupiah",
          },
        },
        "spy-kompetitor": {
          description: "Spy dan analisis kompetitor di marketplace",
          fields: {
            marketplace: "Marketplace yang dianalisa (Tokopedia/Shopee/Lazada)",
            yourProduct: "Nama produk kamu yang akan dibandingkan",
            category: "Kategori produk di marketplace",
            yourStrengths: "Keunggulan produk kamu vs kompetitor",
          },
        },
        "story-telling": {
          description: "Generator story telling untuk konten marketing",
          fields: {
            storyType: "Tipe story (before-after/problem-solution/testimonial/brand-story)",
            emotion: "Emosi yang ingin dibangkitkan (inspirasi/empati/urgensi/kepercayaan)",
            productName: "Nama produk atau layanan",
            productBenefit: "Benefit utama produk",
            targetAudience: "Target audience yang dituju",
            additionalContext: "Konteks tambahan atau detail spesifik cerita",
          },
        },
        "video-script": {
          description: "Script video marketing untuk berbagai platform",
          fields: {
            platform: "Platform video (TikTok/Instagram Reels/YouTube Shorts/YouTube)",
            topic: "Topik atau angle utama video",
            productName: "Nama produk yang dipromosikan",
            objective: "Objective video (awareness/edukasi/konversi/testimonial)",
            videoStyle: "Gaya video (talking head/UGC/demonstrasi/animasi)",
            targetAudience: "Target audience video",
          },
        },
        "ai-banners": {
          description: "AI Banner Creator — buat banner marketing visual",
          fields: {
            headline: "Headline utama banner (max 8 kata, kuat dan menarik)",
            subheadline: "Subheadline pendukung (max 12 kata)",
            brandName: "Nama brand atau produk",
            colorScheme: "Skema warna yang diinginkan (contoh: biru dan emas, atau pastel cerah)",
          },
        },
        "audience-overlap": {
          description: "Audience Overlap Analyzer — analisis tumpang tindih interest",
          fields: {
            niche: "Niche atau kategori bisnis/produk yang dianalisa",
            interests: "Daftar 5-8 Facebook interest yang relevan, dipisahkan koma (contoh: Digital Marketing, Entrepreneurship, ...)",
          },
        },
        "auto-rule": {
          description: "Auto Rule Builder untuk Meta Ads automation rules",
          fields: {
            niche: "Niche atau kategori produk yang diiklankan",
            budget: "Budget harian dalam Rupiah (hanya angka, contoh: 150000)",
            targetRoas: "Target ROAS yang ingin dicapai (hanya angka, contoh: 3)",
            targetCpa: "Target biaya per lead/CPA dalam Rupiah (hanya angka, contoh: 25000)",
          },
        },
        "ai-images": {
          description: "AI Image Creator — generate gambar marketing dengan AI",
          fields: {
            prompt: "Deskripsi detail gambar yang ingin dibuat dalam Bahasa Inggris — sertakan gaya visual, subjek utama, latar belakang, dan nuansa warna yang diinginkan",
          },
        },
        "prompt-framework": {
          description: "Prompt Framework RISEN Builder — buat prompt AI yang efektif",
          fields: {
            role: "Peran/expertise yang harus dimainkan AI (contoh: copywriter dengan 10 tahun pengalaman di digital marketing Indonesia)",
            instruction: "Tugas spesifik yang harus dikerjakan AI",
            steps: "Langkah-langkah yang harus diikuti AI (format: 1) ..., 2) ..., 3) ...)",
            endgoal: "Hasil akhir yang diinginkan dari output AI ini",
            narrowing: "Batasan format, panjang, bahasa, dan hal yang harus dihindari",
          },
        },
        "execution-plan-notes": {
          description: "Saran catatan harian untuk Sistem Eksekusi 14 Hari berdasarkan produk user",
          fields: {
            notes: "Saran catatan praktis dan spesifik untuk hari ini — berikan 3-4 poin ringkas berisi: apa yang perlu difokuskan, tips menghindari hambatan umum hari ini, dan langkah konkret yang disesuaikan dengan produk user. Gunakan bullet point (•). Maksimal 5 kalimat total.",
          },
        },
      };

      const config = TOOL_CONFIGS[toolName];
      if (!config) {
        return res.status(400).json({ error: "Unknown tool" });
      }

      const contextParts: string[] = [];

      if (Object.keys(campaignContext).length > 0) {
        contextParts.push("**Konteks Campaign Aktif:**");
        for (const [k, v] of Object.entries(campaignContext)) {
          contextParts.push(`- ${k}: ${v}`);
        }
      }

      // Task #14 — Inject selected Workroom deliverables as additional context
      // Validate ownership: only the project's owner may use it as context.
      const autofillUserId = (req as any).user?.claims?.sub ?? "";
      if (workroomProjectId) {
        try {
          const [project] = await db
            .select()
            .from(workroomProjects)
            .where(
              and(
                eq(workroomProjects.id, workroomProjectId),
                eq(workroomProjects.userId, autofillUserId),
              ),
            )
            .limit(1);

          if (project) {
            const delivs = await db
              .select()
              .from(workroomDeliverables)
              .where(eq(workroomDeliverables.projectId, project.id))
              .orderBy(workroomDeliverables.phase, workroomDeliverables.id)
              .limit(8);

            const snippets = delivs
              .filter((d) => d.content && d.content.length > 20)
              .map((d) => {
                // 600 chars gives AI enough room to find product name + price
                const preview = d.content.length > 600
                  ? d.content.slice(0, 600) + "..."
                  : d.content;
                return `- ${d.deliverableType} [fase ${d.phase}]: ${preview}`;
              })
              .join("\n");

            if (snippets) {
              contextParts.push(
                `**Riwayat Workroom Campaign "${project.name}":**\n${snippets}`,
              );
            }
          }
        } catch (e) {
          // Non-fatal — autofill still works without Workroom history
          console.warn("Workroom context load failed (non-fatal):", e);
        }
      }

      if (userBrief.trim()) {
        contextParts.push(`**Brief dari User:**\n${userBrief}`);
      }

      const fieldList = Object.entries(config.fields)
        .map(([key, desc]) => `- "${key}": ${desc}`)
        .join("\n");

      const systemPrompt = `Anda adalah AI Marketing Assistant yang ahli mengisi form tool marketing secara cerdas dan relevan. Selalu balas dalam JSON valid.${(req as any).bpCtx || ""}`;

      // Task #16: when user has a business profile but sent no other context,
      // explicitly tell the AI to use the profile from the system prompt
      // instead of falling back to an invented placeholder product.
      let contextSection: string;
      if (contextParts.length > 0) {
        contextSection = contextParts.join("\n\n");
      } else if ((req as any).bpCtx) {
        contextSection = "Gunakan data bisnis dari profil pengguna yang ada di system prompt (bagian [KONTEKS BISNIS PENGGUNA]) untuk mengisi semua field dengan informasi yang konkret, spesifik, dan relevan untuk bisnis tersebut. Jangan mengarang produk fiktif.";
      } else {
        contextSection = "Tidak ada konteks bisnis tersedia. Buat contoh produk yang masuk akal dan konsisten di semua field.";
      }

      const userPrompt = `Tool: ${config.description}

${contextSection}

Tugas: Isi semua field form berikut dengan nilai yang **realistis, spesifik, dan actionable** untuk tool ini.

Field yang harus diisi:
${fieldList}

PENTING:
- Balas HANYA dengan JSON object berisi field-field di atas
- Semua nilai harus dalam Bahasa Indonesia
- Jangan gunakan placeholder seperti "contoh produk" — gunakan data yang konkret dan spesifik
- Nilai harus langsung bisa dipakai tanpa edit besar
- Jika ada konteks campaign, gunakan data tersebut sebagai basis
- Jika ada Riwayat Workroom Campaign: ekstrak nama produk/bisnis dari deliverable dan masukkan ke field "produk" atau "nama"; ekstrak harga (format "Rp X.XXX" atau "Rp X.XXX/bulan") dari deliverable dan masukkan ke field "harga" — jangan mengarang nilai jika sudah ada di teks

Format respons (JSON only, no markdown):
{
  "fields": {
    "fieldName": "nilai yang diisi",
    ...
  }
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5.4-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1500,
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return res.status(500).json({ error: "Invalid AI response" });
      }

      // Support both { fields: {...} } and flat { fieldName: value } shapes
      const fields = (parsed.fields as Record<string, string>) ?? (parsed as Record<string, string>);

      return res.json({ fields });
    } catch (error) {
      console.error("AI auto-fill error:", error);
      return res.status(500).json({ error: "Failed to auto-fill" });
    }
  });

  // ─── Business Profile API ──────────────────────────────────────────────────

  // GET /api/business-profile — get the active (most-recently-updated) profile
  app.get("/api/business-profile", async (req, res) => {
    const userId = (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
    if (!userId) return res.json(null);
    try {
      const rows = await db.select().from(businessProfiles)
        .where(eq(businessProfiles.userId, userId))
        .orderBy(desc(businessProfiles.updatedAt))
        .limit(1);
      res.json(rows[0] ? { ...rows[0], isDefault: true } : null);
    } catch (err) {
      console.error("Business profile GET error:", err);
      res.status(500).json({ error: "Gagal mengambil profil bisnis" });
    }
  });

  // GET /api/business-profiles — list all profiles for the current user
  app.get("/api/business-profiles", async (req, res) => {
    const userId = (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
    if (!userId) return res.json([]);
    try {
      const rows = await db.select().from(businessProfiles)
        .where(eq(businessProfiles.userId, userId))
        .orderBy(desc(businessProfiles.updatedAt));
      // First (most-recently-updated) is treated as active/default
      res.json(rows.map((r, i) => ({ ...r, isDefault: i === 0 })));
    } catch (err) {
      console.error("Business profiles list error:", err);
      res.status(500).json({ error: "Gagal mengambil daftar profil bisnis" });
    }
  });

  // POST /api/business-profiles — create a new profile
  app.post("/api/business-profiles", async (req, res) => {
    const userId = (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
    if (!userId) return res.status(401).json({ error: "Login diperlukan" });
    try {
      const { businessName, businessType, industry, productsServices, targetAudience, valueProposition, tone, location, monthlyBudget, goals, competitors, additionalContext } = req.body;
      if (!businessName?.trim()) return res.status(400).json({ error: "Nama bisnis wajib diisi" });

      const [profile] = await db.insert(businessProfiles).values({
        userId,
        businessName: businessName.trim(),
        businessType: businessType || "",
        industry: industry || "",
        productsServices: productsServices || "",
        targetAudience: targetAudience || "",
        valueProposition: valueProposition || "",
        tone: tone || "",
        location: location || "",
        monthlyBudget: monthlyBudget || "",
        goals: goals || "",
        competitors: competitors || "",
        additionalContext: additionalContext || "",
      }).returning();

      // New profile has highest updatedAt, so it becomes active
      res.json({ ...profile, isDefault: true });
    } catch (err) {
      console.error("Business profile create error:", err);
      res.status(500).json({ error: "Gagal membuat profil bisnis" });
    }
  });

  // PUT /api/business-profiles/:id — update an existing profile
  app.put("/api/business-profiles/:id", async (req, res) => {
    const userId = (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
    if (!userId) return res.status(401).json({ error: "Login diperlukan" });
    try {
      const id = parseInt(req.params.id);
      const { businessName, businessType, industry, productsServices, targetAudience, valueProposition, tone, location, monthlyBudget, goals, competitors, additionalContext } = req.body;
      if (!businessName?.trim()) return res.status(400).json({ error: "Nama bisnis wajib diisi" });

      const [updated] = await db.update(businessProfiles)
        .set({
          businessName: businessName.trim(),
          businessType: businessType || "",
          industry: industry || "",
          productsServices: productsServices || "",
          targetAudience: targetAudience || "",
          valueProposition: valueProposition || "",
          tone: tone || "",
          location: location || "",
          monthlyBudget: monthlyBudget || "",
          goals: goals || "",
          competitors: competitors || "",
          additionalContext: additionalContext || "",
          updatedAt: new Date() as any,
        })
        .where(and(eq(businessProfiles.id, id), eq(businessProfiles.userId, userId)))
        .returning();

      if (!updated) return res.status(404).json({ error: "Profil tidak ditemukan" });
      // Editing makes this profile the most-recently-updated = active
      res.json({ ...updated, isDefault: true });
    } catch (err) {
      console.error("Business profile update error:", err);
      res.status(500).json({ error: "Gagal memperbarui profil bisnis" });
    }
  });

  // DELETE /api/business-profiles/:id
  app.delete("/api/business-profiles/:id", async (req, res) => {
    const userId = (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
    if (!userId) return res.status(401).json({ error: "Login diperlukan" });
    try {
      const id = parseInt(req.params.id);
      await db.delete(businessProfiles)
        .where(and(eq(businessProfiles.id, id), eq(businessProfiles.userId, userId)));
      res.json({ ok: true });
    } catch (err) {
      console.error("Business profile delete error:", err);
      res.status(500).json({ error: "Gagal menghapus profil bisnis" });
    }
  });

  // POST /api/business-profiles/:id/set-default — activate a profile
  // "Active" = most-recently-updated; just touch updatedAt so it sorts first.
  app.post("/api/business-profiles/:id/set-default", async (req, res) => {
    const userId = (req as any).user?.claims?.sub ?? (req as any).user?.id ?? "";
    if (!userId) return res.status(401).json({ error: "Login diperlukan" });
    try {
      const id = parseInt(req.params.id);
      const [updated] = await db.update(businessProfiles)
        .set({ updatedAt: new Date() as any })
        .where(and(eq(businessProfiles.id, id), eq(businessProfiles.userId, userId)))
        .returning();
      if (!updated) return res.status(404).json({ error: "Profil tidak ditemukan" });
      res.json({ ...updated, isDefault: true });
    } catch (err) {
      console.error("Business profile set-default error:", err);
      res.status(500).json({ error: "Gagal mengaktifkan profil bisnis" });
    }
  });

  return httpServer;
}
