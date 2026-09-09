import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type * as A from "@/types/admin";

type UserRow = {
  account_type: A.AccountType;
  id: number; fullname: string; username: string; email: string;
  profile_image: string | null; nationality: string | null; countrycode: string | null;
  phonenumber: number | null; create_at: string | null; is_active: number | null;
  is_delete: number | null; isverified: number | null; rating: number | null; points: number | null;
};
type EventRow = {
  id: number; title: string; description: string | null; created_by: number;
  created_at: string | null; updated_at: string | null; event_start_time: string | null;
  event_end_time: string | null; display_location: string | null; location: string | null;
  max_participants: number | null; status: string; intent: string | null;
  is_cancelled: boolean | null; is_deleted: boolean | null; media: unknown;
};
type ParticipantRow = { id: number; event_id: number; user_id: number; status: string; joined_at: string | null; created_at: string };
type UserReportRow = { id: number; target_user_id: number; reporter_id: number; reason: string; description: string | null; created_at: string };
type EventReportRow = { id: number; event_id: number; reporter_id: number; reason: string; description: string | null; created_at: string | null };
type ActivityPaymentRow = {
  id: number | string;
  event_id: number | string;
  user_id: number | string;
  provider_order_id: string;
  provider_payment_id: string | null;
  payment_session_id: string | null;
  amount_paisa: number | string;
  currency: string;
  status: string;
  provider_status: string | null;
  idempotency_key: string;
  provider_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
};

const EVENT_COLUMNS = "id,title,description,created_by,created_at,updated_at,event_start_time,event_end_time,display_location,location,max_participants,status,intent,is_cancelled,is_deleted,media";
const PAYMENT_COLUMNS = "id,event_id,user_id,provider_order_id,provider_payment_id,payment_session_id,amount_paisa,currency,status,provider_status,idempotency_key,provider_metadata,created_at,updated_at,paid_at";

function configured() {
  if (!isSupabaseConfigured) throw new Error("Admin data is unavailable because the WeNitro Supabase environment is not configured.");
}
function check(context: string, error: { message: string; code?: string } | null) {
  if (error) throw new Error(`${context}: ${error.message}${error.code ? ` (${error.code})` : ""}`);
}
const dateValue = (value: string | null | undefined) => value ?? new Date(0).toISOString();
const locationOf = (user: UserRow) => user.nationality || user.countrycode || "Not provided";
const paginate = <T,>(rows: T[], page = 1, pageSize = 10) => rows.slice((page - 1) * pageSize, page * pageSize);
const formatNumber = (value: number) => new Intl.NumberFormat("en-IN").format(value);

function userStatus(user: UserRow): A.UserStatus {
  if (user.is_delete === 1) return "banned";
  if (user.is_active === 0) return "suspended";
  return user.isverified === 1 ? "verified" : "active";
}
function categoryOf(value?: string | null): A.EventCategory {
  const text = (value ?? "").toLowerCase();
  if (/sport|badminton|cricket|football/.test(text)) return "sports";
  if (/study|academic|education/.test(text)) return "education";
  if (/music|concert/.test(text)) return "music";
  if (/food|coffee|dining/.test(text)) return "food";
  if (/work|business|network/.test(text)) return "business";
  if (/travel|outdoor|adventure/.test(text)) return "adventure";
  if (/wellness|fitness|yoga/.test(text)) return "wellness";
  return "social";
}
function statusOf(event: EventRow): A.EventStatus {
  if (event.is_cancelled || event.is_deleted || event.status.toLowerCase() === "cancelled") return "cancelled";
  if (event.status.toLowerCase() === "reported") return "reported";
  const now = Date.now();
  if (event.event_end_time && new Date(event.event_end_time).getTime() < now) return "completed";
  if (event.event_start_time && new Date(event.event_start_time).getTime() <= now) return "ongoing";
  return "upcoming";
}
function participantStatus(value: string): A.EventParticipantStatus {
  const status = value.toLowerCase();
  if (status === "approved") return "approved";
  if (["confirmed", "going"].includes(status)) return "confirmed";
  if (["pending", "requested"].includes(status)) return "pending";
  if (["waitlist", "interested"].includes(status)) return "waitlist";
  if (["rejected", "declined"].includes(status)) return "rejected";
  if (status === "left") return "left";
  return "cancelled";
}
function isApprovedParticipant(row: ParticipantRow) {
  return ["approved", "confirmed", "going"].includes(row.status.toLowerCase());
}
function reasonOf(value: string): A.ReportReason {
  const text = value.toLowerCase();
  if (text.includes("harass")) return "Harassment";
  if (text.includes("fake profile") || text.includes("imperson")) return "Fake Profile";
  if (text.includes("fake event")) return "Fake Event";
  if (text.includes("fraud")) return "Fraud";
  if (text.includes("scam")) return "Scam";
  if (text.includes("unsafe")) return "Unsafe Location";
  if (text.includes("mislead")) return "Misleading Information";
  if (text.includes("offensive")) return "Offensive Language";
  return "Spam";
}
const severityOf = (count: number): A.ModerationSeverity => count >= 5 ? "critical" : count >= 3 ? "high" : count >= 2 ? "medium" : "low";
function ago(value: string) {
  const minutes = Math.floor(Math.max(0, Date.now() - new Date(value).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}
function cutoff(range: A.AnalyticsRange | A.DashboardRange) {
  const value = new Date();
  if (range === "7d") value.setDate(value.getDate() - 7);
  else if (range === "30d") value.setDate(value.getDate() - 30);
  else value.setFullYear(value.getFullYear() - 1);
  return value;
}
function buckets(range: A.AnalyticsRange | A.DashboardRange) {
  const count = range === "7d" ? 7 : range === "30d" ? 6 : 12;
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const end = new Date(now);
    if (range === "12m") end.setMonth(now.getMonth() - count + index + 1);
    else end.setDate(now.getDate() - (count - index - 1) * (range === "7d" ? 1 : 5));
    return { label: end.toLocaleDateString("en-IN", range === "12m" ? { month: "short" } : { day: "2-digit", month: "short" }), end };
  });
}

