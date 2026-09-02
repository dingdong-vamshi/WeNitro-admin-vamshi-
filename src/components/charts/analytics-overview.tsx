"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeoInsight, HostPerformance, TopEvent } from "@/types/admin";

export function AnalyticsOverview({
  topEvents,
  hostPerformance,
  geoInsights,
}: {
  topEvents: TopEvent[];
  hostPerformance: HostPerformance[];
  geoInsights: GeoInsight[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Top Events by Engagement</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 288 }}>
            <AreaChart data={topEvents}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="title" hide />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="engagementScore" stroke="#202020" fill="#202020" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Host Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 288 }}>
            <AreaChart data={hostPerformance}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="host" hide />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="hostedEvents" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Geographic Insights</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 400, height: 288 }}>
            <AreaChart data={geoInsights}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="region" hide />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#202020" fill="#2563eb" fillOpacity={0.12} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
