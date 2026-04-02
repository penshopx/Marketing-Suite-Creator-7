import { useState, useEffect, useCallback } from "react";

export interface MarketingContext {
  productName: string;
  productNiche: string;
  targetAudience: string;
  budget: string;
  daysCompleted: number;
  completedTasksCount: number;
}

const STORAGE_KEY = "marketing_context";
const PLAN_DAYS_KEY = "execution_completed_days";
const PLAN_TASKS_KEY = "execution_completed_tasks";

const DEFAULT_CONTEXT: MarketingContext = {
  productName: "",
  productNiche: "",
  targetAudience: "",
  budget: "",
  daysCompleted: 0,
  completedTasksCount: 0,
};

export function useMarketingContext() {
  const [context, setContext] = useState<MarketingContext>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const planDays = localStorage.getItem(PLAN_DAYS_KEY);
      const planTasks = localStorage.getItem(PLAN_TASKS_KEY);

      const base = saved ? { ...DEFAULT_CONTEXT, ...JSON.parse(saved) } : { ...DEFAULT_CONTEXT };

      const daysObj = planDays ? JSON.parse(planDays) : {};
      const tasksObj = planTasks ? JSON.parse(planTasks) : {};
      base.daysCompleted = Object.values(daysObj).filter(Boolean).length;
      base.completedTasksCount = Object.values(tasksObj).filter(Boolean).length;

      return base;
    } catch {
      return { ...DEFAULT_CONTEXT };
    }
  });

  const update = useCallback((updates: Partial<Omit<MarketingContext, "daysCompleted" | "completedTasksCount">>) => {
    setContext(prev => {
      const next = { ...prev, ...updates };
      try {
        const { daysCompleted, completedTasksCount, ...toSave } = next;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch {}
      return next;
    });
  }, []);

  const refresh = useCallback(() => {
    try {
      const planDays = localStorage.getItem(PLAN_DAYS_KEY);
      const planTasks = localStorage.getItem(PLAN_TASKS_KEY);
      const daysObj = planDays ? JSON.parse(planDays) : {};
      const tasksObj = planTasks ? JSON.parse(planTasks) : {};
      setContext(prev => ({
        ...prev,
        daysCompleted: Object.values(daysObj).filter(Boolean).length,
        completedTasksCount: Object.values(tasksObj).filter(Boolean).length,
      }));
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  return { context, update };
}
