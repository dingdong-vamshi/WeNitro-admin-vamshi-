"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Edit2, MoreHorizontal, Plus, Search, Tag, Trash2 } from "lucide-react";

import { getCoupons } from "@/lib/api";
import type { Coupon, CouponApplicable, CouponDiscount, CouponStatus } from "@/types/admin";
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

type CouponForm = {
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  applicableOn: CouponApplicable;
  usageLimit: number;
  expiryDate: string;
};

const emptyForm: CouponForm = {
  code: "",
  discountType: "percentage",
  discountValue: 0,
  applicableOn: "Event Tickets",
  usageLimit: 500,
  expiryDate: "",
};

const statuses: Array<CouponStatus | "all"> = ["all", "active", "expired", "disabled"];

function paginationRange(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

function formatDiscount(discount: CouponDiscount): string {
  return discount.type === "percentage" ? `${discount.value}%` : `₹${discount.value}`;
}

const statusVariant: Record<CouponStatus, "success" | "outline" | "danger"> = {
  active: "success",
  expired: "outline",
  disabled: "danger",
};

export function CouponManagementTable() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CouponStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const debouncedSearch = useDebounce(search);
  const [pageSize, setPageSize] = useState(10);

  const query = useQuery({
    queryKey: ["coupons", debouncedSearch, status, page, pageSize],
    queryFn: () => getCoupons({ search: debouncedSearch, status, page, pageSize }),
  });

  const totalPages = useMemo(() => {
    if (!query.data) return 1;
    return Math.max(1, Math.ceil(query.data.total / pageSize));
  }, [query.data]);

  function openEdit(coupon: Coupon) {
    setEditTarget(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discount.type,
      discountValue: coupon.discount.value,
      applicableOn: coupon.applicableOn,
      usageLimit: coupon.usageLimit,
      expiryDate: coupon.expiryDate,
    });
  }

  function handleSave() {
    queryClient.invalidateQueries({ queryKey: ["coupons"] });
    setEditTarget(null);
    setAddOpen(false);
    setForm(emptyForm);
  }

  function handleDelete() {
    queryClient.invalidateQueries({ queryKey: ["coupons"] });
    setDeleteTarget(null);
  }

  const inputCls =
    "h-9 w-full rounded-lg border border-border/70 bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
  const selectCls =
    "h-9 appearance-none rounded-lg border border-border/70 bg-background px-3 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40";

  const formBody = (
    <div className="space-y-3 py-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <label className="text-sm font-medium">Coupon Code</label>
          <input
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="WELCOME10"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Discount Type</label>
          <select
            value={form.discountType}
            onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as "percentage" | "flat" }))}
            className={`${selectCls} w-full`}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat (₹)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Discount Value</label>
          <input
            type="number"
            min={1}
            value={form.discountValue || ""}
            onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
            placeholder={form.discountType === "percentage" ? "10" : "50"}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Applicable On</label>
          <select
            value={form.applicableOn}
            onChange={(e) => setForm((f) => ({ ...f, applicableOn: e.target.value as CouponApplicable }))}
            className={`${selectCls} w-full`}
          >
            <option value="Event Tickets">Event Tickets</option>
            <option value="Rewards">Rewards</option>
            <option value="All">All</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Usage Limit</label>
          <input
            type="number"
            min={1}
            value={form.usageLimit}
            onChange={(e) => setForm((f) => ({ ...f, usageLimit: Number(e.target.value) }))}
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5 col-span-2">
          <label className="text-sm font-medium">Expiry Date</label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
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
              placeholder="Search coupon codes…"
              className="h-10 w-full rounded-lg border border-border/70 bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value as CouponStatus | "all"); setPage(1); }}
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
              Create Coupon
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50 hover:bg-muted/50">
                <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coupon Code</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Discount</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Applicable On</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Usage</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expiry Date</th>
                <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="py-3 pl-3 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="py-3 pl-4 pr-3"><div className="h-4 w-24 animate-pulse rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-5 w-16 animate-pulse rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-24 animate-pulse rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-20 animate-pulse rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-20 animate-pulse rounded bg-muted" /></td>
                    <td className="px-3 py-3"><div className="h-5 w-14 animate-pulse rounded bg-muted" /></td>
                    <td className="py-3 pl-3 pr-4"><div className="ml-auto h-7 w-7 animate-pulse rounded bg-muted" /></td>
                  </tr>
                ))
              ) : !query.data?.rows.length ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-sm text-muted-foreground">No coupons found.</td>
                </tr>
              ) : (
                query.data.rows.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-border/40 last:border-0">
                    <td className="py-3 pl-4 pr-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                        <span className="font-mono font-semibold text-sm">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="info" className="font-semibold">
                        {formatDiscount(coupon.discount)} off
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-sm text-muted-foreground">{coupon.applicableOn}</td>
                    <td className="px-3 py-3 text-sm">
                      {coupon.usedCount.toLocaleString()}{" "}
                      <span className="text-muted-foreground">/ {coupon.usageLimit.toLocaleString()}</span>
                    </td>
                    <td className="px-3 py-3 text-sm">{coupon.expiryDate}</td>
                    <td className="px-3 py-3">
                      <Badge variant={statusVariant[coupon.status]}>
                        {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
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
                          <DropdownMenuItem onClick={() => openEdit(coupon)}>
                            <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {coupon.status === "active" ? "Disable" : "Enable"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(coupon)}
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
              Showing {Math.min((page - 1) * pageSize + 1, query.data?.total ?? 0)}–{Math.min(page * pageSize, query.data?.total ?? 0)} of {query.data?.total ?? 0} coupons
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
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>Update coupon details.</DialogDescription>
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
            <DialogTitle>Create Coupon</DialogTitle>
            <DialogDescription>Add a new discount coupon to the platform.</DialogDescription>
          </DialogHeader>
          {formBody}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!form.code || form.discountValue <= 0 || !form.expiryDate}
            >
              Create Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Permanently delete coupon &quot;{deleteTarget?.code}&quot;? This action cannot be undone.
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
