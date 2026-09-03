export type UserStatus = "active" | "verified" | "blocked" | "suspended" | "banned";

export type ActivityType =
  | "event_created"
  | "event_joined"
  | "message_sent"
  | "report_received"
  | "rating_received"
  | "login";

export type UserActivity = {
  id: string;
  userId: string;
  type: ActivityType;
  description: string;
  date: string;
};

export type BanDuration = "permanent" | "30d" | "90d";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: UserStatus;
  joinedAt: string;
  lastActiveAt: string;
  location: string;
  username: string;
  phone: string;
  eventsHosted: number;
  eventsJoined: number;
  followers: number;
  verificationType?: string;
  verifiedAt?: string;
  blockedReason?: string;
  blockedAt?: string;
  suspendedReason?: string;
  suspendedUntil?: string;
  banReason?: string;
  bannedAt?: string;
};

export type AdminRole =
  | "Super Admin"
  | "Moderator"
  | "Business Manager"
  | "Support Agent";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  status: UserStatus;
  joinedAt: string;
  lastActiveAt: string;
  location: string;
  eventsHosted: number;
  eventsJoined: number;
};

export type EventStatus =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "reported";

export type EventCategory =
  | "adventure"
  | "social"
  | "business"
  | "wellness"
  | "music"
  | "food"
  | "education"
  | "sports";

export type EventParticipantStatus =
  | "approved"
  | "confirmed"
  | "pending"
  | "waitlist"
  | "rejected"
  | "left"
  | "cancelled";

export type Event = {
  id: string;
  title: string;
  host: string;
  city: string;
  date: string;
  attendees: number;
  maxAttendees?: number;
  engagement: number;
  status: EventStatus;
  category: EventCategory;
  startTime?: string;
  location?: string;
  cancelledBy?: "host" | "admin";
  cancelReason?: string;
};

export type EventDetail = {
  id: string;
  title: string;
  host: string;
  hostId: string;
  city: string;
  location: string;
  date: string;
  startTime: string;
  attendees: number;
  maxAttendees: number;
  engagement: number;
  status: EventStatus;
  category: EventCategory;
  description: string;
  isFeatured: boolean;
  cancelledBy?: "host" | "admin";
  cancelReason?: string;
  createdAt: string;
  mediaCount: { photos: number; videos: number };
};

export type EventParticipant = {
  id: string;
  eventId: string;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  joinedDate: string;
  status: EventParticipantStatus;
};

export type DashboardMetric = {
  title: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
};

export type GrowthPoint = {
  label: string;
  users: number;
  events: number;
  revenue: number;
};

export type ReportItem = {
  id: string;
  type: "user" | "event" | "chat" | "image";
  target: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "investigating" | "resolved";
  createdAt: string;
};

export type NotificationCampaign = {
  id: string;
  name: string;
  channel: "push" | "email" | "broadcast";
  scheduledFor: string;
  status: "draft" | "scheduled" | "sent";
};

export type RevenuePoint = {
  label: string;
  sponsoredAds: number;
  partnerships: number;
  total: number;
};

export type TopEvent = {
  id: string;
  title: string;
  engagementScore: number;
  city: string;
};

export type HostPerformance = {
  host: string;
  rating: number;
  hostedEvents: number;
};

export type GeoInsight = {
  region: string;
  users: number;
  events: number;
};

export type DashboardRange = "7d" | "30d" | "12m";

export type PendingReport = {
  id: string;
  username: string;
  reason: string;
  eventTitle: string;
  reportedAgo: string;
};

// ── Reports & Moderation Module ──────────────────────────────────────────────

export type ModerationSeverity = "low" | "medium" | "high" | "critical";

export type ModerationAction =
  | "warn_user"
  | "suspend_user"
  | "ban_user"
  | "delete_message"
  | "remove_image"
  | "cancel_event"
  | "delete_event"
  | "warn_host"
  | "suspend_host"
  | "dismiss_report"
  | "approve_image";

export type ReportReason =
  | "Harassment"
  | "Fake Profile"
  | "Spam"
  | "Inappropriate Behaviour"
  | "Scam"
  | "Fake Event"
  | "Fraud"
  | "Unsafe Location"
  | "Misleading Information"
  | "Spam Promotion"
  | "Offensive Language"
  | "Spam Link"
  | "Nudity"
  | "Violence"
  | "Offensive Symbol";

