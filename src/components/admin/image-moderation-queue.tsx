"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getImageModerationQueue, moderationPreviewUrl, reviewContentModeration } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function ImageModerationQueueGrid() {
  const client = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "review">("all");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const query = useQuery({ queryKey: ["content-moderation", filter], queryFn: () => getImageModerationQueue({ status: filter }) });
  const mutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approve" | "reject" }) => {
      const reason = reasons[id]?.trim() ?? "";
      if (reason.length < 5) throw new Error("Enter a review reason of at least 5 characters.");
      return reviewContentModeration(id, decision, reason);
    },
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["content-moderation"] }); },
  });
  const imageItems = useMemo(() => (query.data ?? []).flatMap((row) => row.items
    .filter((item) => item.kind === "image" && item.storage_bucket && item.storage_path)
    .map((item) => ({ key: `${row.id}:${item.field}:${item.storage_path}`, bucket: item.storage_bucket!, path: item.storage_path! }))), [query.data]);
  useEffect(() => {
    let cancelled = false;
    void Promise.all(imageItems.filter((item) => !previews[item.key]).map(async (item) => {
      try { return [item.key, await moderationPreviewUrl(item.bucket, item.path)] as const; }
      catch { return [item.key, ""] as const; }
    })).then((entries) => { if (!cancelled && entries.length) setPreviews((current) => ({ ...current, ...Object.fromEntries(entries) })); });
    return () => { cancelled = true; };
  }, [imageItems, previews]);

  return <div className="space-y-5">
    <div className="rounded-lg border bg-muted/30 p-4 text-sm">
      New or changed public text and images pass through <strong>omni-moderation-latest</strong>. Provider failures stay private and move here after bounded retries. Approval allows the author to resubmit the exact content; rejection keeps it blocked.
    </div>
    <div className="flex gap-2" aria-label="Moderation status filter">
      {(["all", "pending", "review"] as const).map((status) => <Button key={status} size="sm" variant={filter === status ? "default" : "outline"} onClick={() => setFilter(status)}>{status === "all" ? "All" : status === "pending" ? "Pending" : "Admin Review"}</Button>)}
    </div>
    {query.isLoading ? <p>Loading moderation queue…</p> : query.error ? <p role="alert" className="text-destructive">{query.error.message}</p> : null}
    {(query.data ?? []).map((row) => <article key={row.id} className="space-y-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><p className="font-semibold capitalize">{row.scope.replaceAll("_", " ")}</p><p className="text-xs text-muted-foreground">Submitted {new Date(row.created_at).toLocaleString()} · User {row.user_id}</p></div>
        <Badge variant={row.status === "review" ? "danger" : "secondary"}>{row.status === "review" ? "ADMIN REVIEW" : "PENDING"}</Badge>
      </div>
      {row.error_code ? <p className="text-sm text-amber-700">Reason: {row.error_code.replaceAll("_", " ")}</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {row.items.map((item, index) => {
          const key = `${row.id}:${item.field}:${item.storage_path}`;
          return <div className="rounded-lg border bg-background p-3" key={`${item.field}-${index}`}>
            <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">{item.field.replaceAll("_", " ")}</span><Badge variant="outline">{item.kind}</Badge></div>
            {item.kind === "text" ? <p className="whitespace-pre-wrap break-words text-sm">{item.preview || "No text preview"}</p>
              : previews[key] ? <Image unoptimized width={720} height={480} src={previews[key]} alt={`Private ${item.field} moderation preview`} className="max-h-72 w-full rounded-md bg-muted object-contain" />
              : <p className="text-sm text-muted-foreground">Private preview unavailable or loading.</p>}
          </div>;
        })}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input aria-label={`Review reason for ${row.scope}`} placeholder="Required review reason" value={reasons[row.id] ?? ""} onChange={(event) => setReasons((current) => ({ ...current, [row.id]: event.target.value }))} />
        <Button variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: row.id, decision: "approve" })}>Approve exact content</Button>
        <Button variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: row.id, decision: "reject" })}>Reject</Button>
      </div>
      {mutation.error ? <p role="alert" className="text-sm text-destructive">{mutation.error.message}</p> : null}
    </article>)}
    {!query.isLoading && !query.error && (query.data ?? []).length === 0 ? <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">No pending or review content.</p> : null}
  </div>;
}
