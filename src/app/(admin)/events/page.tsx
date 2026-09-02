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
      <EventsTable />
    </div>
  );
}