export type ReportedUser = {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  reportCount: number;
  lastReportDate: string;
  severity: ModerationSeverity;
  reasons: ReportReason[];
  eventsJoined: number;
  eventsHosted: number;
  riskScore: number;
  status: UserStatus;
};

export type ReportedEvent = {
  id: string;
  eventId: string;
  title: string;
  host: string;
  hostId: string;
  reportCount: number;
  reason: ReportReason;
  severity: ModerationSeverity;
  date: string;
  city: string;
};

export type ChatViolation = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  eventId: string;
  eventTitle: string;
  message: string;
  flaggedFor: ReportReason[];
  severity: ModerationSeverity;
  date: string;
};

export type ImageModerationStatus = "pending" | "flagged" | "approved" | "removed";

export type ImageModerationItem = {
  id: string;
  eventId: string;
  eventTitle: string;
  uploadedBy: string;
  uploadedByUserId: string;
  uploadedByAvatar: string;
  status: ImageModerationStatus;
  aiLabels: string[];
  uploadedAt: string;
  previewInitials: string;
};

export type PendingReportItem = {
  id: string;
  type: "user" | "event" | "chat";
  reportedItem: string;
  reportedItemId: string;
  date: string;
  assignedTo?: string;
};

export type InvestigationCase = {
  id: string;
  userId: string;
  username: string;
  name: string;
  avatar: string;
  reports: ReportReason[];
  eventsJoined: number;
  eventsHosted: number;
  chatMessageCount: number;
  imagesUploaded: number;
  riskScore: number;
  severity: ModerationSeverity;
  status: UserStatus;
  chatSamples: Array<{ message: string; date: string; event: string }>;
};

export type ActionLogEntry = {
  id: string;
  adminName: string;
  adminId: string;
  action: ModerationAction;
  actionLabel: string;
  targetType: "user" | "event" | "image" | "message";
  targetName: string;
  date: string;
};

export type UpcomingEvent = {
  id: string;
  title: string;
  host: string;
  schedule: string;
  participants: string;
  tags: string[];
};

export type RecentActivity = {
  id: string;
  title: string;
  detail: string;
  ago: string;
};

export type SystemAlert = {
  id: string;
  title: string;
  detail: string;
  severity: "medium" | "high";
};

export type DashboardSnapshot = {
  metrics: DashboardMetric[];
  growth: GrowthPoint[];
  contentMix?: Array<{ name: string; value: number }>;
  pendingReports: PendingReport[];
  upcomingEvents: UpcomingEvent[];
  recentActivities: RecentActivity[];
  systemAlerts: SystemAlert[];
  revenue: {
    thisMonth: number;
    lastMonth: number;
    topSponsoredEvents: Array<{ name: string; revenue: number; engagement: string }>;
  };
};

// ── Business & Monetization Module ───────────────────────────────────────────

export type BusinessStatus = "verified" | "pending" | "suspended";

export type BusinessIndustry =
  | "sports"
  | "tech"
  | "food"
  | "fashion"
  | "health"
  | "education"
  | "entertainment"
  | "finance";

export type BusinessAccount = {
  id: string;
  name: string;
  industry: BusinessIndustry;
  city: string;
  email: string;
  status: BusinessStatus;
  joinedAt: string;
  logo: string;
};

export type BusinessProfile = {
  id: string;
  name: string;
  industry: BusinessIndustry;
  city: string;
  email: string;
  phone: string;
  status: BusinessStatus;
  joinedAt: string;
  logo: string;
  sponsoredEvents: number;
  totalParticipants: number;
  revenueGenerated: number;
  averageRating: number;
  website?: string;
  description?: string;
};

export type SponsoredEventStatus = "pending" | "active" | "completed" | "rejected" | "cancelled";

export type SponsoredEvent = {
  id: string;
  title: string;
  businessId: string;
  businessName: string;
  budget: number;
  status: SponsoredEventStatus;
  startDate: string;
  endDate: string;
  city: string;
  participantsRegistered: number;
};

export type SponsoredEventDetail = {
  id: string;
  title: string;
  businessId: string;
  businessName: string;
  budget: number;
  status: SponsoredEventStatus;
  startDate: string;
  endDate: string;
  city: string;
  location: string;
  participantsRegistered: number;
  impressions: number;
  clicks: number;
  conversionRate: number;
  description: string;
};

