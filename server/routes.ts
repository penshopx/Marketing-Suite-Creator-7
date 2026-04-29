import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";
import { generateImageBuffer, openai as aiIntegrationsOpenai } from "./replit_integrations/image/client";
import { speechToText, textToSpeech, ensureCompatibleFormat } from "./replit_integrations/audio/client";

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

function isAdminUser(req: Request): boolean {
  const user = (req as any).user;
  if (!user) return false;
  
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) return true;
  
  const adminHeader = req.headers["x-admin-key"];
  if (adminHeader === ADMIN_SECRET) return true;
  
  return false;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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
          content: "You are a helpful AI marketing assistant. You help with marketing strategy, content creation, ad copywriting, SEO, and business growth. Be concise, practical, and provide actionable advice.",
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
        max_completion_tokens: 2048,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
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
          content: systemPrompt || "You are an expert marketing consultant providing professional advice.",
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
        max_completion_tokens: 2048,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
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
          { role: "system", content: "You are an expert content writer specializing in SEO-optimized articles that engage readers and rank well in search engines." },
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
          { role: "system", content: "You are a world-class email copywriter who writes high-converting email sequences. Always respond with valid JSON." },
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
          { role: "system", content: "You are an expert content strategist for Indonesian social media brands. Always respond with valid JSON containing exactly 30 calendar items. Be concise." },
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
          { role: "system", content: "You are a senior performance marketer specialized in A/B testing ad creatives. Always respond with valid JSON." },
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
              "You are a world-class direct-response copywriter who writes scroll-stopping hooks for short-form video and ads. Always respond with valid JSON.",
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
          { role: "system", content: "You are an expert advertising copywriter who creates high-converting ad copy. Always respond with valid JSON." },
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
          { role: "system", content: "You are a master storyteller who creates compelling brand narratives that connect with audiences emotionally and drive action." },
          { role: "user", content: prompt },
        ],
        stream: true,
        max_completion_tokens: 2048,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
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
            content: "Kamu adalah expert web developer dan copywriter Indonesia yang membuat landing page high-converting. Selalu gunakan bahasa Indonesia yang natural dan persuasif. Return HANYA kode HTML valid dan lengkap, tanpa markdown, tanpa penjelasan.",
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
            content: "Kamu adalah product research expert Indonesia yang memahami pasar digital lokal dan internasional. Selalu respond dengan JSON valid.",
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
            content: "Kamu adalah product validation expert Indonesia yang memberikan penilaian jujur dan akurat. Selalu respond dengan JSON valid.",
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
            content: "Kamu adalah CS expert yang ahli closing produk digital di Indonesia. Selalu respond dengan JSON valid.",
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
            content: "Kamu adalah sales funnel expert Indonesia. Selalu respond dengan JSON valid sesuai format yang diminta.",
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
            content: "Kamu adalah ads scaling expert Indonesia. Selalu respond dengan JSON valid dan analisis yang akurat.",
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
          { role: "system", content: "You are an expert ad copywriter and marketing analyst. Analyze ads critically and provide actionable feedback. Always respond with valid JSON." },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 2048,
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
          { role: "system", content: "You are an expert marketing strategist who creates detailed buyer personas. Always respond with valid JSON." },
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
        { role: "system", content: systemPrompt },
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
        model: "gpt-4o-mini",
        messages,
        stream: true,
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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
        messages: [{ role: "user", content: prompt }],
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

  return httpServer;
}
