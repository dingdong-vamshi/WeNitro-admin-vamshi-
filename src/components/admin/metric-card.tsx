import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMetric } from "@/types/admin";

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold tracking-tight">{metric.value}</div>
        <Badge
          variant={metric.trend === "up" ? "success" : metric.trend === "down" ? "warning" : "outline"}
          className="gap-1"
        >
          {metric.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
          {metric.trend === "down" && <ArrowDownRight className="h-3 w-3" />}
          {metric.trend === "flat" && <ArrowRight className="h-3 w-3" />}
          {metric.delta}
        </Badge>
      </CardContent>
    </Card>
  );
}
