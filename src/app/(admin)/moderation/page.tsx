import Link from "next/link";
import {
  AlertTriangle,
  CalendarX,
  ClipboardList,
  FileSearch,
  History,
  ImageOff,
  MessageSquareWarning,
  ShieldAlert,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "Reported Users",
    description: "Review accounts reported for harassment, spam, fake profiles, and scams.",
    href: "/moderation/reported-users",
    icon: AlertTriangle,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    title: "Reported Events",
    description: "Events flagged for fake listings, fraud, unsafe locations, or misleading content.",
    href: "/moderation/reported-events",
    icon: CalendarX,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "Chat Violations",
    description: "Abusive or inappropriate messages detected in event group chats.",
    href: "/moderation/chat-violations",
    icon: MessageSquareWarning,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Image Moderation",
    description: "Review event photos flagged for nudity, violence, or spam by AI detection.",
    href: "/moderation/image-moderation",
    icon: ImageOff,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    title: "Pending Reports",
    description: "All unresolved reports awaiting admin review and assignment.",
    href: "/moderation/pending-reports",
    icon: ClipboardList,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    title: "Investigation Panel",
    description: "Deep-dive case analysis — chat logs, risk scores, event history, and disciplinary actions.",
    href: "/moderation/investigation",
    icon: FileSearch,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    title: "Action Logs",
    description: "Full audit trail of all moderation decisions for transparency and accountability.",
    href: "/moderation/action-logs",
    icon: History,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

export default function ModerationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
          <ShieldAlert className="h-6 w-6 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports & Moderation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform safety hub — review reports, investigate abuse, moderate content, and maintain an audit trail of all disciplinary actions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href} className="group block">
              <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${section.bg}`}>
                      <Icon className={`h-5 w-5 ${section.color}`} />
                    </div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">{section.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

