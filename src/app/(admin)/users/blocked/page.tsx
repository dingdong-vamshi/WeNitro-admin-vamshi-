import { UsersTable } from "@/components/admin/users-table";

export default function BannedUsersPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Banned Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Indefinite Admin Auth bans and deleted profiles. Member-to-member chat blocks are not account bans.
        </p>
      </div>

      <UsersTable initialStatus="banned" />
    </div>
  );
}