async function users(): Promise<UserRow[]> {
  configured();
  const result = await supabase.rpc("admin_list_users");
  check("Unable to load WeNitro users", result.error);
  return (result.data ?? []) as unknown as UserRow[];
}
async function events(): Promise<EventRow[]> {
  configured();
  const result = await supabase.from("tbl_events").select(EVENT_COLUMNS).order("id", { ascending: false });
  check("Unable to load WeNitro activities", result.error);
  return (result.data ?? []) as unknown as EventRow[];
}
async function participants(): Promise<ParticipantRow[]> {
  configured();
  const result = await supabase.from("tbl_event_participants").select("id,event_id,user_id,status,joined_at,created_at").order("id", { ascending: false });
  check("Unable to load activity participants", result.error);
  return (result.data ?? []) as unknown as ParticipantRow[];
}
async function reports(): Promise<[UserReportRow[], EventReportRow[]]> {
  configured();
  const [userResult, eventResult] = await Promise.all([
    supabase.from("tbl_user_reports").select("id,target_user_id,reporter_id,reason,description,created_at").order("created_at", { ascending: false }),
    supabase.from("tbl_event_reports").select("id,event_id,reporter_id,reason,description,created_at").order("created_at", { ascending: false }),
  ]);
  check("Unable to load user reports", userResult.error);
  check("Unable to load activity reports", eventResult.error);
  return [(userResult.data ?? []) as unknown as UserReportRow[], (eventResult.data ?? []) as unknown as EventReportRow[]];
}
async function categories() {
  configured();
  const [linkResult, categoryResult] = await Promise.all([
    supabase.from("tbl_event_categories").select("event_id,category_id"),
    supabase.from("tbl_categories").select("id,name"),
  ]);
  check("Unable to load activity category links", linkResult.error);
  check("Unable to load activity categories", categoryResult.error);
  const names = new Map((categoryResult.data ?? []).map((row) => [Number(row.id), String(row.name)]));
  return new Map((linkResult.data ?? []).map((row) => [Number(row.event_id), names.get(Number(row.category_id)) ?? "Social"]));
}
function userCounts(eventRows: EventRow[], participantRows: ParticipantRow[]) {
  const hosted = new Map<number, number>();
  const joined = new Map<number, number>();
  eventRows.forEach((row) => hosted.set(row.created_by, (hosted.get(row.created_by) ?? 0) + 1));
  participantRows.filter(isApprovedParticipant).forEach((row) => joined.set(row.user_id, (joined.get(row.user_id) ?? 0) + 1));
  return { hosted, joined };
}
function mapUser(row: UserRow, hosted: Map<number, number>, joined: Map<number, number>): A.User {
  return { accountType: row.account_type === "partner" ? "partner" : "individual", id: String(row.id), name: row.fullname || row.username, username: row.username, email: row.email, avatar: row.profile_image ?? "", status: userStatus(row), joinedAt: dateValue(row.create_at), lastActiveAt: dateValue(row.create_at), location: locationOf(row), eventsHosted: hosted.get(row.id) ?? 0, eventsJoined: joined.get(row.id) ?? 0 };
}
function mapEvent(row: EventRow, userMap: Map<number, UserRow>, counts: Map<number, number>, categoryMap: Map<number, string>): A.Event {
  const start = dateValue(row.event_start_time ?? row.created_at);
  const host = userMap.get(row.created_by);
  return { hostAccountType: host?.account_type === "partner" ? "partner" : "individual", id: String(row.id), title: row.title, host: host?.fullname || host?.username || `User ${row.created_by}`, city: row.display_location || row.location || "Not provided", date: start, attendees: counts.get(row.id) ?? 0, maxAttendees: row.max_participants ?? 0, engagement: counts.get(row.id) ?? 0, status: statusOf(row), category: categoryOf(categoryMap.get(row.id) ?? row.intent), startTime: new Date(start).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), location: row.display_location || row.location || "Not provided" };
}

function normalizedPaymentStatus(row: ActivityPaymentRow): A.PaymentDisplayStatus {
  const values = [row.status, row.provider_status ?? ""].map((value) => value.trim().toLowerCase());
  if (values.some((value) => ["success", "paid", "completed", "captured"].includes(value))) return "completed";
  if (values.some((value) => ["failed", "cancelled", "canceled", "expired", "terminated", "user_dropped"].includes(value))) return "failed";
  return "pending";
}

function minorAmount(value: number | string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function currencyOf(value: string) {
  return value.trim().toUpperCase() || "N/A";
}

async function activityPayments(): Promise<ActivityPaymentRow[]> {
  configured();
  const result = await supabase.from("tbl_activity_payments").select(PAYMENT_COLUMNS).order("created_at", { ascending: false });
  check("Unable to load activity payments", result.error);
  return (result.data ?? []) as unknown as ActivityPaymentRow[];
}

function mapPayment(row: ActivityPaymentRow, userMap: Map<string, UserRow>, eventMap: Map<string, EventRow>): A.BusinessTransaction {
  const user = userMap.get(String(row.user_id));
  const event = eventMap.get(String(row.event_id));
  return {
    id: String(row.id),
    orderId: row.provider_order_id,
    paymentId: row.provider_payment_id,
    userId: String(row.user_id),
    userName: user?.fullname || user?.username || "User " + row.user_id,
    eventId: String(row.event_id),
    eventTitle: event?.title || "Activity " + row.event_id,
    amountMinor: minorAmount(row.amount_paisa),
    currency: currencyOf(row.currency),
    orderStatus: row.provider_status ?? row.status,
    paymentStatus: row.status,
    status: normalizedPaymentStatus(row),
    idempotencyKey: row.idempotency_key,
    failureReason: typeof row.provider_metadata?.failure_reason === "string" ? row.provider_metadata.failure_reason : null,
    metadata: row.provider_metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at,
  };
}

function paymentMetrics(rows: ActivityPaymentRow[]) {
  const completed = rows.filter((row) => normalizedPaymentStatus(row) === "completed");
  const totals = new Map<string, { amountMinor: number; payments: number }>();
  completed.forEach((row) => {
    const currency = currencyOf(row.currency);
    const current = totals.get(currency) ?? { amountMinor: 0, payments: 0 };
    current.amountMinor += minorAmount(row.amount_paisa);
    current.payments += 1;
    totals.set(currency, current);
  });
  const currencyTotals: A.CurrencyRevenueTotal[] = Array.from(totals, ([currency, value]) => ({ currency, ...value }))
    .sort((a, b) => b.amountMinor - a.amountMinor);
  const currency = currencyTotals[0]?.currency ?? currencyOf(rows[0]?.currency ?? "");
  const totalRevenueMinor = currencyTotals.find((item) => item.currency === currency)?.amountMinor ?? 0;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonthMinor = completed
    .filter((row) => currencyOf(row.currency) === currency && new Date(row.paid_at ?? row.updated_at).getTime() >= monthStart.getTime())
    .reduce((sum, row) => sum + minorAmount(row.amount_paisa), 0);
  const now = new Date();
  const trend: A.BusinessRevenuePoint[] = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const revenueMinor = completed
      .filter((row) => {
        const timestamp = new Date(row.paid_at ?? row.updated_at).getTime();
        return currencyOf(row.currency) === currency && timestamp >= start.getTime() && timestamp < end.getTime();
      })
      .reduce((sum, row) => sum + minorAmount(row.amount_paisa), 0);
    return { label: start.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }), revenue: revenueMinor / 100 };
  });
  return {
    currency,
    totalRevenueMinor,
    thisMonthMinor,
    totalPayments: rows.length,
    successfulPayments: completed.length,
    pendingPayments: rows.filter((row) => normalizedPaymentStatus(row) === "pending").length,
    failedPayments: rows.filter((row) => normalizedPaymentStatus(row) === "failed").length,
    currencyTotals,
    trend,
    completed,
  };
}

