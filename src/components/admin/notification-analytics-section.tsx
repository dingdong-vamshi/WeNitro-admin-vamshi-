import { MousePointerClick, Send, TrendingDown, Users } from "lucide-react";

import type { NotificationStats } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statConfig = [
  {
    key: "totalSent" as const,
    label: "Total Notifications Sent",
    icon: Send,
    format: (v: number) => v.toLocaleString(),
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    key: "openRate" as const,
    label: "Open Rate",
    icon: Users,
    format: (v: number) => `${v}%`,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    key: "clickRate" as const,
    label: "Click Rate",
    icon: MousePointerClick,
    format: (v: number) => `${v}%`,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    key: "unsubscribed" as const,
    label: "Unsubscribed Users",
    icon: TrendingDown,
    format: (v: number) => v.toLocaleString(),
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
];

export function NotificationAnalyticsSection({ stats }: { stats: NotificationStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statConfig.map(({ key, label, icon: Icon, format, color, bg }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <div className={`rounded-lg p-2 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight">{format(stats[key])}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
