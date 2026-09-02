import { Suspense } from "react";
import { CalendarDays, Play, CheckCircle, XCircle } from "lucide-react";

import { getEventAnalytics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EventCreationChart,
  EventCategoryChart,
  TopEventsChart,
  EventsByCityChart,
} from "@/components/charts/event-analytics-charts";
import { AnalyticsFilters } from "@/components/admin/analytics-filters";
import type { AnalyticsRange } from "@/types/admin";

type Props = { searchParams: Promise<{ range?: string }> };

const statIcons = [CalendarDays, Play, CheckCircle, XCircle];
const statColors = ["text-chart-1", "text-chart-2", "text-chart-3", "text-destructive"];

export default async function EventAnalyticsPage({ searchParams }: Props) {
  const { range: rawRange } = await searchParams;
  const range: AnalyticsRange =
    rawRange === "7d" || rawRange === "12m" ? rawRange : "30d";

  const data = await getEventAnalytics(range);

  const stats = [
    { label: "Total Events", value: data.stats.totalEvents.toLocaleString() },
    { label: "Active Events", value: data.stats.activeEvents.toLocaleString() },
    { label: "Completed Events", value: data.stats.completedEvents.toLocaleString() },
    { label: "Cancelled Events", value: data.stats.cancelledEvents.toLocaleString() },
  ];

  const csvRows = data.creationTrend.map((g) => ({
    Period: g.label,
    "Events Created": g.created,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Event Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track event creation, participation, and performance metrics.
        </p>
      </div>

      <Suspense>
        <AnalyticsFilters current={range} csvRows={csvRows} csvFilename="event-analytics.csv" />
      </Suspense>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = statIcons[i];
          return (
            <Card key={s.label}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <Icon className={`h-4 w-4 ${statColors[i]}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Creation Trend */}
      <EventCreationChart data={data.creationTrend} />

      {/* Category + Top Events */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <EventCategoryChart data={data.byCategory} />
        <TopEventsChart data={data.topEvents} />
      </div>

      {/* Events by City */}
      <EventsByCityChart data={data.byCity} />
    </div>
  );
}
