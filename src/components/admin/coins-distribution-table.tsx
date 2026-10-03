"use client";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {getCoinRules} from "@/lib/api";
import {Input} from "@/components/ui/input";
import {AdminDataState} from "@/components/admin/admin-data-state";
export function CoinsDistributionTable(){const [search,setSearch]=useState("");const query=useQuery({queryKey:["coin-rules",search],queryFn:()=>getCoinRules({search,pageSize:100})});if(query.isPending)return <AdminDataState title="Nitro rules" loading/>;if(query.error)return <AdminDataState title="Nitro rules" error={query.error} onRetry={()=>void query.refetch()}/>;return <div className="space-y-4"><p>Approved rules are enforced by the backend. These amounts cannot be altered from an unreviewed dashboard form.</p><Input aria-label="Search Nitro rules" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search earning rules"/><table className="w-full text-left text-sm"><thead><tr><th>Action</th><th>Nitro</th><th>Eligibility</th></tr></thead><tbody>{query.data.rows.map(r=><tr className="border-t" key={r.id}><td className="py-3">{r.action}</td><td>{r.coins}</td><td>{r.condition}</td></tr>)}</tbody></table></div>}
