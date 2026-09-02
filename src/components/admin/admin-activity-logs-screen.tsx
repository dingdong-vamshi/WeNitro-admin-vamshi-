"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, Eye, Filter } from "lucide-react";

import { getAdminActivityLogs } from "@/lib/api";
import type { AdminActivityLogEntry } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const moduleOptions = ["All Modules", "Users", "Events", "Reports", "Settings", "Analytics", "Moderation", "Admins", "Notifications"];
const actionOptions = ["All Actions", "Deleted Event", "Suspended User", "Banned User", "Updated Category", "Approved Sponsorship", "Resolved Report", "Exported Report", "Updated Feature Toggle", "Created Admin", "Verified User", "Escalated Report", "Removed Event"];

const moduleColors: Record<string, string> = {
  Users: "text-sky-600 dark:text-sky-400",
  Events: "text-violet-600 dark:text-violet-400",
  Reports: "text-amber-600 dark:text-amber-400",
  Settings: "text-emerald-600 dark:text-emerald-400",
  Analytics: "text-blue-600 dark:text-blue-400",
  Moderation: "text-rose-600 dark:text-rose-400",
  Admins: "text-orange-600 dark:text-orange-400",
  Notifications: "text-indigo-600 dark:text-indigo-400",
};

export function AdminActivityLogsScreen() {
  const query = useQuery({ queryKey: ["admin-activity-logs"], queryFn: getAdminActivityLogs });
  const [selected, setSelected] = useState<AdminActivityLogEntry | null>(null);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Modules");
  const [actionFilter, setActionFilter] = useState("All Actions");

  const data = query.data ?? [];

  const filtered = data.filter((log) => {
    const matchesSearch =
      log.adminName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.targetName.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === "All Modules" || log.module === moduleFilter;
    const matchesAction = actionFilter === "All Actions" || log.action === actionFilter;
    return matchesSearch && matchesModule && matchesAction;
  });

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Logs Table */}
      <Card className="xl:col-span-3">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Admin Activity Logs</CardTitle>
              <CardDescription>
                Track all actions performed by admins. {data.length} total entries.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export Logs
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 pt-2">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="h-8 w-40 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {moduleOptions.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-8 w-44 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow
                  key={log.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/30 ${
                    selected?.id === log.id ? "bg-muted/40" : ""
                  }`}
                  onClick={() => setSelected(log)}
                >
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {log.timestamp}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{log.adminName}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium ${moduleColors[log.module] ?? ""}`}>
                      {log.module}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{log.action}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(log);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No logs match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Detail Panel */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Log Details</CardTitle>
          <CardDescription>
            {selected ? `${selected.action} by ${selected.adminName}` : "Select a log entry to view details."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selected ? (
            <div className="space-y-5">
              {/* Action Badge */}
              <div className="flex items-center justify-center rounded-xl border border-border/60 bg-muted/30 py-6">
                <div className="text-center">
                  <Badge className={`mb-2 ${moduleColors[selected.module] ?? ""}`} variant="outline">
                    {selected.module}
                  </Badge>
                  <p className="text-lg font-semibold">{selected.action}</p>
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</dt>
                  <dd className="font-medium">{selected.adminName}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</dt>
                  <dd>{selected.action}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target</dt>
                  <dd className="text-muted-foreground">{selected.targetName}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Type</dt>
                  <dd className="capitalize text-muted-foreground">{selected.targetType}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date &amp; Time</dt>
                  <dd className="text-muted-foreground">{selected.timestamp}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">IP Address</dt>
                  <dd className="font-mono text-xs text-muted-foreground">{selected.ipAddress}</dd>
                </div>
              </dl>

              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4" />
                Export This Log
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click a log entry from the table to view its full details here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
