"use client";
import {useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {moderateActivity} from "@/lib/api";
import {Button} from "@/components/ui/button";
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle} from "@/components/ui/dialog";
export type ModerateAction="warn_host"|"hide_event"|"unhide_event"|"cancel_event"|"suspend_host"|"delete_event"|"restore_event"|"notify_participants";
type Props={eventId:string;eventTitle:string;open:boolean;onOpenChange:(open:boolean)=>void;onConfirm:(action:ModerateAction)=>void;initialAction?:ModerateAction;deleteOnly?:boolean};
const actions:[ModerateAction,string][]=[["warn_host","Warn host (in-app notice)"],["notify_participants","Notify host and registered participants (in-app)"],["hide_event","Hide from discovery and direct user-app access"],["unhide_event","Restore a hidden Activity"],["cancel_event","Cancel / stop Activity"],["suspend_host","Suspend host for 30 days"],["delete_event","Remove Activity (history retained)"],["restore_event","Restore removed or cancelled unpaid Activity"]];
export function EventModerateDialog({eventId,eventTitle,open,onOpenChange,onConfirm,initialAction="warn_host",deleteOnly=false}:Props){
 const cache=useQueryClient();const [action,setAction]=useState<ModerateAction>(initialAction);const [reason,setReason]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function save(){setBusy(true);setError("");try{await moderateActivity(eventId,deleteOnly?"delete_event":action,reason);await cache.invalidateQueries();onConfirm(action);onOpenChange(false);}catch(e){setError(e instanceof Error?e.message:"Could not save moderation");}finally{setBusy(false);}}
 return <Dialog open={open} onOpenChange={busy?()=>{}:onOpenChange}><DialogContent><DialogHeader><DialogTitle>{deleteOnly?"Remove Activity":"Moderation / Actions"}</DialogTitle><DialogDescription>{eventTitle}. Hiding is reversible and removes the Activity from the user app. Cancellation stops the Activity. Removal retains its audit history. Payments are never automatically refunded.</DialogDescription></DialogHeader>
 {!deleteOnly&&<label>Action<select aria-label="Moderation action" className="mt-1 w-full rounded border bg-background p-2" value={action} onChange={e=>setAction(e.target.value as ModerateAction)}>{actions.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>}
 <label>Reason or message<textarea aria-label="Moderation reason" className="mt-1 w-full rounded border bg-background p-2" minLength={5} maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)}/></label>{error&&<p role="alert" className="text-destructive">{error}</p>}<DialogFooter><Button variant="outline" disabled={busy} onClick={()=>onOpenChange(false)}>Cancel</Button><Button disabled={busy||reason.trim().length<5} onClick={save}>{busy?"Saving…":"Save moderation action"}</Button></DialogFooter></DialogContent></Dialog>;
}
