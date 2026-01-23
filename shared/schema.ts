import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Subscription tiers
export const subscriptionTiers = ["free", "pro", "enterprise"] as const;
export type SubscriptionTier = typeof subscriptionTiers[number];

// User subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  tier: text("tier").notNull().default("free"),
  status: text("status").notNull().default("active"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// Conversations for AI Chat
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").default("chat"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Generated Images
export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  imageData: text("image_data").notNull(),
  type: text("type").default("general"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertGeneratedImageSchema = createInsertSchema(generatedImages).omit({
  id: true,
  createdAt: true,
});

export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertGeneratedImage = z.infer<typeof insertGeneratedImageSchema>;

// Generated Articles
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  topic: text("topic"),
  keywords: text("keywords"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

// Ad Templates
export const adTemplates = pgTable("ad_templates", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  objective: text("objective"),
  headline: text("headline").notNull(),
  primaryText: text("primary_text").notNull(),
  description: text("description"),
  callToAction: text("call_to_action"),
  targetAudience: text("target_audience"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertAdTemplateSchema = createInsertSchema(adTemplates).omit({
  id: true,
  createdAt: true,
});

export type AdTemplate = typeof adTemplates.$inferSelect;
export type InsertAdTemplate = z.infer<typeof insertAdTemplateSchema>;

// Story Telling Content
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  storyType: text("story_type"),
  product: text("product"),
  emotion: text("emotion"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
});

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

// Audio History
export const audioHistory = pgTable("audio_history", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  inputText: text("input_text"),
  outputText: text("output_text"),
  audioData: text("audio_data"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertAudioHistorySchema = createInsertSchema(audioHistory).omit({
  id: true,
  createdAt: true,
});

export type AudioHistory = typeof audioHistory.$inferSelect;
export type InsertAudioHistory = z.infer<typeof insertAudioHistorySchema>;

// Platform options for ads
export const adPlatforms = [
  "meta_ads",
  "youtube",
  "instagram", 
  "tiktok",
  "google_ads",
  "linkedin"
] as const;

export type AdPlatform = typeof adPlatforms[number];

// Story types
export const storyTypes = [
  "hero_journey",
  "problem_solution",
  "before_after",
  "testimonial",
  "origin_story",
  "educational"
] as const;

export type StoryType = typeof storyTypes[number];
