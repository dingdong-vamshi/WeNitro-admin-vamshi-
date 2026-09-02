import { EventsTable } from "@/components/admin/events-table";

export default function UpcomingEventsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Upcoming Activities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Future member plans ready to manage, feature, or moderate.
        </p>
      </div>

      <EventsTable initialStatus="upcoming" hideStatusFilter />
    </div>
  );
}
