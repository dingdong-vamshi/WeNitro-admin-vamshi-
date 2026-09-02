"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, CalendarClock, ChevronDown, MoreVertical, Pause, Pencil, PlusCircle, Save, Search, Send, Trash2 } from "lucide-react";

import { getPushCampaigns } from "@/lib/api";
import type { CampaignAudience, PushCampaign, PushCampaignStatus } from "@/types/admin";
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

const statuses: Array<PushCampaignStatus | "all"> = ["all", "active", "scheduled", "sent", "paused", "draft"];

function paginationRange(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

const statusVariant: Record<PushCampaignStatus, "success" | "warning" | "secondary" | "outline" | "danger"> = {
  sent: "success",
  active: "secondary",
  scheduled: "warning",
  paused: "outline",
  draft: "outline",
};

const audienceOptions: CampaignAudience[] = [
  "All Users",
  "Event Participants",
  "Event Hosts",
  "Business Accounts",
  "New Users",
  "Custom Segment",
];

function CampaignDetail({ campaign }: { campaign: PushCampaign }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
        <Bell className="h-4 w-4 text-violet-500" />
        <div>
          <p className="text-sm font-semibold">{campaign.name}</p>
          <p className="text-xs text-muted-foreground">Campaign details and performance metrics</p>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Campaign Name</p>
            <p className="font-medium">{campaign.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audience</p>
            <p className="font-medium">{campaign.audience}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notification Title</p>
            <p className="font-medium">{campaign.title}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scheduled Date</p>
            <p className="font-medium">
              {new Date(campaign.scheduledDate + "T00:00:00").toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="space-y-1 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</p>
            <p className="font-medium">{campaign.message}</p>
          </div>
        </div>

        {(campaign.status === "sent" || campaign.status === "active") && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Campaign Performance
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{campaign.sent.toLocaleString()}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Sent</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{campaign.opened.toLocaleString()}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Opened</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{campaign.clickRate}%</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Click Rate</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Create Campaign Form ──────────────────────────────────────────────────────
const inputCls = "h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

function CreateCampaignForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [audience, setAudience] = useState<CampaignAudience>("All Users");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  function handleCreate() {
    setName("");
    setTitle("");
    setMessage("");
    setScheduledDate("");
    onCreated();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="border-b border-border/70 px-4 py-3">
        <p className="text-sm font-semibold">Create Push Campaign</p>
        <p className="text-xs text-muted-foreground">Set up a new push notification campaign for a target audience.</p>
      </div>
      <div className="space-y-5 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium">Campaign Name</label>
            <input
              placeholder="e.g. Weekend Adventure Events"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium">Notification Title</label>
            <input
              placeholder="e.g. New Events This Weekend!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium">Message</label>
            <textarea
              rows={3}
              placeholder="Write the notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-lg border border-border/70 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Scheduled Date</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Audience</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {audienceOptions.map((a) => (
              <label key={a} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="push-audience"
                  checked={audience === a}
                  onChange={() => setAudience(a)}
                  className="accent-primary"
                />
                {a}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || !title.trim() || !message.trim()}
          >
            <Send className="mr-1.5 h-4 w-4" />
            Create Campaign
          </Button>
          <Button variant="outline">
            <Save className="mr-1.5 h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="outline">
            <CalendarClock className="mr-1.5 h-4 w-4" />
            Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Campaign Dialog ──────────────────────────────────────────────────────
function EditCampaignDialog({
  campaign,
  onClose,
}: {
  campaign: PushCampaign;
  onClose: () => void;
}) {
  const [name, setName] = useState(campaign.name);
  const [title, setTitle] = useState(campaign.title);
  const [message, setMessage] = useState(campaign.message);
  const [audience, setAudience] = useState<CampaignAudience>(campaign.audience);
  const [scheduledDate, setScheduledDate] = useState(campaign.scheduledDate);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>Update the details for &ldquo;{campaign.name}&rdquo;.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Campaign Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notification Title</label>
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
              <label className="text-sm font-medium">Audience</label>
              <div className="relative">
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as CampaignAudience)}
                  className="h-9 w-full appearance-none rounded-lg border border-border/70 bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {audienceOptions.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Scheduled Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className={inputCls}
              />
            </div>
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

export function PushCampaignsTable() {
  const [tab, setTab] = useState<"list" | "create">("list");
  const [selected, setSelected] = useState<PushCampaign | null>(null);
  const [editing, setEditing] = useState<PushCampaign | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PushCampaignStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ["push-campaigns", debouncedSearch, status, page, pageSize],
    queryFn: () => getPushCampaigns({ search: debouncedSearch, status, page, pageSize }),
  });

  const campaigns = data?.rows ?? [];
  const total = data?.total ?? 0;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return (
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
            {t === "list" ? "Campaign List" : "Create Campaign"}
          </button>
        ))}
      </div>

      {tab === "list" && (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
            {/* Filter bar */}
            <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 flex-1 lg:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search campaigns or audience…"
                  className="h-10 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bell className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value as PushCampaignStatus | "all"); setPage(1); }}
                    className="h-9 appearance-none rounded-lg border border-border/70 bg-background pl-9 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
                <Button size="sm" onClick={() => setTab("create")}>
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  Create Campaign
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
                    <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campaign Name</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Audience</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scheduled Date</th>
                    <th className="py-3 pl-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="py-3 pl-4 pr-3"><div className="h-4 w-40 animate-pulse rounded bg-muted" /></td>
                        <td className="px-3 py-3"><div className="h-4 w-28 animate-pulse rounded bg-muted" /></td>
                        <td className="px-3 py-3"><div className="h-5 w-16 animate-pulse rounded bg-muted" /></td>
                        <td className="px-3 py-3"><div className="h-4 w-24 animate-pulse rounded bg-muted" /></td>
                        <td className="py-3 pl-3 pr-4"><div className="ml-auto h-7 w-7 animate-pulse rounded bg-muted" /></td>
                      </tr>
                    ))
                  ) : !campaigns.length ? (
                    <tr>
                      <td colSpan={5} className="py-14 text-center text-sm text-muted-foreground">No campaigns found.</td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr
                        key={campaign.id}
                        className={`border-b border-border/40 last:border-0 cursor-pointer hover:bg-muted/30 ${
                          selected?.id === campaign.id ? "bg-muted/40" : ""
                        }`}
                        onClick={() => setSelected(campaign.id === selected?.id ? null : campaign)}
                      >
                        <td className="py-3 pl-4 pr-3 font-medium">{campaign.name}</td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">{campaign.audience}</td>
                        <td className="px-3 py-3">
                          <Badge variant={statusVariant[campaign.status]} className="capitalize">
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-sm">
                          {new Date(campaign.scheduledDate + "T00:00:00").toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 pl-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setEditing(campaign)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Campaign
                              </DropdownMenuItem>
                              {campaign.status === "active" && (
                                <DropdownMenuItem>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause Campaign
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Campaign
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
                  Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total} campaigns
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

          {selected && <CampaignDetail campaign={selected} />}
        </div>
      )}

      {tab === "create" && (
        <CreateCampaignForm onCreated={() => setTab("list")} />
      )}

      {editing && (
        <EditCampaignDialog campaign={editing} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