export async function getDashboardSummary() {
  const snapshot = await getDashboardSnapshot();
  return { metrics: snapshot.metrics, growth: snapshot.growth };
}
export async function getDashboardSnapshot(range: A.DashboardRange = "30d"): Promise<A.DashboardSnapshot> {
  configured();
  const [userRows, eventRows, participantRows, categoryMap, reportRows, vibes, communities, stories, verifications] = await Promise.all([
    users(), events(), participants(), categories(), reports(),
    supabase.from("tbl_activity_vibes").select("id,caption,created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(4),
    supabase.from("tbl_chat_rooms").select("id,title,created_at", { count: "exact" }).eq("room_type", "community").order("created_at", { ascending: false }).limit(4),
    supabase.from("tbl_stories").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("tbl_user_verification").select("id", { count: "exact", head: true }).in("status", ["submitted", "under_review"]),
  ]);
  check("Unable to load vibe summary", vibes.error); check("Unable to load community summary", communities.error);
  check("Unable to load story summary", stories.error); check("Unable to load verification summary", verifications.error);
  const userMap = new Map(userRows.map((row) => [row.id, row]));
  const counts = new Map<number, number>(); participantRows.filter(isApprovedParticipant).forEach((row) => counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1));
  const mapped = eventRows.map((row) => mapEvent(row, userMap, counts, categoryMap));
  const reportCount = reportRows[0].length + reportRows[1].length;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const recent = [
    ...userRows.slice(0, 4).map((row) => ({ id: `user-${row.id}`, title: `${row.fullname || row.username} joined WeNitro`, detail: "Member registration", ago: ago(dateValue(row.create_at)), date: dateValue(row.create_at) })),
    ...eventRows.slice(0, 4).map((row) => ({ id: `event-${row.id}`, title: row.title, detail: "Activity created", ago: ago(dateValue(row.created_at)), date: dateValue(row.created_at) })),
    ...(vibes.data ?? []).map((row) => ({ id: `vibe-${row.id}`, title: row.caption || "New vibe", detail: "Vibe published", ago: ago(dateValue(row.created_at)), date: dateValue(row.created_at) })),
    ...(communities.data ?? []).map((row) => ({ id: `community-${row.id}`, title: row.title || "New community", detail: "Community created", ago: ago(dateValue(row.created_at)), date: dateValue(row.created_at) })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6).map(({ date: _date, ...row }) => row);
  return {
    metrics: [
      { title: "Total members", value: formatNumber(userRows.length), delta: "Live", trend: "flat" },
      { title: "Active activities", value: formatNumber(mapped.filter((row) => row.status === "upcoming" || row.status === "ongoing").length), delta: "Live", trend: "flat" },
      { title: "New signups", value: formatNumber(userRows.filter((row) => new Date(dateValue(row.create_at)) >= today).length), delta: "Today", trend: "flat" },
      { title: "Pending reports", value: formatNumber(reportCount), delta: "Needs review", trend: reportCount ? "up" : "flat" },
      { title: "Communities", value: formatNumber(communities.count ?? 0), delta: "Live", trend: "flat" },
      { title: "Vibes", value: formatNumber(vibes.count ?? 0), delta: "Live", trend: "flat" },
    ],
    growth: buckets(range).map(({ label, end }) => ({ label, users: userRows.filter((row) => new Date(dateValue(row.create_at)) <= end).length, events: eventRows.filter((row) => new Date(dateValue(row.created_at)) <= end).length, revenue: 0 })),
    contentMix: [{ name: "Activities", value: eventRows.length }, { name: "Communities", value: communities.count ?? 0 }, { name: "Vibes", value: vibes.count ?? 0 }, { name: "Stories", value: stories.count ?? 0 }],
    pendingReports: [],
    upcomingEvents: mapped.filter((row) => row.status === "upcoming" || row.status === "ongoing").slice(0, 4).map((row) => ({ id: row.id, title: row.title, host: row.host, schedule: new Date(row.date).toLocaleString("en-IN"), participants: `${row.attendees} / ${row.maxAttendees ?? 0} joined`, tags: [row.category, row.status] })),
    recentActivities: recent,
    systemAlerts: [
      ...(reportCount ? [{ id: "reports", title: `${reportCount} reports require review`, detail: "Open moderation to inspect the live report queue.", severity: "high" as const }] : []),
      ...((verifications.count ?? 0) ? [{ id: "verification", title: `${verifications.count} verification submissions pending`, detail: "Open verification review to process submissions.", severity: "medium" as const }] : []),
    ],
    revenue: { thisMonth: 0, lastMonth: 0, topSponsoredEvents: [] },
  };
}

export async function getUsers(params?: { accountType?: A.AccountType | "all"; search?: string; status?: A.UserStatus | "all"; location?: string; signupDate?: "all" | "last30" | "last90" | "last180" | "thisYear"; participation?: "all" | "high" | "medium" | "low"; page?: number; pageSize?: number }): Promise<{ rows: A.User[]; total: number }> {
  const [userRows, eventRows, participantRows] = await Promise.all([users(), events(), participants()]);
  const counts = userCounts(eventRows, participantRows); const search = params?.search?.toLowerCase().trim() ?? "";
  const limit = new Date();
  if (params?.signupDate === "last30") limit.setDate(limit.getDate() - 30); else if (params?.signupDate === "last90") limit.setDate(limit.getDate() - 90); else if (params?.signupDate === "last180") limit.setDate(limit.getDate() - 180); else if (params?.signupDate === "thisYear") limit.setMonth(0, 1); else limit.setTime(0);
  const rows = userRows.map((row) => mapUser(row, counts.hosted, counts.joined)).filter((row) => {
    const involvement = row.eventsHosted + row.eventsJoined;
    const participationMatch = !params?.participation || params.participation === "all" || (params.participation === "high" && involvement >= 30) || (params.participation === "medium" && involvement >= 12 && involvement < 30) || (params.participation === "low" && involvement < 12);
    return (!search || [row.id, row.name, row.username, row.email].some((value) => value.toLowerCase().includes(search))) && (!params?.status || params.status === "all" || row.status === params.status) && (!params?.location || params.location === "all" || row.location === params.location) && (!params?.accountType || params.accountType === "all" || row.accountType === params.accountType) && new Date(row.joinedAt) >= limit && participationMatch;
  });
  return { rows: paginate(rows, params?.page ?? 1, params?.pageSize ?? 5), total: rows.length };
}
export async function getEvents(params?: { status?: A.EventStatus | "all"; search?: string; category?: string; city?: string; page?: number; pageSize?: number }): Promise<{ rows: A.Event[]; total: number }> {
  const [eventRows, userRows, participantRows, categoryMap] = await Promise.all([events(), users(), participants(), categories()]);
  const userMap = new Map(userRows.map((row) => [row.id, row])); const counts = new Map<number, number>(); participantRows.filter(isApprovedParticipant).forEach((row) => counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1));
  const search = params?.search?.toLowerCase().trim() ?? "";
  const rows = eventRows.map((row) => mapEvent(row, userMap, counts, categoryMap)).filter((row) => (!search || [row.id, row.title, row.host].some((value) => value.toLowerCase().includes(search))) && (!params?.status || params.status === "all" || row.status === params.status) && (!params?.category || params.category === "all" || row.category === params.category) && (!params?.city || params.city === "all" || row.city === params.city));
  return { rows: paginate(rows, params?.page ?? 1, params?.pageSize ?? 5), total: rows.length };
}
export async function getReports(): Promise<A.ReportItem[]> {
  const [userReports, eventReports] = await reports();
  return [...userReports.map((row) => ({ id: `user-${row.id}`, type: "user" as const, target: String(row.target_user_id), priority: "medium" as const, status: "pending" as const, createdAt: row.created_at })), ...eventReports.map((row) => ({ id: `event-${row.id}`, type: "event" as const, target: String(row.event_id), priority: "medium" as const, status: "pending" as const, createdAt: dateValue(row.created_at) }))];
}
export async function getMonetization(): Promise<A.MonetizationSummary> {
  const metrics = paymentMetrics(await activityPayments());
  return {
    currency: metrics.currency,
    totalRevenueMinor: metrics.totalRevenueMinor,
    thisMonthMinor: metrics.thisMonthMinor,
    totalPayments: metrics.totalPayments,
    successfulPayments: metrics.successfulPayments,
    pendingPayments: metrics.pendingPayments,
    failedPayments: metrics.failedPayments,
    currencyTotals: metrics.currencyTotals,
    trend: metrics.trend,
  };
}
export async function getAnalytics() {
  const [userRows, eventRows, participantRows] = await Promise.all([users(), events(), participants()]); const counts = new Map<number, number>(); participantRows.filter(isApprovedParticipant).forEach((row) => counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1)); const userMap = new Map(userRows.map((row) => [row.id, row]));
  return { growth: buckets("30d").map(({ label, end }) => ({ label, users: userRows.filter((row) => new Date(dateValue(row.create_at)) <= end).length, events: eventRows.filter((row) => new Date(dateValue(row.created_at)) <= end).length, revenue: 0 })), topEvents: eventRows.sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0)).slice(0, 5).map((row) => ({ id: String(row.id), title: row.title, engagementScore: counts.get(row.id) ?? 0, city: row.display_location || row.location || "Not provided" })), hostPerformance: Array.from(new Set(eventRows.map((row) => row.created_by))).map((id) => ({ host: userMap.get(id)?.fullname || `User ${id}`, rating: userMap.get(id)?.rating ?? 0, hostedEvents: eventRows.filter((row) => row.created_by === id).length })), geoInsights: [] as A.GeoInsight[] };
}
export async function getNotificationCampaigns(): Promise<A.NotificationCampaign[]> { return []; }

