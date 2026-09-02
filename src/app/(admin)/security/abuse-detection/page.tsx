import { AbuseDetectionTable } from "@/components/admin/abuse-detection-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AbuseDetectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Abuse Detection</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered detection of spam, offensive content, fake events, and suspicious behavioral patterns.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Abuse Alerts</CardTitle>
          <CardDescription>Review automatically flagged violations and take action on detected abuse.</CardDescription>
        </CardHeader>
        <CardContent>
          <AbuseDetectionTable />
        </CardContent>
      </Card>
    </div>
  );
}
