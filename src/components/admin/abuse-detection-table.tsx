"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Bot, AlertTriangle, ShieldAlert, UserX, Ban, EyeOff } from "lucide-react";

import { getAbuseAlerts } from "@/lib/api";
import type { AbuseAlert, AbuseSeverity, AbuseAlertType } from "@/types/admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";

const severityVariant: Record<AbuseSeverity, "danger" | "warning" | "secondary"> = {
  high: "danger",
  medium: "warning",
  low: "secondary",
};

const alertTypeLabel: Record<AbuseAlertType, string> = {
  spam_messaging: "Spam Messaging",
  fake_event: "Fake Event",
  offensive_words: "Offensive Words",
  suspicious_behavior: "Suspicious Behavior",
  bot_activity: "Bot Activity",
  mass_reporting: "Mass Reporting",
};

const severities: Array<AbuseSeverity | "all"> = ["all", "high", "medium", "low"];

export function AbuseDetectionTable() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<AbuseSeverity | "all">("all");
  const [page, setPage] = useState(1);
  const [selectedAlert, setSelectedAlert] = useState<AbuseAlert | null>(null);
  const debouncedSearch = useDebounce(search);
  const pageSize = 6;

  const query = useQuery({
    queryKey: ["abuse-alerts", debouncedSearch, severity, page],
    queryFn: () => getAbuseAlerts({ search: debouncedSearch, severity, page, pageSize }),
  });

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data]);

  const selectCls =
    "h-9 appearance-none rounded-lg border border-border/70 bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="space-y-6">
      {/* AI Moderation Insights */}
      {query.data?.aiStats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-rose-200 dark:border-rose-900/50 bg-rose-500/5">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-rose-500/15 p-2.5">
                  <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{query.data.aiStats.flaggedMessages.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Flagged Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-500/5">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-500/15 p-2.5">
                  <EyeOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{query.data.aiStats.flaggedImages}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Flagged Images</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-sky-200 dark:border-sky-900/50 bg-sky-500/5">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-sky-500/15 p-2.5">
                  <Bot className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{query.data.aiStats.potentialFakeEvents}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Potential Fake Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Table section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by user ID or username…"
                className="h-9 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <select
              value={severity}
              onChange={(e) => { setSeverity(e.target.value as AbuseSeverity | "all"); setPage(1); }}
              className={selectCls}
            >
              {severities.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Severities" : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>User</TableHead>
                  <TableHead>Alert Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Flagged</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isPending && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                )}
                {query.data?.rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No abuse alerts found.
                    </TableCell>
                  </TableRow>
                )}
                {query.data?.rows.map((alert) => (
                  <TableRow
                    key={alert.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${selectedAlert?.id === alert.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs">{alert.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{alert.userId}</p>
                          <p className="text-xs text-muted-foreground">{alert.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{alertTypeLabel[alert.alertType]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={severityVariant[alert.severity]}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums font-semibold">{alert.flaggedCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{alert.detectedAt}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <AlertTriangle className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <ShieldAlert className="mr-2 h-4 w-4" /> Warn User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserX className="mr-2 h-4 w-4" /> Temporarily Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600 dark:text-rose-400">
                            <Ban className="mr-2 h-4 w-4" /> Permanent Ban
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-muted-foreground">
                            <EyeOff className="mr-2 h-4 w-4" /> Ignore Alert
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages} — {query.data?.total ?? 0} alerts
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Violation detail panel */}
        {selectedAlert ? (
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Violation Details</CardTitle>
              <CardDescription>{selectedAlert.username}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">User</p>
                  <p className="font-semibold">{selectedAlert.userId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Severity</p>
                  <Badge variant={severityVariant[selectedAlert.severity]}>
                    {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Violation Type</p>
                <Badge variant="secondary">{alertTypeLabel[selectedAlert.alertType]}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Detail</p>
                <p className="rounded-md bg-muted/40 p-2.5 leading-relaxed">{selectedAlert.detail}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Flagged Count</p>
                  <p className="font-semibold tabular-nums">{selectedAlert.flaggedCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Detected</p>
                  <p className="font-semibold">{selectedAlert.detectedAt}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ShieldAlert className="mr-2 h-3.5 w-3.5" /> Warn User
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                  <UserX className="mr-2 h-3.5 w-3.5" /> Temporarily Suspend
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800">
                  <Ban className="mr-2 h-3.5 w-3.5" /> Permanent Ban
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                  <EyeOff className="mr-2 h-3.5 w-3.5" /> Ignore Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 min-h-[200px]">
            <p className="text-sm text-muted-foreground">Select an alert to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
