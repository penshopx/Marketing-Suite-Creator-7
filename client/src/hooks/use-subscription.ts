import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import type { SubscriptionTier } from "@shared/schema";

interface SubscriptionData {
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd?: string;
}

interface FeatureLimits {
  aiChatsPerDay: number;
  adCopiesPerDay: number;
  imageGenerations: number;
  articleGeneration: boolean;
  ttsGeneration: boolean;
  sttTranscription: boolean;
  campaignWizard: boolean;
  audienceBuilder: boolean;
  adAnalyzer: boolean;
  landingPageCreator: boolean;
  videoCreator: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
}

const FEATURE_LIMITS: Record<SubscriptionTier, FeatureLimits> = {
  free: {
    aiChatsPerDay: 5,
    adCopiesPerDay: 3,
    imageGenerations: 2,
    articleGeneration: false,
    ttsGeneration: false,
    sttTranscription: false,
    campaignWizard: false,
    audienceBuilder: false,
    adAnalyzer: false,
    landingPageCreator: false,
    videoCreator: false,
    prioritySupport: false,
    customBranding: false,
  },
  pro: {
    aiChatsPerDay: 100,
    adCopiesPerDay: 50,
    imageGenerations: 25,
    articleGeneration: true,
    ttsGeneration: true,
    sttTranscription: true,
    campaignWizard: true,
    audienceBuilder: true,
    adAnalyzer: true,
    landingPageCreator: true,
    videoCreator: false,
    prioritySupport: true,
    customBranding: false,
  },
  enterprise: {
    aiChatsPerDay: Infinity,
    adCopiesPerDay: Infinity,
    imageGenerations: Infinity,
    articleGeneration: true,
    ttsGeneration: true,
    sttTranscription: true,
    campaignWizard: true,
    audienceBuilder: true,
    adAnalyzer: true,
    landingPageCreator: true,
    videoCreator: true,
    prioritySupport: true,
    customBranding: true,
  },
};

interface SubscriptionResponse extends SubscriptionData {
  isAdmin?: boolean;
}

async function fetchSubscription(): Promise<SubscriptionResponse> {
  const response = await fetch("/api/subscription", {
    credentials: "include",
  });

  if (!response.ok) {
    return { tier: "free", status: "active", isAdmin: false };
  }

  return response.json();
}

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();
  
  const { data: subscription, isLoading } = useQuery<SubscriptionResponse>({
    queryKey: ["/api/subscription"],
    queryFn: fetchSubscription,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const tier: SubscriptionTier = subscription?.tier || "free";
  const isAdmin = subscription?.isAdmin || false;
  const limits = FEATURE_LIMITS[tier];

  const canAccess = (feature: keyof FeatureLimits): boolean => {
    if (isAdmin) return true;
    const limit = limits[feature];
    return typeof limit === "boolean" ? limit : limit > 0;
  };

  const isPro = tier === "pro" || tier === "enterprise" || isAdmin;
  const isEnterprise = tier === "enterprise" || isAdmin;

  return {
    subscription,
    tier,
    limits,
    isLoading,
    canAccess,
    isPro,
    isEnterprise,
    isAdmin,
  };
}
