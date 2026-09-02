import { AdminRolesScreen } from "@/components/admin/admin-roles-screen";

export default function AdminRolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Roles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define and manage the different administrator role types on the platform.
        </p>
      </div>
      <AdminRolesScreen />
    </div>
  );
}
