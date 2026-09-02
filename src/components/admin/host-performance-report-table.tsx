"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, ChevronDown, Search } from "lucide-react";

import { getHostPerformanceReportData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";

type SortKey = "score" | "avgRating" | "eventsHosted" | "totalParticipants" | "completionRate";

const sortLabels: Record<SortKey, string> = {
  score: "Score",
  avgRating: "Avg Rating",
  eventsHosted: "Events Hosted",
  totalParticipants: "Total Participants",
  completionRate: "Completion Rate",
};

const selectBaseClass =
  "h-9 appearance-none rounded-lg border border-border/70 bg-background pl-9 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

const PAGE_SIZE = 6;

export function HostPerformanceReportTable() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["host-performance-report"],
    queryFn: getHostPerformanceReportData,
  });

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const sorted = useMemo(() => {
    const filtered = debouncedSearch
      ? data.filter((row) =>
          row.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
      : data;
    return [...filtered].sort((a, b) => b[sortBy] - a[sortBy]);
  }, [data, debouncedSearch, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const showingStart = sorted.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = Math.min(page * PAGE_SIZE, sorted.length);

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search host..."
            className="h-10 w-full rounded-lg border border-border/70 bg-background pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortKey);
                setPage(1);
              }}
              className={selectBaseClass}
            >
              {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {sortLabels[key]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Host</TableHead>
            <TableHead className="text-right">Events Hosted</TableHead>
            <TableHead className="text-right">Avg Rating</TableHead>
            <TableHead className="text-right">Participants</TableHead>
            <TableHead className="text-right">Completion</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && paged.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-14 text-center text-sm text-muted-foreground">
                No hosts found.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            paged.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right tabular-nums">{row.eventsHosted}</TableCell>
                <TableCell className="text-right tabular-nums">{row.avgRating.toFixed(1)}</TableCell>
                <TableCell className="text-right tabular-nums">{row.totalParticipants.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <span className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${row.completionRate}%` }}
                      />
                    </div>
                    {row.completionRate}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span
                    className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{
                      backgroundColor:
                        row.score >= 90
                          ? "rgb(34 197 94 / 0.15)"
                          : row.score >= 75
                          ? "rgb(234 179 8 / 0.15)"
                          : "rgb(239 68 68 / 0.15)",
                      color:
                        row.score >= 90
                          ? "rgb(21 128 61)"
                          : row.score >= 75
                          ? "rgb(133 77 14)"
                          : "rgb(185 28 28)",
                    }}
                  >
                    {row.score}
                  </span>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/70 px-4 py-4">
        <p className="text-sm text-muted-foreground">
          {sorted.length > 0
            ? `Showing ${showingStart} to ${showingEnd} of ${sorted.length} hosts`
            : "No hosts found"}
        </p>
        <div className="flex items-center gap-6 text-sm">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={page === totalPages || sorted.length === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
