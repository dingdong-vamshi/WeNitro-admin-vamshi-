"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { ParticipantsTable } from "@/components/admin/participants-table";
import { AdminDataState } from "@/components/admin/admin-data-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventDetail } from "@/lib/api";

export default function EventParticipantsPage() {
  const { id } = useParams<{ id: string }>();
  const query = useQuery({ queryKey: ["activity-detail", id], queryFn: () => getEventDetail(id), enabled: Boolean(id) });
  if (query.isLoading) return <AdminDataState title="activity participants" loading />;
  if (query.error) return <AdminDataState title="activity participants" error={query.error} onRetry={() => void query.refetch()} />;
  if (!query.data) return <AdminDataState title="activity record" empty />;
  const event = query.data;

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
