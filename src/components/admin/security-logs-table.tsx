"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, Eye, Bot, Shield, User, Lock } from "lucide-react";

import { getSecurityLogs } from "@/lib/api";
import type { SecurityLogEntry, SecurityLogActorType } from "@/types/admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";

type LogCategory = "all" | "admin_action" | "user_action" | "login_activity" | "security_change";

const categoryOptions: Array<{ value: LogCategory; label: string }> = [
  { value: "all", label: "All Filters" },
  { value: "admin_action", label: "Admin Actions" },
  { value: "user_action", label: "User Actions" },
  { value: "login_activity", label: "Login Activity" },
  { value: "security_change", label: "Security Changes" },
];

const categoryVariant: Record<Exclude<LogCategory, "all">, "danger" | "info" | "warning" | "caution"> = {
  admin_action: "info",
  user_action: "secondary" as never,
  login_activity: "warning",
  security_change: "caution",
};

const categoryLabel: Record<Exclude<LogCategory, "all">, string> = {
  admin_action: "Admin Action",
  user_action: "User Action",
  login_activity: "Login Activity",
  security_change: "Security Change",
};

const actorIcon: Record<SecurityLogActorType, React.ElementType> = {
  admin: Shield,
  user: User,
  system: Bot,
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function SecurityLogsTable() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<LogCategory>("all");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<SecurityLogEntry | null>(null);
  const debouncedSearch = useDebounce(search);
  const pageSize = 8;

  const query = useQuery({
    queryKey: ["security-logs", debouncedSearch, category, page],
    queryFn: () => getSecurityLogs({ search: debouncedSearch, category, page, pageSize }),
  });

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data]);

  const selectCls =
    "h-9 appearance-none rounded-lg border border-border/70 bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      {/* Table section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by admin, user, or action…"
              className="h-9 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value as LogCategory); setPage(1); }}
            className={selectCls}
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isPending && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {query.data?.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No log entries found.
                  </TableCell>
                </TableRow>
              )}
              {query.data?.rows.map((log) => {
                const ActorIcon = actorIcon[log.actorType];
                return (
                  <TableRow
                    key={log.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${selectedLog?.id === log.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedLog(log)}
                  >
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{log.action}</TableCell>
                    <TableCell>
                      <Badge variant={categoryVariant[log.actionCategory as Exclude<LogCategory, "all">] ?? "secondary"}>
                        {categoryLabel[log.actionCategory as Exclude<LogCategory, "all">] ?? log.actionCategory}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarFallback className="text-[10px]">
                            <ActorIcon className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{log.actor}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="sr-only">View details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages} — {query.data?.total ?? 0} entries
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

      {/* Detail panel */}
      {selectedLog ? (
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{selectedLog.action}</CardTitle>
            <CardDescription>
              <Badge variant={categoryVariant[selectedLog.actionCategory as Exclude<LogCategory, "all">] ?? "secondary"}>
                {categoryLabel[selectedLog.actionCategory as Exclude<LogCategory, "all">] ?? selectedLog.actionCategory}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Timestamp</p>
                <p className="font-semibold">{formatTimestamp(selectedLog.timestamp)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Actor</p>
                <div className="flex items-center gap-2">
                  {(() => {
                    const ActorIcon = actorIcon[selectedLog.actorType];
                    return (
                      <>
                        <div className="rounded-md bg-muted p-1.5">
                          <ActorIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{selectedLog.actor}</p>
                          <p className="text-xs text-muted-foreground capitalize">{selectedLog.actorType}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
              {selectedLog.targetId && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Target ID</p>
                  <p className="font-mono text-sm">{selectedLog.targetId}</p>
                </div>
              )}
              {selectedLog.reason && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reason</p>
                  <p className="rounded-md bg-muted/40 p-2.5 leading-relaxed">{selectedLog.reason}</p>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye className="mr-2 h-3.5 w-3.5" /> View Full Details
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="mr-2 h-3.5 w-3.5" /> Export This Log
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Lock className="mr-2 h-3.5 w-3.5" /> Search Related Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 min-h-[200px]">
          <p className="text-sm text-muted-foreground">Select a log entry to view details</p>
        </div>
      )}
    </div>
  );
}
