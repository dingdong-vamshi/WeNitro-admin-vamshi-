"use client";

import { useQuery } from "@tanstack/react-query";
import { getTopEventsReportData } from "@/lib/api";
import { AdminDataState } from "@/components/admin/admin-data-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopEventsReportTable } from "@/components/admin/top-events-report-table";
import { CalendarDays, Star, Users2, MapPin } from "lucide-react";

export default function TopEventsPage() {
  const query = useQuery({ queryKey: ["top-activities-summary"], queryFn: getTopEventsReportData });
  if (query.isLoading) return <AdminDataState title="top activities" loading />;
  if (query.error || !query.data) return <AdminDataState title="top activities" error={query.error} onRetry={() => void query.refetch()} />;
  const data = query.data;

  const totalParticipants = data.reduce((s, r) => s + r.participants, 0);
  const avgRating = (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(2);
  const uniqueCities = new Set(data.map((r) => r.city)).size;

  const summaryCards = [
    { label: "Events Listed",        value: data.length,                      Icon: CalendarDays, color: "text-chart-1" },
    { label: "Total Participants",   value: totalParticipants.toLocaleString(), Icon: Users2,       color: "text-chart-2" },
    { label: "Avg Rating",           value: avgRating,                          Icon: Star,         color: "text-chart-3" },
    { label: "Cities Represented",   value: uniqueCities,                       Icon: MapPin,       color: "text-chart-4" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Top Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          High-performing events ranked by participation and community ratings.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {summaryCards.map(({ label, value, Icon, color }) => (
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

      {/* Filterable Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <TopEventsReportTable />
        </CardContent>
      </Card>
    </div>
  );
}
