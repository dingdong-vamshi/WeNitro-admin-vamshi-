"use client";
import Link from "next/link";
import {Card,CardContent,CardHeader,CardTitle,CardDescription} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
const roles=[
 {name:"Super Admin (Master)",scope:"Users, Activities, Communities, Vibes, verification, reports, announcements, Partner applications and finance. Can add administrators and change their access."},
 {name:"Moderator",scope:"Users, Activities, Communities, Vibes, verification, reports, announcements and Partner applications. Cannot manage administrators or Partner finance."},
 {name:"Finance Admin",scope:"Partner financial ledger, settlement operations and finance configuration. Cannot moderate content or manage administrators."}
];
export function AdminRolesScreen(){return <div className="space-y-4"><p className="text-sm text-muted-foreground">These three roles match the permissions enforced by the backend. Assign a role to an account to control access.</p>{roles.map(r=><Card key={r.name}><CardHeader><CardTitle>{r.name}</CardTitle><CardDescription>{r.scope}</CardDescription></CardHeader></Card>)}<Card><CardContent className="pt-6"><p className="mb-3 text-sm">Only a Master can grant or revoke administrator access. You cannot change your own access. Each saved change records its actor, recipient, role, status, reason and time.</p><Button asChild><Link href="/admins/add">Manage administrator access</Link></Button></CardContent></Card></div>}
