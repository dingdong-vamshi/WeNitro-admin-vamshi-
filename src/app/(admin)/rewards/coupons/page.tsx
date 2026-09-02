import { Tag } from "lucide-react";

import { CouponManagementTable } from "@/components/admin/coupon-management-table";
import { MetricCard } from "@/components/admin/metric-card";

const metrics = [
  { title: "Total Coupons", value: "6", delta: "All time", trend: "flat" as const },
  { title: "Active Coupons", value: "3", delta: "2 expired", trend: "up" as const },
  { title: "Total Usages", value: "3,005", delta: "+15.4%", trend: "up" as const },
  { title: "Avg Discount", value: "18%", delta: "Per coupon", trend: "flat" as const },
];

export default function CouponManagementPage() {
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
