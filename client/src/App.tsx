import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
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
import LandingPage from "@/pages/landing-page";
import CampaignWizard from "@/pages/campaign-wizard";
import CampaignAnalyzer from "@/pages/campaign-analyzer";
import AudienceBuilder from "@/pages/audience-builder";
import WinningDashboard from "@/pages/winning-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/winning-dashboard" component={WinningDashboard} />
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
      <Route path="/landing-page" component={LandingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="marketing-tools-theme">
        <TooltipProvider>
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
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
