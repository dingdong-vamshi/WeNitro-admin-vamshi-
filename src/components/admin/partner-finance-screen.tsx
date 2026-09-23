"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleDollarSign, Landmark, Search, Settings2 } from "lucide-react";

import { AdminDataState } from "@/components/admin/admin-data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getCurrentAdminRole,
  getPartnerFinanceConfig,
  listPartnerFinance,
  recordPartnerFinancialEvent,
  updatePartnerFinanceConfig,
  updatePartnerSettlement,
} from "@/lib/partner-admin";
import type { PartnerFinanceRow, PartnerSettlementStatus } from "@/types/admin";

const statuses: Array<PartnerSettlementStatus | "all"> = ["all", "PENDING", "PROCESSING", "PAID", "FAILED", "ON_HOLD"];
const allowedSettlementTransitions: Record<PartnerSettlementStatus, PartnerSettlementStatus[]> = {
  PENDING: ["PENDING", "PROCESSING", "FAILED", "ON_HOLD"],
  PROCESSING: ["PROCESSING", "PAID", "FAILED", "ON_HOLD"],
  PAID: ["PAID"],
  FAILED: ["FAILED", "PROCESSING", "ON_HOLD"],
  ON_HOLD: ["ON_HOLD", "PROCESSING", "FAILED"],
};
const statusVariant: Record<PartnerSettlementStatus, "success" | "warning" | "danger" | "secondary" | "info"> = {
  PENDING: "warning",
  PROCESSING: "info",
  PAID: "success",
  FAILED: "danger",
  ON_HOLD: "danger",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value / 100);
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not recorded";
}

function humanStatus(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
}

function financialStatus(row: PartnerFinanceRow) {
  if (row.refundPaisa > 0) return "REFUND_ADJUSTED";
  if (row.status === "PAID") return "SETTLED";
  if (row.status === "ON_HOLD") return "ON_HOLD";
  if (row.status === "FAILED") return "ATTENTION_REQUIRED";
  return "PAYABLE";
}

function feeRate(row: PartnerFinanceRow) {
  if (row.grossPaisa <= 0) return "—";
  return `${((row.platformFeePaisa / row.grossPaisa) * 100).toFixed(2).replace(/\.00$/, "")}%`;
}

