import {
  actionLogs,
  achievementBadges,
  aiModerationStats,
  abuseAlerts,
  businessAccounts,
  businessProfiles,
  businessRevenueData,
  businessTransactions,
  chatViolations,
  coinRules,
  coupons,
  dashboardBaseSnapshot,
  dashboardMetrics,
  eventRevenueBreakdown,
  eventDetails,
  eventParticipants,
  events,
  gamificationMetrics,
  geoInsights,
  getEngagementByRange,
  getEventAnalyticsByRange,
  getGrowthByRange,
  getUserAnalyticsByRange,
  growthData,
  hostPerformance,
  imageModerationQueue,
  investigationCases,
  leaderboardAllTime,
  leaderboardMonthly,
  leaderboardWeekly,
  notificationCampaigns,
  pendingReportItems,
  reportedEvents,
  reportedUsers,
  reports,
  revenueData,
  rewardCatalog,
  sponsoredEventDetails,
  sponsoredEvents,
  topEvents,
  topSponsors,
  userActivities,
  userProfiles,
  users,
  getUserGrowthReport,
  getEventEngagement,
  topEventsReport,
  hostPerformanceReport,
  geoReportData,
  getPlatformActivityData,
  pushCampaigns,
  emailCampaigns,
  ipActivities,
  safetyReports,
  securityBlockedUsers,
  securityInsights,
  securityLogs,
  systemAlerts,
  notificationStats,
  platformConfig,
  settingsCategories,
  notificationTemplates,
  emailTemplates,
  supportedLanguages,
  featureToggles,
  settingsSummary,
  adminRoles,
  rolePermissionsData,
  adminAccounts,
  adminActivityLogs,
  accessControlConfig,
  adminSecurityOverview,
} from "@/lib/mock-data";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
  AchievementBadge,
  ActionLogEntry,
  AnalyticsRange,
  BadgeStatus,
  BusinessAccount,
  BusinessProfile,
  BusinessRevenuePoint,
  BusinessStatus,
  BusinessTransaction,
  ChatViolation,
  CoinRule,
  Coupon,
  CouponStatus,
  DashboardRange,
  DashboardSnapshot,
  EngagementMetricsData,
  EventAnalyticsData,
  EventDetail,
  Event,
  EventCategory,
  EventParticipant,
  EventRevenueItem,
  EventStatus,
  GamificationMetrics,
  ImageModerationItem,
  InvestigationCase,
  LeaderboardEntry,
  LeaderboardPeriod,
  PendingReportItem,
  RewardItem,
  RewardStatus,
  UserAnalyticsData,
  ReportedEvent,
  ReportedUser,
  SponsoredEvent,
  SponsoredEventDetail,
  SponsoredEventStatus,
  TopSponsor,
  UserActivity,
  User,
  UserProfile,
  UserStatus,
  UserGrowthReportData,
  EventEngagementData,
  ReportTopEventRow,
  HostReportRow,
  GeoReportData,
  PlatformActivityData,
  PushCampaign,
  PushCampaignStatus,
  EmailCampaign,
  EmailCampaignStatus,
  SystemAlertConfig,
  AlertStatus,
  NotificationStats,
  AbuseAlert,
  AiModerationStats,
  IpActivity,
  IpStatus,
  SafetyReport,
  SafetyReportStatus,
  SafetyReportType,
  SecurityBlockedUser,
  BlockReason,
  SecurityInsights,
  SecurityLogEntry,
  PlatformConfig,
  EventCategoryItem,
  NotificationTemplate,
  EmailTemplate,
  SupportedLanguage,
  FeatureToggle,
  SettingsSummary,
} from "@/types/admin";

const latency = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

type SupabaseProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  created_at: string;
  last_active_at: string | null;
  trust_score: number | null;
  deleted_at: string | null;
};

type SupabaseActivityRow = {
  id: string;
  title: string;
  category: string;
  status: string;
  location_name: string | null;
  starts_at: string;
  capacity: number | null;
  owner_id: string;
  match_score: number | null;
  created_at?: string;
  profiles?: { full_name: string | null; username: string | null } | Array<{ full_name: string | null; username: string | null }> | null;
  participants?: Array<{ count: number }> | null;
};

const mapStatus = (row: SupabaseProfileRow): UserStatus => {
  if (row.deleted_at) return "banned";
  return (row.trust_score ?? 0) >= 85 ? "verified" : "active";
};

