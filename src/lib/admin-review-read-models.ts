import { getEvents, getSafetyReports, getUsers } from '@/lib/api';
import type { Event, SafetyReport, User } from '@/types/admin';

export type ReviewScope = 'all' | 'chat' | 'image' | 'abuse';
export type InvestigationCase = { id: string; user: User | null; label: string; reports: SafetyReport[]; openCount: number; latestAt: string };
export const isOpenReport = (report: SafetyReport) => report.status === 'pending' || report.status === 'investigating';

/** Topic search over submitted reports, not an automated classifier or finding. */
export function matchesReviewScope(report: SafetyReport, scope: ReviewScope) {
  if (scope === 'all' || scope === 'abuse') return true;
  const text = `${report.reportType} ${report.description}`;
  return scope === 'chat'
    ? /chat|message|harass|spam/i.test(text)
    : /image|photo|picture|video|nudity|nude|graphic|explicit/i.test(text);
}

export function buildInvestigationCases(reports: SafetyReport[], users: User[], scope: ReviewScope = 'all'): InvestigationCase[] {
  const byUser = new Map(users.map(user => [user.id, user]));
  const cases = new Map<string, InvestigationCase>();
  for (const report of reports.filter(report => matchesReviewScope(report, scope))) {
    // Keep unavailable/deleted targets separate; never combine unrelated unknown users.
    const key = report.reportedUserId || `${report.sourceType}:${report.targetId}`;
    const user = byUser.get(report.reportedUserId) ?? null;
    const item = cases.get(key) ?? { id: key, user, label: user?.name || report.reportedUser, reports: [], openCount: 0, latestAt: '' };
    item.reports.push(report);
    if (isOpenReport(report)) item.openCount++;
    if (report.createdAt > item.latestAt) item.latestAt = report.createdAt;
    cases.set(key, item);
  }
  return [...cases.values()].map(item => ({ ...item, reports: [...item.reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }))
    .sort((a, b) => b.openCount - a.openCount || b.latestAt.localeCompare(a.latestAt));
}

export async function getReviewCases(scope: ReviewScope) {
  // Existing adapters load the authorized dataset before applying client pagination.
  const [reports, users] = await Promise.all([getSafetyReports({ page: 1, pageSize: Number.MAX_SAFE_INTEGER }), getUsers({ page: 1, pageSize: Number.MAX_SAFE_INTEGER })]);
  return buildInvestigationCases(reports.rows, users.rows, scope);
}

export function selectPartnerActivities(events: Event[]) {
  return events.filter(event => event.hostAccountType === 'partner');
}
export async function getPartnerActivities() {
  const result = await getEvents({ page: 1, pageSize: Number.MAX_SAFE_INTEGER });
  return selectPartnerActivities(result.rows);
}
