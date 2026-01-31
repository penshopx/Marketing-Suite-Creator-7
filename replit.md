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

### Winning Campaign System (NEW)
1. **Roadmap Winning** - Complete roadmap to winning campaigns with progress tracking
2. **Panduan Praktis** - 8 prinsip fundamental iklan winning (hook, emotional trigger, copywriting formula, dll)
3. **Simulasi Beriklan** - Interactive step-by-step simulation untuk Meta Ads, Instagram, TikTok, LinkedIn, YouTube, Google Ads
4. **Campaign Wizard** - 5-step guided process (Research > Audience > Competitors > Creative > Launch)
5. **Audience Builder** - Create detailed buyer personas with AI
6. **Ad Analyzer** - Score and analyze your ad copy for improvements

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
- Uses Replit Auth (OIDC) for login/registration
- Supports Google, GitHub, X, Apple, and email/password
- User data stored in PostgreSQL users table

## Monetization
- Three subscription tiers: Free, Pro, Enterprise
- Pricing page at /pricing
- Subscription data stored in subscriptions table
- **Stripe Integration**: Not yet configured. User needs to set up Stripe connector when ready to accept payments. Currently, subscription upgrades are not functional.

## Admin Access
- **ADMIN_EMAILS**: Set this environment variable with comma-separated email addresses (e.g., "admin@example.com,owner@example.com") to grant full admin access
- **ADMIN_SECRET**: Alternative method - set this env var and pass it via `x-admin-key` header for API access (default: "admin2024")
- Admin users can access all premium features without subscription
- Sidebar shows "Admin (Full Access)" for admin users

## Recent Changes
- 2026-01-31: Upgraded Guide Chatbot to "Attentive Agentic AI" - now proaktif, context-aware, memahami alur user journey lengkap, dan siap menerima tugas
- 2026-01-31: Added FloatingChatbot to landing page and login page for non-authenticated users
- 2026-01-31: Created use-guide-context hook for assembling user context (auth, subscription, page, features)
- 2026-01-31: Enhanced system prompt with complete feature mapping and subscription tier gating
- 2026-01-23: Added landing page, authentication (Replit Auth), and monetization system
- 2026-01-23: Added Winning Campaign System (Dashboard, Wizard, Analyzer, Audience Builder, Simulasi Beriklan)
- 2026-01-23: Initial build with all 13 AI-powered tools
- Using Replit AI Integrations for OpenAI access (charges to credits)
- Complete sidebar navigation with collapsible groups
- Light/Dark theme toggle with user profile in sidebar
