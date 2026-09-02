import { AddAdminScreen } from "@/components/admin/add-admin-screen";

export default function AddAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create new admin accounts and manage existing administrators on the platform.
        </p>
      </div>
      <AddAdminScreen />
    </div>
  );
}
