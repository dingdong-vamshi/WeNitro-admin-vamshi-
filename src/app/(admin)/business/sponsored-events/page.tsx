import { SponsoredEventsTable } from "@/components/admin/sponsored-events-table";
import { Card, CardContent } from "@/components/ui/card";

export default function SponsoredEventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Partner Activities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review activities hosted by Partner accounts and open their existing management controls.
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
