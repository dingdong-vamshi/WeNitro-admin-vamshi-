"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeviceUsage, UserAnalyticsData, UserCityData } from "@/types/admin";

export function UserGrowthChart({ data }: { data: UserAnalyticsData["growth"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">User Growth</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 288 }}>
          <AreaChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="newUsers"
              name="New Users"
              stroke="#202020"
              fill="#202020"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="totalUsers"
              name="Total Users"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function UsersByCityChart({ data }: { data: UserCityData[] }) {
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
            <Area type="monotone" dataKey="users" name="Users" stroke="#202020" fill="#2563eb" fillOpacity={0.12} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DeviceUsageChart({ data }: { data: DeviceUsage[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Device Usage</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 500, height: 288 }}>
          <AreaChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${value}%`, ""]} />
            <Area type="monotone" dataKey="percentage" name="Usage" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
