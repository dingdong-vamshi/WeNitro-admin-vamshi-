"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Ban, ChevronDown, Eye, MoreHorizontal, Search, Shield, SlidersHorizontal, UserX, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { getReportedUsers } from "@/lib/api";
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

export function ReportedUsersTable() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<ModerationSeverity | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search);
  const router = useRouter();

  const query = useQuery({
    queryKey: ["reported-users", debouncedSearch, severity, page, pageSize],
    queryFn: () => getReportedUsers({ search: debouncedSearch, severity, page, pageSize }),
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
              placeholder="Search by username or name…"
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
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reports</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last Report</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Severity</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Risk Score</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reasons</TableHead>
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
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                      </div>
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
                  No reported users found.
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {query.data?.rows.map((user) => (
              <TableRow key={user.id} className="border-b border-border/40 last:border-0">
                <TableCell className="pl-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">{user.reportCount}</span>
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">{user.lastReportDate}</TableCell>
                <TableCell className="py-3">
                  <ModerationSeverityBadge severity={user.severity} />
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${user.riskScore >= 80 ? "bg-rose-500" : user.riskScore >= 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${user.riskScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium tabular-nums">{user.riskScore}/100</span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.reasons.slice(0, 2).map((r) => (
                      <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                    ))}
                    {user.reasons.length > 2 && (
                      <Badge variant="secondary" className="text-xs">+{user.reasons.length - 2}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="pr-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/users/${user.userId}`)}>
                      View Profile
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-muted/50">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onSelect={() => router.push(`/users/${user.userId}`)}>
                          <Eye className="mr-2 h-3.5 w-3.5" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => router.push(`/moderation/investigation`)}>
                          <Shield className="mr-2 h-3.5 w-3.5" /> Investigate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="mr-2 h-3.5 w-3.5" /> Warn User
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-orange-600 dark:text-orange-400">
                          <UserX className="mr-2 h-3.5 w-3.5" /> Suspend Account
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="mr-2 h-3.5 w-3.5" /> Ban User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-muted-foreground">
                          <XCircle className="mr-2 h-3.5 w-3.5" /> Dismiss Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Footer: showing + rows per page + pagination */}
        <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {query.data && query.data.total > 0
                ? `Showing ${showingStart}–${showingEnd} of ${query.data.total} reported users`
                : "No reported users found"}
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
