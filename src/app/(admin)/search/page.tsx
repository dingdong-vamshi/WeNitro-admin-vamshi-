"use client";
import {Suspense,useState} from "react";
import {useQuery} from "@tanstack/react-query";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {getUsers,getEvents,getSafetyReports} from "@/lib/api";
import {Input} from "@/components/ui/input";
import {AdminDataState} from "@/components/admin/admin-data-state";
import {useDebounce} from "@/hooks/use-debounce";
function SearchResults({initial}:{initial:string}){const [search,setSearch]=useState(initial);const term=useDebounce(search);const query=useQuery({queryKey:["admin-search",term],enabled:term.trim().length>0,queryFn:async()=>{const [users,events,reports]=await Promise.all([getUsers({search:term,pageSize:20}),getEvents({search:term,pageSize:20}),getSafetyReports({search:term,pageSize:20})]);return {users,events,reports};}});return <div className="space-y-5"><h1 className="text-2xl font-semibold">Search workspace</h1><Input aria-label="Search workspace" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, email, Activity or report"/>{query.isError?<AdminDataState title="search" error={query.error} onRetry={()=>void query.refetch()}/>:query.isFetching?<p>Searching…</p>:query.data?<div className="grid gap-5 lg:grid-cols-3">{[{title:"Members",total:query.data.users.total,rows:query.data.users.rows.map(u=>({id:u.id,title:u.name,href:`/users/${u.id}`}))},{title:"Activities",total:query.data.events.total,rows:query.data.events.rows.map(e=>({id:e.id,title:e.title,href:`/events/${e.id}`}))},{title:"Reports",total:query.data.reports.total,rows:query.data.reports.rows.map(r=>({id:r.id,title:r.reportedUser,href:`/security/safety-reports?search=${r.id}`}))}].map(group=><section key={group.title} className="rounded border p-4"><h2 className="font-semibold">{group.title} ({group.total})</h2><p className="text-xs text-muted-foreground">Up to 20 matches</p><ul className="mt-3 space-y-3">{group.rows.map(row=><li key={row.id}><Link className="underline" href={row.href}>{row.title}</Link></li>)}</ul>{group.total===0&&<p>No matches.</p>}</section>)}</div>:<p>Enter a search term.</p>}</div>}

function SearchRoute(){const params=useSearchParams();const q=params.get("q")||"";return <SearchResults key={q} initial={q}/>;}
export default function AdminSearch(){return <Suspense fallback={<p>Loading search…</p>}><SearchRoute/></Suspense>;}
