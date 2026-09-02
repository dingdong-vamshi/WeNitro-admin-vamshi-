"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarDays, ChevronDown, MapPin, MoreHorizontal, Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import { BanUserDialog, UnbanUserDialog } from "@/components/admin/ban-user-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { getUsers } from "@/lib/api";
import { AdminDataState } from "@/components/admin/admin-data-state";
import type { User, UserStatus } from "@/types/admin";
import { TremorAreaChart } from "@/components/charts/tremor-charts";

const topTabs: Array<{ label: string; value: UserStatus | "all" }> = [
  { label: "All Users", value: "all" },
  { label: "Verified Users", value: "verified" },
  { label: "Blocked Users", value: "blocked" },
  { label: "Suspended Users", value: "suspended" },
];

const statuses: Array<UserStatus | "all"> = ["all", "active", "verified", "blocked", "suspended", "banned"];

const statusVariant: Record<UserStatus, "success" | "info" | "caution" | "warning" | "danger"> = {
  active: "success",
  verified: "info",
  blocked: "danger",
  suspended: "warning",
  banned: "danger",
};

const statusLabel: Record<UserStatus, string> = {
  active: "Active",
  verified: "Verified",
  blocked: "Blocked",
  suspended: "Suspended",
  banned: "Banned",
};

function userInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatJoinedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date pending";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function UsersTable({ initialStatus = "all" }: { initialStatus?: UserStatus | "all" }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">(initialStatus);
  const [location, setLocation] = useState("all");
  const [signupDate, setSignupDate] = useState<"all" | "last30" | "last90" | "last180" | "thisYear">("all");
  const [participation, setParticipation] = useState<"all" | "high" | "medium" | "low">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [unbanTarget, setUnbanTarget] = useState<User | null>(null);
  const debouncedSearch = useDebounce(search);
  const router = useRouter();
  const query = useQuery({
    queryKey: ["users", debouncedSearch, status, location, signupDate, participation, page, pageSize],
    queryFn: () => getUsers({ search: debouncedSearch, status, location, signupDate, participation, page, pageSize }),
  });
  const locationOptions = useMemo(
    () => ["all", ...Array.from(new Set((query.data?.rows ?? []).map((user) => user.location))).sort((a, b) => a.localeCompare(b))],
    [query.data],
  );

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data, pageSize]);

  const showingStart = query.data && query.data.total > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingEnd = query.data ? Math.min(page * pageSize, query.data.total) : 0;
  const memberFlow = useMemo(() => {
    let participation = 0;
    const rows = [...(query.data?.rows ?? [])].sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
    if (!rows.length) return [{ label: "No data", members: 0, participation: 0 }];
    return rows.map((user, index) => {
      participation += user.eventsHosted + user.eventsJoined;
      return {
        label: new Date(user.joinedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        members: index + 1,
        participation,
      };
    });
  }, [query.data]);

  if (query.isError) return <AdminDataState title="users" error={query.error} onRetry={() => void query.refetch()} />;

  const selectBaseClass = "h-10 appearance-none rounded-lg border border-border bg-card pl-9 pr-8 text-xs font-semibold text-foreground shadow-sm outline-none transition-all focus:border-primary/45 focus:ring-3 focus:ring-ring/10";

  return (
    <div className="space-y-4">
      <div className="flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-md bg-[#f1f1ef] p-0.5">
        {topTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`rounded px-3.5 py-1.5 text-xs font-medium transition-all ${status === tab.value ? "bg-white text-[#202020] shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-white">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#202020]">Member flow</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Cumulative members and participation for the active filters.</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-[#202020]" /> Members</span>
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-blue-600" /> Participation</span>
          </div>
        </div>
        <div className="p-5"><TremorAreaChart data={memberFlow} index="label" categories={["members", "participation"]} colors={["#202020", "#2563eb"]} className="h-56" /></div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <div className="flex flex-col gap-3 border-b border-border bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search users by name, email..."
              className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm shadow-sm outline-none transition-all focus:border-primary/45 focus:ring-3 focus:ring-ring/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as UserStatus | "all");
                  setPage(1);
                }}
                className={selectBaseClass}
              >
                {statuses.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "Filter Status" : statusLabel[option]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value);
                  setPage(1);
                }}
                className={selectBaseClass}
              >
                {locationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "Location" : option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={signupDate}
                onChange={(event) => {
                  setSignupDate(event.target.value as "all" | "last30" | "last90" | "last180" | "thisYear");
                  setPage(1);
                }}
                className={selectBaseClass}
              >
                <option value="all">Signup Date</option>
                <option value="last30">Last 30 Days</option>
                <option value="last90">Last 90 Days</option>
                <option value="last180">Last 180 Days</option>
                <option value="thisYear">This Year</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="relative">
              <Activity className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={participation}
                onChange={(event) => {
                  setParticipation(event.target.value as "all" | "high" | "medium" | "low");
                  setPage(1);
                }}
                className={selectBaseClass}
              >
                <option value="all">Activity Participation</option>
                <option value="high">High (30+)</option>
                <option value="medium">Medium (12-29)</option>
                <option value="low">Low (0-11)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
              <TableHead className="pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Joined</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activity</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
              <TableHead className="pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading
              ? Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={index} className="border-b border-border/40">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
                          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                        </div>
                      </div>
                    </TableCell>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}><div className="h-3.5 w-24 animate-pulse rounded bg-muted" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!query.isLoading && query.data?.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-14 text-center text-sm text-muted-foreground">
                  No users found matching your filters.
                </TableCell>
              </TableRow>
            )}

            {query.data?.rows.map((user) => (
                  <TableRow key={user.id} className="group border-b border-border/50 last:border-0">
                    <TableCell className="pl-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 ring-2 ring-border/70 ring-offset-2 ring-offset-card">
                          {user.avatar.startsWith("http") ? <AvatarImage src={user.avatar} alt="" /> : null}
                          <AvatarFallback>{userInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold leading-tight">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-sm">{user.email}</TableCell>
                    <TableCell className="py-3 text-sm tabular-nums">{formatJoinedDate(user.joinedAt)}</TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">{user.location}</TableCell>
                    <TableCell className="py-3 text-sm tabular-nums text-muted-foreground">
                      {user.eventsHosted} hosted · {user.eventsJoined} joined
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant={statusVariant[user.status]}>{statusLabel[user.status]}</Badge>
                    </TableCell>
                    <TableCell className="pr-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/users/${user.id}`)}>View Profile</Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-muted/50">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => router.push(`/users/${user.id}`)}>View Profile</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => router.push(`/users/${user.id}/activity`)}>Activity History</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status !== "verified" ? <DropdownMenuItem>Verify User</DropdownMenuItem> : null}
                            {user.status === "active" || user.status === "verified" ? (
                              <DropdownMenuItem>Suspend Account</DropdownMenuItem>
                            ) : null}
                            {user.status === "blocked" ? <DropdownMenuItem>Unblock User</DropdownMenuItem> : <DropdownMenuItem>Block User</DropdownMenuItem>}
                            <DropdownMenuSeparator />
                            {user.status === "banned" ? (
                              <DropdownMenuItem onSelect={() => setUnbanTarget(user)}>Unban User</DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-destructive" onSelect={() => setBanTarget(user)}>
                                Ban User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: showing + rows per page */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {query.data && query.data.total > 0
                ? `Showing ${showingStart}–${showingEnd} of ${query.data.total.toLocaleString()} users`
                : "No users found"}
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

          {/* Right: pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </Button>

              {(() => {
                const delta = 1;
                const range: Array<number | "…"> = [];
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                    range.push(i);
                  } else if (range[range.length - 1] !== "…") {
                    range.push("…");
                  }
                }
                return range.map((item, idx) =>
                  item === "…" ? (
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
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <BanUserDialog
        userName={banTarget?.name ?? ""}
        banReason="Repeated harassment reports"
        open={banTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setBanTarget(null);
          }
        }}
        onConfirm={() => setBanTarget(null)}
      />
      <UnbanUserDialog
        userName={unbanTarget?.name ?? ""}
        open={unbanTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setUnbanTarget(null);
          }
        }}
        onConfirm={() => setUnbanTarget(null)}
      />
    </div>
  );
}
