"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Bell,
  ChevronDown,
  Coffee,
  Dumbbell,
  GraduationCap,
  Handshake,
  MapPin,
  Mountain,
  MoreHorizontal,
  Music2,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Star,
  Tag,
  Trash2,
  Users2,
  XCircle,
} from "lucide-react";

import { useDebounce } from "@/hooks/use-debounce";
import { getEvents } from "@/lib/api";
import type { EventCategory, EventStatus } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EventDeleteDialog } from "@/components/admin/event-delete-dialog";
import { EventModerateDialog } from "@/components/admin/event-moderate-dialog";
import { TremorAreaChart } from "@/components/charts/tremor-charts";

// ── Lookups ────────────────────────────────────────────────────────────────

const statusVariant: Record<EventStatus, "secondary" | "success" | "warning" | "danger" | "outline"> = {
  upcoming: "secondary",
  ongoing: "success",
  completed: "outline",
  cancelled: "warning",
  reported: "danger",
};

const statusLabel: Record<EventStatus, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
  reported: "Reported",
};

const categoryLabel: Record<EventCategory, string> = {
  adventure: "Adventure & Outdoors",
  social: "Social & Networking",
  business: "Business & Tech",
  wellness: "Wellness",
  music: "Music & Arts",
  food: "Food & Drink",
  education: "Education",
  sports: "Sports",
};

const categoryIcon: Record<EventCategory, typeof Mountain> = {
  adventure: Mountain,
  social: Handshake,
  business: BookOpen,
  wellness: Dumbbell,
  music: Music2,
  food: Coffee,
  education: GraduationCap,
  sports: Dumbbell,
};

const categoryTone: Record<EventCategory, string> = {
  adventure: "bg-zinc-100 text-zinc-900 ring-zinc-200",
  social: "bg-blue-50 text-blue-700 ring-blue-200",
  business: "bg-zinc-100 text-zinc-900 ring-zinc-200",
  wellness: "bg-blue-50 text-blue-700 ring-blue-200",
  music: "bg-zinc-100 text-zinc-900 ring-zinc-200",
  food: "bg-blue-50 text-blue-700 ring-blue-200",
  education: "bg-zinc-100 text-zinc-900 ring-zinc-200",
  sports: "bg-blue-50 text-blue-700 ring-blue-200",
};

const allCategories: EventCategory[] = [
  "adventure", "social", "business", "wellness", "music", "food", "education", "sports",
];

const allStatuses: Array<EventStatus | "all"> = [
  "all", "upcoming", "ongoing", "completed", "cancelled", "reported",
];

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso.includes("T") ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "Date pending";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function hostInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ── Main component ─────────────────────────────────────────────────────────

