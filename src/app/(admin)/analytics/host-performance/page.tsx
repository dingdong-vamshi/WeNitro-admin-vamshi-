import { getHostPerformanceReportData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HostPerformanceReportTable } from "@/components/admin/host-performance-report-table";
import { Users, Star, Trophy, CalendarCheck } from "lucide-react";

export default async function HostPerformancePage() {
  const data = await getHostPerformanceReportData();

  const totalHosts      = data.length;
  const avgScore        = Math.round(data.reduce((s, r) => s + r.score, 0) / totalHosts);
  const topRated        = data.reduce((best, r) => (r.avgRating > best.avgRating ? r : best), data[0]);
  const totalParticipants = data.reduce((s, r) => s + r.totalParticipants, 0);

  const summaryCards = [
    { label: "Total Hosts",           value: totalHosts,                          Icon: Users,         color: "text-chart-1" },
    { label: "Avg Host Score",         value: avgScore,                            Icon: Trophy,        color: "text-chart-2" },
    { label: "Top Rated Host",         value: topRated?.name ?? "—",              Icon: Star,          color: "text-chart-3" },
    { label: "Total Participants",     value: totalParticipants.toLocaleString(),  Icon: CalendarCheck, color: "text-chart-4" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Host Performance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Evaluate host quality based on ratings, completion rates, and participation.
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

      {/* Sortable + Searchable Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Host Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <HostPerformanceReportTable />
        </CardContent>
      </Card>
    </div>
  );
}
