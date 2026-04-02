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
  Crown,
  MessageCircle,
  GitBranch,
  TrendingUp,
  CheckCircle2,
  Rocket,
  Repeat2,
  FlaskConical,
  Clapperboard,
  Hash,
  KeySquare,
  Eye,
  BarChart2,
  Layers,
  Map,
  Send,
  Bot,
} from "lucide-react";
import { SiTiktok, SiGoogle } from "react-icons/si";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
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
import { useCampaignStore } from "@/hooks/use-campaign-store";

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
  { title: "Interest Finder AI", url: "/interest-finder", icon: Search },
  { title: "Audience Overlap", url: "/audience-overlap", icon: Layers },
  { title: "Ad Analyzer", url: "/campaign-analyzer", icon: BarChart3 },
  { title: "Laporan Kampanye", url: "/campaign-report", icon: BarChart2 },
];

const digitalProductItems = [
  { title: "Riset Produk Digital", url: "/product-research", icon: Search },
  { title: "Validasi Ide Produk", url: "/product-validator", icon: CheckCircle2 },
  { title: "Riset Keyword Marketplace", url: "/keyword-marketplace", icon: KeySquare },
  { title: "Spy Kompetitor", url: "/spy-kompetitor", icon: Eye },
  { title: "Google Ads Creator", url: "/google-ads", icon: SiGoogle },
  { title: "Katalog Produk", url: "/digital-products", icon: Package },
  { title: "TikTok Ads", url: "/tiktok-ads", icon: SiTiktok },
  { title: "Meta Ads Advanced", url: "/meta-ads", icon: Megaphone },
  { title: "Affiliate Content", url: "/affiliate-content", icon: Link2 },
];

const salesSystemItems = [
  { title: "CS Closing Script", url: "/cs-closing", icon: MessageCircle },
  { title: "Funnel Planner", url: "/funnel-planner", icon: GitBranch },
  { title: "Ad Scale Advisor", url: "/ad-scale-advisor", icon: TrendingUp },
  { title: "WA Broadcast Sequence", url: "/wa-broadcast", icon: Send },
  { title: "CS Bot Script Builder", url: "/cs-bot-script", icon: Bot },
  { title: "Customer Journey Map", url: "/customer-journey", icon: Map },
];

const automasiItems = [
  { title: "Campaign Launcher", url: "/campaign-launcher", icon: Rocket },
  { title: "Content Repurposer", url: "/content-repurposer", icon: Repeat2 },
  { title: "Auto Rule Builder", url: "/auto-rule", icon: Zap },
  { title: "Profit Lab", url: "/profit-lab", icon: FlaskConical },
  { title: "Video Script", url: "/video-script", icon: Clapperboard },
  { title: "Hashtag Generator", url: "/hashtag-generator", icon: Hash },
];

const aiAssistantItems = [
  { title: "AI Chat", url: "/ai-chat", icon: MessageSquare },
  { title: "AI Expert Chat", url: "/ai-expert", icon: Sparkles },
  { title: "Prompt Framework", url: "/prompt-framework", icon: Zap },
  { title: "AI Templates", url: "/ai-templates", icon: BookMarked },
];

const aiCreatorItems = [
  { title: "Ad Creator", url: "/ad-creator", icon: Megaphone },
  { title: "LP HTML Builder", url: "/lp-html-generator", icon: Globe },
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
  const { tier, isPro } = useSubscription();
  if (!user) return null;

  const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || user.email?.[0] || "U");
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user.email || "User";

  const planLabel = tier === "enterprise" ? "Enterprise" : tier === "pro" ? "Pro" : "Gratis";
  const planColor = tier === "enterprise"
    ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
    : tier === "pro"
    ? "bg-primary/10 text-primary"
    : "bg-muted text-muted-foreground";

  return (
    <div className="space-y-2">
      {!isPro && (
        <Link href="/pricing">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs border-orange-400/60 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30"
            data-testid="button-upgrade-plan"
          >
            <Crown className="h-3.5 w-3.5" />
            Upgrade ke Pro
          </Button>
        </Link>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImageUrl || undefined} alt={displayName} />
            <AvatarFallback className="text-xs">{initials.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-medium truncate max-w-[80px]" data-testid="text-username">{displayName}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 border-0 ${planColor}`} data-testid="badge-plan">
              {planLabel}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => logout()} data-testid="button-logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
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

function CampaignIndicator() {
  const { campaign, clear } = useCampaignStore();
  if (!campaign.produk && !campaign.niche) return null;
  const name = campaign.produk || campaign.niche || "";
  const toolCount = campaign.usedTools?.length || 0;

  return (
    <Link href="/dashboard">
      <div
        className="px-2 py-2 rounded-lg bg-green-500/10 border border-green-300/40 dark:border-green-700/40 cursor-pointer hover:bg-green-500/15 transition-colors group"
        data-testid="sidebar-campaign-indicator"
      >
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <Package className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-400 truncate">{name}</span>
          </div>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive text-xs ml-1 flex-shrink-0"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); clear(); }}
            title="Hapus campaign aktif"
            data-testid="btn-clear-campaign"
          >
            ✕
          </button>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {toolCount > 0 ? `${toolCount} tools digunakan` : "Campaign aktif"}
          </span>
          {toolCount > 0 && (
            <Badge className="text-xs px-1 py-0 h-3.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0 font-medium">
              {toolCount}
            </Badge>
          )}
        </div>
      </div>
    </Link>
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

        {/* Active Campaign Indicator */}
        <div className="px-2 pb-1">
          <CampaignIndicator />
        </div>

        <NavGroup label="Winning Campaign" items={winningItems} badge="10" badgeColor="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
        <NavGroup label="Sistem Sales" items={salesSystemItems} badge="6" badgeColor="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" defaultOpen={true} />
        <NavGroup label="Otomasi AI" items={automasiItems} badge="6" badgeColor="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" defaultOpen={true} />
        <NavGroup label="Produk Digital" items={digitalProductItems} badge="9" badgeColor="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" defaultOpen={false} />
        <NavGroup label="AI Assistant" items={aiAssistantItems} badge="4" badgeColor="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" defaultOpen={false} />
        <NavGroup label="AI Creator" items={aiCreatorItems} badge="8" badgeColor="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" defaultOpen={false} />
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