export async function getUserProfile(id: string): Promise<A.UserProfile | null> {
  const numericId = Number(id); if (!Number.isInteger(numericId)) return null;
  const [userRows, eventRows, participantRows, verification] = await Promise.all([users(), events(), participants(), supabase.from("tbl_user_verification").select("verification_type,status,reviewed_at,submitted_at").eq("user_id", numericId).maybeSingle()]);
  check("Unable to load user verification", verification.error); const user = userRows.find((row) => row.id === numericId); if (!user) return null; const counts = userCounts(eventRows, participantRows); const base = mapUser(user, counts.hosted, counts.joined);
  return { ...base, phone: user.phonenumber ? `${user.countrycode ?? ""}${user.phonenumber}` : "Not provided", followers: 0, verificationType: verification.data?.verification_type ?? undefined, verifiedAt: verification.data?.reviewed_at ?? verification.data?.submitted_at ?? undefined };
}
export async function getUserActivity(userId: string): Promise<A.UserActivity[]> {
  const id = Number(userId); if (!Number.isInteger(id)) return []; configured();
  const [hosted, joined, messages, receivedReports] = await Promise.all([supabase.from("tbl_events").select("id,title,created_at").eq("created_by", id), supabase.from("tbl_event_participants").select("id,event_id,created_at").eq("user_id", id), supabase.from("tbl_messages").select("id,created_at").eq("sender_id", id), supabase.from("tbl_user_reports").select("id,created_at").eq("target_user_id", id)]);
  check("Unable to load hosted activity history", hosted.error); check("Unable to load participation history", joined.error); check("Unable to load message history", messages.error); check("Unable to load report history", receivedReports.error);
  return [...(hosted.data ?? []).map((row) => ({ id: `event-${row.id}`, userId, type: "event_created" as const, description: `Created ${row.title}`, date: dateValue(row.created_at) })), ...(joined.data ?? []).map((row) => ({ id: `join-${row.id}`, userId, type: "event_joined" as const, description: `Joined activity ${row.event_id}`, date: row.created_at })), ...(messages.data ?? []).map((row) => ({ id: `message-${row.id}`, userId, type: "message_sent" as const, description: "Sent a chat message", date: dateValue(row.created_at) })), ...(receivedReports.data ?? []).map((row) => ({ id: `report-${row.id}`, userId, type: "report_received" as const, description: "Received a user report", date: row.created_at }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
export async function getVerifiedUsers(): Promise<A.UserProfile[]> { const rows = (await users()).filter((row) => row.isverified === 1); const profiles = await Promise.all(rows.map((row) => getUserProfile(String(row.id)))); return profiles.filter((row): row is A.UserProfile => row !== null); }
export async function getBlockedUsers(): Promise<A.UserProfile[]> { return []; }
export async function getSuspendedUsers(): Promise<A.UserProfile[]> { const rows = (await users()).filter((row) => row.is_active === 0 && row.is_delete !== 1); const profiles = await Promise.all(rows.map((row) => getUserProfile(String(row.id)))); return profiles.filter((row): row is A.UserProfile => row !== null); }
export async function getEventDetail(id: string): Promise<A.EventDetail | null> {
  const numericId = Number(id); if (!Number.isInteger(numericId)) return null; const [eventRows, userRows, participantRows, categoryMap] = await Promise.all([events(), users(), participants(), categories()]); const event = eventRows.find((row) => row.id === numericId); if (!event) return null;
  const counts = new Map([[numericId, participantRows.filter((row) => row.event_id === numericId && isApprovedParticipant(row)).length]]); const mapped = mapEvent(event, new Map(userRows.map((row) => [row.id, row])), counts, categoryMap); let photos = 0; let videos = 0;
  if (Array.isArray(event.media)) event.media.forEach((item) => { const type = typeof item === "object" && item !== null && "type" in item ? String(item.type) : ""; if (type.includes("video")) videos += 1; else photos += 1; });
  return { ...mapped, hostId: String(event.created_by), description: event.description ?? "", isFeatured: false, createdAt: dateValue(event.created_at), mediaCount: { photos, videos }, maxAttendees: event.max_participants ?? 0, location: event.display_location || event.location || "Not provided", startTime: mapped.startTime ?? "" };
}
export async function getEventParticipants(eventId: string, params?: { search?: string; status?: A.EventParticipantStatus | "all"; page?: number; pageSize?: number }): Promise<{ rows: A.EventParticipant[]; total: number }> {
  const id = Number(eventId); if (!Number.isInteger(id)) return { rows: [], total: 0 }; const [participantRows, userRows] = await Promise.all([participants(), users()]); const userMap = new Map(userRows.map((row) => [row.id, row])); const search = params?.search?.toLowerCase().trim() ?? "";
  const rows = participantRows.filter((row) => row.event_id === id).map((row) => { const user = userMap.get(row.user_id); return { id: String(row.id), eventId, userId: String(row.user_id), name: user?.fullname || user?.username || `User ${row.user_id}`, username: user?.username || `user_${row.user_id}`, avatar: user?.profile_image ?? "", joinedDate: row.joined_at ?? row.created_at, status: participantStatus(row.status) }; }).filter((row) => (!search || row.name.toLowerCase().includes(search) || row.username.toLowerCase().includes(search)) && (!params?.status || params.status === "all" || row.status === params.status));
  return { rows: paginate(rows, params?.page, params?.pageSize), total: rows.length };
}

export async function getReportedUsers(params?: { search?: string; severity?: string; page?: number; pageSize?: number }): Promise<{ rows: A.ReportedUser[]; total: number }> {
  const [[userReports], userRows, eventRows, participantRows] = await Promise.all([reports(), users(), events(), participants()]); const grouped = new Map<number, UserReportRow[]>(); userReports.forEach((row) => grouped.set(row.target_user_id, [...(grouped.get(row.target_user_id) ?? []), row])); const userMap = new Map(userRows.map((row) => [row.id, row])); const counts = userCounts(eventRows, participantRows); const search = params?.search?.toLowerCase().trim() ?? "";
  const rows: A.ReportedUser[] = Array.from(grouped).map(([id, items]) => { const user = userMap.get(id); return { id: `reported-user-${id}`, userId: String(id), name: user?.fullname || `User ${id}`, username: user?.username || `user_${id}`, avatar: user?.profile_image ?? "", reportCount: items.length, lastReportDate: items[0].created_at, severity: severityOf(items.length), reasons: Array.from(new Set(items.map((item) => reasonOf(item.reason)))), eventsJoined: counts.joined.get(id) ?? 0, eventsHosted: counts.hosted.get(id) ?? 0, riskScore: Math.min(100, items.length * 20), status: user ? userStatus(user) : "active" }; }).filter((row) => (!search || row.name.toLowerCase().includes(search) || row.username.toLowerCase().includes(search)) && (!params?.severity || params.severity === "all" || row.severity === params.severity));
  return { rows: paginate(rows, params?.page ?? 1, params?.pageSize ?? 6), total: rows.length };
}
export async function getReportedEvents(params?: { search?: string; severity?: string; page?: number; pageSize?: number }): Promise<{ rows: A.ReportedEvent[]; total: number }> {
  const [[, eventReports], eventRows, userRows] = await Promise.all([reports(), events(), users()]); const grouped = new Map<number, EventReportRow[]>(); eventReports.forEach((row) => grouped.set(row.event_id, [...(grouped.get(row.event_id) ?? []), row])); const eventMap = new Map(eventRows.map((row) => [row.id, row])); const userMap = new Map(userRows.map((row) => [row.id, row])); const search = params?.search?.toLowerCase().trim() ?? "";
  const rows: A.ReportedEvent[] = Array.from(grouped).map(([id, items]) => { const event = eventMap.get(id); const host = event ? userMap.get(event.created_by) : undefined; return { id: `reported-event-${id}`, eventId: String(id), title: event?.title || `Activity ${id}`, host: host?.fullname || host?.username || "Unknown host", hostId: String(event?.created_by ?? ""), reportCount: items.length, reason: reasonOf(items[0].reason), severity: severityOf(items.length), date: dateValue(items[0].created_at), city: event?.display_location || event?.location || "Not provided" }; }).filter((row) => (!search || row.title.toLowerCase().includes(search) || row.host.toLowerCase().includes(search)) && (!params?.severity || params.severity === "all" || row.severity === params.severity));
  return { rows: paginate(rows, params?.page ?? 1, params?.pageSize ?? 6), total: rows.length };
}
export async function getChatViolations(params?: { search?: string; severity?: string; page?: number; pageSize?: number }): Promise<{ rows: A.ChatViolation[]; total: number }> { void params; return { rows: [], total: 0 }; }
export async function getImageModerationQueue(params?: { status?: string }): Promise<A.ImageModerationItem[]> { void params; return []; }
export async function getPendingReportItems(params?: { type?: string; page?: number; pageSize?: number }): Promise<{ rows: A.PendingReportItem[]; total: number }> {
  const [userRows, eventRows] = await reports(); const type = params?.type ?? "all"; const rows: A.PendingReportItem[] = [...userRows.map((row) => ({ id: `user-${row.id}`, type: "user" as const, reportedItem: `User ${row.target_user_id}`, reportedItemId: String(row.target_user_id), date: row.created_at })), ...eventRows.map((row) => ({ id: `event-${row.id}`, type: "event" as const, reportedItem: `Activity ${row.event_id}`, reportedItemId: String(row.event_id), date: dateValue(row.created_at) }))].filter((row) => type === "all" || row.type === type); return { rows: paginate(rows, params?.page, params?.pageSize), total: rows.length };
}
export async function getInvestigationCases(): Promise<A.InvestigationCase[]> { return []; }
export async function getInvestigationCase(id: string): Promise<A.InvestigationCase | null> { void id; return null; }
export async function getActionLogs(params?: { search?: string; actionType?: string; targetType?: string; page?: number; pageSize?: number }): Promise<{ rows: A.ActionLogEntry[]; total: number }> { void params; return { rows: [], total: 0 }; }

export async function getBusinessAccounts(params?: { search?: string; status?: A.BusinessStatus | "all"; industry?: string; city?: string; page?: number; pageSize?: number }): Promise<{ rows: A.BusinessAccount[]; total: number }> { void params; return { rows: [], total: 0 }; }
export async function getBusinessProfile(id: string): Promise<A.BusinessProfile | null> { void id; return null; }
export async function getSponsoredEvents(params?: { search?: string; status?: A.SponsoredEventStatus | "all"; businessId?: string; city?: string; page?: number; pageSize?: number }): Promise<{ rows: A.SponsoredEvent[]; total: number }> { void params; return { rows: [], total: 0 }; }
export async function getSponsoredEventDetail(id: string): Promise<A.SponsoredEventDetail | null> { void id; return null; }
export async function getBusinessRevenue(): Promise<A.ActivityPaymentRevenue> {
  const [paymentRows, userRows, eventRows] = await Promise.all([activityPayments(), users(), events()]);
  const metrics = paymentMetrics(paymentRows);
  const userMap = new Map(userRows.map((row) => [String(row.id), row]));
  const eventMap = new Map(eventRows.map((row) => [String(row.id), row]));
  const payerTotals = new Map<string, { amountMinor: number; payments: number }>();
  const eventTotals = new Map<string, { amountMinor: number; payments: number }>();
  metrics.completed.filter((row) => currencyOf(row.currency) === metrics.currency).forEach((row) => {
    const userId = String(row.user_id);
    const eventId = String(row.event_id);
    const payer = payerTotals.get(userId) ?? { amountMinor: 0, payments: 0 };
    const activity = eventTotals.get(eventId) ?? { amountMinor: 0, payments: 0 };
    payer.amountMinor += minorAmount(row.amount_paisa);
    payer.payments += 1;
    payerTotals.set(userId, payer);
    activity.amountMinor += minorAmount(row.amount_paisa);
    activity.payments += 1;
    eventTotals.set(eventId, activity);
  });
  const topPayers: A.PaymentPayerSummary[] = Array.from(payerTotals, ([userId, value]) => ({
    userId,
    userName: userMap.get(userId)?.fullname || userMap.get(userId)?.username || "User " + userId,
    ...value,
  })).sort((a, b) => b.amountMinor - a.amountMinor).slice(0, 10);
  const activityBreakdown: A.PaymentActivitySummary[] = Array.from(eventTotals, ([eventId, value]) => ({
    eventId,
    eventTitle: eventMap.get(eventId)?.title || "Activity " + eventId,
    ...value,
  })).sort((a, b) => b.amountMinor - a.amountMinor).slice(0, 10);
  return {
    currency: metrics.currency,
    totalRevenueMinor: metrics.totalRevenueMinor,
    thisMonthMinor: metrics.thisMonthMinor,
    totalPayments: metrics.totalPayments,
    successfulPayments: metrics.successfulPayments,
    pendingPayments: metrics.pendingPayments,
    failedPayments: metrics.failedPayments,
    currencyTotals: metrics.currencyTotals,
    trend: metrics.trend,
    topPayers,
    activityBreakdown,
  };
}
export async function getBusinessTransactions(params?: { search?: string; status?: A.PaymentDisplayStatus | "all"; page?: number; pageSize?: number }): Promise<{ rows: A.BusinessTransaction[]; total: number }> {
  const [paymentRows, userRows, eventRows] = await Promise.all([activityPayments(), users(), events()]);
  const userMap = new Map(userRows.map((row) => [String(row.id), row]));
  const eventMap = new Map(eventRows.map((row) => [String(row.id), row]));
  const search = params?.search?.toLowerCase().trim() ?? "";
  const status = params?.status ?? "all";
  const rows = paymentRows.map((row) => mapPayment(row, userMap, eventMap)).filter((row) => {
    const searchMatch = !search || [
      row.id,
      row.orderId,
      row.paymentId ?? "",
      row.userId,
      row.userName,
      row.eventId,
      row.eventTitle,
      row.idempotencyKey,
    ].some((value) => value.toLowerCase().includes(search));
    return searchMatch && (status === "all" || row.status === status);
  });
  return { rows: paginate(rows, params?.page, params?.pageSize), total: rows.length };
}

export async function getUserAnalytics(range: A.AnalyticsRange = "30d"): Promise<A.UserAnalyticsData> {
  const rows = await users(); const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0); const start = cutoff(range); const byCity = new Map<string, number>(); rows.forEach((row) => byCity.set(locationOf(row), (byCity.get(locationOf(row)) ?? 0) + 1));
  return { stats: { totalUsers: rows.length, newUsersThisMonth: rows.filter((row) => new Date(dateValue(row.create_at)) >= month).length, activeUsers: rows.filter((row) => row.is_active !== 0 && row.is_delete !== 1).length, verifiedUsers: rows.filter((row) => row.isverified === 1).length }, growth: buckets(range).map(({ label, end }) => ({ label, newUsers: rows.filter((row) => { const date = new Date(dateValue(row.create_at)); return date >= start && date <= end; }).length, totalUsers: rows.filter((row) => new Date(dateValue(row.create_at)) <= end).length })), byCity: Array.from(byCity).map(([city, count]) => ({ city, users: count })), deviceUsage: [], dau: 0, mau: rows.filter((row) => row.is_active !== 0).length, retentionRate: 0 };
}
export async function getEventAnalytics(range: A.AnalyticsRange = "30d"): Promise<A.EventAnalyticsData> {
  const [eventRows, participantRows, categoryMap] = await Promise.all([events(), participants(), categories()]); const start = cutoff(range); const participantCounts = new Map<number, number>(); participantRows.filter(isApprovedParticipant).forEach((row) => participantCounts.set(row.event_id, (participantCounts.get(row.event_id) ?? 0) + 1)); const categoryCounts = new Map<string, number>(); const cityCounts = new Map<string, number>(); eventRows.forEach((row) => { const category = categoryMap.get(row.id) ?? row.intent ?? "Social"; categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1); const city = row.display_location || row.location || "Not provided"; cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1); });
  return { stats: { totalEvents: eventRows.length, activeEvents: eventRows.filter((row) => ["upcoming", "ongoing"].includes(statusOf(row))).length, completedEvents: eventRows.filter((row) => statusOf(row) === "completed").length, cancelledEvents: eventRows.filter((row) => statusOf(row) === "cancelled").length }, creationTrend: buckets(range).map(({ label, end }) => ({ label, created: eventRows.filter((row) => { const date = new Date(dateValue(row.created_at)); return date >= start && date <= end; }).length })), byCategory: Array.from(categoryCounts).map(([name, value]) => ({ name, value, percentage: eventRows.length ? Math.round(value * 100 / eventRows.length) : 0 })), topEvents: eventRows.sort((a, b) => (participantCounts.get(b.id) ?? 0) - (participantCounts.get(a.id) ?? 0)).slice(0, 10).map((row) => ({ name: row.title, participants: participantCounts.get(row.id) ?? 0 })), byCity: Array.from(cityCounts).map(([city, count]) => ({ city, events: count })) };
}
export async function getEngagementMetrics(range: A.AnalyticsRange = "30d"): Promise<A.EngagementMetricsData> {
  configured(); const [joins, messages, saves, shares] = await Promise.all([supabase.from("tbl_event_participants").select("id,created_at"), supabase.from("tbl_messages").select("id,created_at"), supabase.from("tbl_event_saves").select("id,created_at"), supabase.from("tbl_vibe_shares").select("id,created_at")]); check("Unable to load joins", joins.error); check("Unable to load messages", messages.error); check("Unable to load saves", saves.error); check("Unable to load shares", shares.error); const points = buckets(range); const trend = points.map(({ label, end }, index) => { const start = index ? points[index - 1].end : cutoff(range); const within = (value: string | null) => { const date = new Date(dateValue(value)); return date > start && date <= end; }; return { label, joins: (joins.data ?? []).filter((row) => within(row.created_at)).length, messages: (messages.data ?? []).filter((row) => within(row.created_at)).length, shares: (shares.data ?? []).filter((row) => within(row.created_at)).length, bookmarks: (saves.data ?? []).filter((row) => within(row.created_at)).length }; }); const totalJoins = joins.data?.length ?? 0; const totalMessages = messages.data?.length ?? 0;
  return { stats: { totalJoins, messagesSent: totalMessages, bookmarks: saves.data?.length ?? 0, shares: shares.data?.length ?? 0 }, trend, avgParticipants: 0, avgMessages: totalJoins ? totalMessages / totalJoins : 0, avgRating: 0, funnel: [], conversionRate: 0, peakTimes: [], heatmap: [] };
}
export async function getUserGrowthReportData(range: A.AnalyticsRange = "30d"): Promise<A.UserGrowthReportData> { const data = await getUserAnalytics(range); return { stats: data.stats, growth: data.growth, retention: { week: 0, month: 0, quarter: 0 } }; }
export async function getEventEngagementData(range: A.AnalyticsRange = "30d"): Promise<A.EventEngagementData> { const data = await getEngagementMetrics(range); return { stats: { totalViews: 0, eventJoins: data.stats.totalJoins, eventShares: data.stats.shares, eventBookmarks: data.stats.bookmarks }, trend: data.trend.map((row) => ({ label: row.label, views: 0, joins: row.joins, shares: row.shares, bookmarks: row.bookmarks })), avgParticipants: data.avgParticipants, avgShares: 0, avgBookmarks: 0, avgRating: data.avgRating }; }
export async function getTopEventsReportData(): Promise<A.ReportTopEventRow[]> { const [eventRows, userRows, participantRows, categoryMap] = await Promise.all([events(), users(), participants(), categories()]); const userMap = new Map(userRows.map((row) => [row.id, row])); const counts = new Map<number, number>(); participantRows.forEach((row) => counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1)); return eventRows.sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0)).map((row) => ({ id: String(row.id), name: row.title, host: userMap.get(row.created_by)?.fullname || `User ${row.created_by}`, city: row.display_location || row.location || "Not provided", category: categoryMap.get(row.id) ?? row.intent ?? "Social", participants: counts.get(row.id) ?? 0, rating: userMap.get(row.created_by)?.rating ?? 0 })); }
export async function getHostPerformanceReportData(): Promise<A.HostReportRow[]> { const [userRows, eventRows, participantRows] = await Promise.all([users(), events(), participants()]); return userRows.map((user) => { const hosted = eventRows.filter((event) => event.created_by === user.id); const ids = new Set(hosted.map((event) => event.id)); const totalParticipants = participantRows.filter((row) => ids.has(row.event_id)).length; const completed = hosted.filter((event) => statusOf(event) === "completed").length; return { id: String(user.id), name: user.fullname || user.username, eventsHosted: hosted.length, avgRating: user.rating ?? 0, totalParticipants, completionRate: hosted.length ? Math.round(completed * 100 / hosted.length) : 0, score: Math.round((user.rating ?? 0) * 20) }; }).filter((row) => row.eventsHosted > 0).sort((a, b) => b.score - a.score); }
export async function getGeoReportData(): Promise<A.GeoReportData> { const [userData, eventData] = await Promise.all([getUserAnalytics(), getEventAnalytics()]); return { usersByCity: userData.byCity, eventsByCity: eventData.byCity, regionBreakdown: userData.byCity.map((row) => ({ region: row.city, users: row.users, events: eventData.byCity.find((event) => event.city === row.city)?.events ?? 0 })) }; }
export async function getPlatformActivityReportData(range: A.AnalyticsRange = "30d"): Promise<A.PlatformActivityData> { configured(); const [userRows, eventRows, messages, reportRows] = await Promise.all([users(), events(), supabase.from("tbl_messages").select("id,created_at"), reports()]); check("Unable to load messages", messages.error); const today = new Date(); today.setHours(0, 0, 0, 0); const points = buckets(range); return { stats: { dau: userRows.filter((row) => row.is_active !== 0).length, eventsCreatedToday: eventRows.filter((row) => new Date(dateValue(row.created_at)) >= today).length, messagesSent: messages.data?.length ?? 0, reportsSubmitted: reportRows[0].length + reportRows[1].length }, timeline: points.map(({ label, end }, index) => { const start = index ? points[index - 1].end : cutoff(range); const within = (value: string | null) => { const date = new Date(dateValue(value)); return date > start && date <= end; }; return { label, registrations: userRows.filter((row) => within(row.create_at)).length, events: eventRows.filter((row) => within(row.created_at)).length, messages: (messages.data ?? []).filter((row) => within(row.created_at)).length, reports: [...reportRows[0], ...reportRows[1]].filter((row) => within(row.created_at)).length }; }), peakTime: "Not tracked", peakDay: "Not tracked" }; }

