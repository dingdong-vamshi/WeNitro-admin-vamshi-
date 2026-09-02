import { AdminActivityLogsScreen } from "@/components/admin/admin-activity-logs-screen";

export default function AdminActivityLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Activity Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and audit all actions performed by admins across every platform module.
        </p>
      </div>
      <AdminActivityLogsScreen />
    </div>
  );
}