export type BusinessRevenuePoint = {
  label: string;
  revenue: number;
};

export type TopSponsor = {
  businessId: string;
  businessName: string;
  totalRevenue: number;
  eventsSponsored: number;
};

export type EventRevenueItem = {
  eventId: string;
  eventTitle: string;
  businessName: string;
  revenue: number;
};

export type BusinessTransaction = {
  id: string;
  businessId: string;
  businessName: string;
  amount: number;
  date: string;
  eventTitle: string;
  status: "completed" | "pending" | "failed";
};

// ── Analytics Module ─────────────────────────────────────────────────────────

export type AnalyticsRange = "7d" | "30d" | "12m";

export type UserGrowthPoint = {
  label: string;
  newUsers: number;
  totalUsers: number;
};

export type UserCityData = {
  city: string;
  users: number;
};

export type DeviceUsage = {
  name: string;
  percentage: number;
};

export type UserAnalyticsData = {
  stats: {
    totalUsers: number;
    newUsersThisMonth: number;
    activeUsers: number;
    verifiedUsers: number;
  };
  growth: UserGrowthPoint[];
  byCity: UserCityData[];
  deviceUsage: DeviceUsage[];
  dau: number;
  mau: number;
  retentionRate: number;
};

export type EventCreationPoint = {
  label: string;
  created: number;
};

export type EventCategoryData = {
  name: string;
  value: number;
  percentage: number;
};

export type EventCityData = {
  city: string;
  events: number;
};

export type TopEventByParticipation = {
  name: string;
  participants: number;
};

export type EventAnalyticsData = {
  stats: {
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    cancelledEvents: number;
  };
  creationTrend: EventCreationPoint[];
  byCategory: EventCategoryData[];
  topEvents: TopEventByParticipation[];
  byCity: EventCityData[];
};

export type EngagementPoint = {
  label: string;
  joins: number;
  messages: number;
  shares: number;
  bookmarks: number;
};

export type FunnelStep = {
  step: string;
  users: number;
};

export type HeatmapRow = {
  hour: string;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
};

export type EngagementMetricsData = {
  stats: {
    totalJoins: number;
    messagesSent: number;
    bookmarks: number;
    shares: number;
  };
  trend: EngagementPoint[];
  avgParticipants: number;
  avgMessages: number;
  avgRating: number;
  funnel: FunnelStep[];
  conversionRate: number;
  peakTimes: string[];
  heatmap: HeatmapRow[];
};

// ── Analytics & Reports Extended Module ──────────────────────────────────────

export type RetentionData = {
  week: number;
  month: number;
  quarter: number;
};

export type UserGrowthReportData = {
  stats: {
    totalUsers: number;
    newUsersThisMonth: number;
    activeUsers: number;
    verifiedUsers: number;
  };
  growth: UserGrowthPoint[];
  retention: RetentionData;
};

export type EventEngagementPoint = {
  label: string;
  views: number;
  joins: number;
  shares: number;
  bookmarks: number;
};

export type EventEngagementData = {
  stats: {
    totalViews: number;
    eventJoins: number;
    eventShares: number;
    eventBookmarks: number;
  };
  trend: EventEngagementPoint[];
  avgParticipants: number;
  avgShares: number;
  avgBookmarks: number;
  avgRating: number;
};

export type ReportTopEventRow = {
  id: string;
  name: string;
  host: string;
  city: string;
  category: string;
  participants: number;
  rating: number;
};

export type HostReportRow = {
  id: string;
  name: string;
  eventsHosted: number;
  avgRating: number;
  totalParticipants: number;
  completionRate: number;
  score: number;
};

export type GeoReportData = {
  usersByCity: UserCityData[];
  eventsByCity: EventCityData[];
  regionBreakdown: GeoInsight[];
};

export type ActivityTimelinePoint = {
  label: string;
  registrations: number;
  events: number;
  messages: number;
  reports: number;
};

export type PlatformActivityData = {
  stats: {
    dau: number;
    eventsCreatedToday: number;
    messagesSent: number;
    reportsSubmitted: number;
  };
  timeline: ActivityTimelinePoint[];
  peakTime: string;
  peakDay: string;
};

// ── Rewards & Gamification Module ────────────────────────────────────────────

