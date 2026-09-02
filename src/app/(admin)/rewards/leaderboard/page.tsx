"use client";

import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";

import { AdminDataState } from "@/components/admin/admin-data-state";
import { LeaderboardTable } from "@/components/admin/leaderboard-table";
import { MetricCard } from "@/components/admin/metric-card";
import { getGamificationMetrics, getLeaderboard } from "@/lib/api";

export default function LeaderboardPage() {
  const query = useQuery({
    queryKey: ["leaderboard-page-metrics"],
    queryFn: async () => {
      const [entries, gamification] = await Promise.all([getLeaderboard("monthly"), getGamificationMetrics()]);
      return { entries, gamification };
    },
  });
  if (query.isLoading) return <AdminDataState title="leaderboard metrics" loading />;
  if (query.error) return <AdminDataState title="leaderboard metrics" error={query.error} onRetry={() => void query.refetch()} />;
  const top = query.data?.entries[0];
  const metrics = [
    { title: "Total Participants", value: String(query.data?.entries.length ?? 0), delta: "Live users", trend: "flat" as const },
    { title: "Coins Distributed", value: (query.data?.gamification.totalCoinsDistributed ?? 0).toLocaleString(), delta: "Current balances", trend: "flat" as const },
    { title: "Top Score (Monthly)", value: (top?.coinsEarned ?? 0).toLocaleString(), delta: top?.name ?? "No ranked users", trend: "flat" as const },
    { title: "Avg Coins / User", value: (query.data?.gamification.avgCoinsPerUser ?? 0).toLocaleString(), delta: "All users", trend: "flat" as const },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-sky-500" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Top users ranked by coins earned, event activity, and referrals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.title} metric={m} />
        ))}
      </div>

      <LeaderboardTable />
    </div>
  );
}
