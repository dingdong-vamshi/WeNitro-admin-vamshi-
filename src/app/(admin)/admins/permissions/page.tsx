import { AdminPermissionsScreen } from "@/components/admin/admin-permissions-screen";

export default function AdminPermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Permissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure what each admin role is allowed to view, create, edit, and delete across modules.
        </p>
      </div>
      <AdminPermissionsScreen />
    </div>
  );
}
