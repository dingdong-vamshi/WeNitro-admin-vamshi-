"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { AdminBreadcrumbs } from "@/components/admin/breadcrumbs";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminPageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const segments = useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname],
  );

  const showBreadcrumbs = pathname !== "/dashboard";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="mx-auto w-full max-w-[1720px] flex-1 space-y-4 px-4 py-5 lg:px-6 lg:py-6">
            {showBreadcrumbs ? <AdminBreadcrumbs segments={segments} /> : null}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
