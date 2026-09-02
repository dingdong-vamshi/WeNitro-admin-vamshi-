import { AdminPageShell } from "@/components/admin/admin-page-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminPageShell>{children}</AdminPageShell>;
}