export async function getCoinRules(params?: { search?: string; page?: number; pageSize?: number }): Promise<{ rows: A.CoinRule[]; total: number }> { void params; return { rows: [], total: 0 }; }
export async function getRewardCatalog(params?: { search?: string; status?: A.RewardStatus | "all"; page?: number; pageSize?: number }): Promise<{ rows: A.RewardItem[]; total: number }> { void params; return { rows: [], total: 0 }; }
export async function getCoupons(params?: { search?: string; status?: A.CouponStatus | "all"; page?: number; pageSize?: number }): Promise<{ rows: A.Coupon[]; total: number }> { void params; return { rows: [], total: 0 }; }
export async function getLeaderboard(period: A.LeaderboardPeriod = "monthly"): Promise<A.LeaderboardEntry[]> { void period; const [userRows, eventRows, participantRows] = await Promise.all([users(), events(), participants()]); const counts = userCounts(eventRows, participantRows); return userRows.sort((a, b) => (b.points ?? 0) - (a.points ?? 0)).map((row, index) => ({ rank: index + 1, userId: String(row.id), name: row.fullname || row.username, username: row.username, avatar: row.profile_image ?? "", coinsEarned: row.points ?? 0, eventsHosted: counts.hosted.get(row.id) ?? 0, eventsJoined: counts.joined.get(row.id) ?? 0, referrals: 0 })); }
export async function getAchievementBadges(params?: { search?: string; status?: A.BadgeStatus | "all"; page?: number; pageSize?: number }): Promise<{ rows: A.AchievementBadge[]; total: number }> { configured(); const [badges, awards] = await Promise.all([supabase.from("tbl_badges").select("id,name,description,icon,slug,created_at").order("id"), supabase.from("tbl_user_badges").select("badge_id")]); check("Unable to load badges", badges.error); check("Unable to load badge awards", awards.error); const counts = new Map<number, number>(); (awards.data ?? []).forEach((row) => counts.set(Number(row.badge_id), (counts.get(Number(row.badge_id)) ?? 0) + 1)); const search = params?.search?.toLowerCase().trim() ?? ""; const rows: A.AchievementBadge[] = (badges.data ?? []).map((row) => ({ id: String(row.id), name: row.name, description: row.description, icon: row.icon ?? "", requirement: row.description, awardedCount: counts.get(Number(row.id)) ?? 0, rewardCoins: 0, status: "active" as const })).filter((row) => (!search || row.name.toLowerCase().includes(search) || row.requirement.toLowerCase().includes(search)) && (!params?.status || params.status === "all" || row.status === params.status)); return { rows: paginate(rows, params?.page ?? 1, params?.pageSize ?? 8), total: rows.length }; }
export async function getGamificationMetrics(): Promise<A.GamificationMetrics> { const rows = await users(); const total = rows.reduce((sum, row) => sum + (row.points ?? 0), 0); return { totalCoinsDistributed: total, rewardsRedeemed: 0, activeRewardUsers: rows.filter((row) => (row.points ?? 0) > 0).length, topCoinAction: "Not tracked", avgCoinsPerUser: rows.length ? Math.round(total / rows.length) : 0 }; }

