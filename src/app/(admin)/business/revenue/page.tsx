import Link from "next/link";
import { CalendarDays, Trophy, Users2, Wallet } from "lucide-react";

import { getBusinessRevenue } from "@/lib/api";
import { BusinessRevenueChart } from "@/components/charts/business-revenue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function formatInr(n: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(n)}`;
}

export default async function RevenueAnalyticsPage() {
  const revenue = await getBusinessRevenue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Revenue Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track platform earnings from sponsorships, partnerships, and business events.
        </p>
      </div>

      {/* Overview metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <OverviewCard
          icon={<Wallet className="h-5 w-5 text-emerald-500" />}
          label="Total Revenue"
          value={formatInr(revenue.totalRevenue)}
          bg="bg-emerald-500/10"
        />
        <OverviewCard
          icon={<CalendarDays className="h-5 w-5 text-blue-500" />}
          label="This Month"
          value={formatInr(revenue.thisMonth)}
          bg="bg-blue-500/10"
        />
        <OverviewCard
          icon={<Users2 className="h-5 w-5 text-violet-500" />}
          label="Active Sponsors"
          value={revenue.activeSponsors.toString()}
          bg="bg-violet-500/10"
        />
        <OverviewCard
          icon={<Trophy className="h-5 w-5 text-amber-500" />}
          label="Sponsored Events"
          value={revenue.sponsoredEventsCount.toString()}
          bg="bg-amber-500/10"
        />
      </div>

      {/* Revenue trend chart */}
      <BusinessRevenueChart data={revenue.trend} />

      {/* Top sponsors + event breakdown */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Top Sponsors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Sponsoring Businesses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {revenue.topSponsors.map((sponsor, i) => (
              <div key={sponsor.businessId}>
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <Link
                        href={`/business/${sponsor.businessId}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {sponsor.businessName}
                      </Link>
                      <p className="text-xs text-muted-foreground">{sponsor.eventsSponsored} events</p>
                    </div>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatInr(sponsor.totalRevenue)}
                  </span>
                </div>
                {i < revenue.topSponsors.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue by Event */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {revenue.eventBreakdown.map((item, i) => (
              <div key={item.eventId}>
                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <Link
                      href={`/business/sponsored-events/${item.eventId}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {item.eventTitle}
                    </Link>
                    <p className="text-xs text-muted-foreground">{item.businessName}</p>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatInr(item.revenue)}
                  </span>
                </div>
                {i < revenue.eventBreakdown.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OverviewCard({
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
          <p className="mt-0.5 text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
