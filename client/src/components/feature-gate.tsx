import { Link } from "wouter";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Sparkles } from "lucide-react";

interface FeatureGateProps {
  feature: keyof ReturnType<typeof useSubscription>["limits"];
  requiredTier?: "pro" | "enterprise";
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export function FeatureGate({
  feature,
  requiredTier = "pro",
  children,
  fallbackTitle = "Fitur Premium",
  fallbackDescription = "Upgrade ke paket Pro untuk mengakses fitur ini dan tingkatkan hasil marketing Anda.",
}: FeatureGateProps) {
  const { canAccess, tier, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const hasAccess = canAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  const tierLabel = requiredTier === "enterprise" ? "Enterprise" : "Pro";

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{fallbackTitle}</CardTitle>
          <CardDescription className="text-base">
            {fallbackDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            Paket saat ini: <span className="font-medium capitalize">{tier}</span>
          </div>
          <Link href="/pricing">
            <Button className="w-full gap-2" data-testid="button-upgrade-feature">
              <Sparkles className="h-4 w-4" />
              Upgrade ke {tierLabel}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
