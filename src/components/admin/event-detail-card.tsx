"use client";

import Link from "next/link";
import {
  Ban,
  CalendarDays,
  Camera,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  Star,
  Tag,
  Users2,
  Video,
  XCircle,
} from "lucide-react";

import type { EventDetail } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EventDeleteDialog } from "@/components/admin/event-delete-dialog";
import { EventModerateDialog, type ModerateAction } from "@/components/admin/event-moderate-dialog";
import { useState } from "react";

const statusVariant: Record<string, "secondary" | "success" | "warning" | "danger" | "outline"> = {
  upcoming: "secondary",
  ongoing: "success",
  completed: "outline",
  cancelled: "warning",
  reported: "danger",
};

const categoryLabel: Record<string, string> = {
  adventure: "Adventure",
  social: "Social",
  business: "Business",
  wellness: "Wellness",
  music: "Music",
  food: "Food",
  education: "Education",
  sports: "Sports",
};

export function EventDetailCard({ event }: { event: EventDetail }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [moderateOpen, setModerateOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Events / Event Details
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{event.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Full event information, participant details, and admin controls.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/events/${event.id}/participants`}>
              <Users2 className="mr-1.5 h-3.5 w-3.5" />
              Participants List
            </Link>
          </Button>
          <Button variant="outline" size="sm">
            <Star className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
            {event.isFeatured ? "Unfeature" : "Feature Event"}
          </Button>
          <Button variant="outline" size="sm">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
            Approve Event
          </Button>
          <Button variant="outline" size="sm" onClick={() => setModerateOpen(true)}>
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5 text-orange-500" />
            Moderate
          </Button>
          <Button variant="outline" size="sm">
            <XCircle className="mr-1.5 h-3.5 w-3.5 text-yellow-600" />
            Cancel Event
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Ban className="mr-1.5 h-3.5 w-3.5" />
            Delete Event
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Left – Core info */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Location, schedule, and description.</CardDescription>
              </div>
              <Badge variant={statusVariant[event.status] ?? "outline"} className="capitalize">
                {event.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {/* Title row */}
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-xl font-bold text-primary ring-1 ring-primary/20">
                {event.title.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-semibold leading-tight">{event.title}</h2>
                <p className="text-xs text-muted-foreground">{event.id}</p>
              </div>
              {event.isFeatured && (
                <Badge variant="warning" className="ml-auto shrink-0">
                  <Star className="mr-1 h-3 w-3" /> Featured
                </Badge>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Host</p>
                <p className="font-medium">{event.host}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Category</p>
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="capitalize">{categoryLabel[event.category] ?? event.category}</p>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Date &amp; Time</p>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  <p>{event.date} · {event.startTime}</p>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Participants</p>
                <div className="flex items-center gap-1.5">
                  <Users2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <p>
                    <span className="font-semibold">{event.attendees}</span>
                    {" / "}
                    <span className="text-muted-foreground">{event.maxAttendees} capacity</span>
                  </p>
                </div>
              </div>
              <div className="col-span-2 space-y-0.5">
                <p className="text-xs text-muted-foreground">Location</p>
                <div className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <p>{event.location}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="text-sm leading-relaxed">{event.description}</p>
            </div>

            {(event.cancelledBy || event.cancelReason) && (
              <>
                <Separator />
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-50/30 p-3 text-sm dark:bg-yellow-900/10">
                  <p className="font-medium text-yellow-700 dark:text-yellow-400">Cancellation Details</p>
                  {event.cancelledBy && (
                    <p className="mt-1 text-muted-foreground">
                      Cancelled by: <span className="capitalize font-medium text-foreground">{event.cancelledBy}</span>
                    </p>
                  )}
                  {event.cancelReason && (
                    <p className="mt-0.5 text-muted-foreground">
                      Reason: <span className="text-foreground">{event.cancelReason}</span>
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right – Stats + Media */}
        <div className="space-y-6">
          {/* Stats card */}
          <Card>
            <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
              <CardTitle>Event Stats</CardTitle>
              <CardDescription>Engagement and media overview.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                  <p className="text-2xl font-bold">{event.attendees}</p>
                  <p className="text-xs text-muted-foreground">Joined</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                  <p className="text-2xl font-bold">{event.maxAttendees}</p>
                  <p className="text-xs text-muted-foreground">Capacity</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                  <p className="text-2xl font-bold">{event.engagement}%</p>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
                  <p className="text-2xl font-bold">
                    {Math.round((event.attendees / event.maxAttendees) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Capacity Fill</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media card */}
          <Card>
            <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
              <CardTitle>Event Gallery</CardTitle>
              <CardDescription>Photos and videos uploaded to this event.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {event.mediaCount.photos === 0 && event.mediaCount.videos === 0 ? (
                <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
              ) : (
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-semibold">{event.mediaCount.photos}</p>
                      <p className="text-xs text-muted-foreground">Photos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3">
                    <Video className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-lg font-semibold">{event.mediaCount.videos}</p>
                      <p className="text-xs text-muted-foreground">Videos</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EventDeleteDialog
        eventTitle={event.title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {}}
      />
      <EventModerateDialog
        eventTitle={event.title}
        open={moderateOpen}
        onOpenChange={setModerateOpen}
        onConfirm={(_action: ModerateAction) => {}}
      />
    </>
  );
}
