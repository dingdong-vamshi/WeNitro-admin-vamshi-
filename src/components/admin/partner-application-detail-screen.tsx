"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Ban, Building2, CircleDollarSign, Mail, MapPin, Phone, UserRound, XCircle } from "lucide-react";
import Link from "next/link";

import { AdminDataState } from "@/components/admin/admin-data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getCurrentAdminRole,
  getPartnerApplication,
  listPartnerApplicationHistory,
  reviewPartnerApplication,
} from "@/lib/partner-admin";
import type { PartnerApplicationStatus } from "@/types/admin";

type ReviewStatus = Exclude<PartnerApplicationStatus, "DRAFT">;

const statusVariant: Record<PartnerApplicationStatus, "success" | "warning" | "danger" | "secondary"> = {
  DRAFT: "secondary",
  UNDER_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  SUSPENDED: "danger",
};

function humanStatus(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
}

function displayDate(value: string | null) {
  return value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not recorded";
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="grid gap-1 border-b border-border/50 py-3 last:border-0 sm:grid-cols-[10rem_1fr]"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="text-sm font-medium">{value || "Not provided"}</dd></div>;
}

export function PartnerApplicationDetailScreen({ userId }: { userId: number }) {
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<ReviewStatus | null>(null);
  const [reason, setReason] = useState("");

  const applicationQuery = useQuery({
    queryKey: ["partner-application", userId],
    queryFn: () => getPartnerApplication(userId),
  });
  const historyQuery = useQuery({
    queryKey: ["partner-application-history", userId],
    queryFn: () => listPartnerApplicationHistory(userId),
  });
  const roleQuery = useQuery({ queryKey: ["admin-app-role"], queryFn: getCurrentAdminRole });
  const review = useMutation({
    mutationFn: () => {
      if (!decision) throw new Error("Choose a Partner decision.");
      return reviewPartnerApplication({ userId, status: decision, reason });
    },
    onSuccess: async () => {
      setDecision(null);
      setReason("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["partner-applications"] }),
        queryClient.invalidateQueries({ queryKey: ["partner-application", userId] }),
        queryClient.invalidateQueries({ queryKey: ["partner-application-history", userId] }),
      ]);
    },
  });

  if (applicationQuery.isLoading) return <AdminDataState title="Partner application" loading />;
  if (applicationQuery.isError) return <AdminDataState title="Partner application" error={applicationQuery.error} onRetry={() => void applicationQuery.refetch()} />;
  const application = applicationQuery.data;
  if (!application) return <AdminDataState title="Partner application" empty />;

  const canReview = roleQuery.data === "admin" || roleQuery.data === "super_admin";
  const reasonRequired = decision === "REJECTED" || decision === "SUSPENDED";
  const submitDisabled = review.isPending || (reasonRequired && !reason.trim());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href="/business" className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Partner Applications
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{application.businessName}</h1>
            <Badge variant={statusVariant[application.status]}>{humanStatus(application.status)}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Application for user {application.userId} · submitted {displayDate(application.submittedAt)}</p>
        </div>
        {canReview ? (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { setDecision("APPROVED"); setReason(""); }}><BadgeCheck className="h-4 w-4" />Approve</Button>
            <Button size="sm" variant="outline" onClick={() => { setDecision("REJECTED"); setReason(""); }}><XCircle className="h-4 w-4" />Reject</Button>
            <Button size="sm" variant="outline" onClick={() => { setDecision("SUSPENDED"); setReason(""); }}><Ban className="h-4 w-4 text-destructive" />Suspend</Button>
          </div>
        ) : (
          <Badge variant="secondary">Review actions require Admin access</Badge>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserRound className="h-4 w-4" />Applicant</CardTitle></CardHeader>
          <CardContent><dl>
            <DetailRow label="Name" value={application.applicant.fullName} />
            <DetailRow label="Username" value={application.applicant.username} />
            <DetailRow label="Email" value={<span className="inline-flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{application.applicant.email || "Not provided"}</span>} />
            <DetailRow label="Phone" value={<span className="inline-flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{application.applicant.phone || "Not provided"}</span>} />
          </dl></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4" />Business details</CardTitle></CardHeader>
          <CardContent><dl>
            <DetailRow label="Business / Club" value={application.businessName} />
            <DetailRow label="City" value={<span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{application.city}</span>} />
            <DetailRow label="Activity location" value={application.activityLocation} />
            <DetailRow label="Age category" value={application.ageCategory} />
            <DetailRow label="Activity types" value={<div className="flex flex-wrap gap-1">{application.activityTypes.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}</div>} />
            <DetailRow label="Description" value={application.description} />
          </dl></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><CircleDollarSign className="h-4 w-4" />Payout destination</CardTitle>
          <CardDescription>Only masked payout identifiers are returned by the Partner Admin RPC.</CardDescription>
        </CardHeader>
        <CardContent>
          {application.payoutAccount ? <dl className="grid gap-x-8 lg:grid-cols-2">
            <DetailRow label="Bank" value={application.payoutAccount.bankName} />
            <DetailRow label="Account holder" value={application.payoutAccount.accountHolderName} />
            <DetailRow label="Account number" value={<span className="font-mono">{application.payoutAccount.accountNumberMasked || "Not provided"}</span>} />
            <DetailRow label="IFSC" value={<span className="font-mono">{application.payoutAccount.ifscMasked || "Not provided"}</span>} />
            <DetailRow label="UPI ID" value={<span className="font-mono">{application.payoutAccount.upiIdMasked || "Not provided"}</span>} />
            <DetailRow label="Review status" value={<Badge variant={application.payoutAccount.reviewStatus === "APPROVED" ? "success" : application.payoutAccount.reviewStatus === "UNDER_REVIEW" ? "warning" : "danger"}>{humanStatus(application.payoutAccount.reviewStatus)}</Badge>} />
          </dl> : <p className="text-sm text-muted-foreground">No payout destination is attached to this application.</p>}
        </CardContent>
      </Card>

      {application.decisionReason ? (
        <Card><CardHeader><CardTitle className="text-base">Current decision</CardTitle></CardHeader><CardContent><p className="text-sm">{application.decisionReason}</p><p className="mt-2 text-xs text-muted-foreground">Reviewed {displayDate(application.reviewedAt)}</p></CardContent></Card>
      ) : null}

      <Card>
        <CardHeader><CardTitle className="text-base">Review history</CardTitle><CardDescription>Append-only application decisions recorded by Supabase.</CardDescription></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {historyQuery.isLoading ? <div className="p-6 text-sm text-muted-foreground">Loading review history…</div>
            : historyQuery.isError ? <div className="p-6 text-sm text-destructive">{historyQuery.error instanceof Error ? historyQuery.error.message : "Unable to load history."}</div>
            : historyQuery.data?.length ? (
              <Table><TableHeader><TableRow><TableHead>When</TableHead><TableHead>Transition</TableHead><TableHead>Reviewer</TableHead><TableHead>Reason</TableHead></TableRow></TableHeader>
                <TableBody>{historyQuery.data.map((item) => <TableRow key={item.id}><TableCell>{displayDate(item.createdAt)}</TableCell><TableCell>{item.fromStatus ? humanStatus(item.fromStatus) : "New"} → {humanStatus(item.toStatus)}</TableCell><TableCell>{item.actorUserId ? `User ${item.actorUserId}` : "Admin / system"}</TableCell><TableCell>{item.reason || "No reason recorded"}</TableCell></TableRow>)}</TableBody>
              </Table>
            ) : <div className="p-6 text-sm text-muted-foreground">No review history has been recorded.</div>}
        </CardContent>
      </Card>

      <Dialog open={decision !== null} onOpenChange={(open) => { if (!open && !review.isPending) { setDecision(null); setReason(""); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{decision ? humanStatus(decision) : "Review"} Partner application</DialogTitle>
            <DialogDescription>This decision is written to the immutable review history and notifies the applicant.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="partner-review-reason" className="text-sm font-medium">Reason {reasonRequired ? "(required)" : "(optional)"}</label>
            <textarea id="partner-review-reason" rows={4} maxLength={1000} className="w-full rounded-lg border bg-background p-3 text-sm" placeholder={reasonRequired ? "Explain this decision" : "Optional review note"} value={reason} onChange={(event) => setReason(event.target.value)} />
            <p className="text-right text-xs text-muted-foreground">{reason.length}/1000</p>
            {review.isError ? <p className="text-sm text-destructive">{review.error instanceof Error ? review.error.message : "The decision could not be saved."}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={review.isPending} onClick={() => { setDecision(null); setReason(""); }}>Cancel</Button>
            <Button variant={decision === "REJECTED" || decision === "SUSPENDED" ? "destructive" : "default"} disabled={submitDisabled} onClick={() => review.mutate()}>{review.isPending ? "Saving…" : "Confirm decision"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
