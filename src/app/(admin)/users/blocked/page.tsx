import { UsersTable } from "@/components/admin/users-table";

export default function BlockedUsersPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Blocked Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accounts currently blocked for policy violations, abuse, or spam.
        </p>
      </div>

      <UsersTable initialStatus="blocked" />
    </div>
  );
}
