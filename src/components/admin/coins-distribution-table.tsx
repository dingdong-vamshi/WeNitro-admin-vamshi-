"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Coins, Edit2, Plus, Search, Trash2 } from "lucide-react";

import { getCoinRules } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import type { CoinRule } from "@/types/admin";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type RuleForm = { action: string; coins: number; condition: string };

const emptyForm: RuleForm = { action: "", coins: 0, condition: "" };

export function CoinsDistributionTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search);
  const [editTarget, setEditTarget] = useState<CoinRule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CoinRule | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<RuleForm>(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["coin-rules", debouncedSearch, page, pageSize],
    queryFn: () => getCoinRules({ search: debouncedSearch, page, pageSize }),
  });

  const rules = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  const showingStart = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const showingEnd = Math.min(page * pageSize, total);

  function openEdit(rule: CoinRule) {
    setEditTarget(rule);
    setForm({ action: rule.action, coins: rule.coins, condition: rule.condition ?? "" });
  }

  function openAdd() {
    setForm(emptyForm);
    setAddOpen(true);
  }

  function handleSaveEdit() {
    queryClient.invalidateQueries({ queryKey: ["coin-rules"] });
    setEditTarget(null);
  }

  function handleAdd() {
    queryClient.invalidateQueries({ queryKey: ["coin-rules"] });
    setAddOpen(false);
    setForm(emptyForm);
  }

  function handleDelete() {
    queryClient.invalidateQueries({ queryKey: ["coin-rules"] });
    setDeleteTarget(null);
  }

  const inputCls =
    "h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        {/* Filter bar */}
        <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search action or condition…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-10 w-full rounded-lg border border-border/70 bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <Button size="sm" onClick={openAdd} className="gap-1.5 self-start lg:self-auto">
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>
        </div>
        <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
                  <TableHead className="pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coins Rewarded</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Condition</TableHead>
                  <TableHead className="w-24 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i} className="border-b border-border/40">
                        <TableCell className="pl-4"><div className="h-3.5 w-32 animate-pulse rounded bg-muted" /></TableCell>
                        {Array.from({ length: 3 }).map((__, j) => (
                          <TableCell key={j}><div className="h-3.5 w-20 animate-pulse rounded bg-muted" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : rules.map((rule) => (
                      <TableRow key={rule.id} className="border-b border-border/40 last:border-0">
                        <TableCell className="pl-4 py-3 font-medium text-sm">{rule.action}</TableCell>
                        <TableCell className="py-3">
                          <Badge variant="warning" className="gap-1 font-semibold">
                            <Coins className="h-3 w-3" />
                            {rule.coins} Coins
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-sm text-muted-foreground">
                          {rule.condition ?? "—"}
                        </TableCell>
                        <TableCell className="pr-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(rule)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(rule)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
        </Table>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  {total > 0 ? `Showing ${showingStart}\u2013${showingEnd} of ${total} rules` : "No rules found"}
                </span>
                <div className="flex items-center gap-1.5">
                  <span>Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="h-7 appearance-none rounded border border-border/70 bg-background px-2 pr-6 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronDown className="h-4 w-4 rotate-90" />
                  </Button>
                  {(() => {
                    const delta = 1;
                    const range: Array<number | "ellipsis"> = [];
                    for (let i = 1; i <= totalPages; i++) {
                      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) range.push(i);
                      else if (range[range.length - 1] !== "ellipsis") range.push("ellipsis");
                    }
                    return range.map((item, idx) =>
                      item === "ellipsis" ? (
                        <span key={`e-${idx}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">\u2026</span>
                      ) : (
                        <Button key={item} variant={item === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => setPage(item as number)}>{item}</Button>
                      ),
                    );
                  })()}
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                  </Button>
                </div>
              )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Coin Rule</DialogTitle>
            <DialogDescription>Update the coins rewarded for this action.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Action Name</label>
              <input
                value={form.action}
                onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Coins Amount</label>
              <input
                type="number"
                min={0}
                value={form.coins}
                onChange={(e) => setForm((f) => ({ ...f, coins: Number(e.target.value) }))}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Condition</label>
              <input
                value={form.condition}
                onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
                placeholder="e.g. Once per day"
                className={inputCls}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={!form.action || form.coins < 0}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Coin Reward Rule</DialogTitle>
            <DialogDescription>Define a new action and its coin reward.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Action Name</label>
              <input
                value={form.action}
                onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
                placeholder="e.g. Share Event"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Coins Amount</label>
              <input
                type="number"
                min={0}
                value={form.coins || ""}
                onChange={(e) => setForm((f) => ({ ...f, coins: Number(e.target.value) }))}
                placeholder="e.g. 8"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Condition</label>
              <input
                value={form.condition}
                onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
                placeholder="e.g. Per unique share"
                className={inputCls}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.action || form.coins <= 0}>
              Add Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Coin Rule</DialogTitle>
            <DialogDescription>
              This will permanently delete the rule for &quot;{deleteTarget?.action}&quot;. This action cannot be
              undone.
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