export async function getPushCampaigns(params?: { search?: string; status?: A.PushCampaignStatus | "all"; page?: number; pageSize?: number }): Promise<{ rows: A.PushCampaign[]; total: number }> { void params; return { rows: [], total: 0 }; }
export async function getEmailCampaigns(params?: { search?: string; status?: A.EmailCampaignStatus | "all"; page?: number; pageSize?: number }): Promise<{ rows: A.EmailCampaign[]; total: number }> { void params; return { rows: [], total: 0 }; }
export async function getSystemAlerts(params?: { search?: string; status?: A.AlertStatus | "all"; page?: number; pageSize?: number }): Promise<{ rows: A.SystemAlertConfig[]; total: number }> { void params; return { rows: [], total: 0 }; }
export async function getSecurityBlockedUsers(params?: { search?: string; reason?: A.BlockReason | "all"; country?: string; page?: number; pageSize?: number }): Promise<{ rows: A.SecurityBlockedUser[]; total: number }> { void params; return { rows: [], total: 0 }; }
export async function getSafetyReports(params?: { search?: string; status?: A.SafetyReportStatus | "all"; reportType?: A.SafetyReportType | "all"; page?: number; pageSize?: number }): Promise<{ rows: A.SafetyReport[]; total: number }> { const [reportRows, userRows] = await Promise.all([reports(), users()]); const userMap = new Map(userRows.map((row) => [row.id, row])); const search = params?.search?.toLowerCase().trim() ?? ""; const rows: A.SafetyReport[] = reportRows[0].map((row) => { const target = userMap.get(row.target_user_id); const reporter = userMap.get(row.reporter_id); const text = row.reason.toLowerCase(); const reportType: A.SafetyReportType = text.includes("harass") ? "harassment" : text.includes("fake") ? "impersonation" : text.includes("spam") ? "spam" : "other"; return { id: String(row.id), reportType, reportedUser: target?.fullname || `User ${row.target_user_id}`, reportedUserId: String(row.target_user_id), reportedBy: reporter?.fullname || `User ${row.reporter_id}`, reportedByAvatar: reporter?.profile_image ?? "", status: "pending" as const, description: row.description || row.reason, evidenceCount: 0, createdAt: row.created_at }; }).filter((row) => (!search || row.id.includes(search) || row.reportedUser.toLowerCase().includes(search)) && (!params?.reportType || params.reportType === "all" || row.reportType === params.reportType) && (!params?.status || params.status === "all" || row.status === params.status)); return { rows: paginate(rows, params?.page ?? 1, params?.pageSize ?? 6), total: rows.length }; }
export async function getAbuseAlerts(params?: { search?: string; severity?: "low" | "medium" | "high" | "all"; page?: number; pageSize?: number }): Promise<{ rows: A.AbuseAlert[]; total: number; aiStats: A.AiModerationStats }> { void params; return { rows: [], total: 0, aiStats: { flaggedMessages: 0, flaggedImages: 0, potentialFakeEvents: 0 } }; }
export async function getIpActivities(params?: { search?: string; status?: A.IpStatus | "all"; page?: number; pageSize?: number }): Promise<{ rows: A.IpActivity[]; total: number }> { void params; return { rows: [], total: 0 }; }
export async function getSecurityLogs(params?: { search?: string; category?: "all" | "admin_action" | "user_action" | "login_activity" | "security_change"; page?: number; pageSize?: number }): Promise<{ rows: A.SecurityLogEntry[]; total: number }> { void params; return { rows: [], total: 0 }; }
export async function getSecurityInsights(): Promise<A.SecurityInsights> { const [userRows, reportRows] = await Promise.all([users(), reports()]); return { totalBlockedUsers: userRows.filter((row) => row.is_delete === 1).length, activeSafetyReports: reportRows[0].length + reportRows[1].length, suspiciousIps: 0, abuseAlertsToday: 0 }; }
export async function getNotificationStats(): Promise<A.NotificationStats> { configured(); const result = await supabase.from("tbl_notifications").select("id,is_read"); check("Unable to load notification statistics", result.error); const totalSent = result.data?.length ?? 0; const opened = (result.data ?? []).filter((row) => row.is_read).length; return { totalSent, openRate: totalSent ? Math.round(opened * 100 / totalSent) : 0, clickRate: 0, unsubscribed: 0 }; }

