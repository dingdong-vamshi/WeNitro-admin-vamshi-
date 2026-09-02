import { getGeoReportData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GeoComparisonChart,
  GeoEventsCityChart,
  RegionBreakdownChart,
} from "@/components/charts/reports-charts";
import { MapPin, Globe, Users2, CalendarDays } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function GeographicInsightsPage() {
  const data = await getGeoReportData();

  const totalUsers   = data.usersByCity.reduce((s, r) => s + r.users, 0);
  const totalEvents  = data.eventsByCity.reduce((s, r) => s + r.events, 0);
  const totalRegions = data.regionBreakdown.length;
  const topCity      = data.usersByCity[0]?.city ?? "—";

  const summaryCards = [
    { label: "Total Users (Tracked)",  value: totalUsers.toLocaleString(),   Icon: Users2,     color: "text-chart-1" },
    { label: "Total Events (Tracked)", value: totalEvents.toLocaleString(),   Icon: CalendarDays, color: "text-chart-2" },
    { label: "Top City",               value: topCity,                         Icon: MapPin,     color: "text-chart-3" },
    { label: "Regions Tracked",        value: totalRegions,                    Icon: Globe,      color: "text-chart-4" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Geographic Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Understand where your users and events are concentrated across cities and regions.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {summaryCards.map(({ label, value, Icon, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* City Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GeoComparisonChart data={data.usersByCity} />
        <GeoEventsCityChart data={data.eventsByCity} />
      </div>

      {/* Region Breakdown */}
      <RegionBreakdownChart data={data.regionBreakdown} />

      {/* Region Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Region Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/60 hover:bg-transparent">
                  <TableHead className="pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Region
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Users
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Events
                  </TableHead>
                  <TableHead className="pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Users / Event
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.regionBreakdown.map((region) => (
                  <TableRow key={region.region} className="border-b border-border/40 last:border-0">
                    <TableCell className="pl-4 py-3 font-medium">{region.region}</TableCell>
                    <TableCell className="py-3 text-right tabular-nums">{region.users.toLocaleString()}</TableCell>
                    <TableCell className="py-3 text-right tabular-nums">{region.events.toLocaleString()}</TableCell>
                    <TableCell className="pr-4 py-3 text-right tabular-nums">
                      {region.events > 0
                        ? Math.round(region.users / region.events).toLocaleString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
