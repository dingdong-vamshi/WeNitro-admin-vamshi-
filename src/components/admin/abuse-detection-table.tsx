"use client";
import { ReportInvestigation } from './investigation-panel';
export function AbuseDetectionTable() {
  return <div className="space-y-4"><p className="rounded-lg border bg-muted/30 p-4 text-sm">Automated abuse detection is not configured. This queue uses actual member reports and current account status. Report counts are shown for review and do not automatically establish abuse or trigger a restriction.</p><ReportInvestigation scope="abuse" /></div>;
}
