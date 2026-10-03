"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getPartnerActivities } from '@/lib/admin-review-read-models';
import { AdminDataState } from './admin-data-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { EventStatus } from '@/types/admin';
export function SponsoredEventsTable() {
  const [search,setSearch]=useState(''),[status,setStatus]=useState<EventStatus|'all'>('all'),[page,setPage]=useState(1);
  const query=useQuery({queryKey:['partner-activity-review'],queryFn:getPartnerActivities});
  const term=search.trim().toLowerCase();
  const rows=(query.data??[]).filter(row=>(status==='all'||row.status===status)&&(!term||[row.id,row.title,row.host,row.city].some(value=>value.toLowerCase().includes(term))));
  const pages=Math.max(1,Math.ceil(rows.length/20)),currentPage=Math.min(page,pages);
  if(query.isPending||query.isError)return <AdminDataState title="Partner activities" loading={query.isPending} error={query.error} onRetry={()=>void query.refetch()}/>;
  return <div className="space-y-4"><p className="rounded-lg border bg-muted/30 p-4 text-sm">These are actual activities hosted by Partner accounts. Advertising sponsorship, promotion budgets, clicks and impressions are not configured; no sponsorship status or ad-spend metrics are inferred from Partner membership.</p><div className="flex flex-wrap gap-3"><input aria-label="Search Partner activities" placeholder="Search activity, host or location" className="min-w-60 flex-1 rounded border bg-background px-3 py-2" value={search} onChange={event=>{setSearch(event.target.value);setPage(1);}}/><select aria-label="Partner activity status" className="rounded border bg-background p-2" value={status} onChange={event=>{setStatus(event.target.value as EventStatus|'all');setPage(1);}}>{['all','upcoming','ongoing','completed','cancelled','reported'].map(value=><option key={value} value={value}>{value==='all'?'All statuses':value}</option>)}</select><Button variant="outline" disabled={query.isFetching} onClick={()=>void query.refetch()}>Refresh</Button></div>
    {!rows.length?<AdminDataState title="matching Partner activities" empty/>:<><Table><TableHeader><TableRow><TableHead>Activity</TableHead><TableHead>Partner host</TableHead><TableHead>Location / date</TableHead><TableHead>Approved participants</TableHead><TableHead>Status</TableHead><TableHead>Manage</TableHead></TableRow></TableHeader><TableBody>{rows.slice((currentPage-1)*20,currentPage*20).map(row=><TableRow key={row.id}><TableCell>{row.title}<span className="block text-xs text-muted-foreground">#{row.id}</span></TableCell><TableCell>{row.host}</TableCell><TableCell>{row.city}<span className="block text-xs">{new Date(row.date).toLocaleDateString()}</span></TableCell><TableCell>{row.attendees}{row.maxAttendees?` / ${row.maxAttendees}`:' · no participant limit'}</TableCell><TableCell><Badge variant="secondary">{row.status}</Badge></TableCell><TableCell><Button size="sm" variant="outline" asChild><Link href={`/events/${row.id}`}>Activity controls</Link></Button></TableCell></TableRow>)}</TableBody></Table><div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{rows.length} matching activities · Page {currentPage} of {pages}</p><div className="flex gap-2"><Button variant="outline" disabled={currentPage<=1} onClick={()=>setPage(currentPage-1)}>Previous</Button><Button variant="outline" disabled={currentPage>=pages} onClick={()=>setPage(currentPage+1)}>Next</Button></div></div></>}
  </div>;
}