const toUser = (
  row: SupabaseProfileRow,
  hostedByUser: Map<string, number>,
  joinedByUser: Map<string, number>,
) => {
  const name = row.full_name || row.username || "WeNitro member";
  return {
    id: row.id,
    name,
    username: row.username || `user_${row.id.slice(0, 8)}`,
    email: "Protected by Auth",
    avatar: row.avatar_url || "",
    status: mapStatus(row),
    joinedAt: row.created_at,
    lastActiveAt: row.last_active_at || row.created_at,
    location: row.location || "Bhubaneswar",
    eventsHosted: hostedByUser.get(row.id) ?? 0,
    eventsJoined: joinedByUser.get(row.id) ?? 0,
  };
};

const toEventCategory = (category: string): EventCategory => {
  const normalized = category.toLowerCase();
  if (normalized.includes("sport") || normalized.includes("badminton") || normalized.includes("cricket")) return "sports";
  if (normalized.includes("study") || normalized.includes("academic")) return "education";
  if (normalized.includes("music")) return "music";
  if (normalized.includes("food") || normalized.includes("coffee")) return "food";
  if (normalized.includes("work") || normalized.includes("business")) return "business";
  if (normalized.includes("travel") || normalized.includes("outdoor")) return "adventure";
  if (normalized.includes("wellness") || normalized.includes("fitness")) return "wellness";
  return "social";
};

const toEventStatus = (status: string, startsAt: string): EventStatus => {
  if (status === "cancelled") return "cancelled";
  if (status === "completed") return "completed";
  if (status === "reported") return "reported";
  return new Date(startsAt).getTime() <= Date.now() ? "ongoing" : "upcoming";
};

const toEvent = (row: SupabaseActivityRow) => {
  const attendees = row.participants?.[0]?.count ?? 0;
  const date = new Date(row.starts_at);
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return {
    id: row.id,
    title: row.title,
    host: profile?.full_name || profile?.username || "WeNitro host",
    city: row.location_name || "Bhubaneswar",
    date: date.toISOString(),
    attendees,
    maxAttendees: row.capacity ?? 20,
    engagement: Math.max(row.match_score ?? 72, attendees * 12),
    status: toEventStatus(row.status, row.starts_at),
    category: toEventCategory(row.category),
    startTime: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    location: row.location_name || "Bhubaneswar",
  };
};

// Dynamic table names prevent Supabase's generated builder type from narrowing here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function countRows(table: string, filter?: (query: any) => any) {
  const base = supabase.from(table).select("id", { count: "exact", head: true });
  const query = filter ? filter(base) : base;
  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

