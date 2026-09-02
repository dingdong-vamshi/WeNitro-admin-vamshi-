import { Suspense } from "react";
import { UserPlus, MessageCircle, Bookmark, Share2, Clock } from "lucide-react";

import { getEngagementMetrics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EngagementTrendChart,
  ConversionFunnelChart,
  ActivityHeatmapChart,
} from "@/components/charts/engagement-charts";
import { AnalyticsFilters } from "@/components/admin/analytics-filters";
import type { AnalyticsRange } from "@/types/admin";

type Props = { searchParams: Promise<{ range?: string }> };

export default async function EngagementMetricsPage({ searchParams }: Props) {
  const { range: rawRange } = await searchParams;
  const range: AnalyticsRange =
    rawRange === "7d" || rawRange === "12m" ? rawRange : "30d";

  const data = await getEngagementMetrics(range);

  const stats = [
    { label: "Total Event Joins", value: data.stats.totalJoins.toLocaleString(), Icon: UserPlus, color: "text-chart-1" },
    { label: "Messages Sent", value: data.stats.messagesSent.toLocaleString(), Icon: MessageCircle, color: "text-chart-2" },
    { label: "Event Bookmarks", value: data.stats.bookmarks.toLocaleString(), Icon: Bookmark, color: "text-chart-3" },
    { label: "Event Shares", value: data.stats.shares.toLocaleString(), Icon: Share2, color: "text-chart-4" },
  ];

  const csvRows = data.trend.map((t) => ({
    Period: t.label,
    Joins: t.joins,
    Messages: t.messages,
    Shares: t.shares,
    Bookmarks: t.bookmarks,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Engagement Metrics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track how users interact with events and the platform.
        </p>
      </div>

      <Suspense>
        <AnalyticsFilters current={range} csvRows={csvRows} csvFilename="engagement-metrics.csv" />
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

      {/* Engagement Trend */}
      <EngagementTrendChart data={data.trend} />

      {/* Average Engagement + Funnel */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Engagement Per Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Avg Participants", value: data.avgParticipants },
                { label: "Avg Messages", value: data.avgMessages },
                { label: "Avg Rating", value: data.avgRating },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border bg-muted/30 p-4 text-center">
                  <div className="text-xl font-bold tracking-tight">{item.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-muted/40 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-chart-1" />
                Peak Activity Times
              </div>
              <ul className="space-y-1">
                {data.peakTimes.map((t) => (
                  <li key={t} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-chart-1" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <ConversionFunnelChart data={data.funnel} conversionRate={data.conversionRate} />
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmapChart data={data.heatmap} />
    </div>
  );
}
