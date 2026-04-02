# AI Marketing Tools Suite - Winning Campaign Edition

## Overview
A comprehensive AI-powered marketing tools application built with React, Express, and OpenAI integration. The application provides various AI-powered marketing utilities including chat assistants, content generators, ad creators, audio processing, and a complete **Winning Campaign System** that guides users step-by-step to create successful advertising campaigns.

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI via Replit AI Integrations (no API key required), Gemini AI (requires GEMINI_API_KEY)
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: wouter

## Key Features

### Winning Campaign System
1. **Roadmap Winning** - Complete roadmap to winning campaigns with progress tracking
2. **Panduan Praktis** - 8 prinsip fundamental iklan winning (hook, emotional trigger, copywriting formula, dll)
3. **Sistem 14 Hari** - Interactive 14-day execution plan tracker with daily tasks and progress
4. **Simulasi Beriklan** - Interactive step-by-step simulation untuk Meta Ads, Instagram, TikTok, LinkedIn, YouTube, Google Ads
5. **Campaign Wizard** - 5-step guided process (Research > Audience > Competitors > Creative > Launch)
6. **Audience Builder** - Create detailed buyer personas with AI
7. **Interest Finder AI** (`/interest-finder`) - Generate 80+ hidden FB/IG interests per niche, grouped by 5 categories (Direct/Adjacent/Behavioral/Competitor/Demographic), with competition level, audience size estimate, Top Picks, bookmark, CSV export. API: `/api/find-interests`
8. **Audience Overlap Analyzer** (`/audience-overlap`) - Analyze audience overlap between multiple interests, overlap matrix with percentage bars, recommended adset structure, exclude suggestions. API: `/api/audience-overlap`
9. **Ad Analyzer** - Score and analyze your ad copy for improvements
10. **Laporan Kampanye** - AI campaign performance report with Share WA tab (ringkas/detail format, WA bubble preview)

### Produk Digital (NEW)
1. **Katalog Produk** - 4 winning digital products with resell rights (100% profit), complete with sales angles and copywriting templates
2. **TikTok Ads** - Complete TikTok Ads guide: setup, content formulas, budget tiers, and FAQ
3. **Meta Ads Advanced** - Advanced Meta Ads settings: campaign types, audience targeting, KPI benchmarks

### Marketing (Enhanced)
- **Affiliate Content** - AI-powered content generator for affiliate marketing (4 template types, 30-day content calendar, platform tips)
- **Prompt Framework** - 10+ proven ChatGPT prompts for marketing, copywriting, research, and sales

### Cekat.AI-Inspired Tools (Sistem Sales)
- **WA Broadcast Sequence** (`/wa-broadcast`) - Generate 7-30 day WhatsApp follow-up sequences by segment. API: `/api/generate-wa-broadcast`. **Sinkronisasi**: reads produk/harga/usp from campaign store + URL params; writes back on generate; cross-tool buttons → CS Bot, Customer Journey, Interest Finder
- **CS Bot Script Builder** (`/cs-bot-script`) - Generate knowledge base Q&A + conversation flows for CS bots (Respond.io, Qontak). API: `/api/generate-cs-bot-script`. **Sinkronisasi**: reads produk/harga/target/usp; cross-tool buttons → WA Broadcast, Customer Journey, Interest Finder
- **Customer Journey Mapper** (`/customer-journey`) - Map full customer journey from awareness to advocacy with stage tactics, KPIs, content ideas. API: `/api/generate-customer-journey`. **Sinkronisasi**: reads produk/harga/target/kompetitor; cross-tool buttons → CS Bot, WA Broadcast, Interest Finder

### Sinkronisasi System (Cross-Tool Data Flow)
- **Campaign Store** (`client/src/hooks/use-campaign-store.ts`) - Global localStorage state: produk, harga, niche, target, usp, kompetitor, savedInterests[], usedTools[]
- **CampaignContextBar** (`client/src/components/campaign-context-bar.tsx`) - Auto-fill + save bar shown at top of each tool page when campaign is active
- **Sidebar Campaign Indicator** - Green widget in sidebar showing active campaign name + tools used count; hover to clear
- **Cross-tool buttons**: Every tool shows a "Lanjutkan ke Fitur Berikutnya" card at bottom of results with 3 next-tool buttons that pre-populate URL params
- Tools connected: Interest Finder ↔ Audience Overlap ↔ WA Broadcast ↔ CS Bot ↔ Customer Journey ↔ LP Builder ↔ Auto Rule Builder

### Otomasi AI
- **Campaign Launcher** - Automate campaign launch workflows
- **Content Repurposer** - Transform content across formats
- **Auto Rule Builder** (`/auto-rule`) - AI generates 5 ready-to-implement Meta Ads Manager automation rules (Stop Loss, Scale Winner, Budget Protector, Frequency Cap, Saturation Detector) with step-by-step implementation instructions. API: `/api/generate-auto-rules`
- **Profit Lab** - Profit analysis and projections
- **Video Script** - Marketing video scripts
- **Hashtag Generator** - Social media hashtag generation

