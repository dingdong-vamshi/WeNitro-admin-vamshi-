"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Search, SlidersHorizontal, Tag } from "lucide-react";

import { getActionLogs } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import type { ModerationAction } from "@/types/admin";

const actionVariant: Partial<Record<ModerationAction, "danger" | "warning" | "caution" | "success" | "secondary" | "info">> = {
  ban_user: "danger",
  suspend_user: "caution",
  suspend_host: "caution",
  warn_user: "warning",
  warn_host: "warning",
  delete_event: "danger",
  cancel_event: "caution",
  delete_message: "danger",
  remove_image: "danger",
  approve_image: "success",
  dismiss_report: "secondary",
};

const targetTypeVariant = {
  user: "info",
  event: "warning",
  image: "secondary",
  message: "caution",
} as const;

const actionOptions = [
  { value: "all", label: "All Actions" },
  { value: "ban_user", label: "Ban User" },
  { value: "suspend_user", label: "Suspend User" },
  { value: "warn_user", label: "Warn User" },
  { value: "delete_event", label: "Delete Event" },
  { value: "cancel_event", label: "Cancel Event" },
  { value: "warn_host", label: "Warn Host" },
  { value: "delete_message", label: "Delete Message" },
  { value: "remove_image", label: "Remove Image" },
  { value: "approve_image", label: "Approve Image" },
  { value: "dismiss_report", label: "Dismiss Report" },
];

const targetTypeOptions = [
  { value: "all", label: "All Targets" },
  { value: "user", label: "User" },
  { value: "event", label: "Event" },
  { value: "image", label: "Image" },
  { value: "message", label: "Message" },
];

export function ActionLogsTable() {
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("all");
  const [targetType, setTargetType] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search);

  const query = useQuery({
    queryKey: ["action-logs", debouncedSearch, actionType, targetType, page, pageSize],
    queryFn: () => getActionLogs({ search: debouncedSearch, actionType, targetType, page, pageSize }),
  });

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data, pageSize]);

  const showingStart = query.data && query.data.total > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingEnd = query.data ? Math.min(page * pageSize, query.data.total) : 0;

  const selectBaseClass = "h-9 appearance-none rounded-lg border border-border/70 bg-background pl-9 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search admin or target..."
              className="h-10 w-full rounded-lg border border-border/70 bg-background pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={actionType}
                onChange={(e) => { setActionType(e.target.value); setPage(1); }}
                className={selectBaseClass}
              >
                {actionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={targetType}
                onChange={(e) => { setTargetType(e.target.value); setPage(1); }}
                className={selectBaseClass}
              >
                {targetTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
              <TableHead className="pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Target</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Target Type</TableHead>
              <TableHead className="pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Skeleton rows */}
            {query.isPending &&
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/40">
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
                      <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </TableCell>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <TableCell key={j}><div className="h-3.5 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  ))}
                </TableRow>
              ))}

            {/* Empty state */}
            {!query.isPending && query.data?.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-14 text-center text-sm text-muted-foreground">
                  No logs match the current filters.
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {query.data?.rows.map((entry) => (
              <TableRow key={entry.id} className="border-b border-border/40 last:border-0">
                <TableCell className="pl-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px]">{entry.adminName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{entry.adminName}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant={actionVariant[entry.action] ?? "secondary"}>{entry.actionLabel}</Badge>
                </TableCell>
                <TableCell className="py-3 text-sm font-medium">{entry.targetName}</TableCell>
                <TableCell className="py-3">
                  <Badge variant={targetTypeVariant[entry.targetType]} className="capitalize">{entry.targetType}</Badge>
                </TableCell>
                <TableCell className="pr-4 py-3 text-sm text-muted-foreground">{entry.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {query.data && query.data.total > 0
                ? `Showing ${showingStart}–${showingEnd} of ${query.data.total} logs`
                : "No logs found"}
            </span>
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="h-7 appearance-none rounded border border-border/70 bg-background px-2 pr-6 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="sm" className="h-8 w-8 p-0"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </Button>
              {(() => {
                const delta = 1;
                const range: Array<number | "ellipsis"> = [];
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                    range.push(i);
                  } else if (range[range.length - 1] !== "ellipsis") {
                    range.push("ellipsis");
                  }
                }
                return range.map((item, idx) =>
                  item === "ellipsis" ? (
                    <span key={`ellipsis-${idx}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">…</span>
                  ) : (
                    <Button
                      key={item}
                      variant={item === page ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0 text-xs"
                      onClick={() => setPage(item as number)}
                    >
                      {item}
                    </Button>
                  ),
                );
              })()}
              <Button
                variant="outline" size="sm" className="h-8 w-8 p-0"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}