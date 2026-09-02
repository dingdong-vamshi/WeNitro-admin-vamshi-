import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  BadgeCheck,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  ShieldOff,
  Star,
  Users2,
  Wallet,
} from "lucide-react";

import { getBusinessProfile } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SponsoredEventsTable } from "@/components/admin/sponsored-events-table";
import type { BusinessIndustry, BusinessStatus } from "@/types/admin";

const statusVariant: Record<BusinessStatus, "success" | "warning" | "danger"> = {
  verified: "success",
  pending: "warning",
  suspended: "danger",
};

const statusLabel: Record<BusinessStatus, string> = {
  verified: "Verified",
  pending: "Pending Verification",
  suspended: "Suspended",
};

const industryLabel: Record<BusinessIndustry, string> = {
  sports: "Sports & Fitness",
  tech: "Tech",
  food: "Food & Beverage",
  fashion: "Fashion",
  health: "Health & Wellness",
  education: "Education",
  entertainment: "Entertainment",
  finance: "Finance",
};

function formatInr(n: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(n)}`;
}

export default async function BusinessProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getBusinessProfile(id);

  if (!profile) notFound();

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/business"
            className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Business Accounts
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{profile.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Business profile, metrics, and admin controls.
          </p>
        </div>

        {/* Admin Actions */}
        <div className="flex flex-wrap gap-2">
          {profile.status === "pending" && (
            <Button size="sm" className="gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verify Business
            </Button>
          )}
          {profile.status === "verified" && (
            <Button variant="outline" size="sm" className="gap-1.5">
              <ShieldOff className="h-3.5 w-3.5 text-orange-500" />
              Remove Verification
            </Button>
          )}
          {profile.status !== "suspended" && (
            <Button variant="outline" size="sm" className="gap-1.5">
              <Ban className="h-3.5 w-3.5 text-rose-500" />
              Suspend Account
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/business/sponsored-events?businessId=${profile.id}`}>
              <CalendarDays className="h-3.5 w-3.5" />
              View Sponsored Events
            </Link>
          </Button>
        </div>
      </div>

      {/* Profile card + metrics */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Identity card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-2xl font-bold text-white">
                {profile.logo}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{profile.name}</h2>
                <Badge variant={statusVariant[profile.status]} className="mt-1">
                  {statusLabel[profile.status]}
                </Badge>
              </div>
            </div>

            <Separator className="my-5" />

            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0" />
                {industryLabel[profile.industry]}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {profile.city}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                {profile.email}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                {profile.phone}
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4 shrink-0" />
                Joined{" "}
                {new Date(profile.joinedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </li>
            </ul>

            {profile.description && (
              <>
                <Separator className="my-5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.description}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metrics grid */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTile
              icon={<CalendarDays className="h-5 w-5 text-blue-500" />}
              label="Sponsored Events"
              value={profile.sponsoredEvents.toString()}
              bg="bg-blue-500/10"
            />
            <MetricTile
              icon={<Users2 className="h-5 w-5 text-violet-500" />}
              label="Total Participants"
              value={new Intl.NumberFormat("en-IN").format(profile.totalParticipants)}
              bg="bg-violet-500/10"
            />
            <MetricTile
              icon={<Wallet className="h-5 w-5 text-emerald-500" />}
              label="Revenue Generated"
              value={formatInr(profile.revenueGenerated)}
              bg="bg-emerald-500/10"
            />
            <MetricTile
              icon={<Star className="h-5 w-5 text-amber-500" />}
              label="Average Rating"
              value={profile.averageRating.toFixed(1)}
              bg="bg-amber-500/10"
            />
          </div>

          {/* Sponsored events for this business */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sponsored Events</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <SponsoredEventsTable businessId={profile.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
