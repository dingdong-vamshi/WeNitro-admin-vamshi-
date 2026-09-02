import { UsersTable } from "@/components/admin/users-table";

export default function VerifiedUsersPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Verified Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trusted users verified through ID, phone, email, or business checks.
        </p>
      </div>

      <UsersTable initialStatus="verified" />
    </div>
  );
}
