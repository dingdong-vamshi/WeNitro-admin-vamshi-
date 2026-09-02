import { Gift } from "lucide-react";

import { RewardsCatalogTable } from "@/components/admin/rewards-catalog-table";
import { MetricCard } from "@/components/admin/metric-card";

const metrics = [
  { title: "Total Rewards", value: "6", delta: "In catalog", trend: "flat" as const },
  { title: "Active Rewards", value: "5", delta: "1 inactive", trend: "up" as const },
  { title: "Rewards Redeemed", value: "5,420", delta: "+8.3%", trend: "up" as const },
  { title: "Avg Coins / Redemption", value: "430", delta: "This month", trend: "flat" as const },
];

export default function RewardsCatalogPage() {
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
