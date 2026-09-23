"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { AdminBreadcrumbs } from "@/components/admin/breadcrumbs";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAdminAuth } from "@/components/AdminAuthGate";
import { defaultAdminPath, isAdminPathAllowed } from "@/components/admin/nav-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function AdminPageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useAdminAuth();
  const allowed = isAdminPathAllowed(pathname, role);

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
            {allowed ? children : (
              <Card className="mx-auto mt-12 w-full max-w-xl border-dashed">
                <CardHeader>
                  <CardTitle>Access restricted</CardTitle>
                  <CardDescription>
                    Your {role.replaceAll("_", " ")} role does not have access to this Admin route.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild><Link href={defaultAdminPath(role)}>Open your workspace</Link></Button>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
