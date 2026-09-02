import { Coins } from "lucide-react";

import { CoinsDistributionTable } from "@/components/admin/coins-distribution-table";
import { MetricCard } from "@/components/admin/metric-card";

const metrics = [
  { title: "Total Rules", value: "8", delta: "Active", trend: "flat" as const },
  { title: "Avg Coins / User", value: "387", delta: "+12 this month", trend: "up" as const },
  { title: "Coins Distributed Today", value: "14,320", delta: "+6.2%", trend: "up" as const },
  { title: "Top Earning Action", value: "Host Event", delta: "30 coins", trend: "flat" as const },
];

export default function CoinsDistributionPage() {
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
