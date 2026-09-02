"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, MapPin, Search, Star, Tag, Users } from "lucide-react";

import { useDebounce } from "@/hooks/use-debounce";
import { getTopEventsReportData } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CATEGORIES = [
  "Adventure", "Business", "Music", "Social", "Sports", "Wellness",
];

const CITIES = [
  "Bangalore", "Boston", "Denver", "Goa", "Mumbai",
  "Nashville", "Portland", "Pune", "San Francisco",
];

const selectBaseClass =
  "h-9 appearance-none rounded-lg border border-border/70 bg-background pl-9 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

const PAGE_SIZE = 6;

export function TopEventsReportTable() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["top-events-report"],
    queryFn: getTopEventsReportData,
  });

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");
  const [minParticipants, setMinParticipants] = useState("0");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      if (
        debouncedSearch &&
        !row.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !row.host.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return false;
      }
      if (city !== "all" && row.city !== city) return false;
      if (category !== "all" && row.category !== category) return false;
      if (row.participants < Number(minParticipants)) return false;
      return true;
    });
  }, [data, debouncedSearch, city, category, minParticipants]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const showingStart = filtered.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const showingEnd = Math.min(page * PAGE_SIZE, filtered.length);

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
            placeholder="Search event or host..."
            className="h-10 w-full rounded-lg border border-border/70 bg-background pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* City */}
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              className={selectBaseClass}
            >
              <option value="all">City</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Category */}
          <div className="relative">
            <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className={selectBaseClass}
            >
              <option value="all">Category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Min participants */}
          <div className="relative">
            <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={minParticipants}
              onChange={(e) => {
                setMinParticipants(e.target.value);
                setPage(1);
              }}
              className={selectBaseClass}
            >
              <option value="0">Min Participants</option>
              <option value="10">&ge; 10</option>
              <option value="25">&ge; 25</option>
              <option value="50">&ge; 50</option>
              <option value="100">&ge; 100</option>
              <option value="300">&ge; 300</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Event</TableHead>
            <TableHead>Host</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Participants</TableHead>
            <TableHead className="text-right">Rating</TableHead>
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
                No events match your filters.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            paged.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-muted-foreground">{row.host}</TableCell>
                <TableCell>{row.city}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{row.category}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.participants.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <span className="flex items-center justify-end gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {row.rating.toFixed(1)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/70 px-4 py-4">
        <p className="text-sm text-muted-foreground">
          {filtered.length > 0
            ? `Showing ${showingStart} to ${showingEnd} of ${filtered.length} events`
            : "No events found"}
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
            disabled={page === totalPages || filtered.length === 0}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
