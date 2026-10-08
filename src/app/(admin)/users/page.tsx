import { UsersTable } from "@/components/admin/users-table";
import { Badge } from "@/components/ui/badge";
import { UsersRound } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <UsersRound className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Audience operations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Monitor platform users, inspect profiles, and apply moderation actions with advanced filters.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-current" /> Live data
        </Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active", "Profile and Auth are allowed. Full verification is shown separately."],
          ["Suspended", "A 30/90-day Admin Auth restriction, or an inactive/deactivated profile. Only timed Auth restrictions expire automatically."],
          ["Banned", "An indefinite Admin Auth restriction or a deleted profile. Login/app access is unavailable; restoring an Admin ban does not undelete a profile."],
          ["Blocked chat", "A member-to-member direct-message block. It hides the direct chat and stops new messages; it does not block either account from login."],
        ].map(([title, description]) => <div key={title} className="rounded-lg border bg-card p-3"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p></div>)}
      </div>
      <UsersTable />
    </div>
  );
}
