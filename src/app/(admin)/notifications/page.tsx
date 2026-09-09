"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotificationStats } from "@/lib/api";
import { AdminDataState } from "@/components/admin/admin-data-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationsPage() {
  const query = useQuery({ queryKey: ["notification-stats"], queryFn: getNotificationStats });
  if (query.isLoading) return <AdminDataState title="notification statistics" loading />;
  if (query.error || !query.data) return <AdminDataState title="notification statistics" error={query.error} onRetry={() => void query.refetch()} />;
  const stats = query.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications &amp; Messaging</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Production in-app notification delivery and read-state data.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>In-app notifications</CardTitle>
          <CardDescription>Live values from the WeNitro notification table. No fixtures.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Database notifications</p>
            <p className="mt-1 text-3xl font-semibold">{stats.totalSent.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Read rate</p>
            <p className="mt-1 text-3xl font-semibold">{stats.openRate}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Broadcast delivery</CardTitle>
          <CardDescription>
            Broadcast campaigns are not configured in the production schema, so this Admin does not simulate sending them.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