export type CoinRule = {
  id: string;
  action: string;
  coins: number;
  condition?: string;
};

export type RewardStatus = "active" | "inactive";

export type RewardItem = {
  id: string;
  name: string;
  coinsRequired: number;
  partner: string;
  validUntil: string;
  description: string;
  status: RewardStatus;
};

export type CouponDiscount =
  | { type: "percentage"; value: number }
  | { type: "flat"; value: number };

export type CouponApplicable = "Event Tickets" | "Rewards" | "All";

export type CouponStatus = "active" | "expired" | "disabled";

export type Coupon = {
  id: string;
  code: string;
  discount: CouponDiscount;
  applicableOn: CouponApplicable;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  status: CouponStatus;
};

export type LeaderboardPeriod = "weekly" | "monthly" | "all_time";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  coinsEarned: number;
  eventsHosted: number;
  eventsJoined: number;
  referrals: number;
};

export type BadgeStatus = "active" | "disabled";

export type AchievementBadge = {
  id: string;
  name: string;
  requirement: string;
  rewardCoins: number;
  icon: string;
  status: BadgeStatus;
};

export type GamificationMetrics = {
  totalCoinsDistributed: number;
  rewardsRedeemed: number;
  activeRewardUsers: number;
  topCoinAction: string;
  avgCoinsPerUser: number;
};

// ── Notifications & Messaging Module ─────────────────────────────────────────

export type CampaignAudience =
  | "All Users"
  | "Event Participants"
  | "Event Hosts"
  | "Business Accounts"
  | "New Users"
  | "Custom Segment";

export type BroadcastChannel = "push" | "in_app" | "email";

export type BroadcastSchedule = "now" | "later";

export type BroadcastDraft = {
  title: string;
  message: string;
  audience: CampaignAudience;
  channels: BroadcastChannel[];
  schedule: BroadcastSchedule;
  scheduledAt?: string;
};

export type PushCampaignStatus = "sent" | "active" | "scheduled" | "paused" | "draft";

export type PushCampaign = {
  id: string;
  name: string;
  audience: CampaignAudience;
  title: string;
  message: string;
  status: PushCampaignStatus;
  scheduledDate: string;
  sent: number;
  opened: number;
  clickRate: number;
};

export type EmailCampaignStatus = "active" | "draft" | "sent" | "scheduled";

export type EmailCampaign = {
  id: string;
  name: string;
  subject: string;
  audience: CampaignAudience;
  status: EmailCampaignStatus;
  createdAt: string;
};

export type AlertPriority = "low" | "medium" | "high";

export type AlertStatus = "active" | "scheduled" | "sent";

export type AlertAffected = "All Users" | "Android Users" | "iOS Users";

export type SystemAlertConfig = {
  id: string;
  title: string;
  message: string;
  priority: AlertPriority;
  status: AlertStatus;
  affectedUsers: AlertAffected;
  displayInApp: boolean;
  displayPush: boolean;
  displayEmail: boolean;
  createdAt: string;
};

export type NotificationStats = {
  totalSent: number;
  openRate: number;
  clickRate: number;
  unsubscribed: number;
};

// ── Safety & Security Module ──────────────────────────────────────────────────

export type BlockReason = "abuse" | "spam" | "harassment" | "fraud" | "fake_profile" | "other";

export type SecurityBlockedUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  reason: BlockReason;
  reportCount: number;
  country: string;
  blockedAt: string;
  violations: string[];
};

export type SafetyReportStatus = "pending" | "investigating" | "resolved";

export type SafetyReportType =
  | "harassment"
  | "fake_event"
  | "inappropriate_message"
  | "spam"
  | "impersonation"
  | "other";

export type SafetyReport = {
  id: string;
  reportType: SafetyReportType;
  reportedUser: string;
  reportedUserId: string;
  reportedBy: string;
  reportedByAvatar: string;
  status: SafetyReportStatus;
  description: string;
  evidenceCount: number;
  createdAt: string;
};

export type AbuseAlertType =
  | "spam_messaging"
  | "fake_event"
  | "offensive_words"
  | "suspicious_behavior"
  | "bot_activity"
  | "mass_reporting";

export type AbuseSeverity = "low" | "medium" | "high";

