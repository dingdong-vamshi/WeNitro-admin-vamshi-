import { SecurityBlockedUsersTable } from "@/components/admin/security-blocked-users-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecurityBlockedUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Blocked Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accounts blocked due to abuse, harassment, spam, or other platform violations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blocked Accounts</CardTitle>
          <CardDescription>Review blocked users, their violations, and take further action.</CardDescription>
        </CardHeader>
        <CardContent>
          <SecurityBlockedUsersTable />
        </CardContent>
      </Card>
    </div>
  );
}
