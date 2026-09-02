import { EventsTable } from "@/components/admin/events-table";

export default function CancelledEventsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cancelled Activities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plans cancelled by a host or administrator, with their audit context retained.
        </p>
      </div>

      <EventsTable initialStatus="cancelled" hideStatusFilter />
    </div>
  );
}
