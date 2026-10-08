import { UsersTable } from "@/components/admin/users-table";

export default function VerifiedUsersPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fully Verified Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Users with confirmed email, confirmed phone, an Admin-approved live selfie, and provider-verified Aadhaar. The legacy profile flag alone does not qualify.
        </p>
      </div>

      <UsersTable initialStatus="verified" />
    </div>
  );
}
