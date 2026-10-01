"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginAnnouncements() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState("");
  const [days, setDays] = useState("7");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  const query = useQuery({ queryKey: ["login-announcements"], queryFn: async () => {
    const result = await supabase.from("tbl_login_announcements").select("id,title,active,expires_at,target_user_ids").order("id", { ascending: false }).limit(50);
    if (result.error) throw result.error;
    return result.data;
  } });
  async function create() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); setSaved(false);
    try {
      const ids = recipients.trim() ? recipients.split(",").map(v => Number(v.trim())) : null;
      const duration = Number(days);
      if (ids?.some(id => !Number.isSafeInteger(id) || id < 1)) throw Error("Recipient IDs must be positive numbers separated by commas.");
      if (!Number.isInteger(duration) || duration < 1 || duration > 90) throw Error("Choose 1–90 days.");
      const result = await supabase.rpc("admin_create_login_announcement", {
        p_title: title.trim(), p_body: body.trim(), p_starts_at: new Date().toISOString(),
        p_expires_at: new Date(Date.now() + duration * 86400000).toISOString(), p_target_user_ids: ids,
      });
      if (result.error) throw result.error;
      setTitle(""); setBody(""); setSaved(true); await query.refetch();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not publish announcement."); }
    finally { lock.current = false; setBusy(false); }
  }
  async function disable(id: number) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const result = await supabase.rpc("admin_disable_login_announcement", { p_id: id });
      if (result.error) throw result.error;
      await query.refetch();
    } catch { setError("Could not disable announcement. Please retry."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Card><CardHeader><CardTitle>Login announcements</CardTitle><CardDescription>Shown on the next app login/load, once per recipient after acknowledgement. This does not send email or push notifications.</CardDescription></CardHeader>
    <CardContent className="space-y-4">
      <label className="block text-sm">Title<Input aria-label="Announcement title" maxLength={120} value={title} onChange={e => setTitle(e.target.value)} /></label>
      <label className="block text-sm">Message<textarea aria-label="Announcement message" maxLength={2000} value={body} onChange={e => setBody(e.target.value)} className="mt-1 min-h-24 w-full rounded-md border bg-background p-3" /></label>
      <label className="block text-sm">Recipient user IDs (blank = all users)<Input aria-label="Announcement recipient IDs" placeholder="91,92 for QA only" value={recipients} onChange={e => setRecipients(e.target.value)} /></label>
      <label className="block text-sm">Expires after days<Input aria-label="Announcement duration" type="number" min={1} max={90} value={days} onChange={e => setDays(e.target.value)} /></label>
      <p className="text-sm text-muted-foreground">Audience: {recipients.trim() ? `user IDs ${recipients}` : "ALL USERS"}. Publishing makes this visible to that audience.</p>
      <Button disabled={busy || !title.trim() || !body.trim()} onClick={() => void create()}>{busy ? "Saving…" : "Publish login announcement"}</Button>
      {saved && <p role="status">Announcement published.</p>}{error && <p role="alert" className="text-destructive">{error}</p>}
      {query.isLoading ? <p>Loading announcements…</p> : query.error ? <div role="alert">Could not load announcements. <Button variant="outline" onClick={() => void query.refetch()}>Retry</Button></div> : !query.data?.length ? <p>No announcements yet.</p> : <ul className="space-y-3">{query.data.map(row => <li key={row.id} className="flex items-center justify-between gap-4 rounded border p-3"><div><p>{row.title}</p><p className="text-xs text-muted-foreground">{row.target_user_ids ? `Users ${row.target_user_ids.join(", ")}` : "All users"} · {row.active && Date.parse(row.expires_at) > Date.now() ? "Active" : "Inactive"}</p></div>{row.active && <Button variant="outline" disabled={busy} onClick={() => void disable(row.id)}>Disable</Button>}</li>)}</ul>}
    </CardContent></Card>;
}
