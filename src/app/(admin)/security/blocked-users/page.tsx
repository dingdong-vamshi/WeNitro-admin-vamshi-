import { SecurityBlockedUsersTable } from "@/components/admin/security-blocked-users-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecurityBlockedUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Restrictions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accounts with an active Admin Auth restriction. Member-to-member chat blocks are separate and do not prevent login.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restricted Accounts</CardTitle>
          <CardDescription>Review timed or indefinite Admin restrictions, recorded reasons, and take further action.</CardDescription>
        </CardHeader>
        <CardContent>
          <SecurityBlockedUsersTable />
        </CardContent>
      </Card>
    </div>
  );
}
