"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleGauge,
  Clock3,
  Flag,
  Layers3,
  RefreshCw,
  Sparkles,
  UsersRound,
  Video,
} from "lucide-react";

import { TremorAreaChart } from "@/components/charts/tremor-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardSnapshot } from "@/lib/api";
import type { DashboardRange } from "@/types/admin";

const filters: Array<{ label: string; value: DashboardRange }> = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "12 months", value: "12m" },
];

const metricIcons = [UsersRound, Activity, CalendarDays, Sparkles, Layers3, Video];

export function DashboardScreen() {
  const [range, setRange] = useState<DashboardRange>("30d");
  const query = useQuery({
    queryKey: ["dashboard-screen", range],
    queryFn: () => getDashboardSnapshot(range),
    refetchInterval: 30_000,
  });

  if (query.isError) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-5">
        <p className="font-semibold text-rose-900">Dashboard data could not be loaded.</p>
        <p className="mt-1 text-sm text-rose-700">Check the Supabase connection and row-level security policies.</p>
        <Button className="mt-4" size="sm" onClick={() => query.refetch()}>Try again</Button>
      </div>
    );
  }

  if (!query.data) {
    return <DashboardSkeleton />;
  }

  const data = query.data;
  return (
    <div className="space-y-7 pb-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Production workspace
            <span className="text-border">/</span>
            Supabase live
          </div>
          <h1 className="text-[28px] font-semibold leading-tight text-[#202020]">Overview</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">A live view of members, activities, communities, and platform health.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 bg-white"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild size="sm" className="h-9">
            <Link href="/notifications">
              Create announcement <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#37352f]">Platform pulse</h2>
          <p className="text-xs text-muted-foreground">Updates automatically every 30 seconds</p>
        </div>
        <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-white xl:grid-cols-3 2xl:grid-cols-6">
          {data.metrics.map((metric, index) => {
            const Icon = metricIcons[index] ?? CircleGauge;
            return (
              <div
                key={metric.title}
                className="min-w-0 border-b border-r border-border p-4 transition-colors hover:bg-[#fafafa] [&:nth-last-child(-n+2)]:border-b-0 xl:[&:nth-last-child(-n+3)]:border-b-0 2xl:border-b-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate text-xs font-medium text-muted-foreground">{metric.title}</p>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-md ${index % 2 === 0 ? "bg-[#202020] text-white" : "bg-blue-50 text-blue-700"}`}>
                    <Icon className="h-4 w-4 shrink-0" />
                  </span>
                </div>
                <p className="mt-4 text-2xl font-semibold tabular-nums tracking-tight text-[#202020]">{metric.value}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className={`h-1.5 w-1.5 rounded-full ${index % 2 === 0 ? "bg-[#202020]" : "bg-blue-600"}`} />
                  {metric.delta}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="rounded-lg border border-border bg-white xl:col-span-8">
          <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#202020]">Member and activity growth</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Cumulative records from the production database</p>
            </div>
            <div className="flex w-fit rounded-md bg-[#f1f1ef] p-0.5">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`rounded px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                    range === item.value ? "bg-white text-[#202020] shadow-sm" : "text-muted-foreground hover:text-[#202020]"
                  }`}
                  onClick={() => setRange(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            <div className="mb-4 flex items-center gap-5 text-xs">
              <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-sm bg-[#202020]" /> Members</span>
              <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-sm bg-[#2563eb]" /> Activities</span>
            </div>
            <TremorAreaChart data={data.growth} index="label" categories={["users", "events"]} colors={["#202020", "#2563eb"]} className="h-72" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white xl:col-span-4">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-[#202020]">Activity flow</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Published activity movement over time</p>
          </div>
          <div className="px-5 py-4">
            <div className="mb-4 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-sm bg-blue-600" /> Activities</span>
              <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-700">Live flow</Badge>
            </div>
            <TremorAreaChart data={data.growth} index="label" categories={["events"]} colors={["#2563eb"]} className="h-56" />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#202020]">Platform status</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Database, moderation, and operational signals</p>
          </div>
          <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-700">Supabase connected</Badge>
        </div>
        <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
          {data.systemAlerts.map((alert) => (
            <div key={alert.id} className="flex gap-3 px-5 py-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-[#37352f]">{alert.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{alert.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="overflow-hidden rounded-lg border border-border bg-white xl:col-span-7">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#202020]">Recent activity</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Latest records created across WeNitro</p>
            </div>
            <Link href="/analytics/platform-activity" className="text-xs font-medium text-blue-700 hover:underline">View all</Link>
          </div>
          {data.recentActivities.length ? (
            <div className="divide-y divide-border">
              {data.recentActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#fafafa]">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#f1f1ef] text-[#5f5e5b]">
                    {index % 2 === 0 ? <UsersRound className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#37352f]">{activity.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-[#9b9a97]">{activity.ago}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Clock3} title="No recent activity" detail="New production records will appear here." />
          )}
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-white xl:col-span-5">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#202020]">Activities to watch</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Upcoming and currently active plans</p>
            </div>
            <Link href="/events" className="text-xs font-medium text-blue-700 hover:underline">All activities</Link>
          </div>
          {data.upcomingEvents.length ? (
            <div className="divide-y divide-border">
              {data.upcomingEvents.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block px-5 py-3.5 hover:bg-[#fafafa]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#37352f]">{event.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{event.host} · {event.schedule}</p>
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#9b9a97]" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">{event.participants}</span>
                    {event.tags.slice(0, 1).map((tag) => <Badge key={tag} variant="secondary" className="rounded-full text-[10px] capitalize">{tag}</Badge>)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarDays} title="No activities scheduled" detail="Published activities will appear here." />
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-white">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#202020]">Moderation queue</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Reports requiring an administrator decision</p>
          </div>
          <Link href="/moderation/pending-reports" className="text-xs font-medium text-blue-700 hover:underline">Open queue</Link>
        </div>
        {data.pendingReports.length ? (
          <div className="divide-y divide-border">
            {data.pendingReports.map((report) => (
              <div key={report.id} className="grid gap-2 px-5 py-3.5 text-sm md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
                <span className="font-medium text-[#37352f]">{report.username}</span>
                <span className="text-muted-foreground">{report.reason}</span>
                <span className="text-muted-foreground">{report.eventTitle}</span>
                <span className="text-xs text-[#9b9a97]">{report.reportedAgo}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Flag} title="Queue is clear" detail="There are no open content reports in Supabase." />
        )}
      </section>
    </div>
  );
}

function EmptyState({ icon: Icon, title, detail }: { icon: typeof Flag; title: string; detail: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
      <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f1ef] text-[#787774]">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm font-medium text-[#37352f]">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-20 border-b border-border" />
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-28 bg-white p-4"><div className="h-3 w-20 rounded bg-muted" /><div className="mt-6 h-7 w-12 rounded bg-muted" /></div>)}
      </div>
      <div className="h-96 rounded-lg border border-border bg-white" />
    </div>
  );
}
