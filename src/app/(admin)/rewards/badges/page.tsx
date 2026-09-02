import { Award } from "lucide-react";

import { AchievementBadgesTable } from "@/components/admin/achievement-badges-table";
import { MetricCard } from "@/components/admin/metric-card";

const metrics = [
  { title: "Total Badges", value: "8", delta: "Defined", trend: "flat" as const },
  { title: "Active Badges", value: "7", delta: "1 disabled", trend: "up" as const },
  { title: "Badges Awarded", value: "12,840", delta: "+18.5%", trend: "up" as const },
  { title: "Most Earned", value: "Event Explorer", delta: "Join 10 Events", trend: "flat" as const },
];

export default function AchievementBadgesPage() {
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

      <AchievementBadgesTable />
    </div>
  );
}
