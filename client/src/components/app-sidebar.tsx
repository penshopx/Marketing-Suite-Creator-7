import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  MessageSquare,
  Image,
  FileText,
  Volume2,
  Megaphone,
  BookOpen,
  Sparkles,
  Palette,
  Video,
  BookMarked,
  Globe,
  ChevronDown,
  Trophy,
  Target,
  Users,
  BarChart3,
  GraduationCap,
  Play,
  LogOut,
  HelpCircle,
  Download,
  CalendarDays,
  Package,
  Zap,
  Mic,
  Link2,
  Search,
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useAuth } from "@/hooks/use-auth";
import { useMarketingContext } from "@/hooks/use-marketing-context";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Panduan Fitur", url: "/guide-chatbot", icon: HelpCircle },
];

const winningItems = [
  { title: "Roadmap Winning", url: "/winning-dashboard", icon: Trophy },
  { title: "Panduan Praktis", url: "/winning-guide", icon: GraduationCap },
  { title: "Sistem 14 Hari", url: "/execution-plan", icon: CalendarDays },
  { title: "Simulasi Beriklan", url: "/ad-simulation", icon: Play },
  { title: "Campaign Wizard", url: "/campaign-wizard", icon: Target },
  { title: "Audience Builder", url: "/audience-builder", icon: Users },
  { title: "Ad Analyzer", url: "/campaign-analyzer", icon: BarChart3 },
];

const digitalProductItems = [
  { title: "Katalog Produk", url: "/digital-products", icon: Package },
  { title: "TikTok Ads", url: "/tiktok-ads", icon: SiTiktok },
  { title: "Meta Ads Advanced", url: "/meta-ads", icon: Megaphone },
  { title: "Affiliate Content", url: "/affiliate-content", icon: Link2 },
];

const aiAssistantItems = [
  { title: "AI Chat", url: "/ai-chat", icon: MessageSquare },
  { title: "AI Expert Chat", url: "/ai-expert", icon: Sparkles },
  { title: "Prompt Framework", url: "/prompt-framework", icon: Zap },
  { title: "AI Templates", url: "/ai-templates", icon: BookMarked },
];

const aiCreatorItems = [
  { title: "Ad Creator", url: "/ad-creator", icon: Megaphone },
  { title: "Story Telling", url: "/story-telling", icon: BookOpen },
  { title: "Landing Page", url: "/landing-page", icon: Globe },
  { title: "Image Creator", url: "/ai-images", icon: Image },
  { title: "Article Creator", url: "/ai-articles", icon: FileText },
  { title: "Banner Creator", url: "/ai-banners", icon: Palette },
  { title: "Video Creator", url: "/ai-video", icon: Video },
];

const aiAudioItems = [
  { title: "Text to Speech", url: "/ai-tts", icon: Volume2 },
  { title: "Speech to Text", url: "/ai-stt", icon: Mic },
];

interface NavGroupProps {
  label: string;
  items: { title: string; url: string; icon: React.ElementType }[];
  defaultOpen?: boolean;
  badge?: string;
  badgeColor?: string;
}

function NavGroup({ label, items, defaultOpen = true, badge, badgeColor }: NavGroupProps) {
  const [location] = useLocation();

  return (
    <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="cursor-pointer flex items-center justify-between hover:bg-sidebar-accent/50 rounded-md px-2 transition-colors">
            <div className="flex items-center gap-1.5">
              <span>{label}</span>
              {badge && (
                <Badge className={`text-xs px-1.5 py-0 ${badgeColor || "bg-primary/10 text-primary"}`}>
                  {badge}
                </Badge>
              )}
            </div>
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      location === item.url && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                  >
                    <Link href={item.url} data-testid={`link-${item.url.replace(/\//g, "-").slice(1) || "home"}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

function UserProfile() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || user.email?.[0] || "U");
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user.email || "User";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.profileImageUrl || undefined} alt={displayName} />
          <AvatarFallback className="text-xs">{initials.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-xs font-medium truncate max-w-[100px]" data-testid="text-username">{displayName}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[100px]" data-testid="text-user-email">{user.email}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => logout()} data-testid="button-logout">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}

function MainNav() {
  const [location] = useLocation();
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {mainItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={cn(location === item.url && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}
              >
                <Link href={item.url} data-testid={`link-${item.url.replace(/\//g, "-").slice(1) || "dashboard"}`}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function ExecutionPlanProgress() {
  const { context } = useMarketingContext();
  if (context.daysCompleted === 0) return null;

  const progress = (context.daysCompleted / 14) * 100;

  return (
    <Link href="/execution-plan">
      <div className="px-2 py-2 rounded-lg bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors" data-testid="sidebar-execution-progress">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium flex items-center gap-1">
            <CalendarDays className="h-3 w-3 text-primary" />
            14 Hari
          </span>
          <span className="text-xs font-bold text-primary">{context.daysCompleted}/14</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
    </Link>
  );
}

export function AppSidebar() {
  const { canInstall, isInstalling, install } = usePWAInstall();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground flex-shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">Marketing Tools</span>
            <span className="text-xs text-muted-foreground mt-0.5">AI Powered Suite</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1">
        {/* Main */}
        <MainNav />

        {/* Execution Plan Progress */}
        <div className="px-2 pb-1">
          <ExecutionPlanProgress />
        </div>

        <NavGroup label="Winning Campaign" items={winningItems} badge="7" badgeColor="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
        <NavGroup label="Produk Digital" items={digitalProductItems} badge="4" badgeColor="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" defaultOpen={false} />
        <NavGroup label="AI Assistant" items={aiAssistantItems} badge="4" badgeColor="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" defaultOpen={false} />
        <NavGroup label="AI Creator" items={aiCreatorItems} badge="7" badgeColor="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" defaultOpen={false} />
        <NavGroup label="AI Audio" items={aiAudioItems} defaultOpen={false} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-2">
        {canInstall && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs border-primary/40 text-primary hover:bg-primary/10"
            onClick={install}
            disabled={isInstalling}
            data-testid="button-install-pwa"
          >
            <Download className="h-3.5 w-3.5" />
            {isInstalling ? "Menginstall..." : "Install App di HP"}
          </Button>
        )}
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
