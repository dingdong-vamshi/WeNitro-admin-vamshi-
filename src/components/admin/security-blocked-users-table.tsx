"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShieldOff, Eye, Ban, RotateCcw, FileText } from "lucide-react";

import { getSecurityBlockedUsers } from "@/lib/api";
import { securityBlockedUsers } from "@/lib/mock-data";
import type { BlockReason, SecurityBlockedUser } from "@/types/admin";
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

const reasonVariant: Record<BlockReason, "danger" | "warning" | "caution" | "info" | "secondary"> = {
  abuse: "danger",
  harassment: "caution",
  spam: "warning",
  fraud: "danger",
  fake_profile: "info",
  other: "secondary",
};

const reasonLabel: Record<BlockReason, string> = {
  abuse: "Abuse",
  harassment: "Harassment",
  spam: "Spam",
  fraud: "Fraud",
  fake_profile: "Fake Profile",
  other: "Other",
};

const reasons: Array<BlockReason | "all"> = ["all", "abuse", "harassment", "spam", "fraud", "fake_profile", "other"];

export function SecurityBlockedUsersTable() {
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState<BlockReason | "all">("all");
  const [country, setCountry] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<SecurityBlockedUser | null>(null);
  const debouncedSearch = useDebounce(search);
  const pageSize = 6;

  const query = useQuery({
    queryKey: ["security-blocked-users", debouncedSearch, reason, country, page],
    queryFn: () => getSecurityBlockedUsers({ search: debouncedSearch, reason, country, page, pageSize }),
  });

  const countryOptions = useMemo(
    () => ["all", ...Array.from(new Set(securityBlockedUsers.map((u) => u.country))).sort()],
    [],
  );

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data]);

  const selectCls =
    "h-9 appearance-none rounded-lg border border-border/70 bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      {/* Table section */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email…"
              className="h-9 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <select
            value={reason}
            onChange={(e) => { setReason(e.target.value as BlockReason | "all"); setPage(1); }}
            className={selectCls}
          >
            {reasons.map((r) => (
              <option key={r} value={r}>
                {r === "all" ? "All Reasons" : reasonLabel[r]}
              </option>
            ))}
          </select>
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); setPage(1); }}
            className={selectCls}
          >
            {countryOptions.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Countries" : c}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Blocked On</TableHead>
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
                    No blocked users found.
                  </TableCell>
                </TableRow>
              )}
              {query.data?.rows.map((user) => (
                <TableRow
                  key={user.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/40 ${selectedUser?.id === user.id ? "bg-primary/5" : ""}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={reasonVariant[user.reason]}>{reasonLabel[user.reason]}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold tabular-nums">{user.reportCount}</span>
                  </TableCell>
                  <TableCell className="text-sm">{user.country}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.blockedAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ShieldOff className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}>
                          <Eye className="mr-2 h-4 w-4" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" /> View Reports
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-emerald-600 dark:text-emerald-400">
                          <RotateCcw className="mr-2 h-4 w-4" /> Unblock User
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600 dark:text-rose-400">
                          <Ban className="mr-2 h-4 w-4" /> Permanent Ban
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {page} of {totalPages} — {query.data?.total ?? 0} users
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
      {selectedUser ? (
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-base">{selectedUser.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{selectedUser.name}</CardTitle>
                <CardDescription className="text-xs">{selectedUser.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Reports Received</p>
                <p className="font-semibold">{selectedUser.reportCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Country</p>
                <p className="font-semibold">{selectedUser.country}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Blocked On</p>
                <p className="font-semibold">{selectedUser.blockedAt}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Account Status</p>
                <Badge variant="danger">Blocked</Badge>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Violation Types</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.violations.map((v) => (
                  <Badge key={v} variant="secondary">{v}</Badge>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                <RotateCcw className="mr-2 h-3.5 w-3.5" /> Unblock User
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye className="mr-2 h-3.5 w-3.5" /> View Activity
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="mr-2 h-3.5 w-3.5" /> View Reports
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800">
                <Ban className="mr-2 h-3.5 w-3.5" /> Permanent Ban
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 min-h-[200px]">
          <p className="text-sm text-muted-foreground">Select a user to view their profile</p>
        </div>
      )}
    </div>
  );
}
