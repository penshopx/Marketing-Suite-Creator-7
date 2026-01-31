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
import Pricing from "@/pages/pricing";
import Login from "@/pages/login";
import GuideChatbot from "@/pages/guide-chatbot";

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
      <Route path="/pricing" component={Pricing} />
      <Route path="/guide-chatbot" component={GuideChatbot} />
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
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-hidden">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
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
    return <Login />;
  }

  if (!user) {
    return <Landing />;
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
