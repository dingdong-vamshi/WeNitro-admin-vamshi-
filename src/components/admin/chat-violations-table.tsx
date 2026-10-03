"use client";
import { ReportInvestigation } from './investigation-panel';
export function ChatViolationsTable() {
  return <div className="space-y-4"><p className="rounded-lg border bg-muted/30 p-4 text-sm">This view searches submitted reports mentioning chat, messages, harassment or spam. Automated message classification and message-level evidence are not configured. Review the member’s submitted description and account history before acting; no private chat transcript or inferred violation is fabricated.</p><ReportInvestigation scope="chat" /></div>;
}
