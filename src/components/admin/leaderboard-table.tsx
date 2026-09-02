"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Coins, Crown, Medal, RefreshCcw, Trophy, Users } from "lucide-react";

import { getLeaderboard } from "@/lib/api";
import type { LeaderboardPeriod } from "@/types/admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const periods: Array<{ label: string; value: LeaderboardPeriod }> = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "All Time", value: "all_time" },
];

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-4 w-4 text-amber-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-400" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />;
  return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
}

export function LeaderboardTable() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("monthly");
  const [resetOpen, setResetOpen] = useState(false);
  const [insightTab, setInsightTab] = useState<"hosts" | "participants" | "referrers">("hosts");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: () => getLeaderboard(period),
  });

  const topHosts = [...entries].sort((a, b) => b.eventsHosted - a.eventsHosted).slice(0, 3);
  const topParticipants = [...entries].sort((a, b) => b.eventsJoined - a.eventsJoined).slice(0, 3);
  const topReferrers = [...entries].sort((a, b) => b.referrals - a.referrals).slice(0, 3);

  const insightData =
    insightTab === "hosts" ? topHosts : insightTab === "participants" ? topParticipants : topReferrers;
  const insightMetric =
    insightTab === "hosts" ? "eventsHosted" : insightTab === "participants" ? "eventsJoined" : "referrals";
  const insightLabel =
    insightTab === "hosts" ? "Events Hosted" : insightTab === "participants" ? "Events Joined" : "Referrals";

  return (
    <>
      <div className="space-y-5">
        {/* Period tabs */}
        <div className="flex gap-6 border-b border-border/80">
          {periods.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`border-b-2 pb-2 text-sm font-semibold transition-colors ${period === p.value ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Main leaderboard table */}
          <div className="lg:col-span-2 overflow-hidden rounded-xl border border-border/70 bg-card">
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <h3 className="flex items-center gap-2 font-semibold">
                <Trophy className="h-4 w-4 text-amber-500" />
                Leaderboard
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/5"
                onClick={() => setResetOpen(true)}
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Reset Leaderboard
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
                    <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-16">Rank</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coins Earned</th>
                    <th className="hidden px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">Hosted</th>
                    <th className="hidden px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">Joined</th>
                    <th className="hidden py-3 pl-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">Referrals</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="border-b border-border/40">
                          <td className="py-3 pl-4 pr-3"><div className="h-4 w-8 animate-pulse rounded bg-muted" /></td>
                          <td className="px-3 py-3"><div className="h-4 w-32 animate-pulse rounded bg-muted" /></td>
                          <td className="px-3 py-3"><div className="h-5 w-20 animate-pulse rounded bg-muted" /></td>
                          <td className="hidden px-3 py-3 md:table-cell"><div className="h-4 w-8 animate-pulse rounded bg-muted" /></td>
                          <td className="hidden px-3 py-3 md:table-cell"><div className="h-4 w-8 animate-pulse rounded bg-muted" /></td>
                          <td className="hidden py-3 pl-3 pr-4 md:table-cell"><div className="h-4 w-8 animate-pulse rounded bg-muted" /></td>
                        </tr>
                      ))
                    : entries.map((entry) => (
                        <tr
                          key={entry.userId}
                          className={`border-b border-border/40 last:border-0 ${entry.rank <= 3 ? "bg-amber-500/5" : ""}`}
                        >
                          <td className="py-3 pl-4 pr-3">
                            <div className="flex items-center justify-center">
                              <RankIcon rank={entry.rank} />
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs">{entry.avatar}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium leading-none">{entry.name}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{entry.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant="warning" className="gap-1 font-semibold">
                              <Coins className="h-3 w-3" />
                              {entry.coinsEarned.toLocaleString()}
                            </Badge>
                          </td>
                          <td className="hidden px-3 py-3 text-sm md:table-cell">{entry.eventsHosted}</td>
                          <td className="hidden px-3 py-3 text-sm md:table-cell">{entry.eventsJoined}</td>
                          <td className="hidden py-3 pl-3 pr-4 text-right text-sm md:table-cell">{entry.referrals}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights panel */}
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
            <div className="border-b border-border/70 px-4 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4 text-violet-500" />
                Leaderboard Insights
              </h3>
              <div className="mt-2 flex gap-2">
                {(["hosts", "participants", "referrers"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${insightTab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    onClick={() => setInsightTab(t)}
                  >
                    {t === "hosts" ? "Hosts" : t === "participants" ? "Participants" : "Referrers"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 p-4">
              {insightData.map((entry, idx) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">{entry.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{entry.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {(entry[insightMetric as keyof typeof entry] as number).toLocaleString()}{" "}
                    <span className="text-xs font-normal text-muted-foreground">{insightLabel}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirm Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Leaderboard</DialogTitle>
            <DialogDescription>
              This will clear all {periods.find((p) => p.value === period)?.label.toLowerCase()} leaderboard scores.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => setResetOpen(false)}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
