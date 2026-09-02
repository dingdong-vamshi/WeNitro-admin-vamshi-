"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ActivityTimelinePoint,
  EventEngagementPoint,
  GeoReportData,
  RetentionData,
} from "@/types/admin";

// Retention Bars — three horizontal progress bars
export function RetentionBarsChart({ data }: { data: RetentionData }) {
  const rows = [
    { label: "Weekly", retention: data.week },
    { label: "Monthly", retention: data.month },
    { label: "Quarterly", retention: data.quarter },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">User Retention Rates</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 288 }}>
          <AreaChart data={rows}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${value}%`, "Retention"]} />
            <Area type="monotone" dataKey="retention" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Event Engagement Multi-Line Chart
export function EventEngagementChart({
  data,
}: {
  data: EventEngagementPoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Event Engagement Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="views"
              name="Views"
              stroke="#202020"
              fill="#202020"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={false}
            />
            <Line type="monotone" dataKey="joins"     name="Joins"     stroke="#2563eb" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="shares"    name="Shares"    stroke="#202020" strokeWidth={2} strokeDasharray="4 3" dot={false} />
            <Line type="monotone" dataKey="bookmarks" name="Bookmarks" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 3" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Platform Activity Timeline
export function ActivityTimelineChart({
  data,
}: {
  data: ActivityTimelinePoint[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Platform Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="registrations" name="Registrations" stroke="#202020" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="events"         name="Activities"    stroke="#2563eb" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="messages"       name="Messages"      stroke="#202020" strokeDasharray="4 3" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="reports"        name="Reports"       stroke="#2563eb" strokeDasharray="4 3" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Geo Users vs Events Bar Chart
export function GeoComparisonChart({
  data,
}: {
  data: GeoReportData["usersByCity"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Users by City</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 288 }}>
          <AreaChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="city" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="users" name="Users" stroke="#202020" fill="#202020" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Events by City Bar Chart
export function GeoEventsCityChart({
  data,
}: {
  data: GeoReportData["eventsByCity"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Events by City</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 288 }}>
          <AreaChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="city" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="events" name="Activities" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Region Breakdown Bar Chart
export function RegionBreakdownChart({
  data,
}: {
  data: GeoReportData["regionBreakdown"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Regional User Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 288 }}>
          <AreaChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="region" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="users" name="Users" stroke="#202020" fill="#2563eb" fillOpacity={0.12} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
