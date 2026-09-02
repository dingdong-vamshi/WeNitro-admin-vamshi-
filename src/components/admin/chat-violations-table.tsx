"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Ban, ChevronDown, MessageSquareWarning, MoreHorizontal, Search, SlidersHorizontal, Trash2, UserX, XCircle } from "lucide-react";

import { getChatViolations } from "@/lib/api";
import { ModerationSeverityBadge } from "@/components/admin/moderation-severity-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useDebounce } from "@/hooks/use-debounce";
import type { ModerationSeverity } from "@/types/admin";

const severities: Array<ModerationSeverity | "all"> = ["all", "low", "medium", "high", "critical"];

export function ChatViolationsTable() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<ModerationSeverity | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expanded, setExpanded] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const query = useQuery({
    queryKey: ["chat-violations", debouncedSearch, severity, page, pageSize],
    queryFn: () => getChatViolations({ search: debouncedSearch, severity, page, pageSize }),
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
              placeholder="Search user, event, or message..."
              className="h-10 w-full rounded-lg border border-border/70 bg-background pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={severity}
                onChange={(e) => { setSeverity(e.target.value as ModerationSeverity | "all"); setPage(1); }}
                className={selectBaseClass}
              >
                {severities.map((s) => (
                  <option key={s} value={s}>{s === "all" ? "All Severities" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
              <TableHead className="pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Event</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Message Preview</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Flagged For</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Severity</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</TableHead>
              <TableHead className="pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Skeleton rows */}
            {query.isPending &&
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/40">
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                      <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </TableCell>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}><div className="h-3.5 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  ))}
                </TableRow>
              ))}

            {/* Empty state */}
            {!query.isPending && query.data?.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-14 text-center text-sm text-muted-foreground">
                  No violations found.
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {query.data?.rows.map((violation) => (
              <TableRow
                key={violation.id}
                className="cursor-pointer border-b border-border/40 last:border-0 hover:bg-muted/30"
                onClick={() => setExpanded(expanded === violation.id ? null : violation.id)}
              >
                <TableCell className="pl-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{violation.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{violation.username}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-sm">{violation.eventTitle}</TableCell>
                <TableCell className="py-3 max-w-[220px]">
                  <p className="truncate text-sm text-muted-foreground">{violation.message}</p>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {violation.flaggedFor.map((f) => (
                      <Badge key={f} variant="danger" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <ModerationSeverityBadge severity={violation.severity} />
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">{violation.date}</TableCell>
                <TableCell className="pr-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-muted/50">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem className="text-rose-600 dark:text-rose-400">
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="mr-2 h-3.5 w-3.5" /> Warn User
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-orange-600 dark:text-orange-400">
                        <UserX className="mr-2 h-3.5 w-3.5" /> Suspend User
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Ban className="mr-2 h-3.5 w-3.5" /> Ban User
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-muted-foreground">
                        <XCircle className="mr-2 h-3.5 w-3.5" /> Dismiss Flag
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
                ? `Showing ${showingStart}–${showingEnd} of ${query.data.total} violations`
                : "No violations found"}
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

      {/* Expanded message panel */}
      {expanded && (() => {
        const violation = query.data?.rows.find((v) => v.id === expanded);
        if (!violation) return null;
        return (
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card px-4 py-4">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-4">
              <MessageSquareWarning className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Full Message — {violation.username}</p>
                <p className="text-sm">{violation.message}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground">Flagged for:</span>
                  {violation.flaggedFor.map((f) => (
                    <Badge key={f} variant="danger" className="text-xs">{f}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}