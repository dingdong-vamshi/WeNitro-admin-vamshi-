import { SystemAlertsTable } from "@/components/admin/system-alerts-table";

export default function SystemAlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Alerts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Notify users about maintenance windows, security updates, and critical platform changes.
        </p>
      </div>
      <SystemAlertsTable />
    </div>
  );
}