export async function getPlatformConfig(): Promise<A.PlatformConfig> { return { platformName: "WeNitro", supportEmail: "", defaultCurrency: "INR", defaultTimezone: "Asia/Kolkata", allowEventCreation: true, allowGuestBrowsing: false, requireEmailVerification: true, autoApproveEvents: false }; }
export async function getEventCategories(): Promise<A.EventCategoryItem[]> { configured(); const result = await supabase.from("tbl_categories").select("id,name").order("name"); check("Unable to load event categories", result.error); return (result.data ?? []).map((row, index) => ({ id: String(row.id), name: row.name, icon: "", description: "", displayOrder: index + 1, status: "active" })); }
export async function getNotificationTemplates(): Promise<A.NotificationTemplate[]> { return []; }
export async function getEmailTemplates(): Promise<A.EmailTemplate[]> { return []; }
export async function getSupportedLanguages(): Promise<A.SupportedLanguage[]> { return []; }
export async function getFeatureToggles(): Promise<A.FeatureToggle[]> { return []; }
export async function getSettingsSummary(): Promise<A.SettingsSummary> { return { activeCategories: (await getEventCategories()).length, notificationTemplates: 0, emailTemplates: 0, enabledLanguages: 0 }; }

export async function getAdminRoles(): Promise<A.AdminRoleDefinition[]> { const accounts = await getAdminAccounts(); return ["Super Admin", "Moderator", "Support Admin", "Content Manager", "Analytics Manager"].map((name) => ({ id: name.toLowerCase().replaceAll(" ", "-"), name: name as A.AdminRoleType, description: "Role is managed through trusted Supabase app metadata.", assignedAdmins: accounts.filter((account) => account.role === name).length, createdAt: "" })); }
export async function getRolePermissions(): Promise<A.RolePermissions[]> { return []; }
export async function getAdminAccounts(): Promise<A.AdminAccount[]> { configured(); const result = await supabase.auth.getUser(); if (result.error) throw new Error(`Unable to load the signed-in administrator: ${result.error.message}`); const user = result.data.user; if (!user) return []; const rawRole = user.app_metadata.role; const role: A.AdminRoleType = rawRole === "super_admin" ? "Super Admin" : rawRole === "admin" ? "Moderator" : "Support Admin"; return [{ id: user.id, fullName: String(user.user_metadata.full_name ?? user.email ?? "Administrator"), email: user.email ?? "", phone: user.phone ?? "", role, status: "active", twoFAEnabled: (user.factors?.length ?? 0) > 0, createdAt: user.created_at, lastLogin: user.last_sign_in_at ?? user.created_at, avatar: String(user.user_metadata.avatar_url ?? "") }]; }
export async function getAdminActivityLogs(): Promise<A.AdminActivityLogEntry[]> { return []; }
export async function getAccessControlConfig(): Promise<A.AccessControlConfig> { return { allowedIps: [], sessionTimeoutMinutes: 60, maxLoginAttempts: 5, requireTwoFA: false, restrictToOfficeIp: false, autoLogoutInactive: true, policies: [] }; }
export async function getAdminSecurityOverview(): Promise<A.AdminSecurityOverview> { const accounts = await getAdminAccounts(); return { totalAdmins: accounts.length, activeAdmins: accounts.filter((row) => row.status === "active").length, failedLoginAttempts: 0, lastAdminLogin: accounts[0]?.lastLogin ?? "", suspendedAdmins: accounts.filter((row) => row.status === "suspended").length, twoFAEnabledCount: accounts.filter((row) => row.twoFAEnabled).length }; }

