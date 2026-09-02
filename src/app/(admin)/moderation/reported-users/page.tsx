import { ReportedUsersTable } from "@/components/admin/reported-users-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportedUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reported Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Users who have been reported by others for harassment, spam, fake profiles, and other violations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Queue</CardTitle>
          <CardDescription>Review, investigate, and take action on reported accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportedUsersTable />
        </CardContent>
      </Card>
    </div>
  );
}
