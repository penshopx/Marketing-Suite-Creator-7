import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap } from "lucide-react";

export interface NextStep {
  title: string;
  description: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}

interface NextStepsProps {
  title?: string;
  steps: NextStep[];
}

export function NextSteps({ title = "Langkah Selanjutnya", steps }: NextStepsProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((step, i) => (
            <Link key={i} href={step.href}>
              <div className="group flex items-start gap-3 p-3 rounded-lg border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">{step.title}</p>
                    {step.badge && (
                      <Badge className={`text-xs ${step.badgeColor || "bg-primary/10 text-primary"}`}>
                        {step.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{step.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
