"use client";

import { useQuery } from "@tanstack/react-query";
import { Tag } from "lucide-react";

import { AdminDataState } from "@/components/admin/admin-data-state";
import { CouponManagementTable } from "@/components/admin/coupon-management-table";
import { MetricCard } from "@/components/admin/metric-card";
import { getCoupons } from "@/lib/api";

export default function CouponManagementPage() {
  const query = useQuery({ queryKey: ["coupon-page-metrics"], queryFn: () => getCoupons({ page: 1, pageSize: 1000 }) });
  if (query.isLoading) return <AdminDataState title="coupon metrics" loading />;
  if (query.error) return <AdminDataState title="coupon metrics" error={query.error} onRetry={() => void query.refetch()} />;
  const rows = query.data?.rows ?? [];
  const metrics = [
    { title: "Total Coupons", value: String(query.data?.total ?? 0), delta: "Live catalog", trend: "flat" as const },
    { title: "Active Coupons", value: String(rows.filter((coupon) => coupon.status === "active").length), delta: "Currently active", trend: "flat" as const },
    { title: "Total Usages", value: "Not tracked", delta: "Backend not configured", trend: "flat" as const },
    { title: "Avg Discount", value: "Not tracked", delta: "Backend not configured", trend: "flat" as const },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Tag className="h-5 w-5 text-indigo-500" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Coupon Management</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Create and manage discount coupons for events and rewards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.title} metric={m} />
        ))}
      </div>

      <CouponManagementTable />
    </div>
  );
}