export function EventsTable({
  initialStatus = "all",
  hideStatusFilter = false,
}: {
  initialStatus?: EventStatus | "all";
  hideStatusFilter?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EventStatus | "all">(initialStatus);
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [moderateTarget, setModerateTarget] = useState<{ id: string; title: string } | null>(null);
  const router = useRouter();

  const query = useQuery({
    queryKey: ["events", debouncedSearch, status, category, city, page, pageSize],
    queryFn: () => getEvents({ search: debouncedSearch, status, category, city, page, pageSize }),
  });

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data, pageSize]);

  const showingStart = query.data && query.data.total > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingEnd = query.data ? Math.min(page * pageSize, query.data.total) : 0;
  const cityOptions = useMemo(
    () => Array.from(new Set((query.data?.rows ?? []).map((event) => event.city))).sort((a, b) => a.localeCompare(b)),
    [query.data],
  );
  const activityFlow = useMemo(() => {
    let participants = 0;
    const rows = [...(query.data?.rows ?? [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (!rows.length) return [{ label: "No data", activities: 0, participants: 0 }];
    return rows.map((event, index) => {
      participants += event.attendees;
      return {
        label: new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        activities: index + 1,
        participants,
      };
    });
  }, [query.data]);

  const selectBaseClass = "h-10 appearance-none rounded-lg border border-border bg-card pl-9 pr-8 text-xs font-semibold text-foreground shadow-sm outline-none transition-all focus:border-primary/45 focus:ring-3 focus:ring-ring/10";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-white">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#202020]">Activity flow</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Cumulative activities and participation for the filtered result set.</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-[#202020]" /> Activities</span>
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-blue-600" /> Participants</span>
          </div>
        </div>
        <div className="p-5"><TremorAreaChart data={activityFlow} index="label" categories={["activities", "participants"]} colors={["#202020", "#2563eb"]} className="h-56" /></div>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-border bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search activities by name or host..."
              className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm shadow-sm outline-none transition-all focus:border-primary/45 focus:ring-3 focus:ring-ring/10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className={selectBaseClass}
              >
                <option value="all">Category</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>{categoryLabel[c]}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(1); }}
                className={selectBaseClass}
              >
                <option value="all">City</option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            {!hideStatusFilter && (
              <div className="relative">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value as EventStatus | "all"); setPage(1); }}
                  className={selectBaseClass}
                >
                  <option value="all">Filter Status</option>
                  {allStatuses.filter((s) => s !== "all").map((s) => (
                    <option key={s} value={s}>{statusLabel[s as EventStatus]}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 transition-colors bg-muted/50 hover:bg-muted/50">
              <TableHead className="pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Activity
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Host
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Participants
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Skeleton rows */}
            {query.isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/40">
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 animate-pulse rounded-lg bg-muted" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  </TableCell>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-3.5 w-20 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {/* Empty state */}
            {!query.isLoading && query.data?.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-14 text-center text-sm text-muted-foreground">
                  No activities found matching your filters.
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {query.data?.rows.map((event) => {
              const CategoryIcon = categoryIcon[event.category] ?? BookOpen;
              const initials = hostInitials(event.host);
              return (
                <TableRow key={event.id} className="group border-b border-border/50 last:border-0">
                  {/* Event name + thumbnail */}
                  <TableCell className="pl-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${categoryTone[event.category]}`}>
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 max-w-72">
                        <p className="truncate text-sm font-semibold leading-tight text-[#202020]">{event.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {categoryLabel[event.category]}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Host */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#202020] text-[10px] font-semibold text-white shadow-[0_2px_0_#000]">
                        {initials}
                      </div>
                      <span className="text-sm">{event.host}</span>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="py-3 text-sm tabular-nums">
                    {formatDate(event.date)}
                  </TableCell>

                  {/* Participants */}
                  <TableCell className="py-3 text-sm tabular-nums">
                    {event.maxAttendees
                      ? `${event.attendees} / ${event.maxAttendees}`
                      : event.attendees}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3">
                    <Badge variant={statusVariant[event.status]}>
                      {statusLabel[event.status]}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="pr-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {/* View button */}
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/events/${event.id}`}>Open</Link>
                      </Button>

                      {/* ⋮ menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md bg-muted/50">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/events/${event.id}/participants`)}>
                              <Users2 className="mr-2 h-3.5 w-3.5" />
                              View Participants
                            </DropdownMenuItem>
                          {(event.status === "upcoming" || event.status === "ongoing") && (
                            <DropdownMenuItem>
                              <Star className="mr-2 h-3.5 w-3.5 text-blue-700" />
                              Feature activity
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Bell className="mr-2 h-3.5 w-3.5" />
                            Send Notification
                          </DropdownMenuItem>
                          {event.status !== "completed" && event.status !== "cancelled" && (
                            <DropdownMenuItem
                              onClick={() => setModerateTarget({ id: event.id, title: event.title })}
                            >
                              <ShieldAlert className="mr-2 h-3.5 w-3.5 text-[#202020]" />
                              Moderate
                            </DropdownMenuItem>
                          )}
                          {(event.status === "upcoming" || event.status === "ongoing") && (
                            <DropdownMenuItem>
                              <XCircle className="mr-2 h-3.5 w-3.5 text-yellow-600" />
                              Cancel activity
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget({ id: event.id, title: event.title })}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete activity
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: showing + rows per page */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {query.data && query.data.total > 0
                ? `Showing ${showingStart}–${showingEnd} of ${query.data.total} activities`
                : "No activities found"}
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
              {/* Previous */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </Button>

              {/* Page numbers with ellipsis */}
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
                    <span key={`ellipsis-${idx}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">
                      …
                    </span>
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

              {/* Next */}
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

      <EventDeleteDialog
        eventTitle={deleteTarget?.title ?? ""}
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={() => {}}
      />
      <EventModerateDialog
        eventTitle={moderateTarget?.title ?? ""}
        open={moderateTarget !== null}
        onOpenChange={(open) => { if (!open) setModerateTarget(null); }}
        onConfirm={() => {}}
      />
    </div>
  );
}