### Attentive Agentic AI (Guide Chatbot)
- **Attentive AI Guide** - Floating chatbot AI proaktif di pojok kanan bawah layar (tersedia di semua halaman termasuk landing page)
- Menggunakan OpenAI via Replit AI Integrations
- **Context-Aware**: Mengetahui status login user, subscription tier, halaman saat ini, dan fitur yang tersedia/terkunci
- **Proactive Guidance**: Memberikan salam dan saran berdasarkan konteks halaman user
- **Task-Ready**: Siap menerima tugas seperti "bantu buat iklan" atau "analisis copy saya"
- **Feature Gating**: Menjelaskan fitur premium dengan sopan dan mengarahkan ke upgrade jika diperlukan
- **User Journey Aware**: Memahami alur lengkap dari landing page, login, dashboard, hingga semua fitur
- Format jawaban bersih tanpa markdown
- Key files: `client/src/components/floating-chatbot.tsx`, `client/src/hooks/use-guide-context.ts`

### AI Tools
1. **AI Chat** - General marketing assistant
2. **AI Expert Chat** - Specialized expert personas (Marketing, SEO, Copywriting, etc.)
3. **AI Image Creator** - Generate images for marketing
4. **AI Article Creator** - SEO-optimized content generation
5. **AI Banner Creator** - Design banners for ads
6. **AI Video Creator** - Video generation (premium feature)
7. **AI Text-to-Speech** - Convert text to natural voice
8. **AI Speech-to-Text** - Transcribe audio recordings
9. **Ad Creator** - Generate ads for Meta, YouTube, Instagram, TikTok, Google, LinkedIn
10. **Story Telling** - Create promotional narratives
11. **AI Templates** - Library of marketing templates
12. **Landing Page Creator** - Generate HTML landing pages

## Project Structure
```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── app-sidebar.tsx  # Main navigation sidebar
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   └── ui/              # shadcn/ui components
│   ├── pages/               # Page components
│   │   ├── dashboard.tsx    # Main dashboard
│   │   ├── winning-dashboard.tsx  # Roadmap winning
│   │   ├── winning-guide.tsx      # Panduan praktis 8 prinsip
│   │   ├── ad-simulation.tsx      # Simulasi beriklan multi-platform
│   │   ├── campaign-wizard.tsx    # Step-by-step wizard
│   │   ├── campaign-analyzer.tsx  # Ad scoring
│   │   ├── audience-builder.tsx   # Persona builder
│   │   ├── ai-chat.tsx      # AI chat assistant
│   │   ├── ai-expert.tsx    # Expert chat personas
│   │   ├── ai-images.tsx    # Image generation
│   │   ├── ai-articles.tsx  # Article creation
│   │   ├── ai-banners.tsx   # Banner creation
│   │   ├── ai-video.tsx     # Video creation
│   │   ├── ai-tts.tsx       # Text to speech
│   │   ├── ai-stt.tsx       # Speech to text
│   │   ├── ad-creator.tsx   # Ad copy generator
│   │   ├── story-telling.tsx # Story generator
│   │   ├── ai-templates.tsx # Template library
│   │   └── landing-page.tsx # LP generator
│   ├── App.tsx              # Main app with routing
│   └── index.css            # Global styles with theming
server/
├── routes.ts                # API endpoints
├── storage.ts               # Database interface
└── replit_integrations/     # AI integrations
    ├── chat/                # Chat routes
    ├── image/               # Image generation
    └── audio/               # TTS/STT
shared/
└── schema.ts                # Database schemas
```

## API Endpoints
- `POST /api/chat` - AI chat with streaming
- `POST /api/expert-chat` - Expert persona chat with streaming
- `POST /api/generate-image` - Image generation
- `POST /api/generate-article` - Article generation with streaming
- `POST /api/generate-ad` - Ad copy generation
- `POST /api/generate-story` - Story generation with streaming
- `POST /api/text-to-speech` - Text to speech conversion
- `POST /api/speech-to-text` - Speech to text transcription
- `POST /api/generate-landing-page` - Landing page HTML generation
- `POST /api/analyze-ad` - Ad copy analysis and scoring
- `POST /api/generate-audience` - Buyer persona generation
- `POST /api/guide-chat` - Guide chatbot with OpenAI (streaming, no markdown)

## Design System
- **Primary Color**: Purple (HSL 252, 85%, 60%)
- **Theme**: Light/Dark mode support
- **Components**: shadcn/ui with custom styling
- **Typography**: Inter font family

## Running the Application
The app runs on port 5000 with `npm run dev`. The frontend and backend are served from the same port via Vite middleware.

## Authentication
- Registration with email, name, and password (bcryptjs hashing)
- Login with email and password
- Session-based authentication stored in PostgreSQL (connect-pg-simple)
- User data stored in PostgreSQL users table with password field
- Replit Auth (OIDC) still available as fallback

## Feature Access
- All features are open to all registered users (no subscription/tier system)
- No feature gating or upgrade prompts
- Admin system still exists via ADMIN_EMAILS env var for potential future admin features

## Recent Changes
- 2026-03-10: Removed subscription/upgrade system - all features now open to all users
- 2026-03-10: Changed auth to registration + password login (bcryptjs)
- 2026-03-10: Removed pricing page, feature gates, and tier-based access control
- 2026-03-10: Updated landing page to show all features without pricing tiers
- 2026-01-31: Upgraded Guide Chatbot to "Attentive Agentic AI"
- 2026-01-23: Added Winning Campaign System
- 2026-01-23: Initial build with all 13 AI-powered tools
- Using Replit AI Integrations for OpenAI access (charges to credits)
- Complete sidebar navigation with collapsible groups
- Light/Dark theme toggle with user profile in sidebar
