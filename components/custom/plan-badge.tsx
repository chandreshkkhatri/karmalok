"use client";

import { usePlan } from "./plan-provider";
import { Badge } from "../ui/badge";

export function PlanBadge({ className = "" }: { className?: string }) {
  const { plan, isBasic, isPro, isEnterprise } = usePlan();

  const planConfig = {
    basic: {
      label: 'Basic',
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    },
    pro: {
      label: 'Pro',
      variant: 'default' as const,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    enterprise: {
      label: 'Enterprise',
      variant: 'default' as const,
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    },
  };

  const config = planConfig[plan];

  return (
    <Badge 
      variant={config.variant}
      className={`text-xs ${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
}