export type AbuseAlert = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  alertType: AbuseAlertType;
  severity: AbuseSeverity;
  detail: string;
  detectedAt: string;
  flaggedCount: number;
};

export type AiModerationStats = {
  flaggedMessages: number;
  flaggedImages: number;
  potentialFakeEvents: number;
};

export type IpStatus = "normal" | "suspicious" | "blocked" | "flagged";

export type IpActivity = {
  id: string;
  ipAddress: string;
  country: string;
  status: IpStatus;
  linkedAccounts: number;
  loginAttempts: number;
  lastSeen: string;
  indicators: string[];
};

export type SecurityLogActorType = "admin" | "user" | "system";

export type SecurityLogEntry = {
  id: string;
  timestamp: string;
  action: string;
  actionCategory: "admin_action" | "user_action" | "login_activity" | "security_change";
  actor: string;
  actorType: SecurityLogActorType;
  targetId?: string;
  reason?: string;
};

export type SecurityInsights = {
  totalBlockedUsers: number;
  activeSafetyReports: number;
  suspiciousIps: number;
  abuseAlertsToday: number;
};

// ── Settings Module ───────────────────────────────────────────────────────────

export type PlatformConfig = {
  platformName: string;
  supportEmail: string;
  defaultCurrency: "USD" | "INR";
  defaultTimezone: string;
  allowEventCreation: boolean;
  allowGuestBrowsing: boolean;
  requireEmailVerification: boolean;
  autoApproveEvents: boolean;
};

export type CategoryStatus = "active" | "disabled";

export type EventCategoryItem = {
  id: string;
  name: string;
  icon: string;
  description: string;
  displayOrder: number;
  status: CategoryStatus;
};

export type NotificationTemplateType = "push" | "in_app" | "email";

export type NotificationTemplate = {
  id: string;
  name: string;
  type: NotificationTemplateType;
  title: string;
  message: string;
  variables: string[];
};

export type EmailTemplateStatus = "active" | "draft";

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  status: EmailTemplateStatus;
};

export type LanguageStatus = "default" | "enabled" | "disabled";

export type SupportedLanguage = {
  id: string;
  name: string;
  code: string;
  status: LanguageStatus;
};

export type FeatureStatus = "enabled" | "disabled";

export type FeatureToggle = {
  id: string;
  name: string;
  description: string;
  status: FeatureStatus;
};

export type SettingsSummary = {
  activeCategories: number;
  notificationTemplates: number;
  emailTemplates: number;
  enabledLanguages: number;
};

// ── Admin Management Module ───────────────────────────────────────────────────

export type AdminAccountStatus = "active" | "inactive" | "suspended";

export type AdminRoleType =
  | "Super Admin"
  | "Moderator"
  | "Support Admin"
  | "Content Manager"
  | "Analytics Manager";

export type PermissionAction = "view" | "create" | "edit" | "delete";

export type PermissionModule =
  | "Users"
  | "Events"
  | "Reports"
  | "Analytics"
  | "Business Accounts"
  | "Settings"
  | "Moderation"
  | "Notifications";

export type AdminRoleDefinition = {
  id: string;
  name: AdminRoleType;
  description: string;
  assignedAdmins: number;
  createdAt: string;
};

export type Permission = {
  module: PermissionModule;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
};

export type RolePermissions = {
  role: AdminRoleType;
  permissions: Permission[];
};

export type AdminAccount = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: AdminRoleType;
  status: AdminAccountStatus;
  twoFAEnabled: boolean;
  createdAt: string;
  lastLogin: string;
  avatar: string;
};

export type AdminActivityLogEntry = {
  id: string;
  adminId: string;
  adminName: string;
  module: string;
  action: string;
  targetName: string;
  targetType: string;
  timestamp: string;
  ipAddress: string;
};

export type AccessPolicy = {
  id: string;
  name: string;
  description: string;
  status: "enabled" | "disabled";
};

export type AccessControlConfig = {
  allowedIps: string[];
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  requireTwoFA: boolean;
  restrictToOfficeIp: boolean;
  autoLogoutInactive: boolean;
  policies: AccessPolicy[];
};

export type AdminSecurityOverview = {
  totalAdmins: number;
  activeAdmins: number;
  failedLoginAttempts: number;
  lastAdminLogin: string;
  suspendedAdmins: number;
  twoFAEnabledCount: number;
};
