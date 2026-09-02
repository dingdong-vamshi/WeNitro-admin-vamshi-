import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  BadgeCheck,
  BarChart2,
  Building2,
  CalendarDays,
  MapPin,
  MousePointerClick,
  PauseCircle,
  Star,
  Users2,
  Wallet,
  Eye,
} from "lucide-react";

import { getSponsoredEventDetail } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { sponsoredStatusLabel, sponsoredStatusVariant } from "@/components/admin/sponsored-events-table";
import type { SponsoredEventStatus } from "@/types/admin";

function formatInr(n: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(n)}`;
}

export default async function SponsoredEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getSponsoredEventDetail(id);

  if (!event) notFound();

  const isActionable = event.status === "pending" || event.status === "active";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/business/sponsored-events"
            className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sponsored Events
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sponsored event details, promotion metrics, and admin controls.
          </p>
        </div>

        {/* Admin Actions */}
        <div className="flex flex-wrap gap-2">
          {event.status === "pending" && (
            <>
              <Button size="sm" className="gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5" />
                Approve Event
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Ban className="h-3.5 w-3.5 text-rose-500" />
                Reject Event
              </Button>
            </>
          )}
          {event.status === "active" && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5">
                <PauseCircle className="h-3.5 w-3.5 text-amber-500" />
                Pause Promotion
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Ban className="h-3.5 w-3.5 text-rose-500" />
                Cancel Event
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                Feature Event
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Event info card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 text-lg font-bold text-white">
                {event.businessName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold leading-tight">{event.title}</p>
                <Badge variant={sponsoredStatusVariant[event.status]} className="mt-1 text-xs">
                  {sponsoredStatusLabel[event.status]}
                </Badge>
              </div>
            </div>

            <Separator className="my-5" />

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wide">Hosted By</p>
                  <p className="font-medium text-foreground">{event.businessName}</p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wide">Budget</p>
                  <p className="font-medium text-foreground">{formatInr(event.budget)}</p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wide">Promotion Duration</p>
                  <p className="font-medium text-foreground">
                    {new Date(event.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {" – "}
                    {new Date(event.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wide">Location</p>
                  <p className="font-medium text-foreground">{event.location}</p>
                </div>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Users2 className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wide">Participants Registered</p>
                  <p className="font-medium text-foreground">
                    {new Intl.NumberFormat("en-IN").format(event.participantsRegistered)}
                  </p>
                </div>
              </li>
            </ul>

            {event.description && (
              <>
                <Separator className="my-5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
                Promotion Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <PromotionMetric
                  icon={<Eye className="h-5 w-5 text-sky-500" />}
                  label="Impressions"
                  value={new Intl.NumberFormat("en-IN").format(event.impressions)}
                  bg="bg-sky-500/10"
                />
                <PromotionMetric
                  icon={<MousePointerClick className="h-5 w-5 text-violet-500" />}
                  label="Clicks"
                  value={new Intl.NumberFormat("en-IN").format(event.clicks)}
                  bg="bg-violet-500/10"
                />
                <PromotionMetric
                  icon={<Users2 className="h-5 w-5 text-emerald-500" />}
                  label="Registrations"
                  value={new Intl.NumberFormat("en-IN").format(event.participantsRegistered)}
                  bg="bg-emerald-500/10"
                />
                <PromotionMetric
                  icon={<BarChart2 className="h-5 w-5 text-amber-500" />}
                  label="Conversion Rate"
                  value={`${event.conversionRate}%`}
                  bg="bg-amber-500/10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Budget Allocated</span>
                  <span className="font-semibold">{formatInr(event.budget)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cost per Click</span>
                  <span className="font-semibold">
                    {event.clicks > 0 ? formatInr(Math.round(event.budget / event.clicks)) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cost per Registration</span>
                  <span className="font-semibold">
                    {event.participantsRegistered > 0
                      ? formatInr(Math.round(event.budget / event.participantsRegistered))
                      : "—"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">CPM (Cost per 1k Impressions)</span>
                  <span className="font-semibold">
                    {event.impressions > 0
                      ? formatInr(Math.round((event.budget / event.impressions) * 1000))
                      : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PromotionMetric({
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
    <div className={`rounded-xl p-4 ${bg}`}>
      <div className="mb-2">{icon}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
