"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";

import { AdminDataState } from "@/components/admin/admin-data-state";
import { getBusinessTransactions } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PaymentDisplayStatus } from "@/types/admin";

const statusVariant: Record<PaymentDisplayStatus, "success" | "warning" | "danger"> = {
  completed: "success",
  pending: "warning",
  failed: "danger",
};
const statusLabel: Record<PaymentDisplayStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
};
const tabs: Array<{ label: string; value: PaymentDisplayStatus | "all" }> = [
  { label: "All Payments", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

function formatMoney(amountMinor: number, currency: string) {
  if (currency === "N/A") return String(amountMinor / 100);
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amountMinor / 100);
  } catch {
    return currency + " " + (amountMinor / 100).toLocaleString("en-IN");
  }
}

function TransactionsTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentDisplayStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search);
  const query = useQuery({
    queryKey: ["activity-payments", debouncedSearch, status, page, pageSize],
    queryFn: () => getBusinessTransactions({ search: debouncedSearch, status, page, pageSize }),
  });
  const totalPages = useMemo(() => Math.max(1, Math.ceil((query.data?.total ?? 0) / pageSize)), [query.data?.total, pageSize]);
  const showingStart = query.data && query.data.total > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingEnd = query.data ? Math.min(page * pageSize, query.data.total) : 0;

  if (query.isError) return <AdminDataState title="activity payments" error={query.error} onRetry={() => void query.refetch()} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-7 border-b border-border/80">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={"border-b-2 pb-2 text-sm font-semibold transition-colors " + (status === tab.value ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
            onClick={() => { setStatus(tab.value); setPage(1); }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="border-b border-border/70 px-4 py-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search order, payment, member, or activity..."
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              className="h-10 w-full rounded-lg border border-border/70 bg-background pl-9 pr-4 text-sm"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="pl-4">Order</TableHead><TableHead>Member</TableHead><TableHead>Activity</TableHead>
              <TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead className="pr-4">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading && Array.from({ length: pageSize }).map((_, index) => (
              <TableRow key={index}>{Array.from({ length: 6 }).map((__, cell) => <TableCell key={cell}><div className="h-3.5 w-24 animate-pulse rounded bg-muted" /></TableCell>)}</TableRow>
            ))}
            {!query.isLoading && query.data?.rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-14 text-center text-sm text-muted-foreground">No activity payments found.</TableCell></TableRow>
            ) : null}
            {query.data?.rows.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="pl-4 py-3">
                  <p className="font-mono text-sm font-medium">{payment.orderId}</p>
                  <p className="text-xs text-muted-foreground">{payment.paymentId ?? "Record " + payment.id}</p>
                </TableCell>
                <TableCell><Link href={"/users/" + payment.userId} className="text-sm font-medium hover:underline">{payment.userName}</Link></TableCell>
                <TableCell><Link href={"/events/" + payment.eventId} className="text-sm text-muted-foreground hover:underline">{payment.eventTitle}</Link></TableCell>
                <TableCell className="font-semibold">{formatMoney(payment.amountMinor, payment.currency)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(payment.paidAt ?? payment.createdAt).toLocaleString("en-IN")}</TableCell>
                <TableCell className="pr-4">
                  <Badge variant={statusVariant[payment.status]}>{statusLabel[payment.status]}</Badge>
                  <p className="mt-1 text-xs text-muted-foreground">{payment.paymentStatus || payment.orderStatus}</p>
                  {payment.failureReason ? <p className="mt-1 max-w-48 text-xs text-destructive">{payment.failureReason}</p> : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{query.data?.total ? "Showing " + showingStart + "-" + showingEnd + " of " + query.data.total + " payments" : "No payments found"}</span>
            <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="h-7 rounded border bg-background px-2 text-sm">
              {[5, 10, 20, 50].map((size) => <option key={size} value={size}>{size} rows</option>)}
            </select>
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronDown className="h-4 w-4 rotate-90" /></Button>
              <span className="px-2 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}><ChevronDown className="h-4 w-4 -rotate-90" /></Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Activity Payments</h1><p className="mt-1 text-sm text-muted-foreground">Live Cashfree order and payment records for WeNitro activities.</p></div>
      <Card><CardContent className="pt-5"><TransactionsTable /></CardContent></Card>
    </div>
  );
}
