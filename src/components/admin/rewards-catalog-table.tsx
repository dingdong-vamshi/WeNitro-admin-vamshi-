"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Coins, Edit2, Gift, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";

import { getRewardCatalog } from "@/lib/api";
import type { RewardItem, RewardStatus } from "@/types/admin";
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

type RewardForm = {
  name: string;
  coinsRequired: number;
  partner: string;
  validUntil: string;
  description: string;
};

const emptyForm: RewardForm = { name: "", coinsRequired: 0, partner: "", validUntil: "", description: "" };

const statuses: Array<RewardStatus | "all"> = ["all", "active", "inactive"];

function paginationRange(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

export function RewardsCatalogTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RewardStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [editTarget, setEditTarget] = useState<RewardItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RewardItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<RewardForm>(emptyForm);
  const debouncedSearch = useDebounce(search);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ["reward-catalog", debouncedSearch, status, page, pageSize],
    queryFn: () => getRewardCatalog({ search: debouncedSearch, status, page, pageSize }),
  });

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data]);

  function openEdit(item: RewardItem) {
    setEditTarget(item);
    setForm({
      name: item.name,
      coinsRequired: item.coinsRequired,
      partner: item.partner,
      validUntil: item.validUntil,
      description: item.description,
    });
  }

  function handleSaveEdit() {
    queryClient.invalidateQueries({ queryKey: ["reward-catalog"] });
    setEditTarget(null);
  }

  function handleAdd() {
    queryClient.invalidateQueries({ queryKey: ["reward-catalog"] });
    setAddOpen(false);
    setForm(emptyForm);
  }

  function handleDelete() {
    queryClient.invalidateQueries({ queryKey: ["reward-catalog"] });
    setDeleteTarget(null);
  }

  function toggleStatus(item: RewardItem) {
    queryClient.invalidateQueries({ queryKey: ["reward-catalog"] });
  }

  const inputCls =
    "h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
  const selectCls =
    "h-9 appearance-none rounded-lg border border-border/70 bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

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
              placeholder="Search rewards or partners…"
              className="h-10 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Gift className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value as RewardStatus | "all"); setPage(1); }}
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
              Add Reward
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
                <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reward Name</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Partner</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coins Required</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valid Until</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="py-3 pl-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="py-3 pl-4 pr-3"><div className="h-4 w-36 animate-pulse rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-24 animate-pulse rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-5 w-16 animate-pulse rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-20 animate-pulse rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-5 w-14 animate-pulse rounded bg-muted" /></td>
                    <td className="py-3 pl-3 pr-4"><div className="ml-auto h-7 w-7 animate-pulse rounded bg-muted" /></td>
                  </tr>
                ))
              ) : !query.data?.rows.length ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-sm text-muted-foreground">No rewards found.</td>
                </tr>
              ) : (
                query.data.rows.map((item) => (
                  <tr key={item.id} className="border-b border-border/40 last:border-0">
                    <td className="py-3 pl-4 pr-3">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 shrink-0 text-violet-500" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-muted-foreground">{item.partner}</td>
                    <td className="px-3 py-3">
                      <Badge variant="warning" className="gap-1 font-semibold">
                        <Coins className="h-3 w-3" />
                        {item.coinsRequired.toLocaleString()}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-sm">{item.validUntil}</td>
                    <td className="px-3 py-3">
                      <Badge variant={item.status === "active" ? "success" : "outline"}>
                        {item.status === "active" ? "Active" : "Inactive"}
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
                          <DropdownMenuItem onClick={() => openEdit(item)}>
                            <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(item)}>
                            {item.status === "active" ? "Disable" : "Enable"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(item)}
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
              Showing {Math.min((page - 1) * pageSize + 1, query.data?.total ?? 0)}–{Math.min(page * pageSize, query.data?.total ?? 0)} of {query.data?.total ?? 0} rewards
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
            <DialogTitle>Edit Reward</DialogTitle>
            <DialogDescription>Update reward details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {(
              [
                { key: "name", label: "Reward Name", placeholder: "Free Coffee Voucher" },
                { key: "partner", label: "Brand / Partner", placeholder: "Starbucks" },
                { key: "validUntil", label: "Expiry Date", placeholder: "2026-06-30", type: "date" },
              ] as const
            ).map(({ key, label, placeholder, ...rest }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-sm font-medium">{label}</label>
                <input
                  type={"type" in rest ? (rest as { type: string }).type : "text"}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className={inputCls}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Coins Required</label>
              <input
                type="number"
                min={0}
                value={form.coinsRequired}
                onChange={(e) => setForm((f) => ({ ...f, coinsRequired: Number(e.target.value) }))}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Reward</DialogTitle>
            <DialogDescription>Add a new item to the rewards catalog.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {(
              [
                { key: "name", label: "Reward Name", placeholder: "Free Coffee Voucher" },
                { key: "partner", label: "Brand / Partner", placeholder: "Starbucks" },
                { key: "validUntil", label: "Expiry Date", placeholder: "2026-06-30", type: "date" },
              ] as const
            ).map(({ key, label, placeholder, ...rest }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-sm font-medium">{label}</label>
                <input
                  type={"type" in rest ? (rest as { type: string }).type : "text"}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className={inputCls}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Coins Required</label>
              <input
                type="number"
                min={1}
                value={form.coinsRequired || ""}
                onChange={(e) => setForm((f) => ({ ...f, coinsRequired: Number(e.target.value) }))}
                placeholder="200"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Describe the reward…"
                className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.partner || form.coinsRequired <= 0}>
              Save Reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Reward</DialogTitle>
            <DialogDescription>
              Permanently delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
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
