"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronDown, MoreVertical, Pencil, PlusCircle, PowerOff, Search, Trash2 } from "lucide-react";

import { getSystemAlerts } from "@/lib/api";
import type { SystemAlertConfig, AlertPriority, AlertStatus, AlertAffected } from "@/types/admin";
import { useDebounce } from "@/hooks/use-debounce";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

const priorityVariant: Record<AlertPriority, "danger" | "warning" | "secondary"> = {
  high: "danger",
  medium: "warning",
  low: "secondary",
};

const statusVariant: Record<AlertStatus, "success" | "warning" | "outline"> = {
  active: "success",
  scheduled: "warning",
  sent: "outline",
};

const affectedOptions: AlertAffected[] = ["All Users", "Android Users", "iOS Users"];
const priorityOptions: AlertPriority[] = ["low", "medium", "high"];
const alertStatuses: Array<AlertStatus | "all"> = ["all", "active", "scheduled", "sent"];

const inputCls = "h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

function paginationRange(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

// ── Edit Alert Dialog ─────────────────────────────────────────────────────────
function EditAlertDialog({
  alert,
  onClose,
}: {
  alert: SystemAlertConfig;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(alert.title);
  const [message, setMessage] = useState(alert.message);
  const [priority, setPriority] = useState<AlertPriority>(alert.priority);
  const [affectedUsers, setAffectedUsers] = useState<AlertAffected>(alert.affectedUsers);
  const [displayInApp, setDisplayInApp] = useState(alert.displayInApp);
  const [displayPush, setDisplayPush] = useState(alert.displayPush);
  const [displayEmail, setDisplayEmail] = useState(alert.displayEmail);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit System Alert</DialogTitle>
          <DialogDescription>Update &ldquo;{alert.title}&rdquo;.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Alert Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Message</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Priority</label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as AlertPriority)}
                  className="h-9 w-full appearance-none rounded-lg border border-border/70 bg-background pl-3 pr-8 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {priorityOptions.map((p) => (
                    <option key={p} value={p} className="capitalize">{p}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Affected Users</label>
              <div className="relative">
                <select
                  value={affectedUsers}
                  onChange={(e) => setAffectedUsers(e.target.value as AlertAffected)}
                  className="h-9 w-full appearance-none rounded-lg border border-border/70 bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {affectedOptions.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="space-y-1 rounded-lg border border-border/60 divide-y divide-border/40">
            {[
              { label: "In-App Banner", value: displayInApp, set: setDisplayInApp },
              { label: "Push Notification", value: displayPush, set: setDisplayPush },
              { label: "Email Alert", value: displayEmail, set: setDisplayEmail },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm">
                {label}
                <Switch checked={value} onCheckedChange={set} />
              </label>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateAlertForm() {
  const [displayInApp, setDisplayInApp] = useState(true);
  const [displayPush, setDisplayPush] = useState(true);
  const [displayEmail, setDisplayEmail] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="border-b border-border/70 px-4 py-3">
        <p className="text-sm font-semibold">Create System Alert</p>
        <p className="text-xs text-muted-foreground">Notify users about platform issues, maintenance windows, or important updates.</p>
      </div>
      <div className="space-y-5 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium">Alert Title</label>
            <input placeholder="e.g. Scheduled Server Maintenance" className={inputCls} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium">Message</label>
            <textarea
              rows={3}
              placeholder="Describe the alert in detail..."
              className="w-full resize-none rounded-lg border border-border/70 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <div className="space-y-2">
              {priorityOptions.map((p) => (
                <label key={p} className="flex cursor-pointer items-center gap-2 text-sm capitalize">
                  <input type="radio" name="priority" defaultChecked={p === "medium"} className="accent-primary" />
                  {p}
                </label>
              ))}
            </div>
          </div>

          {/* Affected Users */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Affected Users</label>
            <div className="space-y-2">
              {affectedOptions.map((a) => (
                <label key={a} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="radio" name="affected" defaultChecked={a === "All Users"} className="accent-primary" />
                  {a}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Display Options</label>
          <div className="rounded-lg border border-border/60 divide-y divide-border/40">
            {[
              { label: "In-App Banner", value: displayInApp, set: setDisplayInApp },
              { label: "Push Notification", value: displayPush, set: setDisplayPush },
              { label: "Email Alert", value: displayEmail, set: setDisplayEmail },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm">
                {label}
                <Switch checked={value} onCheckedChange={set} />
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
            <Button>
              <AlertTriangle className="mr-1.5 h-4 w-4" />
              Create Alert
            </Button>
            <Button variant="outline">Save Draft</Button>
          </div>
      </div>
    </div>
  );
}

export function SystemAlertsTable() {
  const [tab, setTab] = useState<"list" | "create">("list");
  const [editing, setEditing] = useState<SystemAlertConfig | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AlertStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ["system-alerts", debouncedSearch, status, page, pageSize],
    queryFn: () => getSystemAlerts({ search: debouncedSearch, status, page, pageSize }),
  });

  const alerts = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
    <>
      <div className="space-y-5">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-border/80">
          {(["list", "create"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`border-b-2 pb-2 text-sm font-semibold transition-colors ${
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "list" ? "Active Alerts" : "Create Alert"}
            </button>
          ))}
        </div>

        {tab === "list" && (
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
            {/* Filter bar */}
            <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 flex-1 lg:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search alerts…"
                  className="h-10 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <AlertTriangle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value as AlertStatus | "all"); setPage(1); }}
                    className="h-9 appearance-none rounded-lg border border-border/70 bg-background pl-9 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  >
                    {alertStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
                <Button size="sm" onClick={() => setTab("create")}>
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  New Alert
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
                    <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alert Title</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Affected</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Priority</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</th>
                    <th className="py-3 pl-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: pageSize }).map((_, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="py-3 pl-4 pr-3"><div className="h-4 w-44 animate-pulse rounded bg-muted" /></td>
                        <td className="px-3 py-3"><div className="h-4 w-24 animate-pulse rounded bg-muted" /></td>
                        <td className="px-3 py-3"><div className="h-5 w-16 animate-pulse rounded bg-muted" /></td>
                        <td className="px-3 py-3"><div className="h-5 w-16 animate-pulse rounded bg-muted" /></td>
                        <td className="px-3 py-3"><div className="h-4 w-24 animate-pulse rounded bg-muted" /></td>
                        <td className="py-3 pl-3 pr-4"><div className="ml-auto h-7 w-7 animate-pulse rounded bg-muted" /></td>
                      </tr>
                    ))
                  ) : !alerts.length ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-sm text-muted-foreground">No alerts found.</td>
                    </tr>
                  ) : (
                    alerts.map((alert) => (
                      <tr key={alert.id} className="border-b border-border/40 last:border-0">
                        <td className="py-3 pl-4 pr-3">
                          <p className="font-medium leading-snug">{alert.title}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{alert.message}</p>
                        </td>
                        <td className="px-3 py-3 text-sm">{alert.affectedUsers}</td>
                        <td className="px-3 py-3">
                          <Badge variant={priorityVariant[alert.priority]} className="capitalize">{alert.priority}</Badge>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={statusVariant[alert.status]} className="capitalize">{alert.status}</Badge>
                        </td>
                        <td className="px-3 py-3 text-sm">
                          {new Date(alert.createdAt + "T00:00:00").toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 pl-3 pr-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setEditing(alert)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Alert
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Alert
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total} alerts
                </span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="h-8 appearance-none rounded-md border border-border/70 bg-background pl-2 pr-6 text-xs focus:outline-none"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>{n} rows</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-background text-sm disabled:opacity-40 hover:bg-muted/60"
                >
                  <ChevronDown className="h-3.5 w-3.5 rotate-90" />
                </button>
                {paginationRange(page, totalPages).map((p, i) =>
                  p === "ellipsis" ? (
                    <span key={`e${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs ${
                        p === page
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/70 bg-background hover:bg-muted/60"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-background text-sm disabled:opacity-40 hover:bg-muted/60"
                >
                  <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "create" && <CreateAlertForm />}
      </div>

      {editing && (
        <EditAlertDialog alert={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
