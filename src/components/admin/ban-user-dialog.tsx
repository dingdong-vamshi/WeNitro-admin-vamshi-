"use client";

import { useState } from "react";

import type { BanDuration } from "@/types/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const durationLabels: Record<BanDuration, string> = {
  permanent: "Permanent",
  "30d": "30 Days",
  "90d": "90 Days",
};

export function BanUserDialog({
  userName,
  banReason,
  open,
  onOpenChange,
  onConfirm,
}: {
  userName: string;
  banReason?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (duration: BanDuration) => void;
}) {
  const [duration, setDuration] = useState<BanDuration>("permanent");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            This will restrict the user from accessing the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <p className="text-muted-foreground">User</p>
            <p className="mt-0.5 font-medium">{userName}</p>
            {banReason && (
              <>
                <p className="mt-2 text-muted-foreground">Reason</p>
                <p className="mt-0.5">{banReason}</p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Ban Duration</p>
            <div className="flex flex-col gap-2">
              {(["permanent", "30d", "90d"] as BanDuration[]).map((d) => (
                <label
                  key={d}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="ban-duration"
                    value={d}
                    checked={duration === d}
                    onChange={() => setDuration(d)}
                    className="accent-primary"
                  />
                  {durationLabels[d]}
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm(duration);
              onOpenChange(false);
            }}
          >
            Confirm Ban
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UnbanUserDialog({
  userName,
  open,
  onOpenChange,
  onConfirm,
}: {
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Unban User</DialogTitle>
          <DialogDescription>
            This will restore full platform access for this user.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <p className="text-muted-foreground">User</p>
          <p className="mt-0.5 font-medium">{userName}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Unban User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
