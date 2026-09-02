"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";

import { getImageModerationQueue } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { ImageModerationStatus } from "@/types/admin";

const statusVariant: Record<ImageModerationStatus, "warning" | "danger" | "success" | "secondary"> = {
  pending: "warning",
  flagged: "danger",
  approved: "success",
  removed: "secondary",
};

const tabs: Array<{ label: string; value: ImageModerationStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Flagged", value: "flagged" },
  { label: "Approved", value: "approved" },
  { label: "Removed", value: "removed" },
];

export function ImageModerationQueueGrid() {
  const [filter, setFilter] = useState<ImageModerationStatus | "all">("all");
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["image-moderation", filter],
    queryFn: () => getImageModerationQueue({ status: filter }),
  });

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {query.isPending && (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      )}
      {query.data?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <ImageOff className="h-10 w-10 opacity-40" />
          <p className="text-sm">No images in this queue.</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {query.data?.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {/* Image preview placeholder */}
            <div className="relative flex h-40 items-center justify-center bg-muted/50">
              <span className="text-3xl font-bold tracking-widest text-muted-foreground/50">
                {item.previewInitials}
              </span>
              <div className="absolute right-2 top-2">
                <Badge variant={statusVariant[item.status]} className="capitalize">{item.status}</Badge>
              </div>
            </div>

            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">{item.uploadedByAvatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-medium leading-none">{item.uploadedBy}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{item.eventTitle}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-2">
              {item.aiLabels.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {item.aiLabels.map((label) => (
                    <Badge key={label} variant="danger" className="text-[10px]">{label}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No AI flags detected</p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">Uploaded {item.uploadedAt}</p>
            </CardContent>

            <CardFooter className="flex gap-2 px-4 pb-4">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["image-moderation"] })}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-rose-600 hover:text-rose-700 dark:text-rose-400"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["image-moderation"] })}
              >
                Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
