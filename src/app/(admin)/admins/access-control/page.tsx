import { AdminAccessControlScreen } from "@/components/admin/admin-access-control-screen";

export default function AdminAccessControlPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Access Control</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage admin access policies, IP whitelisting, session timeouts, and security restrictions.
        </p>
      </div>
      <AdminAccessControlScreen />
    </div>
  );
}