export async function getDashboardSummary() {
  await latency();
  return {
    metrics: dashboardMetrics,
    growth: growthData,
  };
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function timeAgo(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function buildLiveGrowth(
  range: DashboardRange,
  profiles: Array<{ created_at: string }>,
  activities: Array<{ created_at?: string }>,
) {
  const now = new Date();
  const periods = range === "7d" ? 7 : range === "30d" ? 6 : 12;

  return Array.from({ length: periods }, (_, index) => {
    let end: Date;
    let label: string;

    if (range === "12m") {
      end = new Date(now.getFullYear(), now.getMonth() - (periods - index - 1) + 1, 0, 23, 59, 59);
      label = end.toLocaleDateString("en-IN", { month: "short" });
    } else {
      const step = range === "7d" ? 1 : 5;
      end = new Date(now);
      end.setDate(now.getDate() - (periods - index - 1) * step);
      end.setHours(23, 59, 59, 999);
      label = end.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    }

    return {
      label,
      users: profiles.filter((row) => new Date(row.created_at) <= end).length,
      events: activities.filter((row) => row.created_at && new Date(row.created_at) <= end).length,
      revenue: 0,
    };
  });
}

export async function getDashboardSnapshot(range: DashboardRange = "30d"): Promise<DashboardSnapshot> {
  if (isSupabaseConfigured) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const [
      totalUsers,
      activeEvents,
      eventsToday,
      newSignups,
      pendingReports,
      vibesCount,
      communitiesCount,
      profilesResult,
      activitiesResult,
      vibesResult,
      communitiesResult,
    ] = await Promise.all([
      countRows("profiles"),
      countRows("activities", (query) => query.eq("status", "published")),
      countRows("activities", (query) => query.gte("starts_at", today.toISOString()).lt("starts_at", tomorrow.toISOString())),
      countRows("profiles", (query) => query.gte("created_at", today.toISOString())),
      countRows("content_reports", (query) => query.in("status", ["open", "reviewing"])),
      countRows("vibes"),
      countRows("communities"),
      supabase.from("profiles").select("id,username,full_name,created_at").order("created_at", { ascending: false }).limit(2000),
      supabase
        .from("activities")
        .select("id,title,category,status,location_name,starts_at,capacity,owner_id,match_score,created_at,profiles!activities_owner_id_fkey(full_name,username),participants(count)")
        .order("created_at", { ascending: false })
        .limit(2000),
      supabase.from("vibes").select("id,caption,created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("communities").select("id,name,created_at").order("created_at", { ascending: false }).limit(100),
    ]);

    const profileRows = (profilesResult.data ?? []) as Array<{ id: string; username: string | null; full_name: string | null; created_at: string }>;
    const activityRows = (activitiesResult.data ?? []) as unknown as SupabaseActivityRow[];
    const upcomingEvents = activityRows
      .map(toEvent)
      .filter((event) => event.status === "upcoming" || event.status === "ongoing")
      .slice(0, 4)
      .map((event) => ({
        id: event.id,
        title: event.title,
        host: event.host,
        schedule: new Date(event.date).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
        participants: `${event.attendees} / ${event.maxAttendees ?? 20} joined`,
        tags: [event.category, event.status],
      }));

    const recentActivities = [
      ...profileRows.slice(0, 4).map((row) => ({
        id: `profile-${row.id}`,
        title: `${row.full_name || row.username || "A new member"} joined WeNitro`,
        detail: "New member registration",
        ago: timeAgo(row.created_at),
        date: row.created_at,
      })),
      ...activityRows.slice(0, 4).map((row) => ({
        id: `activity-${row.id}`,
        title: row.title,
        detail: "Activity published",
        ago: timeAgo(row.created_at || row.starts_at),
        date: row.created_at || row.starts_at,
      })),
      ...((vibesResult.data ?? []) as Array<{ id: string; caption: string | null; created_at: string }>).slice(0, 3).map((row) => ({
        id: `vibe-${row.id}`,
        title: row.caption || "A new vibe was published",
        detail: "Community vibe",
        ago: timeAgo(row.created_at),
        date: row.created_at,
      })),
      ...((communitiesResult.data ?? []) as Array<{ id: string; name: string; created_at: string }>).slice(0, 3).map((row) => ({
        id: `community-${row.id}`,
        title: `${row.name} community created`,
        detail: "Community launch",
        ago: timeAgo(row.created_at),
        date: row.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)
      .map(({ date, ...activity }) => {
        void date;
        return activity;
      });

    return {
      metrics: [
        { title: "Total members", value: formatInr(totalUsers), delta: "Profiles", trend: "up" },
        { title: "Published activities", value: formatInr(activeEvents), delta: "Activities", trend: "up" },
        { title: "Activities today", value: formatInr(eventsToday), delta: "Today", trend: "flat" },
        { title: "New signups", value: formatInr(newSignups), delta: "Today", trend: "flat" },
        { title: "Communities", value: formatInr(communitiesCount), delta: "Total", trend: "up" },
        { title: "Vibes", value: formatInr(vibesCount), delta: "Total", trend: "up" },
      ],
      growth: buildLiveGrowth(range, profileRows, activityRows),
      contentMix: [
        { name: "Members", value: totalUsers },
        { name: "Activities", value: activityRows.length },
        { name: "Communities", value: communitiesCount },
        { name: "Vibes", value: vibesCount },
      ],
      pendingReports: [],
      upcomingEvents,
      recentActivities,
      systemAlerts: [
        {
          id: "supabase-sync",
          title: "Database sync healthy",
          detail: `${totalUsers} profiles, ${activeEvents} published activities, ${communitiesCount} communities`,
          severity: "medium",
        },
        ...(pendingReports > 0
          ? [{ id: "open-reports", title: `${pendingReports} reports need review`, detail: "Open the moderation queue to investigate.", severity: "high" as const }]
          : []),
      ],
      revenue: { thisMonth: 0, lastMonth: 0, topSponsoredEvents: [] },
    };
  }

  await latency(160);

  const pulse = Math.floor(Date.now() / 15000) % 5;
  const metricDelta = [0, 6, 10, 3, 8][pulse];

  const metrics = [
    { title: "Total Users", value: formatInr(25430 + metricDelta), delta: "+8.4%", trend: "up" as const },
    { title: "Active Events", value: formatInr(312 + (metricDelta % 4)), delta: "24 ongoing", trend: "up" as const },
    { title: "Events Today", value: formatInr(48 + (metricDelta % 3)), delta: "12 live now", trend: "up" as const },
    { title: "New Signups", value: formatInr(120 + (metricDelta % 5)), delta: "Today", trend: "up" as const },
    { title: "Pending Reports", value: formatInr(12 + (pulse % 2)), delta: "4 urgent", trend: "down" as const },
    { title: "Revenue", value: `INR ${formatInr(240000 + metricDelta * 500)}`, delta: "+24%", trend: "up" as const },
  ];

  return {
    metrics,
    growth: getGrowthByRange(range),
    pendingReports: dashboardBaseSnapshot.pendingReports,
    upcomingEvents: dashboardBaseSnapshot.upcomingEvents,
    recentActivities: dashboardBaseSnapshot.recentActivities,
    systemAlerts: dashboardBaseSnapshot.systemAlerts,
    revenue: dashboardBaseSnapshot.revenue,
  };
}

export async function getUsers(params?: {
  search?: string;
  status?: UserStatus | "all";
  location?: string;
  signupDate?: "all" | "last30" | "last90" | "last180" | "thisYear";
  participation?: "all" | "high" | "medium" | "low";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: User[]; total: number }> {
  const search = params?.search?.toLowerCase() ?? "";
  const status = params?.status ?? "all";
  const location = params?.location ?? "all";
  const signupDate = params?.signupDate ?? "all";
  const participation = params?.participation ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 5;

  if (isSupabaseConfigured) {
    const offset = (page - 1) * pageSize;
    const to = offset + pageSize - 1;
    if (status === "blocked" || status === "suspended") return { rows: [], total: 0 };

    const profileQuery = supabase
      .from("profiles")
      .select("id,username,full_name,avatar_url,location,created_at,last_active_at,trust_score,deleted_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, to);

    if (status === "banned") profileQuery.not("deleted_at", "is", null);
    else profileQuery.is("deleted_at", null);
    if (status === "verified") profileQuery.gte("trust_score", 85);
    if (status === "active") profileQuery.or("trust_score.lt.85,trust_score.is.null");

    if (search) {
      profileQuery.or(`username.ilike.%${search}%,full_name.ilike.%${search}%,location.ilike.%${search}%`);
    }
    if (location !== "all") profileQuery.eq("location", location);

    const [{ data: profileRows, count, error }, hosted, joined] = await Promise.all([
      profileQuery,
      supabase.from("activities").select("owner_id").not("owner_id", "is", null),
      supabase.from("participants").select("user_id").not("user_id", "is", null),
    ]);

    if (!error && profileRows) {
      const hostedByUser = new Map<string, number>();
      for (const activity of hosted.data ?? []) {
        hostedByUser.set(activity.owner_id, (hostedByUser.get(activity.owner_id) ?? 0) + 1);
      }
      const joinedByUser = new Map<string, number>();
      for (const participant of joined.data ?? []) {
        joinedByUser.set(participant.user_id, (joinedByUser.get(participant.user_id) ?? 0) + 1);
      }
      const rows = (profileRows as SupabaseProfileRow[]).map((row) => toUser(row, hostedByUser, joinedByUser));
      return { rows, total: count ?? rows.length };
    }
  }

  await latency();

  const now = new Date("2026-03-13");
  const minJoinDate =
    signupDate === "last30"
      ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      : signupDate === "last90"
        ? new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        : signupDate === "last180"
          ? new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
          : signupDate === "thisYear"
            ? new Date("2026-01-01")
            : null;

  const filtered = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.id.toLowerCase().includes(search);
    const matchesStatus = status === "all" ? true : user.status === status;
    const matchesLocation = location === "all" ? true : user.location === location;

    const userJoinedDate = new Date(user.joinedAt);
    const matchesSignupDate = minJoinDate ? userJoinedDate >= minJoinDate : true;

    const totalParticipation = user.eventsHosted + user.eventsJoined;
    const matchesParticipation =
      participation === "all"
        ? true
        : participation === "high"
          ? totalParticipation >= 30
          : participation === "medium"
            ? totalParticipation >= 12 && totalParticipation < 30
            : totalParticipation < 12;

    return matchesSearch && matchesStatus && matchesLocation && matchesSignupDate && matchesParticipation;
  });

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return { rows: paginated, total };
}

export async function getEvents(params?: {
  status?: EventStatus | "all";
  search?: string;
  category?: string;
  city?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: Event[]; total: number }> {
  const status = params?.status ?? "all";
  const search = params?.search?.toLowerCase() ?? "";
  const category = params?.category ?? "all";
  const city = params?.city ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 5;

  if (isSupabaseConfigured) {
    const offset = (page - 1) * pageSize;
    const to = offset + pageSize - 1;
    const activityQuery = supabase
      .from("activities")
      .select("id,title,category,status,location_name,starts_at,capacity,owner_id,match_score,profiles!activities_owner_id_fkey(full_name,username),participants(count)", { count: "exact" })
      .order("starts_at", { ascending: false })
      .range(offset, to);

    if (search) activityQuery.ilike("title", `%${search}%`);
    if (category !== "all") activityQuery.eq("category", category);
    if (city !== "all") activityQuery.ilike("location_name", `%${city}%`);
    if (status !== "all") {
      if (status === "cancelled" || status === "completed" || status === "reported") activityQuery.eq("status", status);
      if (status === "upcoming") activityQuery.gt("starts_at", new Date().toISOString()).eq("status", "published");
      if (status === "ongoing") activityQuery.lte("starts_at", new Date().toISOString()).eq("status", "published");
    }

    const { data, count, error } = await activityQuery;
    if (!error && data) {
      const rows = (data as unknown as SupabaseActivityRow[]).map(toEvent);
      return { rows, total: count ?? rows.length };
    }
  }

  await latency();

  const filtered = events.filter((event) => {
    const matchesStatus = status === "all" ? true : event.status === status;
    const matchesSearch =
      event.title.toLowerCase().includes(search) ||
      event.host.toLowerCase().includes(search) ||
      event.id.toLowerCase().includes(search);
    const matchesCategory = category === "all" ? true : event.category === category;
    const matchesCity = city === "all" ? true : event.city === city;
    return matchesStatus && matchesSearch && matchesCategory && matchesCity;
  });

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  return { rows, total };
}

export async function getReports() {
  await latency();
  return reports;
}

export async function getMonetization() {
  await latency();
  return revenueData;
}

export async function getAnalytics() {
  await latency();
  return {
    growth: growthData,
    topEvents,
    hostPerformance,
    geoInsights,
  };
}

export async function getNotificationCampaigns() {
  await latency();
  return notificationCampaigns;
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  await latency();
  return userProfiles[id] ?? null;
}

export async function getUserActivity(userId: string): Promise<UserActivity[]> {
  await latency();
  return userActivities.filter((a) => a.userId === userId);
}

export async function getVerifiedUsers(): Promise<UserProfile[]> {
  await latency();
  return Object.values(userProfiles).filter((p) => p.status === "verified");
}

export async function getBlockedUsers(): Promise<UserProfile[]> {
  await latency();
  return Object.values(userProfiles).filter((p) => p.status === "blocked");
}

export async function getSuspendedUsers(): Promise<UserProfile[]> {
  await latency();
  return Object.values(userProfiles).filter((p) => p.status === "suspended");
}

export async function getEventDetail(id: string): Promise<EventDetail | null> {
  await latency();
  return eventDetails[id] ?? null;
}

export async function getEventParticipants(eventId: string, params?: {
  search?: string;
  status?: "confirmed" | "waitlist" | "cancelled" | "all";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: EventParticipant[]; total: number }> {
  await latency();

  const search = params?.search?.toLowerCase() ?? "";
  const status = params?.status ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;

  const filtered = eventParticipants.filter((p) => {
    const matchesEvent = p.eventId === eventId;
    const matchesStatus = status === "all" ? true : p.status === status;
    const matchesSearch =
      p.name.toLowerCase().includes(search) ||
      p.username.toLowerCase().includes(search);
    return matchesEvent && matchesStatus && matchesSearch;
  });

  const total = filtered.length;
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);
  return { rows, total };
}

// ── Reports & Moderation API ─────────────────────────────────────────────────

export async function getReportedUsers(params?: {
  search?: string;
  severity?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: ReportedUser[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const severity = params?.severity ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 6;

  const filtered = reportedUsers.filter((r) => {
    const matchesSearch =
      r.username.toLowerCase().includes(search) ||
      r.name.toLowerCase().includes(search);
    const matchesSeverity = severity === "all" ? true : r.severity === severity;
    return matchesSearch && matchesSeverity;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getReportedEvents(params?: {
  search?: string;
  severity?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: ReportedEvent[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const severity = params?.severity ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 6;

  const filtered = reportedEvents.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search) ||
      r.host.toLowerCase().includes(search);
    const matchesSeverity = severity === "all" ? true : r.severity === severity;
    return matchesSearch && matchesSeverity;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getChatViolations(params?: {
  search?: string;
  severity?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: ChatViolation[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const severity = params?.severity ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;

  const filtered = chatViolations.filter((v) => {
    const matchesSearch =
      v.username.toLowerCase().includes(search) ||
      v.eventTitle.toLowerCase().includes(search) ||
      v.message.toLowerCase().includes(search);
    const matchesSeverity = severity === "all" ? true : v.severity === severity;
    return matchesSearch && matchesSeverity;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getImageModerationQueue(params?: {
  status?: string;
}): Promise<ImageModerationItem[]> {
  await latency();
  const status = params?.status ?? "all";
  return status === "all"
    ? imageModerationQueue
    : imageModerationQueue.filter((i) => i.status === status);
}

export async function getPendingReportItems(params?: {
  type?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: PendingReportItem[]; total: number }> {
  await latency();
  const type = params?.type ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;

  const filtered = type === "all"
    ? pendingReportItems
    : pendingReportItems.filter((r) => r.type === type);

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getInvestigationCases(): Promise<InvestigationCase[]> {
  await latency();
  return investigationCases;
}

export async function getInvestigationCase(id: string): Promise<InvestigationCase | null> {
  await latency();
  return investigationCases.find((c) => c.id === id) ?? null;
}

export async function getActionLogs(params?: {
  search?: string;
  actionType?: string;
  targetType?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: ActionLogEntry[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const actionType = params?.actionType ?? "all";
  const targetType = params?.targetType ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;

  const filtered = actionLogs.filter((entry) => {
    const matchesSearch =
      entry.adminName.toLowerCase().includes(search) ||
      entry.targetName.toLowerCase().includes(search);
    const matchesAction = actionType === "all" ? true : entry.action === actionType;
    const matchesTarget = targetType === "all" ? true : entry.targetType === targetType;
    return matchesSearch && matchesAction && matchesTarget;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

// ── Business & Monetization API ──────────────────────────────────────────────

export async function getBusinessAccounts(params?: {
  search?: string;
  status?: BusinessStatus | "all";
  industry?: string;
  city?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: BusinessAccount[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const status = params?.status ?? "all";
  const industry = params?.industry ?? "all";
  const city = params?.city ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 6;

  const filtered = businessAccounts.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search) ||
      b.email.toLowerCase().includes(search) ||
      b.id.toLowerCase().includes(search);
    const matchesStatus = status === "all" ? true : b.status === status;
    const matchesIndustry = industry === "all" ? true : b.industry === industry;
    const matchesCity = city === "all" ? true : b.city === city;
    return matchesSearch && matchesStatus && matchesIndustry && matchesCity;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getBusinessProfile(id: string): Promise<BusinessProfile | null> {
  await latency();
  return businessProfiles[id] ?? null;
}

export async function getSponsoredEvents(params?: {
  search?: string;
  status?: SponsoredEventStatus | "all";
  businessId?: string;
  city?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: SponsoredEvent[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const status = params?.status ?? "all";
  const businessId = params?.businessId ?? "all";
  const city = params?.city ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 6;

  const filtered = sponsoredEvents.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search) ||
      e.businessName.toLowerCase().includes(search);
    const matchesStatus = status === "all" ? true : e.status === status;
    const matchesBusiness = businessId === "all" ? true : e.businessId === businessId;
    const matchesCity = city === "all" ? true : e.city === city;
    return matchesSearch && matchesStatus && matchesBusiness && matchesCity;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getSponsoredEventDetail(id: string): Promise<SponsoredEventDetail | null> {
  await latency();
  return sponsoredEventDetails[id] ?? null;
}

export async function getBusinessRevenue(): Promise<{
  totalRevenue: number;
  thisMonth: number;
  activeSponsors: number;
  sponsoredEventsCount: number;
  trend: BusinessRevenuePoint[];
  topSponsors: TopSponsor[];
  eventBreakdown: EventRevenueItem[];
}> {
  await latency();
  return {
    totalRevenue: 1250000,
    thisMonth: 210000,
    activeSponsors: 24,
    sponsoredEventsCount: 18,
    trend: businessRevenueData,
    topSponsors,
    eventBreakdown: eventRevenueBreakdown,
  };
}

export async function getBusinessTransactions(params?: {
  search?: string;
  status?: "completed" | "pending" | "failed" | "all";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: BusinessTransaction[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const status = params?.status ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 8;

  const filtered = businessTransactions.filter((t) => {
    const matchesSearch =
      t.businessName.toLowerCase().includes(search) ||
      t.id.toLowerCase().includes(search) ||
      t.eventTitle.toLowerCase().includes(search);
    const matchesStatus = status === "all" ? true : t.status === status;
    return matchesSearch && matchesStatus;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getUserAnalytics(range: AnalyticsRange = "30d"): Promise<UserAnalyticsData> {
  await latency(180);
  return getUserAnalyticsByRange(range);
}

export async function getEventAnalytics(range: AnalyticsRange = "30d"): Promise<EventAnalyticsData> {
  await latency(180);
  return getEventAnalyticsByRange(range);
}

export async function getEngagementMetrics(range: AnalyticsRange = "30d"): Promise<EngagementMetricsData> {
  await latency(180);
  return getEngagementByRange(range);
}

// ── Analytics & Reports Extended API ─────────────────────────────────────────

export async function getUserGrowthReportData(range: AnalyticsRange = "30d"): Promise<UserGrowthReportData> {
  await latency(180);
  return getUserGrowthReport(range);
}

export async function getEventEngagementData(range: AnalyticsRange = "30d"): Promise<EventEngagementData> {
  await latency(180);
  return getEventEngagement(range);
}

export async function getTopEventsReportData(): Promise<ReportTopEventRow[]> {
  await latency(180);
  return topEventsReport;
}

export async function getHostPerformanceReportData(): Promise<HostReportRow[]> {
  await latency(180);
  return hostPerformanceReport;
}

export async function getGeoReportData(): Promise<GeoReportData> {
  await latency(180);
  return geoReportData;
}

export async function getPlatformActivityReportData(range: AnalyticsRange = "30d"): Promise<PlatformActivityData> {
  await latency(180);
  return getPlatformActivityData(range);
}

// ── Rewards & Gamification API ────────────────────────────────────────────────

export async function getCoinRules(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: CoinRule[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const filtered = coinRules.filter(
    (r) =>
      r.action.toLowerCase().includes(search) ||
      (r.condition ?? "").toLowerCase().includes(search),
  );
  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getRewardCatalog(params?: {
  search?: string;
  status?: RewardStatus | "all";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: RewardItem[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const status = params?.status ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 6;

  const filtered = rewardCatalog.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search) || r.partner.toLowerCase().includes(search);
    const matchesStatus = status === "all" ? true : r.status === status;
    return matchesSearch && matchesStatus;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getCoupons(params?: {
  search?: string;
  status?: CouponStatus | "all";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: Coupon[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const status = params?.status ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 6;

  const filtered = coupons.filter((c) => {
    const matchesSearch = c.code.toLowerCase().includes(search);
    const matchesStatus = status === "all" ? true : c.status === status;
    return matchesSearch && matchesStatus;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getLeaderboard(period: LeaderboardPeriod = "monthly"): Promise<LeaderboardEntry[]> {
  await latency();
  if (period === "weekly") return leaderboardWeekly;
  if (period === "all_time") return leaderboardAllTime;
  return leaderboardMonthly;
}

export async function getAchievementBadges(params?: {
  search?: string;
  status?: BadgeStatus | "all";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: AchievementBadge[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const status = params?.status ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 8;

  const filtered = achievementBadges.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(search) || b.requirement.toLowerCase().includes(search);
    const matchesStatus = status === "all" ? true : b.status === status;
    return matchesSearch && matchesStatus;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getGamificationMetrics(): Promise<GamificationMetrics> {
  await latency();
  return gamificationMetrics;
}

export async function getPushCampaigns(params?: {
  search?: string;
  status?: PushCampaignStatus | "all";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: PushCampaign[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const status = params?.status ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  let rows = [...pushCampaigns];
  if (search) rows = rows.filter((c) => c.name.toLowerCase().includes(search) || c.audience.toLowerCase().includes(search));
  if (status !== "all") rows = rows.filter((c) => c.status === status);
  const total = rows.length;
  rows = rows.slice((page - 1) * pageSize, page * pageSize);
  return { rows, total };
}

export async function getEmailCampaigns(params?: {
  search?: string;
  status?: EmailCampaignStatus | "all";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: EmailCampaign[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const status = params?.status ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  let rows = [...emailCampaigns];
  if (search) rows = rows.filter((c) => c.name.toLowerCase().includes(search) || c.subject.toLowerCase().includes(search) || c.audience.toLowerCase().includes(search));
  if (status !== "all") rows = rows.filter((c) => c.status === status);
  const total = rows.length;
  rows = rows.slice((page - 1) * pageSize, page * pageSize);
  return { rows, total };
}

export async function getSystemAlerts(params?: {
  search?: string;
  status?: AlertStatus | "all";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: SystemAlertConfig[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const status = params?.status ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  let rows = [...systemAlerts];
  if (search) rows = rows.filter((a) => a.title.toLowerCase().includes(search) || a.message.toLowerCase().includes(search));
  if (status !== "all") rows = rows.filter((a) => a.status === status);
  const total = rows.length;
  rows = rows.slice((page - 1) * pageSize, page * pageSize);
  return { rows, total };
}

// ── Safety & Security API ─────────────────────────────────────────────────────

export async function getSecurityBlockedUsers(params?: {
  search?: string;
  reason?: BlockReason | "all";
  country?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: SecurityBlockedUser[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const reason = params?.reason ?? "all";
  const country = params?.country ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 6;

  const filtered = securityBlockedUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
    const matchesReason = reason === "all" ? true : u.reason === reason;
    const matchesCountry = country === "all" ? true : u.country === country;
    return matchesSearch && matchesReason && matchesCountry;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getSafetyReports(params?: {
  search?: string;
  status?: SafetyReportStatus | "all";
  reportType?: SafetyReportType | "all";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: SafetyReport[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const status = params?.status ?? "all";
  const reportType = params?.reportType ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 6;

  const filtered = safetyReports.filter((r) => {
    const matchesSearch =
      r.reportedUser.toLowerCase().includes(search) ||
      r.reportedBy.toLowerCase().includes(search) ||
      r.id.toLowerCase().includes(search);
    const matchesStatus = status === "all" ? true : r.status === status;
    const matchesType = reportType === "all" ? true : r.reportType === reportType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getAbuseAlerts(params?: {
  search?: string;
  severity?: "low" | "medium" | "high" | "all";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: AbuseAlert[]; total: number; aiStats: AiModerationStats }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const severity = params?.severity ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 6;

  const filtered = abuseAlerts.filter((a) => {
    const matchesSearch =
      a.username.toLowerCase().includes(search) || a.userId.toLowerCase().includes(search);
    const matchesSeverity = severity === "all" ? true : a.severity === severity;
    return matchesSearch && matchesSeverity;
  });

  return {
    rows: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    aiStats: aiModerationStats,
  };
}

export async function getIpActivities(params?: {
  search?: string;
  status?: IpStatus | "all";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: IpActivity[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const status = params?.status ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 6;

  const filtered = ipActivities.filter((ip) => {
    const matchesSearch =
      ip.ipAddress.toLowerCase().includes(search) || ip.country.toLowerCase().includes(search);
    const matchesStatus = status === "all" ? true : ip.status === status;
    return matchesSearch && matchesStatus;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getSecurityLogs(params?: {
  search?: string;
  category?: "all" | "admin_action" | "user_action" | "login_activity" | "security_change";
  page?: number;
  pageSize?: number;
}): Promise<{ rows: SecurityLogEntry[]; total: number }> {
  await latency();
  const search = params?.search?.toLowerCase() ?? "";
  const category = params?.category ?? "all";
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 8;

  const filtered = securityLogs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(search) ||
      log.action.toLowerCase().includes(search) ||
      (log.reason?.toLowerCase() ?? "").includes(search);
    const matchesCategory = category === "all" ? true : log.actionCategory === category;
    return matchesSearch && matchesCategory;
  });

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

export async function getSecurityInsights(): Promise<SecurityInsights> {
  await latency();
  return securityInsights;
}

export async function getNotificationStats(): Promise<NotificationStats> {
  await latency();
  return notificationStats;
}

export async function getPlatformConfig(): Promise<PlatformConfig> {
  await latency();
  return platformConfig;
}

export async function getEventCategories(): Promise<EventCategoryItem[]> {
  await latency();
  return settingsCategories;
}

export async function getNotificationTemplates(): Promise<NotificationTemplate[]> {
  await latency();
  return notificationTemplates;
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  await latency();
  return emailTemplates;
}

export async function getSupportedLanguages(): Promise<SupportedLanguage[]> {
  await latency();
  return supportedLanguages;
}

export async function getFeatureToggles(): Promise<FeatureToggle[]> {
  await latency();
  return featureToggles;
}

export async function getSettingsSummary(): Promise<SettingsSummary> {
  await latency();
  return settingsSummary;
}

// ── Admin Management Module ───────────────────────────────────────────────────

export async function getAdminRoles() {
  await latency();
  return adminRoles;
}

export async function getRolePermissions() {
  await latency();
  return rolePermissionsData;
}

export async function getAdminAccounts() {
  await latency();
  return adminAccounts;
}

export async function getAdminActivityLogs() {
  await latency();
  return adminActivityLogs;
}

export async function getAccessControlConfig() {
  await latency();
  return accessControlConfig;
}

export async function getAdminSecurityOverview() {
  await latency();
  return adminSecurityOverview;
}
