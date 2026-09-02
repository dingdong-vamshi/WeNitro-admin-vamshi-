"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ShieldCheck, Users, X, Check, RotateCcw, Save, KeyRound } from "lucide-react";

import { getAdminRoles, getRolePermissions } from "@/lib/api";
import type { AdminRoleDefinition, AdminRoleType, Permission, PermissionModule } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const roleColors: Record<string, string> = {
  "Super Admin": "text-rose-600 dark:text-rose-400 bg-rose-500/15 border-rose-200 dark:border-rose-900/50",
  Moderator: "text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-200 dark:border-amber-900/50",
  "Support Admin": "text-sky-600 dark:text-sky-400 bg-sky-500/15 border-sky-200 dark:border-sky-900/50",
  "Content Manager": "text-violet-600 dark:text-violet-400 bg-violet-500/15 border-violet-200 dark:border-violet-900/50",
  "Analytics Manager": "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-200 dark:border-emerald-900/50",
};

const permissionActions: Array<{ key: keyof Omit<Permission, "module">; label: string }> = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
];

type DialogMode = "create" | "edit" | "permissions" | null;

const emptyForm = { name: "", description: "" };

export function AdminRolesScreen() {
  const rolesQuery = useQuery({ queryKey: ["admin-roles"], queryFn: getAdminRoles });
  const permQuery = useQuery({ queryKey: ["role-permissions"], queryFn: getRolePermissions });
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<AdminRoleDefinition | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminRoleDefinition | null>(null);

  // Local overrides so mutations feel instant without a real API
  const [localRoles, setLocalRoles] = useState<AdminRoleDefinition[] | null>(null);
  const data = localRoles ?? rolesQuery.data ?? [];

  // Permissions dialog state
  const [permOverrides, setPermOverrides] = useState<Partial<Record<string, Permission[]>>>({});
  const [permSaved, setPermSaved] = useState(false);

  function getPermissionsForRole(roleName: string): Permission[] {
    if (permOverrides[roleName]) return permOverrides[roleName]!;
    return permQuery.data?.find((r) => r.role === roleName)?.permissions ?? defaultPermissions();
  }

  function defaultPermissions(): Permission[] {
    const modules: PermissionModule[] = [
      "Users", "Events", "Reports", "Analytics",
      "Business Accounts", "Settings", "Moderation", "Notifications",
    ];
    return modules.map((module) => ({ module, view: false, create: false, edit: false, delete: false }));
  }

  function openCreate() {
    setForm(emptyForm);
    setDialogMode("create");
  }

  function openEdit(role: AdminRoleDefinition, e?: React.MouseEvent) {
    e?.stopPropagation();
    setForm({ name: role.name, description: role.description });
    setDialogMode("edit");
    setSelected(role);
  }

  function openPermissions(role: AdminRoleDefinition, e?: React.MouseEvent) {
    e?.stopPropagation();
    setSelected(role);
    setDialogMode("permissions");
    setPermSaved(false);
  }

  function closeDialog() {
    setDialogMode(null);
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (dialogMode === "create") {
      const newRole: AdminRoleDefinition = {
        id: `role_${Date.now()}`,
        name: form.name.trim() as AdminRoleType,
        description: form.description.trim(),
        assignedAdmins: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      const updated = [...data, newRole];
      setLocalRoles(updated);
      queryClient.setQueryData(["admin-roles"], updated);
      setSelected(newRole);
    } else if (dialogMode === "edit" && selected) {
      const updated = data.map((r) =>
        r.id === selected.id
          ? { ...r, name: form.name.trim() as AdminRoleType, description: form.description.trim() }
          : r,
      );
      setLocalRoles(updated);
      queryClient.setQueryData(["admin-roles"], updated);
      setSelected({ ...selected, name: form.name.trim() as AdminRoleType, description: form.description.trim() });
    }

    closeDialog();
  }

  function handleDelete(role: AdminRoleDefinition, e?: React.MouseEvent) {
    e?.stopPropagation();
    setDeleteTarget(role);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const updated = data.filter((r) => r.id !== deleteTarget.id);
    setLocalRoles(updated);
    queryClient.setQueryData(["admin-roles"], updated);
    if (selected?.id === deleteTarget.id) setSelected(null);
    setDeleteTarget(null);
  }

  function togglePermission(roleName: string, module: PermissionModule, action: keyof Omit<Permission, "module">) {
    const current = getPermissionsForRole(roleName);
    const updated = current.map((p) =>
      p.module === module ? { ...p, [action]: !p[action] } : p,
    );
    setPermOverrides((prev) => ({ ...prev, [roleName]: updated }));
  }

  function resetPermissions(roleName: string) {
    setPermOverrides((prev) => {
      const next = { ...prev };
      delete next[roleName];
      return next;
    });
  }

  function savePermissions() {
    setPermSaved(true);
    setTimeout(() => setPermSaved(false), 2000);
  }

  const permDialogRole = dialogMode === "permissions" && selected ? selected : null;
  const permDialogPerms = permDialogRole ? getPermissionsForRole(permDialogRole.name) : [];
  const permIsDirty = permDialogRole ? !!permOverrides[permDialogRole.name] : false;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Roles Table */}
        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Admin Roles</CardTitle>
              <CardDescription>
                Define and manage admin role types.{" "}
                <span className="text-foreground font-medium">{data.length} roles</span> configured.
              </CardDescription>
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Assigned Admins</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((role) => (
                  <TableRow
                    key={role.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/30 ${
                      selected?.id === role.id ? "bg-muted/40" : ""
                    }`}
                    onClick={() => setSelected(role)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={`h-4 w-4 ${roleColors[role.name]?.split(" ")[0]}`} />
                        {role.name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {role.description}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {role.assignedAdmins}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => openEdit(role, e)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => handleDelete(role, e)}
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

        {/* Role Detail Panel */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
            <CardDescription>
              {selected ? selected.name : "Select a role to view details."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-5">
                <div
                  className={`flex flex-col items-center justify-center rounded-xl border py-6 gap-2 ${roleColors[selected.name] ?? ""}`}
                >
                  <ShieldCheck className="h-12 w-12" />
                  <span className="text-sm font-semibold">{selected.name}</span>
                </div>

                <dl className="space-y-3 text-sm">
                  <div className="space-y-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Role Name
                    </dt>
                    <dd className="font-medium">{selected.name}</dd>
                  </div>
                  <div className="space-y-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Description
                    </dt>
                    <dd className="text-muted-foreground">{selected.description}</dd>
                  </div>
                  <div className="space-y-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Assigned Admins
                    </dt>
                    <dd>
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {selected.assignedAdmins} admins
                      </Badge>
                    </dd>
                  </div>
                  <div className="space-y-0.5">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Created
                    </dt>
                    <dd className="text-muted-foreground">{selected.createdAt}</dd>
                  </div>
                </dl>

                <div className="flex flex-col gap-2 pt-1">
                  <Button variant="outline" className="w-full" onClick={() => openEdit(selected)}>
                    <Pencil className="h-4 w-4" />
                    Edit Role
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => openPermissions(selected)}>
                    <KeyRound className="h-4 w-4" />
                    Assign Permissions
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={() => handleDelete(selected)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Role
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Click a role from the table to view its details and manage it here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogMode === "create" || dialogMode === "edit"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Create New Role" : "Edit Role"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Define a new admin role for your team."
                : `Update the details for the "${selected?.name}" role.`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="roleName" className="text-sm font-medium">
                Role Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="roleName"
                placeholder="e.g. Content Reviewer"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="roleDescription" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="roleDescription"
                placeholder="Briefly describe the role's responsibilities"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={!form.name.trim()}>
                {dialogMode === "create" ? (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Role
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Permissions Dialog */}
      <Dialog open={dialogMode === "permissions"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Assign Permissions
            </DialogTitle>
            <DialogDescription>
              Configure module access for the{" "}
              <span className="font-semibold text-foreground">{permDialogRole?.name}</span> role.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Module</TableHead>
                  {permissionActions.map((a) => (
                    <TableHead key={a.key} className="w-20 text-center">
                      {a.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-16 text-center">All</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permDialogPerms.map((perm) => {
                  const allChecked = permissionActions.every((a) => perm[a.key]);
                  return (
                    <TableRow key={perm.module}>
                      <TableCell className="font-medium text-sm">{perm.module}</TableCell>
                      {permissionActions.map((action) => (
                        <TableCell key={action.key} className="text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={perm[action.key]}
                              onCheckedChange={() =>
                                permDialogRole &&
                                togglePermission(permDialogRole.name, perm.module, action.key)
                              }
                              aria-label={`${perm.module} ${action.label}`}
                            />
                          </div>
                        </TableCell>
                      ))}
                      {/* Toggle All column */}
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={allChecked}
                            onCheckedChange={() => {
                              if (!permDialogRole) return;
                              const current = getPermissionsForRole(permDialogRole.name);
                              const updated = current.map((p) =>
                                p.module === perm.module
                                  ? { ...p, view: !allChecked, create: !allChecked, edit: !allChecked, delete: !allChecked }
                                  : p,
                              );
                              setPermOverrides((prev) => ({ ...prev, [permDialogRole.name]: updated }));
                            }}
                            aria-label={`Toggle all for ${perm.module}`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Permission summary chips */}
          {permDialogPerms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
              {permDialogPerms.map((perm) => {
                const granted = permissionActions.filter((a) => perm[a.key]);
                if (granted.length === 0) return null;
                return (
                  <span
                    key={perm.module}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
                  >
                    <Check className="h-3 w-3" />
                    {perm.module}: {granted.map((a) => a.label).join(", ")}
                  </span>
                );
              })}
            </div>
          )}

          <DialogFooter className="gap-2">
            {permIsDirty && (
              <Button
                variant="outline"
                onClick={() => permDialogRole && resetPermissions(permDialogRole.name)}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
            <Button variant="outline" onClick={closeDialog}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={savePermissions} disabled={permSaved}>
              <Save className="h-4 w-4" />
              {permSaved ? "Saved!" : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span> role? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="h-4 w-4" />
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
