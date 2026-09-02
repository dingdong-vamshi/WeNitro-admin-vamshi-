"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Eye, Mail, MoreVertical, Pencil, PlusCircle, Save, Search, Send, Trash2, Upload } from "lucide-react";

import { getEmailCampaigns } from "@/lib/api";
import type { CampaignAudience, EmailCampaign, EmailCampaignStatus } from "@/types/admin";
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

// ── Lookups ───────────────────────────────────────────────────────────────────

const statusVariant: Record<EmailCampaignStatus, "success" | "warning" | "secondary" | "outline"> = {
  sent: "success",
  active: "secondary",
  scheduled: "warning",
  draft: "outline",
};

const statuses: Array<EmailCampaignStatus | "all"> = ["all", "active", "scheduled", "sent", "draft"];

const inputCls = "h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

function paginationRange(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

const audienceOptions: CampaignAudience[] = [
  "All Users",
  "Event Participants",
  "Custom Segment",
  "New Users",
  "Event Hosts",
  "Business Accounts",
];

// ── Preview dialog (from the editor form) ────────────────────────────────────

function EmailPreviewDialog({
  subject,
  title,
  body,
  cta,
  onClose,
}: {
  subject: string;
  title: string;
  body: string;
  cta: string;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Preview
          </DialogTitle>
          <DialogDescription>How this email will appear to recipients.</DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-lg border border-border/70 bg-muted/20">
          <div className="space-y-1 border-b border-border/50 bg-muted/40 px-4 py-3 text-sm">
            <p><span className="text-muted-foreground">From:</span> WeNitro &lt;noreply@wenitro.com&gt;</p>
            <p><span className="text-muted-foreground">Subject:</span> <span className="font-medium">{subject || "(no subject)"}</span></p>
          </div>
          <div className="space-y-3 p-5">
            <p className="text-base font-semibold">{title || "(no title)"}</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {body || "(empty message body)"}
            </p>
            {cta && (
              <div className="pt-2">
                <span className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                  {cta}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Preview dialog (from list row) ───────────────────────────────────────────

function CampaignPreviewDialog({
  campaign,
  onClose,
}: {
  campaign: EmailCampaign;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {campaign.name}
          </DialogTitle>
          <DialogDescription>Email campaign preview</DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-lg border border-border/70 bg-muted/20">
          <div className="space-y-1 border-b border-border/50 bg-muted/40 px-4 py-3 text-sm">
            <p><span className="text-muted-foreground">From:</span> WeNitro &lt;noreply@wenitro.com&gt;</p>
            <p><span className="text-muted-foreground">To:</span> {campaign.audience}</p>
            <p><span className="text-muted-foreground">Subject:</span> <span className="font-medium">{campaign.subject}</span></p>
          </div>
          <div className="space-y-3 p-5">
            <p className="text-base font-semibold">{campaign.name}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This is a preview of the <strong>{campaign.name}</strong> email campaign sending to{" "}
              <strong>{campaign.audience}</strong>. The full rendered content would appear here.
            </p>
            <div className="pt-2">
              <span className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                View Events
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit dialog ───────────────────────────────────────────────────────────────

function EditEmailDialog({
  campaign,
  onClose,
}: {
  campaign: EmailCampaign;
  onClose: () => void;
}) {
  const [name, setName] = useState(campaign.name);
  const [subject, setSubject] = useState(campaign.subject);
  const [audience, setAudience] = useState<CampaignAudience>(campaign.audience);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Email Campaign</DialogTitle>
          <DialogDescription>Update &ldquo;{campaign.name}&rdquo; campaign details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Campaign Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} />
          </div>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Create / editor form ──────────────────────────────────────────────────────

function EmailEditor() {
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("View Events");
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="border-b border-border/70 px-4 py-3">
          <p className="text-sm font-semibold">Create Email Campaign</p>
          <p className="text-xs text-muted-foreground">Design and target a new email campaign.</p>
        </div>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Subject</label>
              <input
                placeholder="e.g. Your Weekend Events Await!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Title</label>
              <input
                placeholder="e.g. Weekend Adventure Events"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Message Body</label>
            <div className="min-h-[140px] rounded-lg border border-border/70 bg-muted/20 p-3">
              <textarea
                rows={6}
                placeholder="Write your email content here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Add Image</label>
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Call-to-Action Button</label>
              <input
                placeholder="e.g. View Events"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Send To</label>
            <div className="space-y-2 rounded-lg border border-border/60 p-3">
              {audienceOptions.map((a) => (
                <label key={a} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="email-audience"
                    defaultChecked={a === "All Users"}
                    className="accent-primary"
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button disabled={!subject.trim() || !body.trim()}>
              <Send className="mr-1.5 h-4 w-4" />
              Send Email
            </Button>
            <Button variant="outline">
              <Save className="mr-1.5 h-4 w-4" />
              Save Draft
            </Button>
            <Button variant="outline">Schedule Email</Button>
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="mr-1.5 h-4 w-4" />
              Preview Email
            </Button>
          </div>
        </div>
      </div>

      {showPreview && (
        <EmailPreviewDialog
          subject={subject}
          title={title}
          body={body}
          cta={cta}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function EmailCampaignsTable() {
  const [tab, setTab] = useState<"list" | "create">("list");
  const [previewing, setPreviewing] = useState<EmailCampaign | null>(null);
  const [editing, setEditing] = useState<EmailCampaign | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EmailCampaignStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ["email-campaigns", debouncedSearch, status, page, pageSize],
    queryFn: () => getEmailCampaigns({ search: debouncedSearch, status, page, pageSize }),
  });

  const campaigns = data?.rows ?? [];
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
              {t === "list" ? "Campaign List" : "Create Campaign"}
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
                  placeholder="Search campaigns, subjects…"
                  className="h-10 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value as EmailCampaignStatus | "all"); setPage(1); }}
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
                  New Campaign
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
                    <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email Name</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Audience</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</th>
                    <th className="py-3 pl-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: pageSize }).map((_, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="py-3 pl-4 pr-3"><div className="h-4 w-36 animate-pulse rounded bg-muted" /></td>
                        <td className="px-3 py-3"><div className="h-4 w-48 animate-pulse rounded bg-muted" /></td>
                        <td className="px-3 py-3"><div className="h-4 w-28 animate-pulse rounded bg-muted" /></td>
                        <td className="px-3 py-3"><div className="h-5 w-16 animate-pulse rounded bg-muted" /></td>
                        <td className="px-3 py-3"><div className="h-4 w-24 animate-pulse rounded bg-muted" /></td>
                        <td className="py-3 pl-3 pr-4"><div className="ml-auto h-7 w-7 animate-pulse rounded bg-muted" /></td>
                      </tr>
                    ))
                  ) : !campaigns.length ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center text-sm text-muted-foreground">No campaigns found.</td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b border-border/40 last:border-0">
                        <td className="py-3 pl-4 pr-3 font-medium">{campaign.name}</td>
                        <td className="max-w-[240px] truncate px-3 py-3 text-sm text-muted-foreground">{campaign.subject}</td>
                        <td className="px-3 py-3 text-sm">{campaign.audience}</td>
                        <td className="px-3 py-3">
                          <Badge variant={statusVariant[campaign.status]} className="capitalize">
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-sm">
                          {new Date(campaign.createdAt + "T00:00:00").toLocaleDateString("en-GB", {
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
                              <DropdownMenuItem onSelect={() => setPreviewing(campaign)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setEditing(campaign)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
        )}

        {tab === "create" && <EmailEditor />}
      </div>

      {previewing && (
        <CampaignPreviewDialog campaign={previewing} onClose={() => setPreviewing(null)} />
      )}
      {editing && (
        <EditEmailDialog campaign={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
