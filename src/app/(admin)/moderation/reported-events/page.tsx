import { ReportedEventsTable } from "@/components/admin/reported-events-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportedEventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reported Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Events flagged for fake listings, misleading information, fraud, or unsafe conditions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Reports</CardTitle>
          <CardDescription>Review flagged events and take action on policy violations.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportedEventsTable />
        </CardContent>
      </Card>
    </div>
  );
}
