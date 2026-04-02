import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import AIChat from "@/pages/ai-chat";
import AIExpert from "@/pages/ai-expert";
import AIImages from "@/pages/ai-images";
import AIArticles from "@/pages/ai-articles";
import AIBanners from "@/pages/ai-banners";
import AIVideo from "@/pages/ai-video";
import AITTS from "@/pages/ai-tts";
import AISTT from "@/pages/ai-stt";
import AdCreator from "@/pages/ad-creator";
import StoryTelling from "@/pages/story-telling";
import AITemplates from "@/pages/ai-templates";
import LandingPageCreator from "@/pages/landing-page";
import CampaignWizard from "@/pages/campaign-wizard";
import CampaignAnalyzer from "@/pages/campaign-analyzer";
import AudienceBuilder from "@/pages/audience-builder";
import WinningDashboard from "@/pages/winning-dashboard";
import WinningGuide from "@/pages/winning-guide";
import AdSimulation from "@/pages/ad-simulation";
import Login from "@/pages/login";
import GuideChatbot from "@/pages/guide-chatbot";
import ExecutionPlan from "@/pages/execution-plan";
import DigitalProducts from "@/pages/digital-products";
import TikTokAds from "@/pages/tiktok-ads";
import MetaAds from "@/pages/meta-ads";
import AffiliateContent from "@/pages/affiliate-content";
import PromptFramework from "@/pages/prompt-framework";
import Pricing from "@/pages/pricing";
import CSClosing from "@/pages/cs-closing";
import FunnelPlanner from "@/pages/funnel-planner";
import AdScaleAdvisor from "@/pages/ad-scale-advisor";
import ProductResearch from "@/pages/product-research";
import ProductValidator from "@/pages/product-validator";
import CampaignLauncher from "@/pages/campaign-launcher";
import ContentRepurposer from "@/pages/content-repurposer";
import ProfitLab from "@/pages/profit-lab";
import VideoScript from "@/pages/video-script";
import HashtagGenerator from "@/pages/hashtag-generator";
import { FloatingChatbot } from "@/components/floating-chatbot";
import { PWAInstallBanner } from "@/components/pwa-install-banner";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/winning-dashboard" component={WinningDashboard} />
      <Route path="/winning-guide" component={WinningGuide} />
      <Route path="/ad-simulation" component={AdSimulation} />
      <Route path="/campaign-wizard" component={CampaignWizard} />
      <Route path="/campaign-analyzer" component={CampaignAnalyzer} />
      <Route path="/audience-builder" component={AudienceBuilder} />
      <Route path="/ai-chat" component={AIChat} />
      <Route path="/ai-expert" component={AIExpert} />
      <Route path="/ai-images" component={AIImages} />
      <Route path="/ai-articles" component={AIArticles} />
      <Route path="/ai-banners" component={AIBanners} />
      <Route path="/ai-video" component={AIVideo} />
      <Route path="/ai-tts" component={AITTS} />
      <Route path="/ai-stt" component={AISTT} />
      <Route path="/ad-creator" component={AdCreator} />
      <Route path="/story-telling" component={StoryTelling} />
      <Route path="/ai-templates" component={AITemplates} />
      <Route path="/landing-page" component={LandingPageCreator} />
      <Route path="/guide-chatbot" component={GuideChatbot} />
      <Route path="/execution-plan" component={ExecutionPlan} />
      <Route path="/digital-products" component={DigitalProducts} />
      <Route path="/tiktok-ads" component={TikTokAds} />
      <Route path="/meta-ads" component={MetaAds} />
      <Route path="/affiliate-content" component={AffiliateContent} />
      <Route path="/prompt-framework" component={PromptFramework} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/cs-closing" component={CSClosing} />
      <Route path="/funnel-planner" component={FunnelPlanner} />
      <Route path="/ad-scale-advisor" component={AdScaleAdvisor} />
      <Route path="/product-research" component={ProductResearch} />
      <Route path="/product-validator" component={ProductValidator} />
      <Route path="/campaign-launcher" component={CampaignLauncher} />
      <Route path="/content-repurposer" component={ContentRepurposer} />
      <Route path="/profit-lab" component={ProfitLab} />
      <Route path="/video-script" component={VideoScript} />
      <Route path="/hashtag-generator" component={HashtagGenerator} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <>
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-auto">
              <Router />
            </main>
          </div>
        </div>
      </SidebarProvider>
      <FloatingChatbot />
      <PWAInstallBanner />
    </>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (location === "/login") {
    return (
      <>
        <Login />
        <FloatingChatbot />
        <PWAInstallBanner />
      </>
    );
  }

  if (location === "/pricing") {
    return (
      <>
        <Pricing />
        <FloatingChatbot />
        <PWAInstallBanner />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Landing />
        <FloatingChatbot />
        <PWAInstallBanner />
      </>
    );
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="marketing-tools-theme">
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
