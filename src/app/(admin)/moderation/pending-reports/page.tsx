import { PendingReportsTable } from "@/components/admin/pending-reports-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PendingReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pending Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All reports awaiting admin review — users, events, and chat violations that need investigation or resolution.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Inbox</CardTitle>
          <CardDescription>Investigate, assign moderators, resolve, or escalate each pending report.</CardDescription>
        </CardHeader>
        <CardContent>
          <PendingReportsTable />
        </CardContent>
      </Card>
    </div>
  );
}
