import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { storage } from "./storage";
import { generateImageBuffer } from "./replit_integrations/image/client";
import { speechToText, textToSpeech, ensureCompatibleFormat } from "./replit_integrations/audio/client";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

  // Article generation endpoint with streaming
  app.post("/api/generate-article", async (req, res) => {
    try {
      const { topic, keywords = "", tone = "professional", length = "medium" } = req.body;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const wordCount = {
        short: 500,
        medium: 1000,
        long: 2000,
      }[length] || 1000;

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

  // Text-to-Speech endpoint
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

  // Speech-to-Text endpoint
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

  // Landing page generation endpoint
  app.post("/api/generate-landing-page", async (req, res) => {
    try {
      const {
        productName,
        tagline,
        description = "",
        features = "",
        style = "modern",
      } = req.body;

      const styleGuides: Record<string, string> = {
        modern: "Clean lines, lots of white space, gradient accents, sans-serif fonts",
        startup: "Bold colors, dynamic layouts, energetic feel, tech-forward",
        corporate: "Professional, structured, trust-building, muted colors",
        creative: "Unique layouts, artistic elements, vibrant colors",
        ecommerce: "Product-focused, clear CTAs, trust badges, clean grid",
      };

      const featureList = features.split("\n").filter((f: string) => f.trim());

      const prompt = `Generate a complete, self-contained HTML landing page for "${productName}".

Tagline: ${tagline}
${description ? `Description: ${description}` : ""}
${featureList.length > 0 ? `Features: ${featureList.join(", ")}` : ""}
Style: ${styleGuides[style] || "modern, professional"}

Requirements:
1. Complete, valid HTML5 document
2. Inline CSS (no external stylesheets)
3. Responsive design
4. Hero section with headline and CTA
5. Features section if features provided
6. Testimonial placeholder section
7. Footer with call-to-action
8. Professional color scheme matching the style
9. Modern, clean typography

Return ONLY the HTML code, no explanations.`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: "You are an expert web developer who creates beautiful, conversion-optimized landing pages. Return only valid HTML code." },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 8192,
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
      res.status(500).json({ error: "Failed to generate landing page" });
    }
  });

  return httpServer;
}
