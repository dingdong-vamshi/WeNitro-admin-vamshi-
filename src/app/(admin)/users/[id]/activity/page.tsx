import { Activity, ArrowLeft, CalendarDays, Flag, LogIn, MessageCircle, Star, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserActivity, getUserProfile } from "@/lib/api";
import { activityLabel } from "@/lib/mock-data";
import type { ActivityType } from "@/types/admin";

const activityMeta: Record<ActivityType, { icon: React.ElementType; dot: string; badge: string }> = {
  event_created: {
    icon: Trophy,
    dot: "bg-violet-500 ring-violet-500/20",
    badge: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  },
  event_joined: {
    icon: Users,
    dot: "bg-blue-500 ring-blue-500/20",
    badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  message_sent: {
    icon: MessageCircle,
    dot: "bg-sky-500 ring-sky-500/20",
    badge: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  },
  report_received: {
    icon: Flag,
    dot: "bg-red-500 ring-red-500/20",
    badge: "bg-red-500/10 text-red-600 border-red-500/20",
  },
  rating_received: {
    icon: Star,
    dot: "bg-amber-500 ring-amber-500/20",
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  login: {
    icon: LogIn,
    dot: "bg-emerald-500 ring-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
};

export default async function UserActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, activities] = await Promise.all([getUserProfile(id), getUserActivity(id)]);

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Users / Activity History</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{profile.name} Activity History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Event creation, participation, ratings, reports, messages, and login activity.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/users/${profile.id}`}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Profile
          </Link>
        </Button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {(Object.entries(activityMeta) as [ActivityType, (typeof activityMeta)[ActivityType]][]).map(([type, meta]) => {
          const count = activities.filter((a) => a.type === type).length;
          const Icon = meta.icon;
          return (
            <div key={type} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs ${meta.badge}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-base font-bold tabular-nums leading-none">{count}</p>
                <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {activityLabel[type]}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline card */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <CardTitle>Activity Timeline</CardTitle>
          </div>
          <CardDescription>Chronological user behavior for moderation and support review.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Activity className="mb-3 h-10 w-10 text-muted-foreground/25" />
              <p className="font-medium text-muted-foreground">No activity recorded</p>
              <p className="mt-1 text-sm text-muted-foreground/60">This user has no tracked history yet.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-[9px] top-3 h-[calc(100%-24px)] w-px bg-border/70" />
              <div className="space-y-0">
                {activities.map((activity, idx) => {
                  const meta = activityMeta[activity.type];
                  const Icon = meta.icon;
                  return (
                    <div key={activity.id} className={`group relative flex gap-4 pb-5 ${idx === activities.length - 1 ? "pb-0" : ""}`}>
                      {/* Timeline dot */}
                      <div className={`relative z-10 mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-4 ${meta.dot}`}>
                        <Icon className="h-2.5 w-2.5 text-white" />
                      </div>
                      {/* Content row */}
                      <div className="min-w-0 flex-1 rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors group-hover:bg-muted/30">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badge}`}>
                            <Icon className="h-3 w-3" />
                            {activityLabel[activity.type]}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {activity.date}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium leading-snug">{activity.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
