"use client";

import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";

import { AdminDataState } from "@/components/admin/admin-data-state";
import { MetricCard } from "@/components/admin/metric-card";
import { getAchievementBadges } from "@/lib/api";

export default function AchievementBadgesPage() {
  const query = useQuery({ queryKey: ["achievement-badge-summary"], queryFn: () => getAchievementBadges({ page: 1, pageSize: 1000 }) });
  if (query.isLoading) return <AdminDataState title="achievement badges" loading />;
  if (query.error || !query.data) return <AdminDataState title="achievement badges" error={query.error} onRetry={() => void query.refetch()} />;
  const metrics = [
    { title: "Total Badges", value: query.data.total.toLocaleString(), delta: "Live catalog", trend: "flat" as const },
    { title: "Active Badges", value: query.data.rows.filter((badge) => badge.status === "active").length.toLocaleString(), delta: "Enabled", trend: "flat" as const },
    { title: "Disabled Badges", value: query.data.rows.filter((badge) => badge.status === "disabled").length.toLocaleString(), delta: "Catalog state", trend: "flat" as const },
    { title: "Catalog Source", value: "WeNitro", delta: "Live database", trend: "flat" as const },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-rose-500" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Achievement Badges</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Define milestone-based badges to reward and celebrate user achievements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.title} metric={m} />
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Live badge catalog</h2>
          <p className="mt-1 text-sm text-muted-foreground">Loaded from the WeNitro badge table. No fixtures.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Badge</th>
                <th className="px-5 py-3 font-medium">Requirement</th>
                <th className="px-5 py-3 font-medium">Reward</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {query.data.rows.map((badge) => (
                <tr key={badge.id}>
                  <td className="px-5 py-3 font-medium">{badge.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{badge.requirement}</td>
                  <td className="px-5 py-3">{badge.rewardCoins.toLocaleString()} Nitro</td>
                  <td className="px-5 py-3 capitalize">{badge.status}</td>
                </tr>
              ))}
              {query.data.rows.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-muted-foreground" colSpan={4}>No badge records configured.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
