import { useAuth } from "./use-auth";

export function useSubscription() {
  const { isAuthenticated } = useAuth();

  return {
    subscription: null,
    tier: "enterprise" as const,
    limits: {},
    isLoading: false,
    canAccess: () => true,
    isPro: true,
    isEnterprise: true,
    isAdmin: isAuthenticated,
  };
}
