import { ActionLogsTable } from "@/components/admin/action-logs-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActionLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Action Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A complete audit trail of all moderation decisions — bans, suspensions, deletions, and dismissals — with admin attribution.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Moderation History</CardTitle>
          <CardDescription>Filter by action type, target type, or search by admin name and target for full transparency.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActionLogsTable />
        </CardContent>
      </Card>
    </div>
  );
}
