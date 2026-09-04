"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, CreditCard, Wallet } from "lucide-react";
import { AdminDataState } from "@/components/admin/admin-data-state";
import { BusinessRevenueChart } from "@/components/charts/business-revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getBusinessRevenue } from "@/lib/api";

function formatMoney(amountMinor: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amountMinor / 100);
  } catch {
    return currency + " " + (amountMinor / 100).toLocaleString("en-IN");
  }
}

export default function RevenueAnalyticsPage() {
  const query = useQuery({ queryKey: ["activity-payment-revenue"], queryFn: getBusinessRevenue });
  if (query.isLoading) return <AdminDataState title="payment revenue" loading />;
  if (query.isError) return <AdminDataState title="payment revenue" error={query.error} onRetry={() => void query.refetch()} />;
  if (!query.data || query.data.totalPayments === 0) return <AdminDataState title="activity payment revenue" empty />;
  const revenue = query.data;
  const cards = [
    { icon: <Wallet className="h-5 w-5 text-emerald-500" />, label: "Collected", value: formatMoney(revenue.totalRevenueMinor, revenue.currency) },
    { icon: <CalendarDays className="h-5 w-5 text-blue-500" />, label: "This Month", value: formatMoney(revenue.thisMonthMinor, revenue.currency) },
    { icon: <CheckCircle2 className="h-5 w-5 text-violet-500" />, label: "Successful", value: revenue.successfulPayments.toLocaleString("en-IN") },
    { icon: <CreditCard className="h-5 w-5 text-amber-500" />, label: "Payment Attempts", value: revenue.totalPayments.toLocaleString("en-IN") },
  ];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Activity Payment Revenue</h1><p className="mt-1 text-sm text-muted-foreground">Revenue from successfully paid WeNitro activity orders.</p></div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => <Card key={card.label}><CardContent className="flex flex-col gap-3 pt-5">{card.icon}<div><p className="text-xs text-muted-foreground">{card.label}</p><p className="mt-0.5 text-xl font-bold">{card.value}</p></div></CardContent></Card>)}
      </div>
      <BusinessRevenueChart data={revenue.trend} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Top Paying Members</CardTitle></CardHeader><CardContent>
          {revenue.topPayers.length === 0 ? <p className="text-sm text-muted-foreground">No successful payments yet.</p> : revenue.topPayers.map((payer, index) => <div key={payer.userId}><div className="flex items-center justify-between py-2.5"><div><Link href={"/users/" + payer.userId} className="text-sm font-medium hover:underline">{payer.userName}</Link><p className="text-xs text-muted-foreground">{payer.payments} successful payments</p></div><span className="font-semibold">{formatMoney(payer.amountMinor, revenue.currency)}</span></div>{index < revenue.topPayers.length - 1 ? <Separator /> : null}</div>)}
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Revenue by Activity</CardTitle></CardHeader><CardContent>
          {revenue.activityBreakdown.length === 0 ? <p className="text-sm text-muted-foreground">No successful payments yet.</p> : revenue.activityBreakdown.map((activity, index) => <div key={activity.eventId}><div className="flex items-center justify-between py-2.5"><div><Link href={"/events/" + activity.eventId} className="text-sm font-medium hover:underline">{activity.eventTitle}</Link><p className="text-xs text-muted-foreground">{activity.payments} successful payments</p></div><span className="font-semibold">{formatMoney(activity.amountMinor, revenue.currency)}</span></div>{index < revenue.activityBreakdown.length - 1 ? <Separator /> : null}</div>)}
        </CardContent></Card>
      </div>
    </div>
  );
}