export function PartnerFinanceScreen({ view = "ledger" }: { view?: "ledger" | "settlements" | "overview" }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PartnerSettlementStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PartnerFinanceRow | null>(null);
  const [nextStatus, setNextStatus] = useState<PartnerSettlementStatus>("PENDING");
  const [payoutReference, setPayoutReference] = useState("");
  const [note, setNote] = useState("");
  const [configOpen, setConfigOpen] = useState(false);
  const [platformFeeBps, setPlatformFeeBps] = useState(1000);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstBps, setGstBps] = useState(0);
  const [gstBasis, setGstBasis] = useState<"disabled" | "gross" | "platform_fee">("disabled");
  const [settlementDays, setSettlementDays] = useState(7);
  const [configReason, setConfigReason] = useState("");
  const [savedPolicy, setSavedPolicy] = useState<string | null>(null);
  const [eventOpen, setEventOpen] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [eventKind, setEventKind] = useState<"REFUND" | "CHARGEBACK" | "DISPUTE" | "REVERSAL" | "ADJUSTMENT">("REFUND");
  const [eventStatus, setEventStatus] = useState<"REQUIRED" | "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "OPEN" | "RESOLVED">("PENDING");
  const [eventAmount, setEventAmount] = useState("");
  const [providerReference, setProviderReference] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [eventReason, setEventReason] = useState("");

  const roleQuery = useQuery({ queryKey: ["admin-app-role"], queryFn: getCurrentAdminRole });
  const canManageFinance = roleQuery.data === "super_admin" || roleQuery.data === "finance_admin";
  const financeQuery = useQuery({
    queryKey: ["partner-finance", status],
    queryFn: () => listPartnerFinance(status),
    enabled: canManageFinance,
  });
  const configQuery = useQuery({
    queryKey: ["partner-finance-config"],
    queryFn: getPartnerFinanceConfig,
    enabled: canManageFinance,
  });
  const settlementMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("Choose a settlement.");
      return updatePartnerSettlement({
        settlementId: selected.settlementId,
        status: nextStatus,
        payoutReference,
        note,
      });
    },
    onSuccess: async () => {
      setSelected(null);
      setPayoutReference("");
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["partner-finance"] });
    },
  });
  const configMutation = useMutation({
    mutationFn: () => updatePartnerFinanceConfig({
      platformFeeBps,
      gstEnabled,
      gstBps,
      gstBasis: gstEnabled ? gstBasis : "disabled",
      settlementDays,
      reason: configReason,
    }),
    onSuccess: async (config) => {
      setSavedPolicy(`Saved ${config.platformFeeBps / 100}% platform fee, ${config.gstEnabled ? `${config.gstBps / 100}% GST on ${config.gstBasis}` : "GST disabled"}, ${config.settlementDays}-day window.`);
      setConfigOpen(false);
      setConfigReason("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["partner-finance"] }),
        queryClient.invalidateQueries({ queryKey: ["partner-finance-config"] }),
      ]);
    },
  });
  const eventMutation = useMutation({
    mutationFn: () => recordPartnerFinancialEvent({
      paymentId: Number(paymentId),
      kind: eventKind,
      status: eventStatus,
      amountPaisa: Math.round(Number(eventAmount) * 100),
      providerReference,
      idempotencyKey,
      reason: eventReason,
    }),
    onSuccess: async () => {
      setEventOpen(false);
      setPaymentId("");
      setEventAmount("");
      setProviderReference("");
      setEventReason("");
      await queryClient.invalidateQueries({ queryKey: ["partner-finance"] });
    },
  });

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (financeQuery.data ?? []).filter((row) => !needle || [
      row.businessName,
      row.partnerName,
      row.activityTitle,
      String(row.eventId),
      String(row.settlementId),
      row.payoutReference ?? "",
    ].some((value) => value.toLowerCase().includes(needle)));
  }, [financeQuery.data, search]);
  const totals = useMemo(() => filtered.reduce((total, row) => ({
    gross: total.gross + row.grossPaisa,
    fee: total.fee + row.platformFeePaisa,
    gst: total.gst + row.gstPaisa,
    refunds: total.refunds + row.refundPaisa,
    net: total.net + row.expectedNetPaisa,
  }), { gross: 0, fee: 0, gst: 0, refunds: 0, net: 0 }), [filtered]);

  if (roleQuery.isLoading) return <AdminDataState title="finance authorization" loading />;
  if (roleQuery.isError) return <AdminDataState title="finance authorization" error={roleQuery.error} onRetry={() => void roleQuery.refetch()} />;
  if (!canManageFinance) {
    return <Card className="border-dashed"><CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center"><Landmark className="h-8 w-8 text-muted-foreground" /><div><h1 className="font-semibold">Financial access restricted</h1><p className="mt-1 max-w-lg text-sm text-muted-foreground">Partner financial data and settlement controls are available only to Super Admin and Finance Admin accounts. Supabase enforces the same rule in every RPC.</p></div></CardContent></Card>;
  }
  if (financeQuery.isLoading) return <AdminDataState title="Partner financial ledger" loading />;
  if (financeQuery.isError) return <AdminDataState title="Partner financial ledger" error={financeQuery.error} onRetry={() => void financeQuery.refetch()} />;

  const title = view === "settlements" ? "Partner Settlements" : view === "overview" ? "Partner Finance Overview" : "Partner Financial Ledger";
  const description = view === "settlements"
    ? "Review settlement eligibility and record manual or provider payout references."
    : "Reconcile Partner activity collections, the configured platform fee, GST deductions, refunds, and settlement state.";
  const needsNote = nextStatus === "FAILED" || nextStatus === "ON_HOLD";
  const settlementDisabled = settlementMutation.isPending
    || selected?.status === "PAID"
    || (nextStatus === "PAID" && !payoutReference.trim())
    || (needsNote && !note.trim());
  const configDisabled = configMutation.isPending
    || !configReason.trim()
    || platformFeeBps < 0 || platformFeeBps > 10000
    || settlementDays < 0 || settlementDays > 90
    || (gstEnabled && (gstBps <= 0 || gstBps > 10000 || gstBasis === "disabled"));
  const eventDisabled = eventMutation.isPending
    || !Number.isInteger(Number(paymentId)) || Number(paymentId) <= 0
    || !Number.isFinite(Number(eventAmount)) || Number(eventAmount) < 0
    || !idempotencyKey.trim() || !eventReason.trim();

  function openConfig() {
    const config = configQuery.data;
    if (config) {
      setPlatformFeeBps(config.platformFeeBps);
      setGstEnabled(config.gstEnabled);
      setGstBps(config.gstBps);
      setGstBasis(config.gstBasis);
      setSettlementDays(config.settlementDays);
    }
    setConfigOpen(true);
  }

  function openFinancialEvent() {
    setIdempotencyKey(`admin-${Date.now()}`);
    setEventOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><CircleDollarSign className="h-5 w-5 text-primary" /></span>
          <div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={openFinancialEvent}><CircleDollarSign className="h-4 w-4" />Record financial event</Button>
          <Button variant="outline" onClick={openConfig} disabled={configQuery.isLoading || configQuery.isError}><Settings2 className="h-4 w-4" />Configure policy</Button>
        </div>
      </div>

      {savedPolicy ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{savedPolicy}</p> : null}
      {configQuery.isError ? <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{configQuery.error instanceof Error ? configQuery.error.message : "Unable to load the current Partner finance policy."}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Gross collection", totals.gross],
          ["Platform fee", totals.fee],
          ["GST deduction", totals.gst],
          ["Refunds / reversals", totals.refunds],
          ["Expected net", totals.net],
        ].map(([label, value]) => <Card key={String(label)}><CardContent className="pt-5"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{formatMoney(Number(value))}</p></CardContent></Card>)}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Settlement ledger</CardTitle><CardDescription>The V1 default platform fee is 10%. Each row shows its persisted ledger amount, including historical snapshots.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <label className="relative flex-1"><span className="sr-only">Search financial ledger</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm" placeholder="Search Partner, business, activity, reference, or ID" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
            <select className="h-10 rounded-lg border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value as PartnerSettlementStatus | "all")}>
              {statuses.map((item) => <option key={item} value={item}>{item === "all" ? "All settlement statuses" : humanStatus(item)}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto rounded-xl border">
            <Table><TableHeader><TableRow className="bg-muted/50 hover:bg-muted/50"><TableHead>Partner / Activity</TableHead><TableHead>Gross</TableHead><TableHead>Platform fee</TableHead><TableHead>GST</TableHead><TableHead>Refunds</TableHead><TableHead>Net</TableHead><TableHead>Financial status</TableHead><TableHead>Settlement</TableHead><TableHead>Due / payout</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>{filtered.length === 0 ? <TableRow><TableCell colSpan={10} className="py-12 text-center text-muted-foreground">No Partner finance rows match these filters.</TableCell></TableRow> : filtered.map((row) => (
                <TableRow key={row.settlementId}>
                  <TableCell><p className="font-medium">{row.businessName}</p><p className="text-xs text-muted-foreground">{row.activityTitle} · Activity {row.eventId}</p></TableCell>
                  <TableCell>{formatMoney(row.grossPaisa)}</TableCell>
                  <TableCell><p>{formatMoney(row.platformFeePaisa)}</p><p className="text-xs text-muted-foreground">{feeRate(row)}</p></TableCell>
                  <TableCell>{formatMoney(row.gstPaisa)}</TableCell>
                  <TableCell>{formatMoney(row.refundPaisa)}</TableCell>
                  <TableCell className="font-semibold">{formatMoney(row.expectedNetPaisa)}</TableCell>
                  <TableCell><Badge variant={row.refundPaisa > 0 || row.status === "ON_HOLD" || row.status === "FAILED" ? "warning" : "secondary"}>{humanStatus(financialStatus(row))}</Badge></TableCell>
                  <TableCell><Badge variant={statusVariant[row.status]}>{humanStatus(row.status)}</Badge></TableCell>
                  <TableCell><p className="text-sm">{formatDate(row.dueAt)}</p><p className="max-w-44 truncate font-mono text-xs text-muted-foreground">{row.payoutReference || "No payout reference"}</p></TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => { setSelected(row); setNextStatus(row.status); setPayoutReference(row.payoutReference ?? ""); setNote(row.note ?? ""); }}>Manage</Button></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open && !settlementMutation.isPending) setSelected(null); }}>
        <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Update settlement {selected?.settlementId}</DialogTitle><DialogDescription>The database validates authorization, eligible date, permitted status, and the payout reference required for PAID.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <label className="block space-y-1"><span className="text-sm font-medium">Settlement status</span><select disabled={selected?.status === "PAID"} className="h-10 w-full rounded-lg border bg-background px-3 text-sm disabled:opacity-60" value={nextStatus} onChange={(event) => setNextStatus(event.target.value as PartnerSettlementStatus)}>{(selected ? allowedSettlementTransitions[selected.status] : []).map((item) => <option key={item} value={item}>{humanStatus(item)}</option>)}</select></label>
            <label className="block space-y-1"><span className="text-sm font-medium">Payout reference {nextStatus === "PAID" ? "(required)" : "(not recorded until paid)"}</span><input disabled={selected?.status === "PAID" || nextStatus !== "PAID"} className="h-10 w-full rounded-lg border bg-background px-3 text-sm disabled:opacity-60" maxLength={255} value={payoutReference} onChange={(event) => setPayoutReference(event.target.value)} placeholder="Bank / Cashfree payout reference" /></label>
            {selected?.status === "PAID" ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Paid settlements are terminal. Any correction requires a separate audited finance workflow.</p> : null}
            <label className="block space-y-1"><span className="text-sm font-medium">Operational note {needsNote ? "(required)" : "(optional)"}</span><textarea className="w-full rounded-lg border bg-background p-3 text-sm" rows={3} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Reason or reconciliation note" /></label>
            {settlementMutation.isError ? <p className="text-sm text-destructive">{settlementMutation.error instanceof Error ? settlementMutation.error.message : "Unable to update settlement."}</p> : null}
          </div>
          <DialogFooter><Button variant="outline" disabled={settlementMutation.isPending} onClick={() => setSelected(null)}>Cancel</Button><Button disabled={settlementDisabled} onClick={() => settlementMutation.mutate()}>{settlementMutation.isPending ? "Saving…" : "Save settlement"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={configOpen} onOpenChange={(open) => { if (!configMutation.isPending) setConfigOpen(open); }}>
        <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Configure Partner finance policy</DialogTitle><DialogDescription>The current persisted policy is loaded from the finance-admin RPC. Every change requires a reason and is written to the audit history.</DialogDescription></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1"><span className="text-sm font-medium">Platform fee (%)</span><input type="number" min={0} max={100} step={0.01} className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={platformFeeBps / 100} onChange={(event) => setPlatformFeeBps(Math.round(Number(event.target.value) * 100))} /></label>
            <label className="space-y-1"><span className="text-sm font-medium">Settlement window (days)</span><input type="number" min={0} max={90} className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={settlementDays} onChange={(event) => setSettlementDays(Number(event.target.value))} /></label>
            <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2"><input type="checkbox" checked={gstEnabled} onChange={(event) => { setGstEnabled(event.target.checked); if (!event.target.checked) { setGstBps(0); setGstBasis("disabled"); } else { setGstBasis("platform_fee"); } }} />Enable an approved GST deduction</label>
            {gstEnabled ? <><label className="space-y-1"><span className="text-sm font-medium">GST rate (%)</span><input type="number" min={0.01} max={100} step={0.01} className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={gstBps / 100} onChange={(event) => setGstBps(Math.round(Number(event.target.value) * 100))} placeholder="Enter approved rate" /></label><label className="space-y-1"><span className="text-sm font-medium">GST basis</span><select className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={gstBasis} onChange={(event) => setGstBasis(event.target.value as "gross" | "platform_fee")}><option value="platform_fee">Platform fee</option><option value="gross">Gross collection</option></select></label></> : null}
            <label className="space-y-1 sm:col-span-2"><span className="text-sm font-medium">Change reason (required)</span><textarea className="w-full rounded-lg border bg-background p-3 text-sm" rows={3} maxLength={1000} value={configReason} onChange={(event) => setConfigReason(event.target.value)} placeholder="Document the Finance-approved reason" /></label>
            {configMutation.isError ? <p className="text-sm text-destructive sm:col-span-2">{configMutation.error instanceof Error ? configMutation.error.message : "Unable to save policy."}</p> : null}
          </div>
          <DialogFooter><Button variant="outline" disabled={configMutation.isPending} onClick={() => setConfigOpen(false)}>Cancel</Button><Button disabled={configDisabled} onClick={() => configMutation.mutate()}>{configMutation.isPending ? "Saving…" : "Save audited policy"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={eventOpen} onOpenChange={(open) => { if (!eventMutation.isPending) setEventOpen(open); }}>
        <DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Record refund or financial event</DialogTitle><DialogDescription>Use a verified payment ID. This append-only action can record a refund, chargeback, dispute, reversal, or adjustment and refreshes the related settlement.</DialogDescription></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1"><span className="text-sm font-medium">Verified payment ID</span><input type="number" min={1} className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={paymentId} onChange={(event) => setPaymentId(event.target.value)} /></label>
            <label className="space-y-1"><span className="text-sm font-medium">Amount (INR)</span><input type="number" min={0} step={0.01} className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={eventAmount} onChange={(event) => setEventAmount(event.target.value)} /></label>
            <label className="space-y-1"><span className="text-sm font-medium">Event kind</span><select className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={eventKind} onChange={(event) => setEventKind(event.target.value as typeof eventKind)}>{["REFUND", "CHARGEBACK", "DISPUTE", "REVERSAL", "ADJUSTMENT"].map((item) => <option key={item} value={item}>{humanStatus(item)}</option>)}</select></label>
            <label className="space-y-1"><span className="text-sm font-medium">Event status</span><select className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={eventStatus} onChange={(event) => setEventStatus(event.target.value as typeof eventStatus)}>{["REQUIRED", "PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "OPEN", "RESOLVED"].map((item) => <option key={item} value={item}>{humanStatus(item)}</option>)}</select></label>
            <label className="space-y-1"><span className="text-sm font-medium">Provider reference (optional)</span><input className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={providerReference} onChange={(event) => setProviderReference(event.target.value)} /></label>
            <label className="space-y-1"><span className="text-sm font-medium">Idempotency key</span><input className="h-10 w-full rounded-lg border bg-background px-3 font-mono text-sm" value={idempotencyKey} onChange={(event) => setIdempotencyKey(event.target.value)} /></label>
            <label className="space-y-1 sm:col-span-2"><span className="text-sm font-medium">Reason (required)</span><textarea rows={3} maxLength={1000} className="w-full rounded-lg border bg-background p-3 text-sm" value={eventReason} onChange={(event) => setEventReason(event.target.value)} /></label>
            {eventMutation.isError ? <p className="text-sm text-destructive sm:col-span-2">{eventMutation.error instanceof Error ? eventMutation.error.message : "Unable to record financial event."}</p> : null}
          </div>
          <DialogFooter><Button variant="outline" disabled={eventMutation.isPending} onClick={() => setEventOpen(false)}>Cancel</Button><Button disabled={eventDisabled} onClick={() => eventMutation.mutate()}>{eventMutation.isPending ? "Recording…" : "Record append-only event"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
