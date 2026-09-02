"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, CalendarDays, ChevronDown, MapPin, MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";

import { getBlockedUsers } from "@/lib/api";
import { users as usersSeed } from "@/lib/mock-data";
import type { UserProfile } from "@/types/admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BanUserDialog } from "@/components/admin/ban-user-dialog";
import { useDebounce } from "@/hooks/use-debounce";

const topTabs = [
  { label: "All Users", href: "/users" },
  { label: "Verified Users", href: "/users/verified" },
  { label: "Blocked Users", href: "/users/blocked" },
  { label: "Suspended Users", href: "/users/suspended" },
];

export function BlockedUsersTable() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [signupDate, setSignupDate] = useState<"all" | "last30" | "last90" | "last180" | "thisYear">("all");
  const [participation, setParticipation] = useState<"all" | "high" | "medium" | "low">("all");
  const [page, setPage] = useState(1);
  const [banTarget, setBanTarget] = useState<UserProfile | null>(null);
  const pageSize = 6;
  const debouncedSearch = useDebounce(search);

  const query = useQuery({
    queryKey: ["blocked-users"],
    queryFn: getBlockedUsers,
  });

  const locationOptions = useMemo(
    () => ["all", ...Array.from(new Set(usersSeed.map((user) => user.location))).sort((a, b) => a.localeCompare(b))],
    [],
  );

  const filteredRows = useMemo(() => {
    const allRows = query.data ?? [];
    const now = new Date("2026-03-13");
    const minJoinDate =
      signupDate === "last30"
        ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        : signupDate === "last90"
          ? new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          : signupDate === "last180"
            ? new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
            : signupDate === "thisYear"
              ? new Date("2026-01-01")
              : null;

    return allRows.filter((user) => {
      const searchTerm = debouncedSearch.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm);
      const matchesLocation = location === "all" ? true : user.location === location;
      const matchesSignupDate = minJoinDate ? new Date(user.joinedAt) >= minJoinDate : true;
      const totalParticipation = user.eventsHosted + user.eventsJoined;
      const matchesParticipation =
        participation === "all"
          ? true
          : participation === "high"
            ? totalParticipation >= 30
            : participation === "medium"
              ? totalParticipation >= 12 && totalParticipation < 30
              : totalParticipation < 12;

      return matchesSearch && matchesLocation && matchesSignupDate && matchesParticipation;
    });
  }, [query.data, debouncedSearch, location, signupDate, participation]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginated = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const showingStart = filteredRows.length > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingEnd = Math.min(page * pageSize, filteredRows.length);
  const selectBaseClass = "h-9 appearance-none rounded-lg border border-border/70 bg-background pl-9 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-7 border-b border-border/80 pb-1">
        {topTabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 pb-2 text-sm font-semibold transition-colors ${tab.href === "/users/blocked" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search users by name, email..."
              className="h-10 w-full rounded-lg border border-border/70 bg-background pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select value={location} onChange={(event) => { setLocation(event.target.value); setPage(1); }} className={selectBaseClass}>
                {locationOptions.map((option) => (
                  <option key={option} value={option}>{option === "all" ? "Location" : option}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select value={signupDate} onChange={(event) => { setSignupDate(event.target.value as "all" | "last30" | "last90" | "last180" | "thisYear"); setPage(1); }} className={selectBaseClass}>
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
              <select value={participation} onChange={(event) => { setParticipation(event.target.value as "all" | "high" | "medium" | "low"); setPage(1); }} className={selectBaseClass}>
                <option value="all">Event Participation</option>
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
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Blocked Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading
              ? Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : paginated.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{user.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold leading-tight">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell className="text-sm">{user.blockedReason ?? "—"}</TableCell>
                    <TableCell className="text-sm">{user.blockedAt ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/users/${user.id}`}>View Profile</Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-muted/50">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href={`/users/${user.id}`}>View Profile</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-emerald-600">Unblock User</DropdownMenuItem>
                            <DropdownMenuItem className="text-amber-600">Suspend</DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600" onSelect={() => setBanTarget(user)}>Ban User</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/70 px-4 py-4">
          <p className="text-sm text-muted-foreground">
            {filteredRows.length > 0
              ? `Showing ${showingStart} to ${showingEnd} of ${filteredRows.length.toLocaleString()} users`
              : "No users found"}
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || filteredRows.length === 0}>Next</Button>
          </div>
        </div>
      </div>

      <BanUserDialog
        userName={banTarget?.name ?? ""}
        open={banTarget !== null}
        onOpenChange={(open) => { if (!open) setBanTarget(null); }}
        onConfirm={() => setBanTarget(null)}
      />
    </div>
  );
}
