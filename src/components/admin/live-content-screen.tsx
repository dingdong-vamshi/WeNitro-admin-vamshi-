"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleUserRound, Clock3, Film, Heart, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

import { AdminDataState } from "@/components/admin/admin-data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCommunities, getStories, getUserInterests, getVerificationSubmissions, getVibes, reviewVerification } from "@/lib/api";

type ScreenKind = "communities" | "vibes" | "stories" | "interests" | "verification";

const copy: Record<ScreenKind, { title: string; description: string }> = {
  communities: { title: "Communities", description: "Live community rooms and membership totals from WeNitro." },
  vibes: { title: "Vibes", description: "User-created media posts stored in the production activity feed." },
  stories: { title: "Stories", description: "Active, expired, and deleted story records from WeNitro." },
  interests: { title: "Member interests", description: "Real category selections associated with member profiles." },
  verification: { title: "Verification review", description: "Identity submissions and their current review status." },
};

const date = (value: string | null | undefined) => value ? new Date(value).toLocaleString("en-IN") : "Not recorded";
const pathName = (value: string | null | undefined) => value?.split("/").pop() || "No media";
const pageLoadedAt = Date.now();

function StatusBadge({ value }: { value: string | null | undefined }) {
  const label = value || "unknown";
  return <Badge variant={label === "approved" || label === "active" ? "default" : "secondary"}>{label}</Badge>;
}

function CommunitiesTable({ rows }: { rows: Awaited<ReturnType<typeof getCommunities>> }) {
  return (
    <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Community</TableHead><TableHead>Visibility</TableHead><TableHead>Members</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
      <TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell className="font-mono text-xs">{row.id}</TableCell><TableCell><p className="font-medium">{row.title || "Untitled community"}</p><p className="max-w-md truncate text-xs text-muted-foreground">{row.tagline || row.description || "No description"}</p></TableCell><TableCell><StatusBadge value={row.visibility} /></TableCell><TableCell>{row.memberCount.toLocaleString()}</TableCell><TableCell>{date(row.created_at)}</TableCell></TableRow>)}</TableBody>
    </Table>
  );
}

function VibesTable({ rows }: { rows: Awaited<ReturnType<typeof getVibes>> }) {
  return (
    <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Caption</TableHead><TableHead>Owner</TableHead><TableHead>Media</TableHead><TableHead>Likes</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
      <TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell className="font-mono text-xs">{row.id}</TableCell><TableCell className="max-w-sm truncate font-medium">{row.caption || "No caption"}</TableCell><TableCell>{row.user_id}</TableCell><TableCell>{row.media_type || pathName(row.media_url)}</TableCell><TableCell>{row.likes_count ?? 0}</TableCell><TableCell>{date(row.created_at)}</TableCell></TableRow>)}</TableBody>
    </Table>
  );
}

function StoriesTable({ rows }: { rows: Awaited<ReturnType<typeof getStories>> }) {
  return (
    <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Caption</TableHead><TableHead>Owner</TableHead><TableHead>Media</TableHead><TableHead>Expires</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
      <TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell className="font-mono text-xs">{row.id}</TableCell><TableCell className="max-w-sm truncate font-medium">{row.caption || "No caption"}</TableCell><TableCell>{row.user_id}</TableCell><TableCell>{row.media_type || pathName(row.media_url)}</TableCell><TableCell>{date(row.expires_at)}</TableCell><TableCell><StatusBadge value={row.deleted_at ? "deleted" : new Date(row.expires_at).getTime() < pageLoadedAt ? "expired" : "active"} /></TableCell></TableRow>)}</TableBody>
    </Table>
  );
}

