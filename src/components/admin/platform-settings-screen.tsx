"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Save, Upload } from "lucide-react";

import { getPlatformConfig } from "@/lib/api";
import type { PlatformConfig } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const timezones = [
  "GMT+0:00",
  "GMT+1:00",
  "GMT+2:00",
  "GMT+3:00",
  "GMT+4:00",
  "GMT+5:00",
  "GMT+5:30",
  "GMT+6:00",
  "GMT+7:00",
  "GMT+8:00",
  "GMT+9:00",
  "GMT+10:00",
  "GMT-5:00",
  "GMT-6:00",
  "GMT-7:00",
  "GMT-8:00",
];

const selectClass =
  "h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function PlatformSettingsScreen() {
  const query = useQuery({ queryKey: ["platform-config"], queryFn: getPlatformConfig });
  const [form, setForm] = useState<PlatformConfig | null>(null);
  const [saved, setSaved] = useState(false);

  const data = form ?? query.data;

  function handleChange<K extends keyof PlatformConfig>(key: K, value: PlatformConfig[K]) {
    const base = form ?? query.data;
    if (!base) return;
    setForm({ ...base, [key]: value });
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    setForm(null);
  }

  if (!data) {
    return <div className="text-sm text-muted-foreground">Loading platform settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Platform Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Configuration</CardTitle>
          <CardDescription>Configure general platform identity and contact settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Platform Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Platform Name</label>
              <Input
                value={data.platformName}
                onChange={(e) => handleChange("platformName", e.target.value)}
              />
            </div>

            {/* Support Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Support Email</label>
              <Input
                type="email"
                value={data.supportEmail}
                onChange={(e) => handleChange("supportEmail", e.target.value)}
              />
            </div>

            {/* Default Currency */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Default Currency</label>
              <select
                value={data.defaultCurrency}
                onChange={(e) => handleChange("defaultCurrency", e.target.value as "USD" | "INR")}
                className={selectClass}
              >
                <option value="USD">USD – US Dollar</option>
                <option value="INR">INR – Indian Rupee</option>
              </select>
            </div>

            {/* Default Timezone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Default Time Zone</label>
              <select
                value={data.defaultTimezone}
                onChange={(e) => handleChange("defaultTimezone", e.target.value)}
                className={selectClass}
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Platform Logo */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Platform Logo</label>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-xs text-muted-foreground">
                Logo
              </div>
              <Button variant="outline" size="sm">
                <Upload className="h-3.5 w-3.5" />
                Upload Logo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Behavior Settings */}
      <Card>
        <CardHeader>
          <CardTitle>App Behavior</CardTitle>
          <CardDescription>Control platform-level feature switches and access rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              { key: "allowEventCreation", label: "Allow Event Creation", description: "Users can create and publish events" },
              { key: "allowGuestBrowsing", label: "Allow Guest Browsing", description: "Unauthenticated users can browse events" },
              { key: "requireEmailVerification", label: "Require Email Verification", description: "Users must verify email before accessing the app" },
              { key: "autoApproveEvents", label: "Auto Approve Events", description: "Events are published immediately without admin review" },
            ] as Array<{ key: keyof PlatformConfig; label: string; description: string }>
          ).map(({ key, label, description }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-border/60 p-4"
            >
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={data[key] as boolean}
                onCheckedChange={(v) => handleChange(key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saved}>
          <Save className="h-4 w-4" />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4" />
          Reset Settings
        </Button>
      </div>
    </div>
  );
}
