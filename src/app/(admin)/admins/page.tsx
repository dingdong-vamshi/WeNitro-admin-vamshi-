import Link from "next/link";
import { ShieldCheck, Lock, UserPlus, Activity, KeyRound } from "lucide-react";

import { AdminRolesScreen } from "@/components/admin/admin-roles-screen";
import { Card, CardContent } from "@/components/ui/card";

const quickLinks = [
  { href: "/admins/roles", icon: ShieldCheck, label: "Admin Roles", description: "Define and manage role types" },
  { href: "/admins/permissions", icon: KeyRound, label: "Permissions", description: "Configure module access per role" },
  { href: "/admins/add", icon: UserPlus, label: "Add Admin", description: "Create new admin accounts" },
  { href: "/admins/activity-logs", icon: Activity, label: "Activity Logs", description: "Track all admin actions" },
  { href: "/admins/access-control", icon: Lock, label: "Access Control", description: "Manage security policies" },
];

export default function AdminsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage internal administrators, roles, permissions, and activity tracking.
        </p>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {quickLinks.map(({ href, icon: Icon, label, description }) => (
          <Link key={href} href={href}>
            <Card className="h-full cursor-pointer border-border/70 transition-colors hover:border-primary/50 hover:bg-muted/30">
              <CardContent className="flex flex-col gap-2 p-4">
                <Icon className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Default View: Admin Roles */}
      <AdminRolesScreen />
    </div>
  );
}

