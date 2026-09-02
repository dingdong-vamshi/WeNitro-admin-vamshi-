import Link from "next/link";
import { Tag, Bell, Mail, Globe, ToggleLeft } from "lucide-react";
import { Suspense } from "react";

import { PlatformSettingsScreen } from "@/components/admin/platform-settings-screen";
import { SettingsSummaryCards } from "@/components/admin/settings-summary-cards";
import { Card, CardContent } from "@/components/ui/card";

const quickLinks = [
  { href: "/settings/categories", icon: Tag, label: "Category Management", description: "Manage event categories" },
  { href: "/settings/notification-templates", icon: Bell, label: "Notification Templates", description: "Edit push & in-app templates" },
  { href: "/settings/email-templates", icon: Mail, label: "Email Templates", description: "Configure automated emails" },
  { href: "/settings/languages", icon: Globe, label: "Language Settings", description: "Multi-language support" },
  { href: "/settings/features", icon: ToggleLeft, label: "Feature Toggles", description: "Enable or disable features" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure platform identity, app behaviour, and core settings.
        </p>
      </div>

      {/* System Configuration Summary */}
      <Suspense>
        <SettingsSummaryCards />
      </Suspense>

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

      {/* Platform Settings Form */}
      <PlatformSettingsScreen />
    </div>
  );
}
