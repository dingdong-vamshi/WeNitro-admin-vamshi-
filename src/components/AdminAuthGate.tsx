"use client";

import { createContext, FormEvent, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "authorized"; session: Session }
  | { status: "unauthorized"; session: Session };

export type AdminRole = "admin" | "super_admin" | "finance_admin";

type AdminAuthContextValue = {
  session: Session;
  role: AdminRole;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);
const ADMIN_ROLES = new Set<AdminRole>(["admin", "super_admin", "finance_admin"]);

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("useAdminAuth must be used inside AdminAuthGate.");
  return value;
}

function resolveAuthState(session: Session | null): AuthState {
  if (!session) {
    return { status: "signed-out" };
  }

  const role = session.user.app_metadata?.role as AdminRole | undefined;
  return role && ADMIN_ROLES.has(role) && (!session.user.app_metadata.admin_status || session.user.app_metadata.admin_status === "active")
    ? { status: "authorized", session }
    : { status: "unauthorized", session };
}

function AuthBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,85,231,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="relative w-full max-w-md">{children}</div>
    </main>
  );
}

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(async ({ data, error: sessionError }) => {
      if (!active) return;

      if (sessionError) {
        setError(sessionError.message);
        setAuthState({ status: "signed-out" });
        return;
      }

      if (!data.session) { setAuthState({status:"signed-out"}); return; }
      const current = await supabase.auth.getUser();
      if (active) setAuthState(current.error || !current.data.user ? {status:"signed-out"} : resolveAuthState({...data.session,user:current.data.user}));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { if (active) setAuthState({status:"signed-out"}); return; }
      // Fetch current server metadata outside the auth callback lock.
      setTimeout(() => { void supabase.auth.getUser().then(({data,error}) => {
        if (active) setAuthState(error || !data.user ? {status:"signed-out"} : resolveAuthState({...session,user:data.user}));
      }); },0);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) setError(signInError.message);
    setIsSubmitting(false);
  }

  async function handleSignOut() {
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
  }

  const contextValue = useMemo<AdminAuthContextValue | null>(() => {
    if (authState.status !== "authorized") return null;
    return {
      session: authState.session,
      role: authState.session.user.app_metadata.role as AdminRole,
      signOut: async () => {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
      },
    };
  }, [authState]);

  if (authState.status === "loading") {
    return (
      <AuthBackdrop>
        <div className="flex items-center justify-center gap-3 text-sm font-medium text-muted-foreground">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
          Verifying admin access
        </div>
      </AuthBackdrop>
    );
  }

  if (authState.status === "authorized") {
    return <AdminAuthContext.Provider value={contextValue}>{children}</AdminAuthContext.Provider>;
  }

  if (authState.status === "unauthorized") {
    return (
      <AuthBackdrop>
        <Card className="overflow-hidden shadow-xl shadow-black/5">
          <div className="h-1 bg-destructive" />
          <CardHeader className="space-y-3">
            <div className="w-fit rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-destructive">
              Access restricted
            </div>
            <CardTitle className="font-mono text-2xl">Admin permission required</CardTitle>
            <CardDescription className="leading-6">
              You are signed in as {authState.session.user.email ?? "this user"}, but this account does not have an admin role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button className="w-full" variant="outline" onClick={handleSignOut}>
              Sign out and use another account
            </Button>
          </CardContent>
        </Card>
      </AuthBackdrop>
    );
  }

  return (
    <AuthBackdrop>
      <Card className="overflow-hidden shadow-xl shadow-black/5">
        <div className="h-1 bg-primary" />
        <CardHeader className="space-y-3">
          <div className="w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
            WeNitro operations
          </div>
          <CardTitle className="font-mono text-2xl">Admin sign in</CardTitle>
          <CardDescription>
            Use an account with an admin, super-admin, or finance-admin role to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSignIn}>
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="admin-email">
                Email
              </label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@wenitro.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold" htmlFor="admin-password">
                Password
              </label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {!isSupabaseConfigured ? (
              <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                Supabase environment variables are not configured for this deployment.
              </p>
            ) : null}
            {error ? (
              <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button className="w-full" type="submit" disabled={isSubmitting || !isSupabaseConfigured}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthBackdrop>
  );
}
