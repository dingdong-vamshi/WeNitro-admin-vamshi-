import { SafetyReportsTable } from "@/components/admin/safety-reports-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SafetyReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Safety Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          User-submitted safety complaints covering harassment, fake events, spam, and more.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Queue</CardTitle>
          <CardDescription>Investigate safety reports and take appropriate action on flagged accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <SafetyReportsTable />
        </CardContent>
      </Card>
    </div>
  );
}
