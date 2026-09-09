import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { AdminAuthGate } from "@/components/AdminAuthGate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGate>
      <AdminPageShell>{children}</AdminPageShell>
    </AdminAuthGate>
  );
}
