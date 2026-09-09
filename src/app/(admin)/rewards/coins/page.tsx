"use client";

import { useQuery } from "@tanstack/react-query";
import { Coins } from "lucide-react";

import { AdminDataState } from "@/components/admin/admin-data-state";
import { CoinsDistributionTable } from "@/components/admin/coins-distribution-table";
import { MetricCard } from "@/components/admin/metric-card";
import { getCoinRules, getGamificationMetrics } from "@/lib/api";

export default function CoinsDistributionPage() {
  const query = useQuery({
    queryKey: ["coin-page-metrics"],
    queryFn: async () => {
      const [rules, metrics] = await Promise.all([getCoinRules({ page: 1, pageSize: 1000 }), getGamificationMetrics()]);
      return { rules, metrics };
    },
  });
  if (query.isLoading) return <AdminDataState title="coin metrics" loading />;
  if (query.error) return <AdminDataState title="coin metrics" error={query.error} onRetry={() => void query.refetch()} />;
  const metrics = [
    { title: "Total Rules", value: String(query.data?.rules.total ?? 0), delta: "Live catalog", trend: "flat" as const },
    { title: "Avg Coins / User", value: (query.data?.metrics.avgCoinsPerUser ?? 0).toLocaleString(), delta: "All users", trend: "flat" as const },
    { title: "Total Coins Distributed", value: (query.data?.metrics.totalCoinsDistributed ?? 0).toLocaleString(), delta: "Current balances", trend: "flat" as const },
    { title: "Top Earning Action", value: query.data?.metrics.topCoinAction || "Not tracked", delta: "Live schema", trend: "flat" as const },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Coins className="h-5 w-5 text-amber-500" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Coins Distribution</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Define and manage coin earning rules for user actions across the platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.title} metric={m} />
        ))}
      </div>

      <CoinsDistributionTable />
    </div>
  );
}
