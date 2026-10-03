import { IpMonitoringTable } from "@/components/admin/ip-monitoring-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IpMonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">IP Monitoring</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          IP monitoring requires a connected login telemetry and enforcement service.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monitoring availability</CardTitle>
          <CardDescription>Use the connected security audit and account restriction controls while IP telemetry is unavailable.</CardDescription>
        </CardHeader>
        <CardContent>
          <IpMonitoringTable />
        </CardContent>
      </Card>
    </div>
  );
}
