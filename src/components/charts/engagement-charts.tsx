"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EngagementMetricsData } from "@/types/admin";

export function EngagementTrendChart({ data }: { data: EngagementMetricsData["trend"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">User Engagement Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="joins" name="Joins" stroke="#202020" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="messages" name="Messages" stroke="#2563eb" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="shares" name="Shares" stroke="#202020" strokeDasharray="4 3" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="bookmarks" name="Bookmarks" stroke="#2563eb" strokeDasharray="4 3" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ConversionFunnelChart({ data, conversionRate }: { data: EngagementMetricsData["funnel"]; conversionRate: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pt-2">
        <ResponsiveContainer width="100%" height="80%" initialDimension={{ width: 500, height: 220 }}>
          <AreaChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="step" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="users" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Overall Conversion Rate</span>
          <span className="font-bold text-foreground">{conversionRate}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityHeatmapChart({ data }: { data: EngagementMetricsData["heatmap"] }) {
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const allValues = data.flatMap((row) => days.map((d) => row[d]));
  const maxVal = Math.max(...allValues);

  function getColor(value: number) {
    const intensity = value / maxVal;
    if (intensity > 0.75) return "bg-chart-1 text-white";
    if (intensity > 0.5) return "bg-chart-2/80 text-white";
    if (intensity > 0.25) return "bg-chart-3/60";
    return "bg-muted";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Peak Activity Heatmap</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-0.5">
          <thead>
            <tr>
              <th className="w-16 text-left font-medium text-muted-foreground px-1">Hour</th>
              {dayLabels.map((d) => (
                <th key={d} className="text-center font-medium text-muted-foreground pb-1">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.hour}>
                <td className="pr-2 py-0.5 font-medium text-muted-foreground whitespace-nowrap">{row.hour}</td>
                {days.map((d) => (
                  <td key={d} className="py-0.5">
                    <div
                      className={`mx-auto flex h-8 w-full min-w-[2.5rem] items-center justify-center rounded text-[10px] font-semibold ${getColor(row[d])}`}
                    >
                      {row[d]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
