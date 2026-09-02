"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldOff, FileWarning, Globe, AlertTriangle } from "lucide-react";

import { getSecurityInsights } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

const insightCards = [
  {
    key: "totalBlockedUsers" as const,
    label: "Total Blocked Users",
    icon: ShieldOff,
    colorClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-500/15",
    borderClass: "border-rose-200 dark:border-rose-900/50",
  },
  {
    key: "activeSafetyReports" as const,
    label: "Active Safety Reports",
    icon: FileWarning,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/15",
    borderClass: "border-amber-200 dark:border-amber-900/50",
  },
  {
    key: "suspiciousIps" as const,
    label: "Suspicious IPs",
    icon: Globe,
    colorClass: "text-sky-600 dark:text-sky-400",
    bgClass: "bg-sky-500/15",
    borderClass: "border-sky-200 dark:border-sky-900/50",
  },
  {
    key: "abuseAlertsToday" as const,
    label: "Abuse Alerts Today",
    icon: AlertTriangle,
    colorClass: "text-orange-600 dark:text-orange-400",
    bgClass: "bg-orange-500/15",
    borderClass: "border-orange-200 dark:border-orange-900/50",
  },
];

export function SecurityInsightsSection() {
  const query = useQuery({
    queryKey: ["security-insights"],
    queryFn: getSecurityInsights,
  });

  if (query.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {insightCards.map((card) => (
          <Card key={card.key} className="animate-pulse">
            <CardContent className="pt-5">
              <div className="h-14 rounded-md bg-muted/60" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!query.data) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {insightCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key} className={`border ${card.borderClass}`}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2.5 ${card.bgClass}`}>
                  <Icon className={`h-5 w-5 ${card.colorClass}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{query.data[card.key].toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
