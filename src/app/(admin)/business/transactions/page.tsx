"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { getBusinessTransactions } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TxStatus = "completed" | "pending" | "failed";

const txStatusVariant: Record<TxStatus, "success" | "warning" | "danger"> = {
  completed: "success",
  pending: "warning",
  failed: "danger",
};

const txStatusLabel: Record<TxStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
};

const topTabs: Array<{ label: string; value: TxStatus | "all" }> = [
  { label: "All Transactions", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

const selectBaseClass =
  "h-9 appearance-none rounded-lg border border-border/70 bg-background pl-9 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

function formatInr(n: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(n)}`;
}

function TransactionsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TxStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search);
  const router = useRouter();

  const query = useQuery({
    queryKey: ["business-transactions", debouncedSearch, status, page, pageSize],
    queryFn: () => getBusinessTransactions({ search: debouncedSearch, status, page, pageSize }),
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
        {/* Search bar */}
        <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 lg:flex-row lg:items-center">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search business, event, or TX ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-10 w-full rounded-lg border border-border/70 bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
              <TableHead className="pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Transaction ID</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Business</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Event</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</TableHead>
              <TableHead className="pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Skeleton rows */}
            {query.isLoading &&
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/40">
                  <TableCell className="pl-4"><div className="h-3.5 w-28 animate-pulse rounded bg-muted font-mono" /></TableCell>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}><div className="h-3.5 w-20 animate-pulse rounded bg-muted" /></TableCell>
                  ))}
                </TableRow>
              ))}

            {/* Empty state */}
            {!query.isLoading && query.data?.rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-14 text-center text-sm text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {query.data?.rows.map((tx) => (
              <TableRow key={tx.id} className="border-b border-border/40 last:border-0">
                <TableCell className="pl-4 py-3 font-mono text-sm font-medium">{tx.id}</TableCell>
                <TableCell className="py-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/business/${tx.businessId}`)}
                    className="text-sm font-medium hover:underline"
                  >
                    {tx.businessName}
                  </button>
                </TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">{tx.eventTitle}</TableCell>
                <TableCell className="py-3 font-semibold text-sm">{formatInr(tx.amount)}</TableCell>
                <TableCell className="py-3 text-sm text-muted-foreground">
                  {new Date(tx.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="pr-4 py-3">
                  <Badge variant={txStatusVariant[tx.status]}>{txStatusLabel[tx.status]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {query.data && query.data.total > 0
                ? `Showing ${showingStart}\u2013${showingEnd} of ${query.data.total} transactions`
                : "No transactions found"}
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

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Transaction History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Payment records for all sponsored event transactions on the platform.
        </p>
      </div>

      <Card>
        <CardContent className="pt-5">
          <TransactionsTable />
        </CardContent>
      </Card>
    </div>
  );
}
