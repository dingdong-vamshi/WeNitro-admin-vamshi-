"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronDown, ExternalLink, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { getSponsoredEvents } from "@/lib/api";
import { sponsoredEvents as seed, businessAccounts } from "@/lib/mock-data";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SponsoredEventStatus } from "@/types/admin";

// ── Lookups ────────────────────────────────────────────────────────────────

export const sponsoredStatusVariant: Record<
  SponsoredEventStatus,
  "success" | "warning" | "danger" | "outline" | "secondary"
> = {
  active: "success",
  pending: "warning",
  completed: "outline",
  rejected: "danger",
  cancelled: "secondary",
};

export const sponsoredStatusLabel: Record<SponsoredEventStatus, string> = {
  active: "Active",
  pending: "Pending",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const topTabs: Array<{ label: string; value: SponsoredEventStatus | "all" }> = [
  { label: "All Events", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending Approval", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
];

const selectBaseClass =
  "h-9 appearance-none rounded-lg border border-border/70 bg-background pl-9 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

function formatInr(n: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(n)}`;
}

export function SponsoredEventsTable({
  initialStatus = "all",
  businessId,
}: {
  initialStatus?: SponsoredEventStatus | "all";
  businessId?: string;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SponsoredEventStatus | "all">(initialStatus);
  const [selectedBusiness, setSelectedBusiness] = useState(businessId ?? "all");
  const [city, setCity] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search);
  const router = useRouter();

  const cityOptions = useMemo(
    () => ["all", ...Array.from(new Set(seed.map((e) => e.city))).sort()],
    [],
  );

  const query = useQuery({
    queryKey: ["sponsored-events", debouncedSearch, status, selectedBusiness, city, page, pageSize],
    queryFn: () =>
      getSponsoredEvents({
        search: debouncedSearch,
        status,
        businessId: selectedBusiness,
        city,
        page,
        pageSize,
      }),
  });

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data, pageSize]);

  const showingStart = query.data && query.data.total > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingEnd = query.data ? Math.min(page * pageSize, query.data.total) : 0;

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-7 border-b border-border/80">
        {topTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`border-b-2 pb-2 text-sm font-semibold transition-colors ${
              status === tab.value
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => { setStatus(tab.value); setPage(1); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        {/* Filters bar */}
        <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search event or business…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-10 w-full rounded-lg border border-border/70 bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Business filter (hide if already scoped to a business) */}
            {!businessId && (
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={selectedBusiness}
                  onChange={(e) => { setSelectedBusiness(e.target.value); setPage(1); }}
                  className={selectBaseClass}
                >
                  <option value="all">All Businesses</option>
                  {businessAccounts.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            )}

            {/* City filter */}
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(1); }}
                className={selectBaseClass}
              >
                {cityOptions.map((c) => (
                  <option key={c} value={c}>{c === "all" ? "All Cities" : c}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
              <TableHead className="pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Event</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Business</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Budget</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Duration</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
              <TableHead className="pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Skeleton rows */}
            {query.isLoading &&
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/40">
                  <TableCell className="pl-4">
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-36 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    </div>
                  </TableCell>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}><div className="h-3.5 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  ))}
                </TableRow>
              ))}

            {/* Empty state */}
            {!query.isLoading && query.data?.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-14 text-center text-sm text-muted-foreground">
                  No sponsored events found.
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {query.data?.rows.map((ev) => (
              <TableRow key={ev.id} className="border-b border-border/40 last:border-0">
                <TableCell className="pl-4 py-3">
                  <div>
                    <p className="font-medium leading-tight text-sm">{ev.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{ev.city}</p>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">{ev.businessName}</TableCell>
                <TableCell className="py-3 font-medium text-sm">{formatInr(ev.budget)}</TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">
                  {new Date(ev.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {" – "}
                  {new Date(ev.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </TableCell>
                <TableCell className="py-3">
                  <Badge variant={sponsoredStatusVariant[ev.status]}>
                    {sponsoredStatusLabel[ev.status]}
                  </Badge>
                </TableCell>
                <TableCell className="pr-4 py-3 text-right">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/business/sponsored-events/${ev.id}`)}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    {ev.status === "pending" ? "Review" : "View"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {query.data && query.data.total > 0
                ? `Showing ${showingStart}\u2013${showingEnd} of ${query.data.total} events`
                : "No events found"}
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
                    <span key={`ellipsis-${idx}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">\u2026</span>
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
