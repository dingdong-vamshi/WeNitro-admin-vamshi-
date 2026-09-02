"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe, PlusCircle, Save, Trash2, X } from "lucide-react";

import { getSupportedLanguages } from "@/lib/api";
import type { LanguageStatus, SupportedLanguage } from "@/types/admin";
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

const statusVariant: Record<LanguageStatus, "info" | "success" | "secondary"> = {
  default: "info",
  enabled: "success",
  disabled: "secondary",
};

const statusLabel: Record<LanguageStatus, string> = {
  default: "Default",
  enabled: "Enabled",
  disabled: "Disabled",
};

const emptyForm = { name: "", code: "", status: "enabled" as LanguageStatus };

export function LanguageSettingsScreen() {
  const query = useQuery({ queryKey: ["supported-languages"], queryFn: getSupportedLanguages });
  const [languages, setLanguages] = useState<SupportedLanguage[] | null>(null);
  const [selected, setSelected] = useState<SupportedLanguage | null>(null);
  const [dialog, setDialog] = useState<"add" | "delete" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);

  const data = languages ?? query.data ?? [];

  function handleToggle(lang: SupportedLanguage) {
    if (lang.status === "default") return;
    setLanguages(
      data.map((l) =>
        l.id === lang.id ? { ...l, status: l.status === "enabled" ? "disabled" : "enabled" } : l,
      ),
    );
    if (selected?.id === lang.id) {
      setSelected((prev) => prev ? { ...prev, status: prev.status === "enabled" ? "disabled" : "enabled" } : null);
    }
  }

  function handleAdd() {
    if (!form.name || !form.code) return;
    const newLang: SupportedLanguage = { ...form, id: `lang-${Date.now()}` };
    setLanguages([...data, newLang]);
    setSaved(true);
    setTimeout(() => { setSaved(false); setDialog(null); }, 800);
  }

  function handleDelete() {
    if (!selected || selected.status === "default") return;
    setLanguages(data.filter((l) => l.id !== selected.id));
    setSelected(null);
    setDialog(null);
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Languages Table */}
      <Card className="xl:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Supported Languages</CardTitle>
            <CardDescription>Enable or disable languages for the mobile app.</CardDescription>
          </div>
          <Button size="sm" onClick={() => { setForm(emptyForm); setDialog("add"); }}>
            <PlusCircle className="h-4 w-4" />
            Add Language
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Language</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((lang) => (
                <TableRow
                  key={lang.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(lang)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{lang.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{lang.code}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[lang.status]}>{statusLabel[lang.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {lang.status !== "default" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => { e.stopPropagation(); handleToggle(lang); }}
                          >
                            {lang.status === "enabled" ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); setSelected(lang); setDialog("delete"); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Language Details Panel */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Language Configuration</CardTitle>
          <CardDescription>
            {selected ? `Viewing: ${selected.name}` : "Select a language to view details."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center rounded-xl border border-border/60 bg-muted/30 py-8 text-4xl">
                <Globe className="h-12 w-12 text-muted-foreground/60" />
              </div>
              <dl className="space-y-3 text-sm">
                {(
                  [
                    ["Language Name", selected.name],
                    ["Language Code", selected.code],
                    ["Status", statusLabel[selected.status]],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              {selected.status !== "default" && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1" onClick={() => handleToggle(selected)}>
                    {selected.status === "enabled" ? "Disable Language" : "Enable Language"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDialog("delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              {selected.status === "default" && (
                <p className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
                  This is the default language and cannot be disabled or removed.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click a language to view configuration details here.</p>
          )}
        </CardContent>
      </Card>

      {/* Add Language Dialog */}
      <Dialog open={dialog === "add"} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Language</DialogTitle>
            <DialogDescription>Add a new language to the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Language Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. German"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Language Code</label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().slice(0, 5) })}
                placeholder="e.g. DE"
                maxLength={5}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as LanguageStatus })}
                className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.code || saved}>
              <Save className="h-4 w-4" />
              {saved ? "Added!" : "Add Language"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={dialog === "delete"} onOpenChange={() => setDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Language</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selected?.name}</strong>? This cannot be undone.
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
