"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, MessageSquare, Shield, Users, CalendarDays, Image } from "lucide-react";

import { getInvestigationCases } from "@/lib/api";
import { ModerationSeverityBadge } from "@/components/admin/moderation-severity-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function InvestigationPanel() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["investigation-cases"],
    queryFn: getInvestigationCases,
  });

  const selected = query.data?.find((c) => c.id === selectedId) ?? query.data?.[0] ?? null;

  if (query.isPending) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading cases…</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      {/* Case list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Cases</p>
        {query.data?.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className={`w-full rounded-lg border p-3 text-left transition-colors ${
              (selectedId === c.id || (!selectedId && c === query.data?.[0]))
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">{c.avatar}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.username}</p>
                <ModerationSeverityBadge severity={c.severity} />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail pane */}
      {selected && (
        <div className="space-y-4">
          {/* Header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="text-lg">{selected.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selected.name}</CardTitle>
                    <CardDescription>{selected.username}</CardDescription>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <ModerationSeverityBadge severity={selected.severity} />
                    </div>
                  </div>
                </div>
                {/* Risk score */}
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Risk Score</p>
                  <p className={`text-3xl font-bold tabular-nums ${selected.riskScore >= 80 ? "text-rose-600 dark:text-rose-400" : selected.riskScore >= 50 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {selected.riskScore}
                  </p>
                  <p className="text-xs text-muted-foreground">/ 100</p>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Events Joined</p>
                  <p className="text-sm font-semibold">{selected.eventsJoined}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Events Hosted</p>
                  <p className="text-sm font-semibold">{selected.eventsHosted}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Chat Messages</p>
                  <p className="text-sm font-semibold">{selected.chatMessageCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Images Uploaded</p>
                  <p className="text-sm font-semibold">{selected.imagesUploaded}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports & Chat */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  Reports Against User
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {selected.reports.map((r) => (
                  <Badge key={r} variant="danger">{r}</Badge>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4 text-amber-500" />
                  Flagged Chat Samples
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selected.chatSamples.map((s, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-sm">&ldquo;{s.message}&rdquo;</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.event} · {s.date}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950">
                Send Warning
              </Button>
              <Button variant="outline" size="sm" className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950">
                Temporary Suspension
              </Button>
              <Button variant="outline" size="sm" className="text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950">
                Permanent Ban
              </Button>
              <Button variant="outline" size="sm" className="text-rose-700 border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950">
                Delete Content
              </Button>
              <Button variant="outline" size="sm" className="text-muted-foreground">
                Dismiss Report
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
