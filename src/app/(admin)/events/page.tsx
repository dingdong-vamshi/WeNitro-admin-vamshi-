import { EventsTable } from "@/components/admin/events-table";
import { Badge } from "@/components/ui/badge";
import { CalendarRange } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <CalendarRange className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-[0.12em]">Activity operations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Activity Management</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Monitor member-led plans, moderate content, track each activity lifecycle, and manage participants.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-current" /> Live monitoring
        </Badge>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-semibold">Activity lifecycle shown by Admin</p>
        <div className="mt-3 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
          <p><strong className="text-foreground">Draft:</strong> stored as draft.</p>
          <p><strong className="text-foreground">Upcoming:</strong> published and starts in the future.</p>
          <p><strong className="text-foreground">Ongoing:</strong> start passed; end has not.</p>
          <p><strong className="text-foreground">Completed:</strong> stored completed or end time passed.</p>
          <p><strong className="text-foreground">Cancelled:</strong> explicitly cancelled by a host/co-host or Admin.</p>
          <p><strong className="text-foreground">Removed:</strong> the stored deleted flag is true.</p>
          <p><strong className="text-foreground">Reported:</strong> the stored status is reported.</p>
          <p><strong className="text-foreground">Never started:</strong> does not by itself mean cancelled.</p>
        </div>
      </div>
      <EventsTable />
    </div>
  );
}
