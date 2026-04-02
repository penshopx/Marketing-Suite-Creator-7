import { useState, useEffect, useCallback } from "react";

export interface CampaignData {
  produk: string;
  harga: string;
  niche: string;
  target: string;
  usp: string;
  kompetitor: string;
  savedInterests: string[];
  savedPersona: string;
  usedTools: string[];
  updatedAt: string;
}

const STORAGE_KEY = "active_campaign";

const DEFAULT: CampaignData = {
  produk: "",
  harga: "",
  niche: "",
  target: "",
  usp: "",
  kompetitor: "",
  savedInterests: [],
  savedPersona: "",
  usedTools: [],
  updatedAt: "",
};

export function useCampaignStore() {
  const [campaign, setCampaignState] = useState<CampaignData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT, ...JSON.parse(saved) } : { ...DEFAULT };
    } catch {
      return { ...DEFAULT };
    }
  });

  const save = useCallback((updates: Partial<CampaignData>) => {
    setCampaignState((prev) => {
      const next = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("campaign_updated"));
      } catch {}
      return next;
    });
  }, []);

  const markToolUsed = useCallback((toolId: string) => {
    setCampaignState((prev) => {
      if (prev.usedTools.includes(toolId)) return prev;
      const next = { ...prev, usedTools: [...prev.usedTools, toolId], updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("campaign_updated"));
      } catch {}
      return next;
    });
  }, []);

  const addInterests = useCallback((interests: string[]) => {
    setCampaignState((prev) => {
      const merged = Array.from(new Set([...prev.savedInterests, ...interests]));
      const next = { ...prev, savedInterests: merged, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("campaign_updated"));
      } catch {}
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    const empty = { ...DEFAULT };
    setCampaignState(empty);
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("campaign_updated"));
    } catch {}
  }, []);

  const isActive = campaign.produk.trim().length > 0;

  useEffect(() => {
    const handler = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setCampaignState({ ...DEFAULT, ...JSON.parse(saved) });
      } catch {}
    };
    window.addEventListener("campaign_updated", handler);
    return () => window.removeEventListener("campaign_updated", handler);
  }, []);

  return { campaign, save, markToolUsed, addInterests, clear, isActive };
}
