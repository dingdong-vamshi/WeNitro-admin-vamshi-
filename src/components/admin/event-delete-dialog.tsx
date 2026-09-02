"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const reasons = [
  "Spam / Fake Event",
  "Safety Issue",
  "Policy Violation",
  "Duplicate Event",
  "Other",
];

export function EventDeleteDialog({
  eventTitle,
  open,
  onOpenChange,
  onConfirm,
}: {
  eventTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState(reasons[0]);

  function handleConfirm() {
    onConfirm(reason);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            This will permanently remove the event and notify all participants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <p className="text-muted-foreground">Event</p>
            <p className="mt-0.5 font-medium">{eventTitle}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Reason</p>
            <div className="flex flex-col gap-2">
              {reasons.map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/50 has-[:checked]:border-destructive has-[:checked]:bg-destructive/5"
                >
                  <input
                    type="radio"
                    name="delete-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-destructive"
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
