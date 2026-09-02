import { Suspense } from "react";
import { Users, CalendarDays, MessageSquare, Flag } from "lucide-react";

import { getPlatformActivityReportData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTimelineChart } from "@/components/charts/reports-charts";
import { AnalyticsFilters } from "@/components/admin/analytics-filters";
import type { AnalyticsRange } from "@/types/admin";

type Props = { searchParams: Promise<{ range?: string }> };

export default async function PlatformActivityPage({ searchParams }: Props) {
  const { range: rawRange } = await searchParams;
  const range: AnalyticsRange =
    rawRange === "7d" || rawRange === "12m" ? rawRange : "30d";

  const data = await getPlatformActivityReportData(range);

  const stats = [
    { label: "Daily Active Users",   value: data.stats.dau.toLocaleString(),                Icon: Users,         color: "text-chart-1" },
    { label: "Events Created Today", value: data.stats.eventsCreatedToday.toLocaleString(), Icon: CalendarDays,  color: "text-chart-2" },
    { label: "Messages Sent",        value: data.stats.messagesSent.toLocaleString(),        Icon: MessageSquare, color: "text-chart-3" },
    { label: "Reports Submitted",    value: data.stats.reportsSubmitted.toLocaleString(),    Icon: Flag,          color: "text-chart-4" },
  ];

  const csvRows = data.timeline.map((t) => ({
    Period:          t.label,
    Registrations:   t.registrations,
    Events:          t.events,
    Messages:        t.messages,
    Reports:         t.reports,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of overall platform health: active users, event creation, messaging, and moderation signals.
        </p>
      </div>

      <Suspense>
        <AnalyticsFilters current={range} csvRows={csvRows} csvFilename="platform-activity.csv" />
      </Suspense>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, Icon, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline Chart */}
      <ActivityTimelineChart data={data.timeline} />

      {/* Peak Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Peak Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Peak Time of Day",  value: data.peakTime, sub: "Highest activity window" },
              { label: "Peak Day of Week",  value: data.peakDay,  sub: "Most active day on average" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border bg-muted/30 p-4">
                <div className="text-xl font-bold tracking-tight">{item.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{item.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground/70">{item.sub}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
