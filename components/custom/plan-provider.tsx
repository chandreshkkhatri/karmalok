"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export type Plan = 'basic' | 'pro' | 'enterprise';

interface PlanContextType {
  plan: Plan;
  isBasic: boolean;
  isPro: boolean;
  isEnterprise: boolean;
  hasFeatureAccess: (feature: string) => boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [plan, setPlan] = useState<Plan>('basic');

  useEffect(() => {
    if (session?.user?.plan) {
      setPlan(session.user.plan);
    }
  }, [session]);

  const hasFeatureAccess = (feature: string): boolean => {
    const featureAccess: Record<string, Plan[]> = {
      'gemini-pro-models': ['pro', 'enterprise'],
      'advanced-models': ['pro', 'enterprise'],
      'priority-support': ['pro', 'enterprise'],
      'unlimited-chats': ['pro', 'enterprise'],
      'custom-models': ['enterprise'],
      'team-features': ['enterprise'],
    };

    return featureAccess[feature]?.includes(plan) || false;
  };

  const contextValue: PlanContextType = {
    plan,
    isBasic: plan === 'basic',
    isPro: plan === 'pro',
    isEnterprise: plan === 'enterprise',
    hasFeatureAccess,
  };

  return (
    <PlanContext.Provider value={contextValue}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}

// Plan configuration
export const PLAN_CONFIG = {
  basic: {
    name: 'Basic',
    description: 'Essential features for getting started',
    models: ['gemini-1.5-flash'],
  },
  pro: {
    name: 'Pro',
    description: 'Advanced features for power users',
    models: [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash-exp',
      'gemini-exp-1206',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Full access with enterprise features',
    models: [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash-exp',
      'gemini-exp-1206',
      'gemini-1.5-pro-002',
    ],
  },
} as const;