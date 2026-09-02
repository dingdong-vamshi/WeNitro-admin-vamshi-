import { Activity, Ban, CalendarDays, CheckCircle2, Mail, MapPin, Phone, ShieldOff, ShieldAlert, Star, UserCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { UserStatusBadge } from "@/components/admin/user-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserActivity, getUserProfile } from "@/lib/api";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, activities] = await Promise.all([getUserProfile(id), getUserActivity(id)]);

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page heading + action buttons */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Users / User Profile</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{profile.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Complete user information, performance signals, and account safety controls.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/users/${profile.id}/activity`}>
              <Activity className="mr-1.5 h-3.5 w-3.5" />
              View Activity History
            </Link>
          </Button>
          <Button variant="outline" size="sm">
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
            Send Warning
          </Button>
          <Button variant="outline" size="sm">
            <UserCheck className="mr-1.5 h-3.5 w-3.5" />
            Verify User
          </Button>
          <Button variant="outline" size="sm">
            <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
            Suspend Account
          </Button>
          <Button variant="outline" size="sm">
            <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
            Block User
          </Button>
          <Button variant="destructive" size="sm">
            <Ban className="mr-1.5 h-3.5 w-3.5" />
            Ban User
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Left — identity & stats */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Primary identity, contact information, and membership details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Avatar row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-2xl font-bold text-primary ring-1 ring-primary/20">
                {profile.avatar}
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-semibold">{profile.name}</h2>
                  <UserStatusBadge status={profile.status} />
                </div>
                <p className="text-sm text-muted-foreground">{profile.username}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Joined {profile.joinedAt}
                </div>
              </div>
            </div>

            {/* Contact info grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/25 p-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-border/60">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Email</p>
                  <p className="mt-0.5 truncate text-sm font-medium">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/25 p-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-border/60">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Phone</p>
                  <p className="mt-0.5 text-sm font-medium">{profile.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/25 p-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-border/60">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Location</p>
                  <p className="mt-0.5 text-sm font-medium">{profile.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/25 p-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-border/60">
                  <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Verification</p>
                  <p className="mt-0.5 text-sm font-medium">{profile.verificationType ?? "Pending review"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Stats row */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 p-4 text-center">
                <p className="text-2xl font-bold tabular-nums">{profile.eventsHosted}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Events Hosted</p>
              </div>
              <div className="rounded-xl border border-border/70 p-4 text-center">
                <p className="text-2xl font-bold tabular-nums">{profile.eventsJoined}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Events Joined</p>
              </div>
              <div className="rounded-xl border border-border/70 p-4 text-center">
                <p className="text-2xl font-bold tabular-nums">{profile.followers}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Followers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Account Status card */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Moderation context and admin controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-5 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/25 px-4 py-3">
                <span className="font-medium text-muted-foreground">Current Status</span>
                <UserStatusBadge status={profile.status} />
              </div>
              {profile.verifiedAt ? (
                <div className="flex items-start gap-3 rounded-xl border border-border/70 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Verified Date</p>
                    <p className="mt-0.5 font-medium">{profile.verifiedAt}</p>
                  </div>
                </div>
              ) : null}
              {profile.blockedReason ? (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <ShieldOff className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Blocked Reason</p>
                    <p className="mt-0.5 font-medium">{profile.blockedReason}</p>
                  </div>
                </div>
              ) : null}
              {profile.suspendedReason ? (
                <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Suspension</p>
                    <p className="mt-0.5 font-medium">{profile.suspendedReason}</p>
                    <p className="mt-0.5 text-muted-foreground">Until {profile.suspendedUntil}</p>
                  </div>
                </div>
              ) : null}
              {profile.banReason ? (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ban Reason</p>
                    <p className="mt-0.5 font-medium">{profile.banReason}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Recent Activity card */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest behavior snapshots for review.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-1">
                {activities.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40">
                    <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-primary/50 ring-4 ring-primary/10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-snug">{activity.description}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {activities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Star className="mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
