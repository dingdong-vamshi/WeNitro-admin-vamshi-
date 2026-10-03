import { IpMonitoringTable } from "@/components/admin/ip-monitoring-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IpMonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">IP Monitoring</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inspect retained Auth IP observations using your current Admin permissions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recorded Auth IP observations</CardTitle>
          <CardDescription>Actual recorded timestamps, IP addresses, Auth actions and mapped application actors.</CardDescription>
        </CardHeader>
        <CardContent>
          <IpMonitoringTable />
        </CardContent>
      </Card>
    </div>
  );
}
