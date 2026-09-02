import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ParticipantsTable } from "@/components/admin/participants-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventDetail } from "@/lib/api";

export default async function EventParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventDetail(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Events / Participants
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Participants List</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All users registered for{" "}
            <span className="font-medium text-foreground">{event.title}</span> ·{" "}
            {event.attendees} / {event.maxAttendees} capacity
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/events/${id}`}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
          <CardDescription>
            Manage participant status — remove, block, or send notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParticipantsTable eventId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
