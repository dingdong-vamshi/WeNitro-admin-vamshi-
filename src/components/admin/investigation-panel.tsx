"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getReviewCases, isOpenReport, type ReviewScope } from '@/lib/admin-review-read-models';
import { reviewReport } from '@/lib/api';
import type { SafetyReport } from '@/types/admin';
import { AdminDataState } from './admin-data-state';
import { BanUserDialog } from './ban-user-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ReportInvestigation({ scope = 'all' }: { scope?: ReviewScope }) {
  const cache = useQueryClient();
  const [search, setSearch] = useState(''), [openOnly, setOpenOnly] = useState(true), [selectedId, setSelectedId] = useState('');
  const [reason, setReason] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [restrictionTarget, setRestrictionTarget] = useState<{ id: string; name: string } | null>(null);
  const query = useQuery({ queryKey: ['review-cases', scope], queryFn: () => getReviewCases(scope) });
  const term = search.trim().toLowerCase();
  const cases = (query.data ?? []).filter(item => (!openOnly || item.openCount > 0) && (!term || [item.label, item.user?.username, item.id, ...item.reports.map(report => `${report.id} ${report.description}`)].some(value => value?.toLowerCase().includes(term))));
  const selected = cases.find(item => item.id === selectedId) ?? cases[0];
  async function review(report: SafetyReport, status: 'reviewing' | 'resolved' | 'dismissed') {
    if (busy || reason.trim().length < 5) return;
    setBusy(true); setError('');
    try { await reviewReport(report.sourceType, report.sourceId, status, reason.trim()); await cache.invalidateQueries(); setReason(''); }
    catch (error) { setError(error instanceof Error ? error.message : 'The report could not be updated.'); }
    finally { setBusy(false); }
  }
  if (query.isPending || query.isError) return <AdminDataState title="reported accounts" loading={query.isPending} error={query.error} onRetry={() => void query.refetch()} />;
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-3">
      <input aria-label="Search reports and accounts" placeholder="Search account, report ID or submitted description" className="min-w-64 flex-1 rounded border bg-background px-3 py-2 text-sm" value={search} onChange={event => setSearch(event.target.value)} />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={openOnly} onChange={event => setOpenOnly(event.target.checked)} />Open reports only</label>
      <Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}>Refresh</Button>
    </div>
    <p className="text-sm text-muted-foreground">{cases.length} matching accounts. Reports are allegations submitted by members; a report count is not a risk score or a confirmed violation.</p>
    {!selected ? <AdminDataState title="matching reports" empty /> : <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <div className="space-y-2">{cases.map(item => <button key={item.id} disabled={busy} onClick={() => { setSelectedId(item.id); setReason(''); setError(''); }} className={`w-full rounded-lg border p-3 text-left ${selected.id === item.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
        <span className="block font-medium">{item.label}</span><span className="text-xs text-muted-foreground">{item.openCount} open · {item.reports.length} submitted reports</span>
      </button>)}</div>
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{selected.label}</h2><p className="text-sm text-muted-foreground">{selected.user ? `@${selected.user.username} · Account status: ${selected.user.status}` : 'The reported account is unavailable.'}</p></div>
          {selected.user && <div className="flex gap-2"><Button variant="outline" asChild><Link href={`/users/${selected.user.id}`}>Profile &amp; history</Link></Button><Button variant="outline" disabled={busy} onClick={() => setRestrictionTarget({ id: selected.user!.id, name: selected.user!.name })}>Restrict account</Button></div>}
        </div>
        {selected.user && <p className="text-sm">{selected.user.eventsHosted} activities hosted · {selected.user.eventsJoined} approved participation records</p>}
        <label className="block text-sm font-medium">Review notes<textarea aria-label="Report review notes" value={reason} onChange={event => setReason(event.target.value)} disabled={busy} minLength={5} maxLength={1000} className="mt-1 block min-h-20 w-full rounded border bg-background p-2" placeholder="Record why you are updating the report (at least 5 characters)." /></label>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {selected.reports.filter(report => !openOnly || isOpenReport(report)).map(report => <article key={report.id} className="space-y-3 rounded-lg border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-medium">Report {report.id}</h3><Badge variant={isOpenReport(report) ? 'warning' : 'secondary'}>{report.status}</Badge></div>
          <p className="text-xs text-muted-foreground">Submitted by {report.reportedBy} · {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Date unavailable'}</p>
          <p className="whitespace-pre-wrap break-words text-sm">{report.description}</p>
          <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" asChild><Link href={report.sourceType === 'event' ? `/events/${report.targetId}` : `/users/${report.targetId}`}>{report.sourceType === 'event' ? 'Activity, media & moderation' : 'Reported profile'}</Link></Button><Button variant="outline" size="sm" asChild><Link href={`/security/safety-reports?search=${encodeURIComponent(report.id)}`}>Safety report</Link></Button></div>
          <div className="flex flex-wrap gap-2">{(['reviewing', 'resolved', 'dismissed'] as const).map(status => <Button key={status} size="sm" variant="outline" disabled={busy || reason.trim().length < 5 || (status === 'reviewing' ? report.status === 'investigating' : report.status === status)} onClick={() => void review(report, status)}>{status === 'reviewing' ? 'Mark investigating' : status === 'resolved' ? 'Resolve' : 'Dismiss'}</Button>)}</div>
        </article>)}
      </div>
    </div>}
    {restrictionTarget && <BanUserDialog key={restrictionTarget.id} userId={restrictionTarget.id} userName={restrictionTarget.name} open onOpenChange={open => { if (!open) setRestrictionTarget(null); }} onConfirm={() => setRestrictionTarget(null)} />}
  </div>;
}
export function InvestigationPanel() { return <ReportInvestigation />; }
