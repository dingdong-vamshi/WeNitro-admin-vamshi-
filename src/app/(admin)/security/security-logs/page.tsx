import { SecurityLogsTable } from "@/components/admin/security-logs-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecurityLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Security Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comprehensive audit trail of admin actions, login activity, and platform security events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>Search, filter, and export platform security events for compliance and investigation.</CardDescription>
        </CardHeader>
        <CardContent>
          <SecurityLogsTable />
        </CardContent>
      </Card>
    </div>
  );
}
