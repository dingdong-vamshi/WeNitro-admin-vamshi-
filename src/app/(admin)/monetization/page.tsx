"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminDataState } from "@/components/admin/admin-data-state";
import { BusinessRevenueChart } from "@/components/charts/business-revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonetization } from "@/lib/api";

function formatMoney(amountMinor: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amountMinor / 100);
  } catch {
    return currency + " " + (amountMinor / 100).toLocaleString("en-IN");
  }
}

export default function MonetizationPage() {
  const query = useQuery({ queryKey: ["monetization"], queryFn: getMonetization });
  if (query.isLoading) return <AdminDataState title="payment overview" loading />;
  if (query.isError) return <AdminDataState title="payment overview" error={query.error} onRetry={() => void query.refetch()} />;
  if (!query.data || query.data.totalPayments === 0) return <AdminDataState title="activity payments" empty />;
  const summary = query.data;
  const metrics = [
    ["Collected", formatMoney(summary.totalRevenueMinor, summary.currency)],
    ["Successful Payments", summary.successfulPayments.toLocaleString("en-IN")],
    ["Pending Payments", summary.pendingPayments.toLocaleString("en-IN")],
    ["Failed Payments", summary.failedPayments.toLocaleString("en-IN")],
  ];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Payment Overview</h1><p className="mt-1 text-sm text-muted-foreground">Live activity-payment totals from Supabase.</p></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([title, value]) => <Card key={title}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{title}</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{value}</CardContent></Card>)}
      </div>
      <BusinessRevenueChart data={summary.trend} />
      {summary.currencyTotals.length > 1 ? (
        <Card><CardHeader><CardTitle className="text-base">Collected by currency</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summary.currencyTotals.map((total) => <div key={total.currency} className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">{total.currency} · {total.payments} payments</p><p className="mt-1 text-lg font-semibold">{formatMoney(total.amountMinor, total.currency)}</p></div>)}
        </CardContent></Card>
      ) : null}
    </div>
  );
}
