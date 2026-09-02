"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ban, Bell, User, XCircle } from "lucide-react";

import { useDebounce } from "@/hooks/use-debounce";
import { getEventParticipants } from "@/lib/api";
import type { EventParticipantStatus } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const statusVariant: Record<EventParticipantStatus, "success" | "secondary" | "danger"> = {
  confirmed: "success",
  waitlist: "secondary",
  cancelled: "danger",
};

const allStatuses: Array<EventParticipantStatus | "all"> = ["all", "confirmed", "waitlist", "cancelled"];

export function ParticipantsTable({ eventId }: { eventId: string }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EventParticipantStatus | "all">("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const pageSize = 10;

  const query = useQuery({
    queryKey: ["participants", eventId, debouncedSearch, status, page],
    queryFn: () =>
      getEventParticipants(eventId, {
        search: debouncedSearch,
        status,
        page,
        pageSize,
      }),
  });

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search participants…"
          className="max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {allStatuses.map((s) => (
            <Button
              key={s}
              variant={status === s ? "default" : "outline"}
              size="sm"
              className="capitalize"
              onClick={() => { setStatus(s); setPage(1); }}
            >
              {s === "all" ? "All" : s}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Participant</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-4 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!query.isLoading && query.data?.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No participants found.
                </TableCell>
              </TableRow>
            )}

            {query.data?.rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-bold text-primary ring-1 ring-primary/20">
                      {p.avatar}
                    </div>
                    <p className="font-medium text-sm">{p.name}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.username}</TableCell>
                <TableCell className="text-sm tabular-nums">{p.joinedDate}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[p.status]} className="capitalize">
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/users/${p.userId}`}>
                            <User className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Profile</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Bell className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Send Notification</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <XCircle className="h-4 w-4 text-yellow-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Remove from Event</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Ban className="h-4 w-4 text-rose-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Block User</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Page {page} of {totalPages}
          {query.data ? ` · ${query.data.total} participants` : ""}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
