"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  Clock,
  Globe,
  LogIn,
  Save,
  Users,
  ShieldCheck,
  ShieldAlert,
  Lock,
  ActivitySquare,
} from "lucide-react";

import { getAccessControlConfig, getAdminSecurityOverview } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const overviewCards = [
  {
    key: "totalAdmins" as const,
    label: "Total Admins",
    icon: Users,
    colorClass: "text-sky-600 dark:text-sky-400",
    bgClass: "bg-sky-500/15",
    borderClass: "border-sky-200 dark:border-sky-900/50",
  },
  {
    key: "activeAdmins" as const,
    label: "Active Admins",
    icon: ShieldCheck,
    colorClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/15",
    borderClass: "border-emerald-200 dark:border-emerald-900/50",
  },
  {
    key: "failedLoginAttempts" as const,
    label: "Failed Login Attempts",
    icon: ShieldAlert,
    colorClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-500/15",
    borderClass: "border-rose-200 dark:border-rose-900/50",
  },
  {
    key: "twoFAEnabledCount" as const,
    label: "2FA Enabled",
    icon: Lock,
    colorClass: "text-violet-600 dark:text-violet-400",
    bgClass: "bg-violet-500/15",
    borderClass: "border-violet-200 dark:border-violet-900/50",
  },
];

export function AdminAccessControlScreen() {
  const configQuery = useQuery({ queryKey: ["access-control-config"], queryFn: getAccessControlConfig });
  const overviewQuery = useQuery({ queryKey: ["admin-security-overview"], queryFn: getAdminSecurityOverview });

  const config = configQuery.data;
  const overview = overviewQuery.data;
  const ips = config?.allowedIps ?? [];
  const policies = config?.policies ?? [];

  return (
    <div className="space-y-6">
      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          const value = overview?.[card.key];
          return (
            <Card key={card.key} className={`border ${card.borderClass}`}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2.5 ${card.bgClass}`}>
                    <Icon className={`h-5 w-5 ${card.colorClass}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">
                      {value !== undefined ? value.toLocaleString() : "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Last Admin Login */}
      {overview && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ActivitySquare className="h-4 w-4" />
          Last admin login:
          <span className="font-medium text-foreground">{overview.lastAdminLogin}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Access Policies */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Access Control Policies</CardTitle>
            <CardDescription>Enable or disable platform-wide access control rules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="flex items-center justify-between rounded-lg border border-border/60 p-4 bg-muted/20"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{policy.name}</p>
                    <Badge variant={policy.status === "enabled" ? "success" : "secondary"}>
                      {policy.status === "enabled" ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{policy.description}</p>
                </div>
                <Switch
                  checked={policy.status === "enabled"}
                  disabled
                  aria-label={`Toggle ${policy.name}`}
                />
              </div>
            ))}
            {policies.length === 0 && (
              <p className="rounded-lg border border-dashed border-border/70 px-4 py-6 text-center text-sm text-muted-foreground">
                No persisted access-control policies are configured.
              </p>
            )}

            {/* Security Options */}
            <div className="rounded-lg border border-border/60 p-4 space-y-3 bg-muted/20 mt-2">
              <p className="text-sm font-semibold">Advanced Security Options</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Require 2FA for all admins</p>
                  <p className="text-xs text-muted-foreground">Force two-factor authentication on login</p>
                </div>
                <Switch checked={config?.requireTwoFA ?? false} disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Restrict to office IP</p>
                  <p className="text-xs text-muted-foreground">Only allow admin login from whitelisted IPs</p>
                </div>
                <Switch checked={config?.restrictToOfficeIp ?? false} disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Auto logout inactive admins</p>
                  <p className="text-xs text-muted-foreground">End sessions after timeout period</p>
                </div>
                <Switch checked={config?.autoLogoutInactive ?? false} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Rules Panel */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Access Rules</CardTitle>
            <CardDescription>Configure IP whitelist and session parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* IP Whitelist */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Allowed IP Addresses
              </div>
              <div className="space-y-1.5">
                {ips.map((ip) => (
                  <div
                    key={ip}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 px-3 py-2"
                  >
                    <span className="font-mono text-sm">{ip}</span>
                  </div>
                ))}
                {ips.length === 0 && (
                  <p className="rounded-md border border-dashed border-border/70 px-3 py-4 text-center text-xs text-muted-foreground">
                    No IP allowlist is configured.
                  </p>
                )}
              </div>
            </div>

            {/* Session & Login Rules */}
            <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Session Timeout</span>
              </div>
              <p className="text-2xl font-bold tabular-nums">
                {config?.sessionTimeoutMinutes ?? "—"}
                <span className="ml-1 text-sm font-normal text-muted-foreground">minutes</span>
              </p>

              <div className="flex items-center gap-2 pt-2">
                <LogIn className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Max Login Attempts</span>
              </div>
              <p className="text-2xl font-bold tabular-nums">
                {config?.maxLoginAttempts ?? "—"}
                <span className="ml-1 text-sm font-normal text-muted-foreground">attempts</span>
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button className="flex-1" disabled title="Access-control persistence is not configured">
                <Save className="h-4 w-4" />
                Backend not configured
              </Button>
              <Button variant="outline" disabled title="Access-control persistence is not configured">
                <Shield className="h-4 w-4" />
                Update Policy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
