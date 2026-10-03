"use client";
import {EventModerateDialog} from "./event-moderate-dialog";
export function EventDeleteDialog(props:{eventId:string;eventTitle:string;open:boolean;onOpenChange:(open:boolean)=>void;onConfirm:(reason:string)=>void}){return <EventModerateDialog {...props} deleteOnly initialAction="delete_event"/>;}
