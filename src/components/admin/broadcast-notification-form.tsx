"use client";

import { useState } from "react";
import { Bell, Send, CalendarClock, Save } from "lucide-react";

import type { CampaignAudience, BroadcastChannel, BroadcastSchedule } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const audiences: CampaignAudience[] = [
  "All Users",
  "Event Participants",
  "Event Hosts",
  "Business Accounts",
  "Custom Segment",
];

const channelOptions: { id: BroadcastChannel; label: string }[] = [
  { id: "push", label: "Push Notification" },
  { id: "in_app", label: "In-App Notification" },
  { id: "email", label: "Email" },
];

export function BroadcastNotificationForm() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<CampaignAudience>("All Users");
  const [channels, setChannels] = useState<BroadcastChannel[]>(["push", "in_app"]);
  const [schedule, setSchedule] = useState<BroadcastSchedule>("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [sent, setSent] = useState(false);

  function toggleChannel(ch: BroadcastChannel) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  }

  function handleSend() {
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* ── Compose Form ── */}
      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Compose Broadcast</CardTitle>
          <CardDescription>
            Send an instant message to all users or a specific audience segment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notification Title</label>
            <Input
              placeholder="e.g. Weekend Adventure Events!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Message</label>
            <textarea
              rows={4}
              placeholder="Write your broadcast message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Audience</label>
            <div className="space-y-2">
              {audiences.map((a) => (
                <label key={a} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="audience"
                    checked={audience === a}
                    onChange={() => setAudience(a)}
                    className="accent-primary"
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>

          {/* Delivery Channel */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Delivery Channel</label>
            <div className="space-y-2">
              {channelOptions.map(({ id, label }) => (
                <label key={id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={channels.includes(id)}
                    onChange={() => toggleChannel(id)}
                    className="accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Schedule</label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="schedule"
                  checked={schedule === "now"}
                  onChange={() => setSchedule("now")}
                  className="accent-primary"
                />
                Send Now
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="schedule"
                  checked={schedule === "later"}
                  onChange={() => setSchedule("later")}
                  className="accent-primary"
                />
                Schedule Later
              </label>
            </div>
            {schedule === "later" && (
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-2 max-w-xs"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              onClick={handleSend}
              disabled={!title.trim() || !message.trim() || channels.length === 0}
            >
              <Send className="mr-1.5 h-4 w-4" />
              {sent ? "Broadcast Sent!" : "Send Broadcast"}
            </Button>
            <Button variant="outline">
              <Save className="mr-1.5 h-4 w-4" />
              Save Draft
            </Button>
            {schedule === "later" && (
              <Button variant="outline">
                <CalendarClock className="mr-1.5 h-4 w-4" />
                Schedule Notification
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Preview ── */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Notification Preview
          </CardTitle>
          <CardDescription>Live preview of how your notification will appear.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mock device frame */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold">WeNitro</p>
                <p className="text-xs text-muted-foreground">now</p>
              </div>
            </div>
            <p className="text-sm font-semibold">
              {title || "Your notification title will appear here"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {message || "Your message body will appear here."}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Audience</span>
              <Badge variant="secondary">{audience}</Badge>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Channels</span>
              <div className="flex flex-wrap justify-end gap-1">
                {channels.length > 0 ? (
                  channels.map((ch) => (
                    <Badge key={ch} variant="outline" className="text-xs capitalize">
                      {ch.replace("_", " ")}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">None selected</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-muted-foreground">Delivery</span>
              <Badge variant={schedule === "now" ? "success" : "warning"}>
                {schedule === "now" ? "Immediate" : scheduledAt || "Not set"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
