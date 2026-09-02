import { SponsoredEventsTable } from "@/components/admin/sponsored-events-table";
import { Card, CardContent } from "@/components/ui/card";

export default function SponsoredEventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sponsored Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review, approve, and manage events promoted by business partners and brands.
        </p>
      </div>

      <Card>
        <CardContent className="pt-5">
          <SponsoredEventsTable />
        </CardContent>
      </Card>
    </div>
  );
}
