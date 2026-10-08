import { UsersTable } from "@/components/admin/users-table";

export default function SuspendedUsersPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Suspended Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Temporary 30/90-day Admin Auth restrictions and inactive/deactivated profiles. Only the timed Admin restrictions expire automatically.
        </p>
      </div>

      <UsersTable initialStatus="suspended" />
    </div>
  );
}
