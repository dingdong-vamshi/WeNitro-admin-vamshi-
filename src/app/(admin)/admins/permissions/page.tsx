import { AdminPermissionsScreen } from "@/components/admin/admin-permissions-screen";

export default function AdminPermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Permissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review the permissions enforced for each role. A Master assigns these roles to verified accounts.
        </p>
      </div>
      <AdminPermissionsScreen />
    </div>
  );
}
