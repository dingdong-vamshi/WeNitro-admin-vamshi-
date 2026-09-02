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

export type ModerateAction = "warn_host" | "cancel_event" | "suspend_host" | "delete_event";

const actions: Array<{ value: ModerateAction; label: string; description: string }> = [
  { value: "warn_host", label: "Warn Host", description: "Send an official warning to the event host." },
  { value: "cancel_event", label: "Cancel Event", description: "Cancel the event and notify all participants." },
  { value: "suspend_host", label: "Suspend Host", description: "Temporarily suspend the host's account." },
  { value: "delete_event", label: "Delete Event", description: "Permanently remove this event from the platform." },
];

export function EventModerateDialog({
  eventTitle,
  open,
  onOpenChange,
  onConfirm,
}: {
  eventTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (action: ModerateAction) => void;
}) {
  const [selected, setSelected] = useState<ModerateAction>("warn_host");

  function handleConfirm() {
    onConfirm(selected);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Moderate Event</DialogTitle>
          <DialogDescription>
            Choose a moderation action for <span className="font-medium text-foreground">{eventTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-1">
          {actions.map((action) => (
            <label
              key={action.value}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="moderate-action"
                value={action.value}
                checked={selected === action.value}
                onChange={() => setSelected(action.value)}
                className="mt-0.5 accent-primary"
              />
              <div>
                <p className="font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </label>
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm Action</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
