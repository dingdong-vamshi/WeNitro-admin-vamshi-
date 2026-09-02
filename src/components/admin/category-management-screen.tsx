"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Pencil, Trash2, Ban, Save, X } from "lucide-react";

import { getEventCategories } from "@/lib/api";
import { AdminDataState } from "@/components/admin/admin-data-state";
import type { CategoryStatus, EventCategoryItem } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusVariant: Record<CategoryStatus, "success" | "secondary"> = {
  active: "success",
  disabled: "secondary",
};

const emptyForm: Omit<EventCategoryItem, "id"> = {
  name: "",
  icon: "",
  description: "",
  displayOrder: 1,
  status: "active",
};

export function CategoryManagementScreen() {
  const query = useQuery({ queryKey: ["event-categories"], queryFn: getEventCategories });
  const [categories, setCategories] = useState<EventCategoryItem[] | null>(null);
  const [selected, setSelected] = useState<EventCategoryItem | null>(null);
  const [dialog, setDialog] = useState<"add" | "edit" | "delete" | null>(null);
  const [form, setForm] = useState<Omit<EventCategoryItem, "id">>(emptyForm);
  const [editSaved, setEditSaved] = useState(false);

  const data = categories ?? query.data ?? [];

  if (query.isLoading) return <AdminDataState title="activity categories" loading />;
  if (query.isError) return <AdminDataState title="activity categories" error={query.error} onRetry={() => void query.refetch()} />;

  function openAdd() {
    setForm(emptyForm);
    setDialog("add");
  }

  function openEdit(cat: EventCategoryItem) {
    setSelected(cat);
    setForm({ name: cat.name, icon: cat.icon, description: cat.description, displayOrder: cat.displayOrder, status: cat.status });
    setDialog("edit");
  }

  function openDelete(cat: EventCategoryItem) {
    setSelected(cat);
    setDialog("delete");
  }

  function handleSaveAdd() {
    const newCat: EventCategoryItem = { ...form, id: `cat-${Date.now()}` };
    setCategories([...data, newCat]);
    setDialog(null);
  }

  function handleSaveEdit() {
    if (!selected) return;
    setCategories(data.map((c) => (c.id === selected.id ? { ...selected, ...form } : c)));
    setEditSaved(true);
    setTimeout(() => {
      setEditSaved(false);
      setDialog(null);
    }, 900);
  }

  function handleDelete() {
    if (!selected) return;
    setCategories(data.filter((c) => c.id !== selected.id));
    setDialog(null);
  }

  function handleToggleStatus(cat: EventCategoryItem) {
    setCategories(
      data.map((c) =>
        c.id === cat.id ? { ...c, status: c.status === "active" ? "disabled" : "active" } : c,
      ),
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Categories Table */}
      <Card className="xl:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Event Categories</CardTitle>
            <CardDescription>Manage categories displayed in the mobile app.</CardDescription>
          </div>
          <Button size="sm" disabled title="Category editing is not configured for this legacy schema">
            <PlusCircle className="h-4 w-4" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((cat) => (
                <TableRow
                  key={cat.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(cat)}
                  data-selected={selected?.id === cat.id}
                >
                  <TableCell>
                    <span className="mr-2">{cat.icon}</span>
                    <span className="font-medium">{cat.name}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{cat.displayOrder}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[cat.status]}>
                      {cat.status === "active" ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled
                        title={cat.status === "active" ? "Disable" : "Enable"}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        disabled
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category Details Panel */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>
            {selected ? `Viewing: ${selected.name}` : "Click a category to view details."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center rounded-xl border border-border/60 bg-muted/30 py-6 text-5xl">
                {selected.icon || "📁"}
              </div>
              <dl className="space-y-3 text-sm">
                {(
                  [
                    ["Category Name", selected.name],
                    ["Description", selected.description || "—"],
                    ["Display Order", String(selected.displayOrder)],
                    ["Status", selected.status === "active" ? "Active" : "Disabled"],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" disabled>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled
                >
                  <Ban className="h-3.5 w-3.5" />
                  {selected.status === "active" ? "Disable" : "Enable"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a category from the table to view its details here.</p>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialog === "add" || dialog === "edit"} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog === "add" ? "Create Category" : "Edit Category"}</DialogTitle>
            <DialogDescription>
              {dialog === "add" ? "Add a new event category to the platform." : `Editing "${selected?.name}".`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Adventure" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category Icon (emoji)</label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 🧗" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Display Order</label>
                <Input
                  type="number"
                  min={1}
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value, 10) || 1 })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as CategoryStatus })}
                  className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={dialog === "add" ? handleSaveAdd : handleSaveEdit} disabled={!form.name || editSaved}>
              <Save className="h-4 w-4" />
              {editSaved ? "Saved!" : "Save Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={dialog === "delete"} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selected?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
