"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { moderateContent } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type ModeratedContentKind = "community" | "vibe" | "story";
export type ContentAction = "hide" | "suspend" | "remove" | "restore";

const labels: Record<ContentAction, string> = {
  hide: "Hide from the user app (reversible)",
  suspend: "Suspend Community and block posts, messages, and joins",
  remove: "Remove from the user app (record retained)",
  restore: "Restore normal availability",
};
const categories = ["Spam", "Harassment", "Unsafe content", "Explicit / inappropriate content", "Fraud / scam", "Misleading content", "Community guideline violation", "Other"];

export function ContentModerationDialog({ kind, id, title, status, open, onOpenChange }: { kind: ModeratedContentKind; id: string | number; title: string; status: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const cache = useQueryClient();
  const actions = useMemo<ContentAction[]>(() => status === "active"
    ? kind === "community" ? ["hide", "suspend", "remove"] : ["hide", "remove"]
    : ["restore"], [kind, status]);
  const [action, setAction] = useState<ContentAction>(actions[0]);
  const [category, setCategory] = useState(categories[0]);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setAction(actions[0]); setCategory(categories[0]); setNotes(""); setError(""); }, [actions, id, open]);
  const reason = notes.trim() ? `${category} — ${notes.trim()}` : category;
  async function save() {
    setBusy(true); setError("");
    try {
      await moderateContent(kind, id, action, reason);
      await cache.invalidateQueries();
      onOpenChange(false);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not save moderation action.");
    } finally { setBusy(false); }
  }
  return <Dialog open={open} onOpenChange={busy ? () => {} : onOpenChange}><DialogContent>
    <DialogHeader><DialogTitle>Moderation / Actions</DialogTitle><DialogDescription>{title} · {kind} #{id}. Every change is reversible where shown and recorded in the existing Admin Action Log.</DialogDescription></DialogHeader>
    <label className="text-sm font-medium">Action<select aria-label="Moderation action" className="mt-1 w-full rounded border bg-background p-2" value={action} onChange={event => setAction(event.target.value as ContentAction)}>{actions.map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label>
    <label className="text-sm font-medium">Reason/category<select aria-label="Moderation reason category" className="mt-1 w-full rounded border bg-background p-2" value={category} onChange={event => setCategory(event.target.value)}>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
    <label className="text-sm font-medium">Notes (optional)<textarea aria-label="Moderation notes" className="mt-1 min-h-24 w-full rounded border bg-background p-2" maxLength={900} placeholder="Add the evidence or context Admin used for this decision." value={notes} onChange={event => setNotes(event.target.value)} /></label>
    <p className="rounded border bg-muted/30 p-3 text-xs text-muted-foreground">Hidden and removed content disappears from normal discovery and direct user-app reads. A suspended Community also rejects new posts, messages, joins, and membership changes.</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <DialogFooter><Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={busy || reason.length < 5} onClick={() => void save()}>{busy ? "Saving…" : "Apply moderation"}</Button></DialogFooter>
  </DialogContent></Dialog>;
}
