"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Users, UserCheck, Activity, ShieldCheck } from "lucide-react";

import { getUserAnalytics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserGrowthChart, UsersByCityChart, DeviceUsageChart } from "@/components/charts/user-analytics-charts";
import { AnalyticsFilters } from "@/components/admin/analytics-filters";
import { AdminDataState } from "@/components/admin/admin-data-state";
import type { AnalyticsRange } from "@/types/admin";

const statIcons = [Users, UserCheck, Activity, ShieldCheck];
const statColors = ["text-chart-1", "text-chart-2", "text-chart-3", "text-chart-4"];

export default function UserAnalyticsPage() {
  const rawRange = useSearchParams().get("range");
  const range: AnalyticsRange =
    rawRange === "7d" || rawRange === "12m" ? rawRange : "30d";

  const query = useQuery({ queryKey: ["user-analytics", range], queryFn: () => getUserAnalytics(range) });
  if (query.isLoading) return <AdminDataState title="user analytics" loading />;
  if (query.error || !query.data) return <AdminDataState title="user analytics" error={query.error} onRetry={() => void query.refetch()} />;
  const data = query.data;

  const stats = [
    { label: "Total Users", value: data.stats.totalUsers.toLocaleString() },
    { label: "New Users (This Month)", value: data.stats.newUsersThisMonth.toLocaleString() },
    { label: "Active Users", value: data.stats.activeUsers.toLocaleString() },
    { label: "Verified Users", value: data.stats.verifiedUsers.toLocaleString() },
  ];

  const csvRows = data.growth.map((g) => ({
    Period: g.label,
    "New Users": g.newUsers,
    "Total Users": g.totalUsers,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track user growth, activity, and demographics across the platform.
        </p>
      </div>

      <Suspense>
        <AnalyticsFilters current={range} csvRows={csvRows} csvFilename="user-analytics.csv" />
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

      {/* Growth Chart */}
      <UserGrowthChart data={data.growth} />

      {/* City + Device Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <UsersByCityChart data={data.byCity} />
        <DeviceUsageChart data={data.deviceUsage} />
      </div>

      {/* Activity Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily Active Users (DAU)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{data.dau.toLocaleString()}</div>
            <p className="mt-1 text-xs text-muted-foreground">Users active today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Active Users (MAU)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{data.mau.toLocaleString()}</div>
            <p className="mt-1 text-xs text-muted-foreground">Users active this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{data.retentionRate}%</div>
            <p className="mt-1 text-xs text-muted-foreground">30-day user retention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
