"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, X, Save, RotateCcw } from "lucide-react";

import { getRolePermissions } from "@/lib/api";
import type { AdminRoleType, Permission, PermissionModule } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const allRoles: AdminRoleType[] = [
  "Super Admin",
  "Moderator",
  "Support Admin",
  "Content Manager",
  "Analytics Manager",
];

const actions: Array<{ key: keyof Omit<Permission, "module">; label: string }> = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
];

export function AdminPermissionsScreen() {
  const query = useQuery({ queryKey: ["role-permissions"], queryFn: getRolePermissions });
  const [selectedRole, setSelectedRole] = useState<AdminRoleType>("Moderator");
  const [overrides, setOverrides] = useState<Partial<Record<AdminRoleType, Permission[]>>>({});
  const [saved, setSaved] = useState(false);

  const roleData = query.data ?? [];
  const basePermissions = roleData.find((r) => r.role === selectedRole)?.permissions ?? [];
  const currentPermissions = overrides[selectedRole] ?? basePermissions;

  function togglePermission(module: PermissionModule, action: keyof Omit<Permission, "module">) {
    const updated = currentPermissions.map((p) =>
      p.module === module ? { ...p, [action]: !p[action] } : p,
    );
    setOverrides({ ...overrides, [selectedRole]: updated });
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [selectedRole]: _removed, ...rest } = overrides;
    setOverrides(rest);
  }

  const isDirty = !!overrides[selectedRole];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Permissions Matrix */}
      <Card className="xl:col-span-3">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Permissions Matrix</CardTitle>
            <CardDescription>
              Configure what each role is allowed to access and modify across modules.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Select
              value={selectedRole}
              onValueChange={(v: string) => setSelectedRole(v as AdminRoleType)}
            >
              <SelectTrigger className="w-44 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allRoles.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                {actions.map((a) => (
                  <TableHead key={a.key} className="text-center w-20">{a.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPermissions.map((perm) => (
                <TableRow key={perm.module}>
                  <TableCell className="font-medium text-sm">{perm.module}</TableCell>
                  {actions.map((action) => (
                    <TableCell key={action.key} className="text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={perm[action.key]}
                          onCheckedChange={() => togglePermission(perm.module, action.key)}
                          aria-label={`${perm.module} ${action.label}`}
                        />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end gap-2 pt-4">
            {isDirty && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={saved}>
              <Save className="h-4 w-4" />
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Panel */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Permission Summary</CardTitle>
          <CardDescription>
            Access overview for <span className="font-medium text-foreground">{selectedRole}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPermissions.map((perm) => {
            const granted = actions.filter((a) => perm[a.key]).map((a) => a.label);
            const denied = actions.filter((a) => !perm[a.key]).map((a) => a.label);
            return (
              <div key={perm.module} className="space-y-1.5 rounded-lg border border-border/60 p-3">
                <p className="text-sm font-semibold">{perm.module}</p>
                <div className="flex flex-wrap gap-1.5">
                  {granted.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-0.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
                    >
                      <Check className="h-3 w-3" />
                      {label}
                    </span>
                  ))}
                  {denied.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      <X className="h-3 w-3" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {isDirty && (
            <Badge variant="warning" className="w-full justify-center">
              Unsaved changes
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
