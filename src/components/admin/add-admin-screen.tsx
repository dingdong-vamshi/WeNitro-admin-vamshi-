"use client";
import {FormEvent,useState} from "react";
import {useQuery,useQueryClient} from "@tanstack/react-query";
import {getAdminAccounts,setAdminAccountAccess} from "@/lib/api";
import {useAdminAuth} from "@/components/AdminAuthGate";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card,CardContent,CardHeader,CardTitle,CardDescription} from "@/components/ui/card";
import type {AdminAccountStatus} from "@/types/admin";
type AccessRole="super_admin"|"admin"|"finance_admin";
export function AddAdminScreen(){
 const {role,session}=useAdminAuth(); const master=role==="super_admin"; const cache=useQueryClient();
 const query=useQuery({queryKey:["admin-accounts"],queryFn:getAdminAccounts});
 const [email,setEmail]=useState("");const [accessRole,setRole]=useState<AccessRole>("admin");
 const [status,setStatus]=useState<AdminAccountStatus>("active");const [reason,setReason]=useState("");
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [error,setError]=useState("");
 async function save(e:FormEvent){e.preventDefault();setBusy(true);setError("");setMessage("");try{
  await setAdminAccountAccess(email.trim(),accessRole,status,reason.trim());
  await cache.invalidateQueries({queryKey:["admin-accounts"]});await cache.invalidateQueries({queryKey:["admin-activity-logs"]});
  setMessage("Administrator access saved. The account list reflects the saved state.");setReason("");
 }catch(e){setError(e instanceof Error?e.message:"Could not save access");}finally{setBusy(false);}}
 return <div className="space-y-6">
 <Card><CardHeader><CardTitle>Administrator access</CardTitle><CardDescription>{master?"Add a verified, registered WeNitro member or change an administrator’s role and status. Inactive and suspended accounts lose Admin access immediately, including existing sessions.":"Only a Master (Super Admin) can manage administrator access. Your own account is shown below."}</CardDescription></CardHeader><CardContent>
 {master&&<form onSubmit={save} className="grid gap-4 md:grid-cols-2">
 <label className="space-y-1">Account email<Input aria-label="Administrator email" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
 <label className="space-y-1">Role<select aria-label="Administrator role" className="block w-full rounded border bg-background p-2" value={accessRole} onChange={e=>setRole(e.target.value as AccessRole)}><option value="admin">Moderator — users and content</option><option value="finance_admin">Finance Admin — Partner finance</option><option value="super_admin">Super Admin — full access and administrators</option></select></label>
 <label className="space-y-1">Status<select aria-label="Administrator status" className="block w-full rounded border bg-background p-2" value={status} onChange={e=>setStatus(e.target.value as AdminAccountStatus)}><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select></label>
 <label className="space-y-1">Reason<Input aria-label="Access change reason" required minLength={5} maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)}/></label>
 <Button type="submit" disabled={busy}>{busy?"Saving…":"Save administrator access"}</Button></form>}
 {error&&<p role="alert" className="mt-3 text-destructive">{error}</p>}{message&&<p role="status" className="mt-3">{message}</p>}
 </CardContent></Card>
 <Card><CardHeader><CardTitle>{master?"All administrators":"Your administrator account"}</CardTitle><CardDescription>Roles and status are read from the current target database. MFA shows actual verified enrollment.</CardDescription></CardHeader><CardContent>
 {query.isLoading?<p>Loading administrators…</p>:query.error?<p role="alert">{query.error.message}</p>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Account</th><th>Role</th><th>Status</th><th>MFA enrolled</th><th>Action</th></tr></thead><tbody>{query.data?.map(a=><tr key={a.id} className="border-t"><td className="p-2">{a.fullName}<div className="text-muted-foreground">{a.email}</div></td><td>{a.role}</td><td>{a.status}</td><td>{a.twoFAEnabled?"Yes":"No"}</td><td>{master&&a.id!==session.user.id?<Button variant="outline" size="sm" onClick={()=>{setEmail(a.email);setRole(a.role==="Super Admin"?"super_admin":a.role==="Finance Admin"?"finance_admin":"admin");setStatus(a.status);setReason("");setMessage("");}}>Manage</Button>:a.id===session.user.id?"Current account":""}</td></tr>)}</tbody></table></div>}
 </CardContent></Card></div>;
}
