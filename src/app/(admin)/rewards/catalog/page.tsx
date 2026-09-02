"use client";

import { useQuery } from "@tanstack/react-query";
import { Gift } from "lucide-react";

import { AdminDataState } from "@/components/admin/admin-data-state";
import { RewardsCatalogTable } from "@/components/admin/rewards-catalog-table";
import { MetricCard } from "@/components/admin/metric-card";
import { getRewardCatalog } from "@/lib/api";

export default function RewardsCatalogPage() {
  const query = useQuery({ queryKey: ["reward-page-metrics"], queryFn: () => getRewardCatalog({ page: 1, pageSize: 1000 }) });
  if (query.isLoading) return <AdminDataState title="reward catalog" loading />;
  if (query.error) return <AdminDataState title="reward catalog" error={query.error} onRetry={() => void query.refetch()} />;
  const rows = query.data?.rows ?? [];
  const metrics = [
    { title: "Total Rewards", value: String(query.data?.total ?? 0), delta: "Live catalog", trend: "flat" as const },
    { title: "Active Rewards", value: String(rows.filter((reward) => reward.status === "active").length), delta: "Currently active", trend: "flat" as const },
    { title: "Rewards Redeemed", value: "Not tracked", delta: "Backend not configured", trend: "flat" as const },
    { title: "Avg Coins / Redemption", value: "Not tracked", delta: "Backend not configured", trend: "flat" as const },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-violet-500" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rewards Catalog</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage items users can redeem with their earned coins.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.title} metric={m} />
        ))}
      </div>

      <RewardsCatalogTable />
    </div>
  );
}
