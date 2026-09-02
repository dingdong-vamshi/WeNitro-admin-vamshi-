"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ClipboardList, MoreHorizontal, Search, ShieldAlert, UserCog, CheckCircle2, ArrowUpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { getPendingReportItems } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const typeVariant = {
  user: "info",
  event: "warning",
  chat: "danger",
} as const;

const typeTabs = [
  { label: "All", value: "all" },
  { label: "Users", value: "user" },
  { label: "Events", value: "event" },
  { label: "Chat", value: "chat" },
] as const;

export function PendingReportsTable() {
  const [filter, setFilter] = useState<"all" | "user" | "event" | "chat">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();

  const query = useQuery({
    queryKey: ["pending-reports", filter, page, pageSize],
    queryFn: () => getPendingReportItems({ type: filter, page, pageSize }),
  });

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data, pageSize]);

  const showingStart = query.data && query.data.total > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingEnd = query.data ? Math.min(page * pageSize, query.data.total) : 0;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {typeTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setFilter(tab.value); setPage(1); }}
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
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
              <TableHead className="pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Report ID</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reported Item</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assigned To</TableHead>
              <TableHead className="pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Skeleton rows */}
            {query.isPending &&
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/40">
                  <TableCell className="pl-4"><div className="h-3.5 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}><div className="h-3.5 w-24 animate-pulse rounded bg-muted" /></TableCell>
                  ))}
                </TableRow>
              ))}

            {/* Empty state */}
            {!query.isPending && query.data?.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                    <ClipboardList className="h-8 w-8 opacity-40" />
                    <p className="text-sm">No pending reports.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {query.data?.rows.map((report) => (
              <TableRow key={report.id} className="border-b border-border/40 last:border-0">
                <TableCell className="pl-4 py-3 font-mono text-sm font-medium">{report.id}</TableCell>
                <TableCell className="py-3">
                  <Badge variant={typeVariant[report.type]} className="capitalize">{report.type}</Badge>
                </TableCell>
                <TableCell className="py-3 text-sm font-medium">{report.reportedItem}</TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">{report.date}</TableCell>
                <TableCell className="py-3">
                  {report.assignedTo ? (
                    <Badge variant="secondary">{report.assignedTo}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="pr-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-muted/50">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onSelect={() => router.push("/moderation/investigation")}>
                        <ShieldAlert className="mr-2 h-3.5 w-3.5" /> Investigate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserCog className="mr-2 h-3.5 w-3.5" /> Assign Moderator
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Resolve Report
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-rose-600 dark:text-rose-400">
                        <ArrowUpCircle className="mr-2 h-3.5 w-3.5" /> Escalate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {query.data && query.data.total > 0
                ? `Showing ${showingStart}–${showingEnd} of ${query.data.total} reports`
                : "No pending reports"}
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