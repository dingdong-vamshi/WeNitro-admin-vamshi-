import { EventsTable } from "@/components/admin/events-table";

export default function OngoingEventsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ongoing Activities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plans currently in progress, with live participation and moderation controls.
        </p>
      </div>

      <EventsTable initialStatus="ongoing" hideStatusFilter />
    </div>
  );
}
