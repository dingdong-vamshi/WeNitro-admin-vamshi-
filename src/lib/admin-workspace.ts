import {supabase} from "@/lib/supabase";
export type WorkspaceKind="notification_template"|"email_template"|"reward"|"coupon"|"campaign";
export type WorkspacePayload={name:string;title:string;body:string;channel:"in_app"|"push"|"email";recipients:number[];status:"draft";notes:string};
export type WorkspaceDocument={id:string;kind:WorkspaceKind;payload:WorkspacePayload;version:number;status:"draft"|"sent";archived:boolean;updated_at:string;sent_at:string|null;scheduled_at?:string|null;last_error?:string|null;delivered:number;opened:number};
export async function listWorkspace(kind:WorkspaceKind){const rows:WorkspaceDocument[]=[];for(let from=0;;from+=1000){const r=await supabase.rpc("admin_workspace_list",{p_kind:kind}).range(from,from+999);if(r.error)throw r.error;const batch=(r.data??[]) as WorkspaceDocument[];rows.push(...batch);if(batch.length<1000)return rows;}}
export async function saveWorkspace(row:Pick<WorkspaceDocument,"id"|"kind"|"payload"|"version"|"archived">,reason:string){const r=await supabase.rpc("admin_workspace_save",{p_id:row.id,p_kind:row.kind,p_payload:row.payload,p_version:row.version,p_archived:row.archived,p_reason:reason});if(r.error)throw r.error;return r.data as WorkspaceDocument;}
export async function sendWorkspace(row:WorkspaceDocument,reason:string){const r=await supabase.rpc("admin_send_campaign",{p_id:row.id,p_version:row.version,p_reason:reason});if(r.error)throw r.error;return r.data as WorkspaceDocument;}
export type FeatureGate={key:string;enabled:boolean;updated_at:string};
export async function featureGates(key?:string,enabled?:boolean,reason?:string){const r=await supabase.rpc("admin_feature_gates",{p_key:key??null,p_enabled:enabled??null,p_reason:reason??null});if(r.error)throw r.error;return (r.data??[]) as FeatureGate[];}

export async function scheduleWorkspace(row:WorkspaceDocument,when:string|null,reason:string){const r=await supabase.rpc("admin_schedule_campaign",{p_id:row.id,p_version:row.version,p_when:when,p_reason:reason});if(r.error)throw r.error;return r.data as WorkspaceDocument;}
