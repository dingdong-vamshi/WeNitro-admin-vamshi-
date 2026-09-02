"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Globe, ShieldBan, Flag, Eye, Users } from "lucide-react";

import { getIpActivities } from "@/lib/api";
import type { IpActivity, IpStatus } from "@/types/admin";
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

const statusVariant: Record<IpStatus, "success" | "warning" | "danger" | "caution"> = {
  normal: "success",
  suspicious: "warning",
  flagged: "caution",
  blocked: "danger",
};

const statusLabel: Record<IpStatus, string> = {
  normal: "Normal",
  suspicious: "Suspicious",
  flagged: "Flagged",
  blocked: "Blocked",
};

const statuses: Array<IpStatus | "all"> = ["all", "normal", "suspicious", "flagged", "blocked"];

export function IpMonitoringTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<IpStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [selectedIp, setSelectedIp] = useState<IpActivity | null>(null);
  const debouncedSearch = useDebounce(search);
  const pageSize = 6;

  const query = useQuery({
    queryKey: ["ip-activities", debouncedSearch, status, page],
    queryFn: () => getIpActivities({ search: debouncedSearch, status, page, pageSize }),
  });

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data]);

  const selectCls =
    "h-9 appearance-none rounded-lg border border-border/70 bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="space-y-6">
      {/* Suspicious activity indicators */}
      <Card className="border-amber-200 dark:border-amber-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Suspicious Activity Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Multiple accounts registered from the same IP address",
              "Frequent failed login attempts suggesting brute force",
              "Login activity originating from different countries within short periods",
            ].map((indicator) => (
              <li key={indicator} className="flex items-start gap-2">
                <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                {indicator}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Table section */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by IP or country…"
                className="h-9 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as IpStatus | "all"); setPage(1); }}
              className={selectCls}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All Statuses" : statusLabel[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>IP Address</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Linked Accounts</TableHead>
                  <TableHead>Login Attempts</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isPending && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                )}
                {query.data?.rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      No IP records found.
                    </TableCell>
                  </TableRow>
                )}
                {query.data?.rows.map((ip) => (
                  <TableRow
                    key={ip.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${selectedIp?.id === ip.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedIp(ip)}
                  >
                    <TableCell className="font-mono text-sm">{ip.ipAddress}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        {ip.country}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[ip.status]}>{statusLabel[ip.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">{ip.linkedAccounts}</TableCell>
                    <TableCell className="text-sm tabular-nums">{ip.loginAttempts}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{ip.lastSeen}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <Globe className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedIp(ip); }}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" /> Investigate Users
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Flag className="mr-2 h-4 w-4" /> Flag IP
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600 dark:text-rose-400">
                            <ShieldBan className="mr-2 h-4 w-4" /> Block IP
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
                Page {page} of {totalPages} — {query.data?.total ?? 0} IPs
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
        {selectedIp ? (
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="font-mono text-base">{selectedIp.ipAddress}</CardTitle>
              <CardDescription>
                <Badge variant={statusVariant[selectedIp.status]}>{statusLabel[selectedIp.status]}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Country</p>
                  <p className="font-semibold">{selectedIp.country}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Last Seen</p>
                  <p className="font-semibold">{selectedIp.lastSeen}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Linked Accounts</p>
                  <p className="font-semibold tabular-nums">{selectedIp.linkedAccounts}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Login Attempts</p>
                  <p className={`font-semibold tabular-nums ${selectedIp.loginAttempts > 20 ? "text-rose-600 dark:text-rose-400" : selectedIp.loginAttempts > 10 ? "text-amber-600 dark:text-amber-400" : ""}`}>
                    {selectedIp.loginAttempts}
                  </p>
                </div>
              </div>

              {selectedIp.indicators.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Indicators</p>
                  <ul className="space-y-1.5">
                    {selectedIp.indicators.map((indicator) => (
                      <li key={indicator} className="flex items-start gap-2 rounded-md bg-amber-500/5 border border-amber-200 dark:border-amber-900/50 px-2.5 py-1.5">
                        <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs">{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t border-border pt-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800">
                  <ShieldBan className="mr-2 h-3.5 w-3.5" /> Block IP
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                  <Flag className="mr-2 h-3.5 w-3.5" /> Flag IP
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Eye className="mr-2 h-3.5 w-3.5" /> Monitor Activity
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="mr-2 h-3.5 w-3.5" /> Investigate Users
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 min-h-[200px]">
            <p className="text-sm text-muted-foreground">Select an IP to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