// These entities have no dedicated admin screens yet, but exposing their live rows here
// keeps future screens on the same canonical legacy schema rather than reintroducing fixtures.
export async function getCommunities() { configured(); const [rooms, members] = await Promise.all([supabase.from("tbl_chat_rooms").select("id,title,tagline,description,visibility,created_at,created_by,image_url,cover_url").eq("room_type", "community").order("created_at", { ascending: false }), supabase.from("tbl_chat_participants").select("room_id")]); check("Unable to load communities", rooms.error); check("Unable to load community members", members.error); const counts = new Map<number, number>(); (members.data ?? []).forEach((row) => { if (row.room_id !== null) counts.set(Number(row.room_id), (counts.get(Number(row.room_id)) ?? 0) + 1); }); return (rooms.data ?? []).map((row) => ({ ...row, id: String(row.id), created_by: row.created_by === null ? null : String(row.created_by), memberCount: counts.get(Number(row.id)) ?? 0 })); }
export async function getVibes() { configured(); const result = await supabase.from("tbl_activity_vibes").select("id,user_id,event_id,caption,media_type,media_url,likes_count,visibility,created_at").order("created_at", { ascending: false }); check("Unable to load vibes", result.error); return result.data ?? []; }
export async function getStories() { configured(); const result = await supabase.from("tbl_stories").select("id,user_id,caption,media_type,media_url,created_at,expires_at,deleted_at").order("created_at", { ascending: false }); check("Unable to load stories", result.error); return result.data ?? []; }
export async function getVerificationSubmissions() { configured(); const result = await supabase.from("tbl_user_verification").select("id,user_id,verification_type,status,document_path,document_mime,submitted_at,reviewed_at,review_notes,created_at,updated_at").order("created_at", { ascending: false }); check("Unable to load verification submissions", result.error); return result.data ?? []; }
export async function reviewVerification(id: number, status: "approved" | "rejected", notes = "Reviewed in WeNitro Admin") { configured(); const result = await supabase.rpc("admin_review_verification", { p_verification_id: id, p_status: status, p_review_notes: notes }); check("Unable to review verification", result.error); return result.data; }
export async function getUserInterests(userId?: string) { configured(); let query = supabase.from("tbl_user_interests").select("id,user_id,category_id,created_at,tbl_categories(name)").order("created_at", { ascending: false }); if (userId !== undefined) query = query.eq("user_id", Number(userId)); const result = await query; check("Unable to load user interests", result.error); return result.data ?? []; }
