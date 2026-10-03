import { AbuseDetectionTable } from "@/components/admin/abuse-detection-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AbuseDetectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Abuse Detection</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review member-submitted safety concerns and current account restrictions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member report review</CardTitle>
          <CardDescription>Inspect actual allegations before deciding on report status or an account restriction.</CardDescription>
        </CardHeader>
        <CardContent>
          <AbuseDetectionTable />
        </CardContent>
      </Card>
    </div>
  );
}
