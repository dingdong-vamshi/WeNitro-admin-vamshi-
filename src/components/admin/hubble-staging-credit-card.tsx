"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, FlaskConical, RotateCcw, ShieldCheck } from "lucide-react";

import { useAdminAuth } from "@/components/AdminAuthGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getHubbleStagingCredits, grantHubbleStagingCredit, reverseHubbleStagingCredit } from "@/lib/api";

function newKey() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function HubbleStagingCreditCard({ userId, userName }: { userId: string; userName: string }) {
  const { role } = useAdminAuth();
  const canManage = role === "admin" || role === "super_admin";
  const queryClient = useQueryClient();
  const [targetBalance, setTargetBalance] = useState<200 | 500>(200);
  const [reason, setReason] = useState("Approved Hubble staging client test");
  const [message, setMessage] = useState<string | null>(null);
  const requestKey = useRef(newKey());
  const query = useQuery({
    queryKey: ["hubble-staging-credits", userId],
    queryFn: () => getHubbleStagingCredits(userId),
    enabled: canManage,
  });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["hubble-staging-credits", userId] }),
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] }),
    ]);
  };

  const grant = useMutation({
    mutationFn: () => grantHubbleStagingCredit({ userId, targetBalance, reason: reason.trim(), idempotencyKey: requestKey.current }),
    onSuccess: async (result) => {
      setMessage(result.granted > 0
        ? `Granted ${result.granted} staging Nitro. Balance is now ${result.currentBalance}.`
        : `No credit was needed. Balance is already ${result.currentBalance}.`);
      requestKey.current = newKey();
      await refresh();
    },
  });

  const reverse = useMutation({
    mutationFn: (creditId: number) => reverseHubbleStagingCredit({ creditId, reason: "Approved staging test cleanup" }),
    onSuccess: async (result) => {
      setMessage(result.reversed > 0
        ? `Reversed ${result.reversed} unused staging Nitro. Balance is now ${result.currentBalance}.`
        : "This staging credit has no unused amount to reverse.");
      await refresh();
    },
  });

  if (!canManage) return null;
  const balance = query.data?.currentBalance ?? 0;
  const needed = Math.max(0, targetBalance - balance);
  const error = grant.error ?? reverse.error ?? query.error;

  return (
    <Card className="overflow-hidden border-violet-500/25">
      <CardHeader className="border-b border-border/60 bg-violet-500/5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-violet-500" />
              Hubble staging test credit
            </CardTitle>
            <CardDescription className="mt-1.5">
              Add only enough temporary, auditable Nitro for an approved staging tester.
            </CardDescription>
          </div>
          <Badge variant="secondary">STAGING ONLY</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-muted/25 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Tester</p>
            <p className="mt-1 truncate text-sm font-semibold">{userName}</p>
            <p className="text-xs text-muted-foreground">User ID {userId}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/25 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Current Nitro</p>
            <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold tabular-nums"><Coins className="h-5 w-5 text-amber-500" />{query.isLoading ? "…" : balance}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/25 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Credit needed</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-violet-500">+{needed}</p>
            <p className="text-xs text-muted-foreground">to reach {targetBalance}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Target staging balance</p>
          <div className="flex gap-2">
            {[200, 500].map((value) => (
              <Button key={value} type="button" size="sm" variant={targetBalance === value ? "default" : "outline"} onClick={() => setTargetBalance(value as 200 | 500)}>
                {value} Nitro
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold" htmlFor={`hubble-credit-reason-${userId}`}>Audit reason</label>
          <Input id={`hubble-credit-reason-${userId}`} value={reason} maxLength={240} onChange={(event) => setReason(event.target.value)} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" disabled={grant.isPending || query.isLoading || reason.trim().length < 5} onClick={() => { setMessage(null); grant.mutate(); }}>
            <ShieldCheck className="h-4 w-4" />
            {grant.isPending ? "Granting…" : needed > 0 ? `Grant +${needed} test Nitro` : "Confirm already eligible"}
          </Button>
          <p className="text-xs text-muted-foreground">Category: HUBBLE_STAGING_TEST_CREDIT</p>
        </div>

        {message ? <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}
        {error ? <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error.message}</p> : null}

        {(query.data?.credits.length ?? 0) > 0 ? (
          <div className="space-y-3 border-t border-border/60 pt-4">
            <p className="text-sm font-semibold">Audit trail</p>
            {query.data?.credits.map((credit) => (
              <div key={credit.id} className="rounded-xl border border-border/70 p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">+{credit.grantedAmount} Nitro to target {credit.targetBalance}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{credit.reason} · {new Date(credit.grantedAt).toLocaleString("en-IN")}</p>
                  </div>
                  <Badge variant="secondary">{credit.status.replace("_", " ")}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Unused and reversible: <strong className="text-foreground">{credit.remainingAmount} Nitro</strong></p>
                  {credit.remainingAmount > 0 && credit.status !== "reversed" ? (
                    <Button type="button" size="sm" variant="outline" disabled={reverse.isPending} onClick={() => { setMessage(null); reverse.mutate(credit.id); }}>
                      <RotateCcw className="h-3.5 w-3.5" /> Reverse unused credit
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
