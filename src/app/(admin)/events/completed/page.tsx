import { EventsTable } from "@/components/admin/events-table";

export default function CompletedEventsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Completed Activities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Finished plans with final participation, engagement, and moderation history.
        </p>
      </div>

      <EventsTable initialStatus="completed" hideStatusFilter />
    </div>
  );
}
