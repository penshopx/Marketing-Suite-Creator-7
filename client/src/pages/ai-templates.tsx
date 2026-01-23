import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookMarked, Copy, Search, Sparkles, FileText, Megaphone, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const templateCategories = [
  { id: "all", name: "All Templates" },
  { id: "ads", name: "Ad Copy" },
  { id: "email", name: "Email" },
  { id: "social", name: "Social Media" },
  { id: "landing", name: "Landing Page" },
];

const templates = [
  {
    id: "1",
    title: "AIDA Framework",
    description: "Attention, Interest, Desire, Action - Classic persuasion formula",
    category: "ads",
    icon: Megaphone,
    template: `[ATTENTION]
Hook your audience with a bold statement or question

[INTEREST]
Explain the problem and how it affects them

[DESIRE]
Present your solution and its benefits

[ACTION]
Clear call-to-action with urgency`,
  },
  {
    id: "2",
    title: "PAS Framework",
    description: "Problem, Agitation, Solution - Powerful for pain points",
    category: "ads",
    icon: Megaphone,
    template: `[PROBLEM]
Identify the specific problem your audience faces

[AGITATION]
Amplify the pain - what happens if they don't solve it?

[SOLUTION]
Introduce your product/service as the answer`,
  },
  {
    id: "3",
    title: "Cold Email Outreach",
    description: "Professional B2B outreach email template",
    category: "email",
    icon: Mail,
    template: `Subject: Quick question about [Company]

Hi [Name],

I noticed [specific observation about their company/recent news].

At [Your Company], we help [target audience] achieve [specific result].

For example, we helped [similar company] [specific result with numbers].

Would you be open to a quick 15-minute call next week?

Best,
[Your Name]`,
  },
  {
    id: "4",
    title: "Social Media Hook",
    description: "Attention-grabbing first line for social posts",
    category: "social",
    icon: MessageSquare,
    template: `[HOOK OPTIONS]

1. "Stop scrolling if you [target audience identifier]..."
2. "Nobody talks about this, but..."
3. "I made $X in Y days. Here's how:"
4. "The biggest mistake [audience] make is..."
5. "90% of [audience] don't know this trick..."`,
  },
  {
    id: "5",
    title: "Landing Page Hero",
    description: "High-converting hero section copy",
    category: "landing",
    icon: FileText,
    template: `[HEADLINE]
[Desired outcome] in [timeframe] without [pain point]

[SUBHEADLINE]
[More specific benefit]. Join [social proof number] others who [achieved result].

[CTA]
[Action verb] + [Benefit] - "Start Your Free Trial"

[SUPPORTING TEXT]
No credit card required • Cancel anytime • 30-day money-back guarantee`,
  },
  {
    id: "6",
    title: "Testimonial Request",
    description: "Email template to request customer testimonials",
    category: "email",
    icon: Mail,
    template: `Subject: Quick favor (takes 2 minutes)

Hi [Name],

I hope you're enjoying [Product/Service]!

We're collecting stories from customers like you, and I'd love to feature yours.

Would you mind answering these 3 quick questions?

1. What problem were you trying to solve before using [Product]?
2. How has [Product] helped you?
3. What results have you seen?

As a thank you, I'd love to offer you [incentive].

Best,
[Your Name]`,
  },
  {
    id: "7",
    title: "FAB Framework",
    description: "Features, Advantages, Benefits",
    category: "ads",
    icon: Megaphone,
    template: `[FEATURE]
What your product does or has

[ADVANTAGE]
How this feature works or helps

[BENEFIT]
Why this matters to the customer (emotional outcome)

Example:
Feature: 30-day battery life
Advantage: Charge once a month instead of daily
Benefit: Never miss tracking your workout or important notification`,
  },
  {
    id: "8",
    title: "Social Proof Post",
    description: "Showcase customer results",
    category: "social",
    icon: MessageSquare,
    template: `[RESULT HIGHLIGHT]
[Customer/Company] achieved [specific result] using [Your Product]

[THE STORY]
- Starting point: [where they were]
- Challenge: [what they struggled with]
- Solution: [how your product helped]
- Result: [specific numbers/outcomes]

[QUOTE]
"[Direct customer quote about the experience]"

[CTA]
Want similar results? [Link in bio/DM us/etc.]`,
  },
];

export default function AITemplates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const { toast } = useToast();

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Template copied to clipboard",
    });
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-primary" />
            AI Templates
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Proven marketing templates to supercharge your content
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-templates"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {templateCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                data-testid={`button-category-${cat.id}`}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`hover-elevate cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <template.icon className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-base">{template.title}</CardTitle>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {templateCategories.find((c) => c.id === template.category)?.name}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <BookMarked className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No templates found</p>
                    <p className="text-sm mt-1">Try adjusting your search or category</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle>
                    {selectedTemplate ? selectedTemplate.title : "Select Template"}
                  </CardTitle>
                  <CardDescription>
                    {selectedTemplate ? selectedTemplate.description : "Click a template to view"}
                  </CardDescription>
                </div>
                {selectedTemplate && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(selectedTemplate.template)}
                    data-testid="button-copy-template"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {selectedTemplate ? (
                  <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg overflow-auto max-h-[500px]">
                    {selectedTemplate.template}
                  </pre>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-center text-muted-foreground bg-muted/50 rounded-lg">
                    <div>
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Select a template to preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
