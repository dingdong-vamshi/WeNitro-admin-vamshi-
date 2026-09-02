import { Suspense } from "react";
import { Eye, CalendarCheck, Share2, Bookmark } from "lucide-react";

import { getEventEngagementData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventEngagementChart } from "@/components/charts/reports-charts";
import { AnalyticsFilters } from "@/components/admin/analytics-filters";
import type { AnalyticsRange } from "@/types/admin";

type Props = { searchParams: Promise<{ range?: string }> };

export default async function EventEngagementPage({ searchParams }: Props) {
  const { range: rawRange } = await searchParams;
  const range: AnalyticsRange =
    rawRange === "7d" || rawRange === "12m" ? rawRange : "30d";

  const data = await getEventEngagementData(range);

  const stats = [
    { label: "Total Views",     value: data.stats.totalViews.toLocaleString(),    Icon: Eye,         color: "text-chart-1" },
    { label: "Event Joins",     value: data.stats.eventJoins.toLocaleString(),    Icon: CalendarCheck, color: "text-chart-2" },
    { label: "Event Shares",    value: data.stats.eventShares.toLocaleString(),   Icon: Share2,      color: "text-chart-3" },
    { label: "Event Bookmarks", value: data.stats.eventBookmarks.toLocaleString(), Icon: Bookmark,   color: "text-chart-4" },
  ];

  const csvRows = data.trend.map((t) => ({
    Period:    t.label,
    Views:     t.views,
    Joins:     t.joins,
    Shares:    t.shares,
    Bookmarks: t.bookmarks,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Event Engagement</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Measure how users discover, join, share, and save events across the platform.
        </p>
      </div>

      <Suspense>
        <AnalyticsFilters current={range} csvRows={csvRows} csvFilename="event-engagement.csv" />
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
      <EventEngagementChart data={data.trend} />

      {/* Per-event Averages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Average Engagement Per Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Avg Participants", value: data.avgParticipants },
              { label: "Avg Shares",        value: data.avgShares },
              { label: "Avg Bookmarks",     value: data.avgBookmarks },
              { label: "Avg Rating",        value: data.avgRating.toFixed(1) },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border bg-muted/30 p-4 text-center">
                <div className="text-xl font-bold tracking-tight">{m.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{m.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
