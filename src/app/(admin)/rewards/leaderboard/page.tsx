import { Trophy } from "lucide-react";

import { LeaderboardTable } from "@/components/admin/leaderboard-table";
import { MetricCard } from "@/components/admin/metric-card";

const metrics = [
  { title: "Total Participants", value: "3,200", delta: "Active reward users", trend: "up" as const },
  { title: "Coins Distributed", value: "1.24M", delta: "+9.1%", trend: "up" as const },
  { title: "Top Score (Monthly)", value: "4,200", delta: "Rahul S.", trend: "up" as const },
  { title: "Avg Coins / User", value: "387", delta: "This month", trend: "flat" as const },
];

export default function LeaderboardPage() {
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
