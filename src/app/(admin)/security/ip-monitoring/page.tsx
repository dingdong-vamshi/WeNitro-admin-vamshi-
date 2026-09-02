import { IpMonitoringTable } from "@/components/admin/ip-monitoring-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IpMonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">IP Monitoring</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Detect suspicious login patterns, geolocation anomalies, and multi-account IPs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>IP Activity</CardTitle>
          <CardDescription>Monitor IP addresses for abnormal login behavior and multi-account activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <IpMonitoringTable />
        </CardContent>
      </Card>
    </div>
  );
}
