"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, ChevronDown, Coins, Edit2, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";

import { getAchievementBadges } from "@/lib/api";
import type { AchievementBadge, BadgeStatus } from "@/types/admin";
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
import { useDebounce } from "@/hooks/use-debounce";

type BadgeForm = {
  name: string;
  requirement: string;
  rewardCoins: number;
  icon: string;
};

const emptyForm: BadgeForm = { name: "", requirement: "", rewardCoins: 0, icon: "🏆" };

const statuses: Array<BadgeStatus | "all"> = ["all", "active", "disabled"];

function paginationRange(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

export function AchievementBadgesTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BadgeStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [editTarget, setEditTarget] = useState<AchievementBadge | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AchievementBadge | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<BadgeForm>(emptyForm);
  const debouncedSearch = useDebounce(search);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ["achievement-badges", debouncedSearch, status, page, pageSize],
    queryFn: () => getAchievementBadges({ search: debouncedSearch, status, page, pageSize }),
  });

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data]);

  function openEdit(badge: AchievementBadge) {
    setEditTarget(badge);
    setForm({ name: badge.name, requirement: badge.requirement, rewardCoins: badge.rewardCoins, icon: badge.icon });
  }

  function handleSave() {
    queryClient.invalidateQueries({ queryKey: ["achievement-badges"] });
    setEditTarget(null);
    setAddOpen(false);
    setForm(emptyForm);
  }

  function handleDelete() {
    queryClient.invalidateQueries({ queryKey: ["achievement-badges"] });
    setDeleteTarget(null);
  }

  const inputCls =
    "h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
  const selectCls =
    "h-9 appearance-none rounded-lg border border-border/70 bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

  const formBody = (
    <div className="space-y-3 py-1">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Badge Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Event Explorer"
          className={inputCls}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Requirement</label>
        <input
          value={form.requirement}
          onChange={(e) => setForm((f) => ({ ...f, requirement: e.target.value }))}
          placeholder="e.g. Join 10 Events"
          className={inputCls}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Reward (Coins)</label>
          <input
            type="number"
            min={0}
            value={form.rewardCoins || ""}
            onChange={(e) => setForm((f) => ({ ...f, rewardCoins: Number(e.target.value) }))}
            placeholder="50"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Badge Icon (Emoji)</label>
          <input
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            placeholder="🏆"
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search badges…"
              className="h-10 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Award className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value as BadgeStatus | "all"); setPage(1); }}
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
            <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Badge
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
                <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Badge</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Requirement</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reward</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="py-3 pl-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="py-3 pl-4 pr-3"><div className="h-4 w-36 animate-pulse rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-40 animate-pulse rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-5 w-16 animate-pulse rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-5 w-14 animate-pulse rounded bg-muted" /></td>
                    <td className="py-3 pl-3 pr-4"><div className="ml-auto h-7 w-7 animate-pulse rounded bg-muted" /></td>
                  </tr>
                ))
              ) : !query.data?.rows.length ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-sm text-muted-foreground">No badges found.</td>
                </tr>
              ) : (
                query.data.rows.map((badge) => (
                  <tr key={badge.id} className="border-b border-border/40 last:border-0">
                    <td className="py-3 pl-4 pr-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl leading-none">{badge.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-muted-foreground">{badge.requirement}</td>
                    <td className="px-3 py-3">
                      <Badge variant="warning" className="gap-1 font-semibold">
                        <Coins className="h-3 w-3" />
                        {badge.rewardCoins}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={badge.status === "active" ? "success" : "outline"}>
                        {badge.status === "active" ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(badge)}>
                            <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {badge.status === "active" ? "Disable" : "Enable"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(badge)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
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
              Showing {Math.min((page - 1) * pageSize + 1, query.data?.total ?? 0)}–{Math.min(page * pageSize, query.data?.total ?? 0)} of {query.data?.total ?? 0} badges
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

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Badge</DialogTitle>
            <DialogDescription>Update achievement badge details.</DialogDescription>
          </DialogHeader>
          {formBody}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Badge</DialogTitle>
            <DialogDescription>Define a new milestone-based achievement badge.</DialogDescription>
          </DialogHeader>
          {formBody}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.requirement}>
              Create Badge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Badge</DialogTitle>
            <DialogDescription>
              Permanently delete the &quot;{deleteTarget?.name}&quot; badge? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
