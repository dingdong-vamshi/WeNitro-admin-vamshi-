"use client";
import {useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {moderateUser} from "@/lib/api";
import type {BanDuration} from "@/types/admin";
import {Button} from "@/components/ui/button";
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle} from "@/components/ui/dialog";
type Props={userId:string;userName:string;banReason?:string;open:boolean;onOpenChange:(value:boolean)=>void;onConfirm:(duration:BanDuration)=>void};
function RestrictionDialog({userId,userName,open,onOpenChange,onConfirm,restore=false}:Props&{restore?:boolean}){
 const cache=useQueryClient();const [duration,setDuration]=useState<BanDuration>("30d");const [reason,setReason]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function save(){setBusy(true);setError("");try{await moderateUser(userId,restore?"restore":duration,reason);await cache.invalidateQueries();onConfirm(duration);onOpenChange(false);setReason("");}catch(e){setError(e instanceof Error?e.message:"Could not save restriction");}finally{setBusy(false);}}
 return <Dialog open={open} onOpenChange={busy?()=>{}:onOpenChange}><DialogContent><DialogHeader><DialogTitle>{restore?"Lift Admin restriction":"Restrict account"}</DialogTitle><DialogDescription>{userName}. {restore?"Remove the Admin ban. Other account restrictions remain in effect.":"Restrict sign-in, existing-session data access and qualifying badge actions. History is retained."}</DialogDescription></DialogHeader>
 {!restore&&<label>Duration<select aria-label="Restriction duration" className="mt-1 block w-full rounded border bg-background p-2" value={duration} onChange={e=>setDuration(e.target.value as BanDuration)}><option value="30d">30 days</option><option value="90d">90 days</option><option value="permanent">Until an Admin restores access</option></select></label>}
 <label>Reason<textarea aria-label="Restriction reason" className="mt-1 w-full rounded border bg-background p-2" minLength={5} maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)}/></label>{error&&<p role="alert" className="text-destructive">{error}</p>}
 <DialogFooter><Button variant="outline" disabled={busy} onClick={()=>onOpenChange(false)}>Cancel</Button><Button disabled={busy||reason.trim().length<5} onClick={save}>{busy?"Saving…":restore?"Restore access":"Save restriction"}</Button></DialogFooter></DialogContent></Dialog>;
}
export function BanUserDialog(props:Props){return <RestrictionDialog {...props}/>;}
export function UnbanUserDialog(props:Omit<Props,"onConfirm">&{onConfirm:()=>void}){return <RestrictionDialog {...props} restore/>;}
