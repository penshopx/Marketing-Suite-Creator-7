import { useAuth } from "./use-auth";

export type SubscriptionTier = "free" | "pro" | "enterprise";

const tierLimits = {
  free: {
    dailyGenerations: 5,
    maxTools: 10,
  },
  pro: {
    dailyGenerations: Infinity,
    maxTools: Infinity,
  },
  enterprise: {
    dailyGenerations: Infinity,
    maxTools: Infinity,
  },
};

const proOnlyTools = [
  "ai-images",
  "ai-banners",
  "ai-video",
  "ai-tts",
  "ai-stt",
  "landing-page",
  "ai-articles",
];

export function useSubscription() {
  const { user, isLoading } = useAuth();

  const tier: SubscriptionTier = (user as any)?.plan === "pro"
    ? "pro"
    : (user as any)?.plan === "enterprise"
    ? "enterprise"
    : "free";

  const limits = tierLimits[tier];
  const isPro = tier === "pro" || tier === "enterprise";
  const isEnterprise = tier === "enterprise";

  const canAccess = (toolId?: string) => {
    if (!user) return false;
    if (isPro) return true;
    if (toolId && proOnlyTools.includes(toolId)) return false;
    return true;
  };

  return {
    subscription: user ? { plan: tier } : null,
    tier,
    limits,
    isLoading,
    canAccess,
    isPro,
    isEnterprise,
    isAdmin: isEnterprise,
  };
}
