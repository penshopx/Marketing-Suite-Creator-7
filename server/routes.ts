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
        max_completion_tokens: 1024,
      });

      const content = response.choices[0]?.message?.content || "{}";
      
      // Parse JSON from response
      let adData;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        adData = JSON.parse(jsonMatch[1] || content);
      } catch (e) {
        adData = {
          headline: "Transform Your Business Today",
          primaryText: productDescription,
          description: "Limited time offer",
          callToAction: "Learn More",
        };
      }

      res.json(adData);
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
9. FAQ section: 4-5 pertanyaan yang mungkin ada di benak target market
10. FINAL CTA section: Kuat dan urgency, CTA button "${ctaType}"
11. Footer

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

  return httpServer;
}
