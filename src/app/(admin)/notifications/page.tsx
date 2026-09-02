import { getNotificationStats } from "@/lib/api";
import { BroadcastNotificationForm } from "@/components/admin/broadcast-notification-form";
import { NotificationAnalyticsSection } from "@/components/admin/notification-analytics-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NotificationsPage() {
  const stats = await getNotificationStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications &amp; Messaging</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Send broadcasts, run campaigns, manage email communication, and post system alerts.
        </p>
      </div>

      {/* Analytics overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Notification Analytics</CardTitle>
          <CardDescription>Overall performance across all notification channels.</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationAnalyticsSection stats={stats} />
        </CardContent>
      </Card>

      {/* Broadcast form */}
      <BroadcastNotificationForm />
    </div>
  );
}
