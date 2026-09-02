"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Eye, Pencil, Save, X } from "lucide-react";

import { getNotificationTemplates } from "@/lib/api";
import type { NotificationTemplate, NotificationTemplateType } from "@/types/admin";
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

const typeVariant: Record<NotificationTemplateType, "info" | "secondary" | "outline"> = {
  push: "info",
  in_app: "secondary",
  email: "outline",
};

const typeLabel: Record<NotificationTemplateType, string> = {
  push: "Push",
  in_app: "In-App",
  email: "Email",
};

export function NotificationTemplatesScreen() {
  const query = useQuery({ queryKey: ["notification-templates"], queryFn: getNotificationTemplates });
  const [templates, setTemplates] = useState<NotificationTemplate[] | null>(null);
  const [selected, setSelected] = useState<NotificationTemplate | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Pick<NotificationTemplate, "title" | "message">>({ title: "", message: "" });
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const data = templates ?? query.data ?? [];

  function openEdit(tpl: NotificationTemplate) {
    setSelected(tpl);
    setEditForm({ title: tpl.title, message: tpl.message });
    setEditing(true);
    setPreviewOpen(false);
  }

  function handleSave() {
    if (!selected) return;
    setTemplates(data.map((t) => (t.id === selected.id ? { ...t, ...editForm } : t)));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setEditing(false);
    }, 900);
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Templates Table */}
      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Notification Templates</CardTitle>
          <CardDescription>Predefined push and in-app notification messages.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((tpl) => (
                <TableRow
                  key={tpl.id}
                  className="cursor-pointer"
                  onClick={() => { setSelected(tpl); setEditing(false); setPreviewOpen(false); }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{tpl.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeVariant[tpl.type]}>{typeLabel[tpl.type]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); setSelected(tpl); setPreviewOpen(true); setEditing(false); }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); openEdit(tpl); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Template Editor / Detail Panel */}
      <Card className="xl:col-span-2">
        {editing && selected ? (
          <>
            <CardHeader>
              <CardTitle>Edit Notification Template</CardTitle>
              <CardDescription>{selected.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Template Name</label>
                <Input value={selected.name} disabled className="bg-muted/40" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  rows={4}
                  value={editForm.message}
                  onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {selected.variables.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Available Variables</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.variables.map((v) => (
                      <code
                        key={v}
                        className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-foreground"
                      >
                        {v}
                      </code>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} disabled={saved} className="flex-1">
                  <Save className="h-4 w-4" />
                  {saved ? "Saved!" : "Save Template"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </>
        ) : selected ? (
          <>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>{selected.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="space-y-3 text-sm">
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</dt>
                  <dd><Badge variant={typeVariant[selected.type]}>{typeLabel[selected.type]}</Badge></dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</dt>
                  <dd className="font-medium">{selected.title}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</dt>
                  <dd className="text-muted-foreground">{selected.message}</dd>
                </div>
                {selected.variables.length > 0 && (
                  <div className="space-y-1">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Variables</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {selected.variables.map((v) => (
                        <code key={v} className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
                          {v}
                        </code>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" onClick={() => openEdit(selected)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Template
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)}>
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>Select a template to view or edit it.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Click a row to view template details.</p>
            </CardContent>
          </>
        )}
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Notification Preview</DialogTitle>
            <DialogDescription>How this notification will appear to users.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="rounded-xl border border-border/60 bg-muted/40 p-4 shadow-sm">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Bell className="h-3.5 w-3.5" />
                WeNitro · Now
              </div>
              <p className="text-sm font-semibold">{selected.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{selected.message}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
