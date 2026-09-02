"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Save, ToggleLeft, ToggleRight } from "lucide-react";

import { getFeatureToggles } from "@/lib/api";
import type { FeatureStatus, FeatureToggle } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const statusVariant: Record<FeatureStatus, "success" | "secondary"> = {
  enabled: "success",
  disabled: "secondary",
};

export function FeatureTogglesScreen() {
  const query = useQuery({ queryKey: ["feature-toggles"], queryFn: getFeatureToggles });
  const [toggles, setToggles] = useState<FeatureToggle[] | null>(null);
  const [selected, setSelected] = useState<FeatureToggle | null>(null);
  const [saved, setSaved] = useState(false);

  const data = toggles ?? query.data ?? [];

  function handleToggle(id: string) {
    const updated = data.map((f) =>
      f.id === id ? { ...f, status: f.status === "enabled" ? "disabled" : "enabled" } as FeatureToggle : f,
    );
    setToggles(updated);
    const updatedFeature = updated.find((f) => f.id === id) ?? null;
    if (selected?.id === id) setSelected(updatedFeature);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const enabledCount = data.filter((f) => f.status === "enabled").length;
  const disabledCount = data.filter((f) => f.status === "disabled").length;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Feature Toggles List */}
      <Card className="xl:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Feature Toggles</CardTitle>
            <CardDescription>
              Enable or disable platform features dynamically.{" "}
              <span className="text-success">{enabledCount} enabled</span> ·{" "}
              <span className="text-muted-foreground">{disabledCount} disabled</span>
            </CardDescription>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saved}>
            <Save className="h-4 w-4" />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {data.map((feature) => (
            <div
              key={feature.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/30 ${
                selected?.id === feature.id ? "border-primary/50 bg-muted/40" : "border-border/60"
              }`}
              onClick={() => setSelected(feature)}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{feature.name}</p>
                  <Badge variant={statusVariant[feature.status]}>
                    {feature.status === "enabled" ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
              <Switch
                checked={feature.status === "enabled"}
                onCheckedChange={() => handleToggle(feature.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Feature Detail Panel */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Feature Toggle Details</CardTitle>
          <CardDescription>
            {selected ? selected.name : "Select a feature to view details."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selected ? (
            <div className="space-y-5">
              {/* Status Visual */}
              <div className="flex items-center justify-center rounded-xl border border-border/60 bg-muted/30 py-6">
                {selected.status === "enabled" ? (
                  <ToggleRight className="h-14 w-14 text-success" />
                ) : (
                  <ToggleLeft className="h-14 w-14 text-muted-foreground" />
                )}
              </div>

              <dl className="space-y-3 text-sm">
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Feature</dt>
                  <dd className="font-medium">{selected.name}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</dt>
                  <dd className="text-muted-foreground">{selected.description}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant={statusVariant[selected.status]}>
                      {selected.status === "enabled" ? "Enabled" : "Disabled"}
                    </Badge>
                  </dd>
                </div>
              </dl>

              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1"
                  variant={selected.status === "enabled" ? "outline" : "default"}
                  onClick={() => handleToggle(selected.id)}
                >
                  {selected.status === "enabled" ? "Disable Feature" : "Enable Feature"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click a feature from the list to view and manage it here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