function InterestsTable({ rows }: { rows: Awaited<ReturnType<typeof getUserInterests>> }) {
  return (
    <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Member ID</TableHead><TableHead>Category ID</TableHead><TableHead>Interest</TableHead><TableHead>Selected</TableHead></TableRow></TableHeader>
      <TableBody>{rows.map((row) => {
        const name = row.tbl_categories?.[0]?.name;
        return <TableRow key={row.id}><TableCell className="font-mono text-xs">{row.id}</TableCell><TableCell>{row.user_id}</TableCell><TableCell>{row.category_id}</TableCell><TableCell className="font-medium">{name || "Unlabelled category"}</TableCell><TableCell>{date(row.created_at)}</TableCell></TableRow>;
      })}</TableBody>
    </Table>
  );
}

function VerificationTable({ rows }: { rows: Awaited<ReturnType<typeof getVerificationSubmissions>> }) {
  const queryClient = useQueryClient();
  const review = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "rejected" }) => reviewVerification(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["live-admin", "verification"] }),
  });
  return (
    <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Member ID</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Document</TableHead><TableHead>Submitted</TableHead><TableHead>Reviewed</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
      <TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell className="font-mono text-xs">{row.id}</TableCell><TableCell>{row.user_id}</TableCell><TableCell>{row.verification_type}</TableCell><TableCell><StatusBadge value={row.status} /></TableCell><TableCell className="max-w-40 truncate">{pathName(row.document_path)}</TableCell><TableCell>{date(row.submitted_at || row.created_at)}</TableCell><TableCell>{date(row.reviewed_at)}</TableCell><TableCell>{["submitted", "under_review"].includes(row.status) ? <div className="flex gap-2"><Button size="sm" disabled={review.isPending} onClick={() => review.mutate({ id: Number(row.id), status: "approved" })}>Approve</Button><Button size="sm" variant="outline" disabled={review.isPending} onClick={() => review.mutate({ id: Number(row.id), status: "rejected" })}>Reject</Button></div> : "Complete"}</TableCell></TableRow>)}</TableBody>
    </Table>
  );
}

const icons = { communities: UsersRound, vibes: Film, stories: Sparkles, interests: Heart, verification: ShieldCheck };

export function LiveContentScreen({ kind }: { kind: ScreenKind }) {
  const query = useQuery<unknown[]>({
    queryKey: ["live-admin", kind],
    queryFn: () => {
      if (kind === "communities") return getCommunities();
      if (kind === "vibes") return getVibes();
      if (kind === "stories") return getStories();
      if (kind === "interests") return getUserInterests();
      return getVerificationSubmissions();
    },
  });
  const Icon = icons[kind];
  const meta = copy[kind];

  if (query.isLoading) return <AdminDataState title={meta.title} loading />;
  if (query.error || !query.data) return <AdminDataState title={meta.title} error={query.error} onRetry={() => void query.refetch()} />;
  if (query.data.length === 0) return <AdminDataState title={meta.title} empty />;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><Icon className="h-5 w-5 text-primary" /></span>
        <div><h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1><p className="mt-1 text-sm text-muted-foreground">{meta.description}</p></div>
      </div>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><CircleUserRound className="h-4 w-4" />{query.data.length.toLocaleString()} live records</CardTitle><CardDescription className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" />Loaded from the authenticated WeNitro Supabase session. No fixtures.</CardDescription></CardHeader><CardContent className="overflow-x-auto p-0">
        {kind === "communities" ? <CommunitiesTable rows={query.data as Awaited<ReturnType<typeof getCommunities>>} /> : null}
        {kind === "vibes" ? <VibesTable rows={query.data as Awaited<ReturnType<typeof getVibes>>} /> : null}
        {kind === "stories" ? <StoriesTable rows={query.data as Awaited<ReturnType<typeof getStories>>} /> : null}
        {kind === "interests" ? <InterestsTable rows={query.data as Awaited<ReturnType<typeof getUserInterests>>} /> : null}
        {kind === "verification" ? <VerificationTable rows={query.data as Awaited<ReturnType<typeof getVerificationSubmissions>>} /> : null}
      </CardContent></Card>
    </div>
  );
}
