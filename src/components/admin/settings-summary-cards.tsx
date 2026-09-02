"use client";

import { useQuery } from "@tanstack/react-query";
import { Globe, Bell, Mail, Tag } from "lucide-react";

import { getSettingsSummary } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

const icons = [Tag, Bell, Mail, Globe];
const labels = ["Active Categories", "Notification Templates", "Email Templates", "Enabled Languages"];
const keys = ["activeCategories", "notificationTemplates", "emailTemplates", "enabledLanguages"] as const;

export function SettingsSummaryCards() {
  const query = useQuery({ queryKey: ["settings-summary"], queryFn: getSettingsSummary });
  const data = query.data;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {keys.map((key, i) => {
        const Icon = icons[i];
        return (
          <Card key={key} className="border-border/80 bg-card/95 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">
                  {data ? data[key] : "—"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{labels[i]}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
