"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, FileText, ShieldAlert, UserX, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";

import { getSafetyReports } from "@/lib/api";
import type { SafetyReport, SafetyReportStatus, SafetyReportType } from "@/types/admin";
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

const statusVariant: Record<SafetyReportStatus, "warning" | "info" | "success"> = {
  pending: "warning",
  investigating: "info",
  resolved: "success",
};

const statusLabel: Record<SafetyReportStatus, string> = {
  pending: "Pending",
  investigating: "Investigating",
  resolved: "Resolved",
};

const statusIcon: Record<SafetyReportStatus, React.ElementType> = {
  pending: Clock,
  investigating: Eye,
  resolved: CheckCircle2,
};

const typeLabel: Record<SafetyReportType, string> = {
  harassment: "Harassment",
  fake_event: "Fake Event",
  inappropriate_message: "Inappropriate Msg",
  spam: "Spam",
  impersonation: "Impersonation",
  other: "Other",
};

const reportTypes: Array<SafetyReportType | "all"> = [
  "all", "harassment", "fake_event", "inappropriate_message", "spam", "impersonation", "other",
];

const statuses: Array<SafetyReportStatus | "all"> = ["all", "pending", "investigating", "resolved"];

export function SafetyReportsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SafetyReportStatus | "all">("all");
  const [reportType, setReportType] = useState<SafetyReportType | "all">("all");
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);
  const debouncedSearch = useDebounce(search);
  const pageSize = 6;

  const query = useQuery({
    queryKey: ["safety-reports", debouncedSearch, status, reportType, page],
    queryFn: () => getSafetyReports({ search: debouncedSearch, status, reportType, page, pageSize }),
  });

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data]);

  const selectCls =
    "h-9 appearance-none rounded-lg border border-border/70 bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      {/* Table section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by user or report ID…"
              className="h-9 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <select
            value={reportType}
            onChange={(e) => { setReportType(e.target.value as SafetyReportType | "all"); setPage(1); }}
            className={selectCls}
          >
            {reportTypes.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All Types" : typeLabel[t]}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as SafetyReportStatus | "all"); setPage(1); }}
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
                <TableHead>Report ID</TableHead>
                <TableHead>Report Type</TableHead>
                <TableHead>Reported User</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Evidence</TableHead>
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
                    No reports found.
                  </TableCell>
                </TableRow>
              )}
              {query.data?.rows.map((report) => {
                const StatusIcon = statusIcon[report.status];
                return (
                  <TableRow
                    key={report.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/40 ${selectedReport?.id === report.id ? "bg-primary/5" : ""}`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">{report.id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{typeLabel[report.reportType]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarFallback className="text-[10px]">{report.reportedUser.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{report.reportedUser}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarFallback className="text-[10px]">{report.reportedByAvatar}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{report.reportedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <StatusIcon className="h-3.5 w-3.5" />
                        <Badge variant={statusVariant[report.status]}>{statusLabel[report.status]}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">{report.evidenceCount} file{report.evidenceCount !== 1 ? "s" : ""}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <ShieldAlert className="mr-2 h-4 w-4" /> Warn User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserX className="mr-2 h-4 w-4" /> Suspend User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600 dark:text-rose-400">
                            <XCircle className="mr-2 h-4 w-4" /> Block User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-muted-foreground">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Dismiss Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
              Page {page} of {totalPages} — {query.data?.total ?? 0} reports
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
      {selectedReport ? (
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{selectedReport.id}</CardTitle>
            <CardDescription>
              <Badge variant={statusVariant[selectedReport.status]}>{statusLabel[selectedReport.status]}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reported User</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{selectedReport.reportedUser.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{selectedReport.reportedUser}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reported By</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{selectedReport.reportedByAvatar}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{selectedReport.reportedBy}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Report Type</p>
                <Badge variant="secondary">{typeLabel[selectedReport.reportType]}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm leading-relaxed rounded-md bg-muted/40 p-2.5">{selectedReport.description}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Evidence</p>
                <p className="text-sm">{selectedReport.evidenceCount} attached file{selectedReport.evidenceCount !== 1 ? "s" : ""}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Date Submitted</p>
                <p className="text-sm">{selectedReport.createdAt}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Investigation Panel</p>
              <div className="grid grid-cols-1 gap-1.5">
                {["User Chat Logs", "Event Participation", "Previous Reports", "User Activity History"].map((item) => (
                  <button
                    key={item}
                    className="flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-left text-sm hover:bg-muted/40 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ShieldAlert className="mr-2 h-3.5 w-3.5" /> Warn User
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                <UserX className="mr-2 h-3.5 w-3.5" /> Suspend User
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800">
                <XCircle className="mr-2 h-3.5 w-3.5" /> Block User
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Dismiss Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 min-h-[200px]">
          <p className="text-sm text-muted-foreground">Select a report to view details</p>
        </div>
      )}
    </div>
  );
}
