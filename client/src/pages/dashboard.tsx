import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Image,
  FileText,
  Volume2,
  Megaphone,
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  BarChart3,
} from "lucide-react";

const quickActions = [
  {
    title: "AI Chat",
    description: "Chat with AI assistant for marketing advice",
    icon: MessageSquare,
    href: "/ai-chat",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Image Creator",
    description: "Generate stunning images with AI",
    icon: Image,
    href: "/ai-images",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Article Creator",
    description: "Create SEO-optimized articles automatically",
    icon: FileText,
    href: "/ai-articles",
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Ad Creator",
    description: "Create winning ads for all platforms",
    icon: Megaphone,
    href: "/ad-creator",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    title: "Story Telling",
    description: "Create compelling promotional stories",
    icon: BookOpen,
    href: "/story-telling",
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    title: "Text to Speech",
    description: "Convert text to natural voice",
    icon: Volume2,
    href: "/ai-tts",
    color: "bg-cyan-500/10 text-cyan-500",
  },
];

const stats = [
  { label: "AI Generations", value: "2,456", change: "+12%", icon: Sparkles },
  { label: "Ads Created", value: "156", change: "+8%", icon: Target },
  { label: "Articles Written", value: "89", change: "+24%", icon: FileText },
  { label: "Images Generated", value: "432", change: "+18%", icon: Image },
];

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome to your AI-powered marketing suite
            </p>
          </div>
          <Button asChild data-testid="button-new-project">
            <Link href="/ad-creator">
              <Sparkles className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <Badge variant="secondary">AI Powered</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="hover-elevate cursor-pointer h-full transition-all">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className={`p-2 rounded-md ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {action.description}
                      </CardDescription>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Platform Performance
              </CardTitle>
              <CardDescription>Ad performance across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Meta Ads", value: 85, color: "bg-blue-500" },
                  { name: "Google Ads", value: 72, color: "bg-green-500" },
                  { name: "TikTok", value: 68, color: "bg-pink-500" },
                  { name: "YouTube", value: 56, color: "bg-red-500" },
                ].map((platform) => (
                  <div key={platform.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{platform.name}</span>
                      <span className="text-muted-foreground">{platform.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${platform.color} transition-all`}
                        style={{ width: `${platform.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest AI generations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "Image", title: "Product Banner", time: "2 min ago" },
                  { type: "Article", title: "SEO Blog Post", time: "15 min ago" },
                  { type: "Ad", title: "Meta Campaign", time: "1 hour ago" },
                  { type: "Story", title: "Brand Story", time: "2 hours ago" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.type}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
