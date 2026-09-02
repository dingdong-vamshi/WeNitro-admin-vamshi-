"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Mail, Pencil, Save, Send, X } from "lucide-react";

import { getEmailTemplates } from "@/lib/api";
import type { EmailTemplate, EmailTemplateStatus } from "@/types/admin";
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

const statusVariant: Record<EmailTemplateStatus, "success" | "secondary"> = {
  active: "success",
  draft: "secondary",
};

export function EmailTemplatesScreen() {
  const query = useQuery({ queryKey: ["email-templates"], queryFn: getEmailTemplates });
  const [templates, setTemplates] = useState<EmailTemplate[] | null>(null);
  const [selected, setSelected] = useState<EmailTemplate | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Pick<EmailTemplate, "subject" | "body" | "status">>({
    subject: "",
    body: "",
    status: "active",
  });
  const [saved, setSaved] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const data = templates ?? query.data ?? [];

  function openEdit(tpl: EmailTemplate) {
    setSelected(tpl);
    setEditForm({ subject: tpl.subject, body: tpl.body, status: tpl.status });
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

  function handleTestSend() {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Email Templates Table */}
      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>Automated email templates for platform events.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Status</TableHead>
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
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{tpl.name}</span>
                    </div>
                    <p className="ml-5.5 mt-0.5 text-xs text-muted-foreground">{tpl.subject}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[tpl.status]}>
                      {tpl.status === "active" ? "Active" : "Draft"}
                    </Badge>
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
              <CardTitle>Email Template Editor</CardTitle>
              <CardDescription>{selected.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Template Name</label>
                <Input value={selected.name} disabled className="bg-muted/40" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email Subject</label>
                <Input
                  value={editForm.subject}
                  onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email Body</label>
                <textarea
                  rows={6}
                  value={editForm.body}
                  onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {selected.variables.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Available Variables</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.variables.map((v) => (
                      <code key={v} className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
                        {v}
                      </code>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as EmailTemplateStatus })}
                  className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} disabled={saved} className="flex-1">
                  <Save className="h-4 w-4" />
                  {saved ? "Saved!" : "Save Template"}
                </Button>
                <Button variant="outline" onClick={handleTestSend} disabled={testSent}>
                  <Send className="h-4 w-4" />
                  {testSent ? "Sent!" : "Test"}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4" />
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
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</dt>
                  <dd><Badge variant={statusVariant[selected.status]}>{selected.status === "active" ? "Active" : "Draft"}</Badge></dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</dt>
                  <dd className="font-medium">{selected.subject}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Body Preview</dt>
                  <dd className="whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed line-clamp-6">{selected.body}</dd>
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
                  Edit
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
              <CardDescription>Select a template from the table.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Click a row to view or edit a template.</p>
            </CardContent>
          </>
        )}
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>How this email will appear to recipients.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="rounded-xl border border-border/60 bg-background p-5 shadow-sm space-y-3">
              <div className="border-b border-border/60 pb-3">
                <p className="text-xs text-muted-foreground">From: <span className="font-medium text-foreground">WeNitro &lt;support@wenitro.com&gt;</span></p>
                <p className="text-xs text-muted-foreground">Subject: <span className="font-medium text-foreground">{selected.subject}</span></p>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.body}</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleTestSend} disabled={testSent}>
              <Send className="h-4 w-4" />
              {testSent ? "Test Sent!" : "Send Test Email"}
            </Button>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
