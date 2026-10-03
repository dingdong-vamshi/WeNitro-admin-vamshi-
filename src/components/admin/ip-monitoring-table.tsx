"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAdminAuth } from "@/components/AdminAuthGate";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { getAuthIpObservations } from "@/lib/admin-auth-observations";

export function IpMonitoringTable() {
  const { session, role } = useAdminAuth();
  const canRead = role === "admin" || role === "super_admin";
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const query = useQuery({
    queryKey: ["auth-ip-observations", session.user.id, role, debouncedSearch],
    queryFn: ({ signal }) => getAuthIpObservations(debouncedSearch, signal),
    enabled: canRead, gcTime: 0, staleTime: 0, retry: false,
  });
  if (!canRead) return <p className="text-sm">Auth IP observations require Admin or Master access.</p>;
  return <div className="space-y-4">
    <p className="max-w-3xl text-sm text-muted-foreground">Recorded Auth events with an IP address. Search covers the latest 500 retained records and returns at most 100 matches. Missing records do not establish that no sign-ins occurred. IP addresses do not establish a person or location.</p>
    <div className="flex flex-wrap gap-3">
      <input aria-label="Search Auth IP observations" value={search} maxLength={64} onChange={(event) => setSearch(event.target.value)} placeholder="Search IP, Auth action or app user ID" className="h-9 min-w-64 flex-1 rounded-lg border border-border bg-background px-3 text-sm" />
      <Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>{query.isFetching ? "Refreshing…" : "Refresh observations"}</Button>
    </div>
    {query.isPending ? <p className="text-sm">Loading recorded Auth IP observations…</p>
      : query.isError ? <div role="alert" className="space-y-2"><p className="text-sm text-destructive">{query.error instanceof Error ? query.error.message : "Unable to load Auth IP observations."}</p><Button variant="outline" onClick={() => void query.refetch()}>Retry observations</Button></div>
      : query.data ? <>
        <p className="text-sm text-muted-foreground">Showing {query.data.items.length} of {query.data.matchingCount} matches within {query.data.candidateCount} retained records.</p>
        {query.data.items.length === 0 ? <p className="rounded-lg border p-5 text-sm">{query.data.candidateCount === 0 ? "No retained Auth IP observations are available. Refresh to check for newly recorded events." : "No recorded Auth IP observations match this search."}</p>
          : <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Recorded at</TableHead><TableHead>IP address</TableHead><TableHead>Auth action</TableHead><TableHead>Recorded actor</TableHead></TableRow></TableHeader><TableBody>{query.data.items.map((item) => <TableRow key={item.id}><TableCell>{item.occurredAt ? new Date(item.occurredAt).toLocaleString("en-IN") : "Not recorded"}</TableCell><TableCell className="font-mono">{item.ipAddress}</TableCell><TableCell>{item.action || "Not recorded"}</TableCell><TableCell>{item.actorUserId ? <Link className="text-primary underline" href={`/users/${item.actorUserId}`}>User {item.actorUserId}</Link> : "No mapped app user"}</TableCell></TableRow>)}</TableBody></Table></div>}
      </> : null}
    <p className="text-xs text-muted-foreground">This view does not infer suspicious activity, geolocation or shared-account ownership, and does not block IP addresses. Use existing account restrictions when appropriate.</p>
    <div className="flex flex-wrap gap-3"><Button variant="outline" asChild><Link href="/security/security-logs">Open security audit</Link></Button><Button variant="outline" asChild><Link href="/security/blocked-users">Manage restricted accounts</Link></Button></div>
  </div>;
}
