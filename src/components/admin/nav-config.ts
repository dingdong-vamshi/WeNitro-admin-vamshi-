import {
  BarChart3,
  Bell,
  Briefcase,
  Film,
  Gamepad2,
  Gauge,
  LayoutDashboard,
  Lock,
  ShieldAlert,
  UserCog,
  Users,
  CalendarDays,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { AdminRole } from "@/components/AdminAuthGate";

const OPERATIONS_ROLES: AdminRole[] = ["super_admin", "admin"];
const FINANCE_ROLES: AdminRole[] = ["super_admin", "finance_admin"];
const ALL_ADMIN_ROLES: AdminRole[] = ["super_admin", "admin", "finance_admin"];

export type NavSection = {
  title: string;
  icon: LucideIcon;
  href: string;
  allowedRoles?: AdminRole[];
  children?: Array<{ label: string; href: string; allowedRoles?: AdminRole[] }>;
};

export const navSections: NavSection[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    children: [],
  },
  {
    title: "Users",
    icon: Users,
    href: "/users",
    children: [
      { label: "All Users", href: "/users" },
      { label: "Member Interests", href: "/users/interests" },
      { label: "Verified Users", href: "/users/verified" },
      { label: "Blocked Users", href: "/users/blocked" },
      { label: "Suspended Users", href: "/users/suspended" },
    ],
  },
  {
    title: "Activities",
    icon: CalendarDays,
    href: "/events",
    children: [
      { label: "All Activities", href: "/events" },
      { label: "Upcoming", href: "/events/upcoming" },
      { label: "Ongoing", href: "/events/ongoing" },
      { label: "Completed", href: "/events/completed" },
      { label: "Cancelled", href: "/events/cancelled" },
    ],
  },
  {
    title: "Reports & Moderation",
    icon: ShieldAlert,
    href: "/moderation",
    children: [
      { label: "Reported Users", href: "/moderation/reported-users" },
      { label: "Reported Events", href: "/moderation/reported-events" },
      { label: "Chat Violations", href: "/moderation/chat-violations" },
      { label: "Image Moderation", href: "/moderation/image-moderation" },
      { label: "Pending Reports", href: "/moderation/pending-reports" },
      { label: "Investigation Panel", href: "/moderation/investigation" },
      { label: "Action Logs", href: "/moderation/action-logs" },
    ],
  },
  {
    title: "Communities",
    icon: Users,
    href: "/communities",
    children: [],
  },
  {
    title: "Content",
    icon: Film,
    href: "/content/vibes",
    children: [
      { label: "Vibes", href: "/content/vibes" },
      { label: "Stories", href: "/content/stories" },
    ],
  },
  {
    title: "Verification",
    icon: ShieldCheck,
    href: "/verification",
    children: [],
  },
  {
    title: "Business",
    icon: Briefcase,
    href: "/business",
    children: [
      { label: "Partner Applications", href: "/business", allowedRoles: OPERATIONS_ROLES },
      { label: "Sponsored Events", href: "/business/sponsored-events", allowedRoles: OPERATIONS_ROLES },
      { label: "Partner Finance", href: "/business/revenue", allowedRoles: FINANCE_ROLES },
      { label: "Financial Ledger", href: "/business/transactions", allowedRoles: FINANCE_ROLES },
      { label: "Settlements", href: "/business/settlements", allowedRoles: FINANCE_ROLES },
    ],
    allowedRoles: ALL_ADMIN_ROLES,
  },
  {
    title: "Rewards & Gamification",
    icon: Gamepad2,
    href: "/rewards",
    children: [
      { label: "Coins Distribution", href: "/rewards/coins" },
      { label: "Rewards Catalog", href: "/rewards/catalog" },
      { label: "Coupon Management", href: "/rewards/coupons" },
      { label: "Leaderboard", href: "/rewards/leaderboard" },
      { label: "Achievement Badges", href: "/rewards/badges" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
    children: [
      { label: "Broadcast Notification", href: "/notifications" },
      { label: "Push Campaigns", href: "/notifications/push-campaigns" },
      { label: "Email Notifications", href: "/notifications/email" },
      { label: "System Alerts", href: "/notifications/system-alerts" },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    children: [
      { label: "User Analytics", href: "/analytics/user-analytics" },
      { label: "Event Analytics", href: "/analytics/event-analytics" },
      { label: "Engagement Metrics",    href: "/analytics/engagement" },
      { label: "User Growth",            href: "/analytics/user-growth" },
      { label: "Event Engagement",       href: "/analytics/event-engagement" },
      { label: "Top Events",             href: "/analytics/top-events" },
      { label: "Host Performance",       href: "/analytics/host-performance" },
      { label: "Geographic Insights",    href: "/analytics/geographic-insights" },
      { label: "Platform Activity",      href: "/analytics/platform-activity" },
    ],
  },
  {
    title: "Safety & Security",
    icon: Lock,
    href: "/security",
    children: [
      { label: "Blocked Users", href: "/security/blocked-users" },
      { label: "Safety Reports", href: "/security/safety-reports" },
      { label: "Abuse Detection", href: "/security/abuse-detection" },
      { label: "IP Monitoring", href: "/security/ip-monitoring" },
      { label: "Security Logs", href: "/security/security-logs" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    children: [
      { label: "Platform Settings", href: "/settings" },
      { label: "Category Management", href: "/settings/categories" },
      { label: "Notification Templates", href: "/settings/notification-templates" },
      { label: "Email Templates", href: "/settings/email-templates" },
      { label: "Language Settings", href: "/settings/languages" },
      { label: "Feature Toggles", href: "/settings/features" },
    ],
  },
  {
    title: "Admins",
    icon: UserCog,
    href: "/admins",
    children: [
      { label: "Admin Roles", href: "/admins/roles" },
      { label: "Permissions", href: "/admins/permissions" },
      { label: "Add Admin", href: "/admins/add" },
      { label: "Activity Logs", href: "/admins/activity-logs" },
      { label: "Access Control", href: "/admins/access-control" },
    ],
    allowedRoles: [],
  },
];

const routeRules: Array<{ prefix: string; roles: AdminRole[] }> = [
  { prefix: "/business/sponsored-events", roles: OPERATIONS_ROLES },
  { prefix: "/business/revenue", roles: FINANCE_ROLES },
  { prefix: "/business/transactions", roles: FINANCE_ROLES },
  { prefix: "/business/settlements", roles: FINANCE_ROLES },
  { prefix: "/business", roles: OPERATIONS_ROLES },
  // These screens are local mock state only. Keep them unreachable until a
  // server-authoritative provisioning and permissions workflow is shipped.
  { prefix: "/admins", roles: [] },
];

export function isAdminPathAllowed(pathname: string, role: AdminRole) {
  const rule = routeRules.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (rule) return rule.roles.includes(role);
  return OPERATIONS_ROLES.includes(role);
}

export function defaultAdminPath(role: AdminRole) {
  return role === "finance_admin" ? "/business/revenue" : "/dashboard";
}

export function navSectionsForRole(role: AdminRole): NavSection[] {
  return navSections.flatMap((section) => {
    const children = section.children?.filter((child) =>
      (child.allowedRoles ?? section.allowedRoles ?? OPERATIONS_ROLES).includes(role));
    const sectionAllowed = (section.allowedRoles ?? OPERATIONS_ROLES).includes(role);
    if (!sectionAllowed && !children?.length) return [];
    return [{ ...section, children }];
  });
}

export const routeTitleMap: Record<string, string> = {
  dashboard: "Dashboard",
  users: "User Management",
  verified: "Verified Users",
  blocked: "Blocked Users",
  suspended: "Suspended Users",
  activity: "Activity History",
  communities: "Communities",
  content: "Content",
  vibes: "Vibes",
  stories: "Stories",
  interests: "Member Interests",
  verification: "Verification Review",
  events: "Activity Management",
  moderation: "Reports & Moderation",
  "reported-users": "Reported Users",
  "reported-events": "Reported Events",
  "chat-violations": "Chat Violations",
  "image-moderation": "Image Moderation",
  "pending-reports": "Pending Reports",
  investigation: "Investigation Panel",
  "action-logs": "Action Logs",
  business: "Business / Host Management",
  settlements: "Partner Settlements",
  monetization: "Monetization Management",
  rewards: "Rewards & Gamification",
  coins: "Coins Distribution",
  catalog: "Rewards Catalog",
  coupons: "Coupon Management",
  leaderboard: "Leaderboard",
  badges: "Achievement Badges",
  notifications: "Notifications & Messaging",
  "push-campaigns": "Push Campaigns",
  email: "Email Notifications",
  "system-alerts": "System Alerts",
  analytics: "Analytics & Reports",
  "user-analytics": "User Analytics",
  "event-analytics": "Event Analytics",
  engagement: "Engagement Metrics",
  "user-growth": "User Growth",
  "event-engagement": "Event Engagement",
  "top-events": "Top Events",
  "host-performance": "Host Performance",
  "geographic-insights": "Geographic Insights",
  "platform-activity": "Platform Activity",
  security: "Safety & Security",
  "blocked-users": "Blocked Users",
  "safety-reports": "Safety Reports",
  "abuse-detection": "Abuse Detection",
  "ip-monitoring": "IP Monitoring",
  "security-logs": "Security Logs",
  settings: "Settings",
  categories: "Category Management",
  "notification-templates": "Notification Templates",
  "email-templates": "Email Templates",
  languages: "Language Settings",
  features: "Feature Toggles",
  admins: "Admin Management",
  roles: "Admin Roles",
  permissions: "Permissions",
  add: "Add Admin",
  "activity-logs": "Activity Logs",
  "access-control": "Access Control",
};

export const roleMatrix = ["Super Admin", "Moderator", "Business Manager", "Support Agent"];

export const sectionIcons = {
  dashboard: Gauge,
  users: Users,
  events: CalendarDays,
};
