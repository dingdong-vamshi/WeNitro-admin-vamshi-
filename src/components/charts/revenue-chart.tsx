"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { RevenuePoint } from "@/types/admin";

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Growth</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => [typeof value === "number" ? formatCurrency(value) : value, ""]} />
            <Area type="monotone" dataKey="sponsoredAds" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="partnerships" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="total" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
