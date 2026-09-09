"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Users, UserPlus, Activity, ShieldCheck } from "lucide-react";

import { getUserGrowthReportData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserGrowthChart } from "@/components/charts/user-analytics-charts";
import { RetentionBarsChart } from "@/components/charts/reports-charts";
import { AnalyticsFilters } from "@/components/admin/analytics-filters";
import { AdminDataState } from "@/components/admin/admin-data-state";
import type { AnalyticsRange } from "@/types/admin";

export default function UserGrowthPage() {
  const rawRange = useSearchParams().get("range");
  const range: AnalyticsRange =
    rawRange === "7d" || rawRange === "12m" ? rawRange : "30d";

  const query = useQuery({ queryKey: ["user-growth", range], queryFn: () => getUserGrowthReportData(range) });
  if (query.isLoading) return <AdminDataState title="user growth" loading />;
  if (query.error || !query.data) return <AdminDataState title="user growth" error={query.error} onRetry={() => void query.refetch()} />;
  const data = query.data;

  const stats = [
    { label: "Total Users",           value: data.stats.totalUsers.toLocaleString(),          Icon: Users,       color: "text-chart-1" },
    { label: "New Users (This Month)", value: data.stats.newUsersThisMonth.toLocaleString(),   Icon: UserPlus,    color: "text-chart-2" },
    { label: "Active Users",           value: data.stats.activeUsers.toLocaleString(),         Icon: Activity,    color: "text-chart-3" },
    { label: "Verified Users",         value: data.stats.verifiedUsers.toLocaleString(),       Icon: ShieldCheck, color: "text-chart-4" },
  ];

  const csvRows = data.growth.map((g) => ({
    Period:        g.label,
    "New Users":   g.newUsers,
    "Total Users": g.totalUsers,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User Growth</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor new registrations, active users, and platform retention over time.
        </p>
      </div>

      <Suspense>
        <AnalyticsFilters current={range} csvRows={csvRows} csvFilename="user-growth.csv" />
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

      {/* Growth Chart */}
      <UserGrowthChart data={data.growth} />

      {/* Retention */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RetentionBarsChart data={data.retention} />

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Retention Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Weekly",    value: `${data.retention.week}%` },
                { label: "Monthly",   value: `${data.retention.month}%` },
                { label: "Quarterly", value: `${data.retention.quarter}%` },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border bg-muted/30 p-4 text-center">
                  <div className="text-xl font-bold tracking-tight">{item.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Percentage of users who return within the given period after their first session.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
