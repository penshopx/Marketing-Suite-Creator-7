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
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useAuth } from "@/hooks/use-auth";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";
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
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Panduan Fitur",
    url: "/guide-chatbot",
    icon: HelpCircle,
  },
];

const winningItems = [
  {
    title: "Roadmap Winning",
    url: "/winning-dashboard",
    icon: Trophy,
  },
  {
    title: "Panduan Praktis",
    url: "/winning-guide",
    icon: GraduationCap,
  },
  {
    title: "Sistem 14 Hari",
    url: "/execution-plan",
    icon: CalendarDays,
  },
  {
    title: "Simulasi Beriklan",
    url: "/ad-simulation",
    icon: Play,
  },
  {
    title: "Campaign Wizard",
    url: "/campaign-wizard",
    icon: Target,
  },
  {
    title: "Audience Builder",
    url: "/audience-builder",
    icon: Users,
  },
  {
    title: "Ad Analyzer",
    url: "/campaign-analyzer",
    icon: BarChart3,
  },
];

const aiAssistantItems = [
  {
    title: "AI Chat",
    url: "/ai-chat",
    icon: MessageSquare,
  },
  {
    title: "AI Expert Chat",
    url: "/ai-expert",
    icon: Sparkles,
  },
];

const aiCreatorItems = [
  {
    title: "Image Creator",
    url: "/ai-images",
    icon: Image,
  },
  {
    title: "Article Creator",
    url: "/ai-articles",
    icon: FileText,
  },
  {
    title: "Banner Creator",
    url: "/ai-banners",
    icon: Palette,
  },
  {
    title: "Video Creator",
    url: "/ai-video",
    icon: Video,
  },
];

const aiAudioItems = [
  {
    title: "Text to Speech",
    url: "/ai-tts",
    icon: Volume2,
  },
  {
    title: "Speech to Text",
    url: "/ai-stt",
    icon: Volume2,
  },
];

const marketingItems = [
  {
    title: "Ad Creator",
    url: "/ad-creator",
    icon: Megaphone,
  },
  {
    title: "Story Telling",
    url: "/story-telling",
    icon: BookOpen,
  },
  {
    title: "AI Templates",
    url: "/ai-templates",
    icon: BookMarked,
  },
  {
    title: "Landing Page",
    url: "/landing-page",
    icon: Globe,
  },
  {
    title: "Affiliate Content",
    url: "/affiliate-content",
    icon: Globe,
  },
  {
    title: "Prompt Framework",
    url: "/prompt-framework",
    icon: Zap,
  },
];

const digitalProductItems = [
  {
    title: "Katalog Produk",
    url: "/digital-products",
    icon: Package,
  },
  {
    title: "TikTok Ads",
    url: "/tiktok-ads",
    icon: SiTiktok,
  },
  {
    title: "Meta Ads Advanced",
    url: "/meta-ads",
    icon: Megaphone,
  },
];

interface NavGroupProps {
  label: string;
  items: { title: string; url: string; icon: React.ElementType }[];
  defaultOpen?: boolean;
}

function NavGroup({ label, items, defaultOpen = true }: NavGroupProps) {
  const [location] = useLocation();
  
  return (
    <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="cursor-pointer flex items-center justify-between hover-elevate rounded-md">
            <span>{label}</span>
            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
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
                      location === item.url && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <Link href={item.url} data-testid={`link-${item.url.replace(/\//g, '-').slice(1) || 'home'}`}>
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
          <span className="text-xs text-muted-foreground" data-testid="text-user-email">{user.email}</span>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => logout()}
        data-testid="button-logout"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function AppSidebar() {
  const [location] = useLocation();
  const { canInstall, isInstalling, install } = usePWAInstall();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Marketing Tools</span>
            <span className="text-xs text-muted-foreground">AI Powered Suite</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      location === item.url && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <Link href={item.url} data-testid={`link-${item.url.replace(/\//g, '-').slice(1) || 'dashboard'}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavGroup label="Winning Campaign" items={winningItems} />
        <NavGroup label="Produk Digital" items={digitalProductItems} />
        <NavGroup label="AI Assistant" items={aiAssistantItems} />
        <NavGroup label="AI Creator" items={aiCreatorItems} />
        <NavGroup label="AI Audio" items={aiAudioItems} />
        <NavGroup label="Marketing" items={marketingItems} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 space-y-3">
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
