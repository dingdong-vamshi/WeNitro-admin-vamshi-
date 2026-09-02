import { UsersTable } from "@/components/admin/users-table";

export default function SuspendedUsersPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Suspended Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Temporarily restricted accounts under active safety or authenticity review.
        </p>
      </div>

      <UsersTable initialStatus="suspended" />
    </div>
  );
}
