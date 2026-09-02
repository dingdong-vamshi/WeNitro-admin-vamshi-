"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Eye, EyeOff, Send, Search, MoreHorizontal, ShieldCheck } from "lucide-react";

import { getAdminAccounts } from "@/lib/api";
import type { AdminAccountStatus, AdminRoleType } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roles: AdminRoleType[] = [
  "Super Admin",
  "Moderator",
  "Support Admin",
  "Content Manager",
  "Analytics Manager",
];

const statusVariant: Record<AdminAccountStatus, "success" | "secondary" | "warning"> = {
  active: "success",
  inactive: "secondary",
  suspended: "warning",
};

export function AddAdminScreen() {
  const query = useQuery({ queryKey: ["admin-accounts"], queryFn: getAdminAccounts });
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFA, setTwoFA] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const data = query.data ?? [];
  const filtered = data.filter(
    (a) =>
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase()),
  );

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Create Admin Form */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Create Admin Account</CardTitle>
          <CardDescription>Add a new administrator to the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="e.g. Jordan Smith" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="admin@wenitro.com" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 555-0100" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Admin Role</Label>
              <Select required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Set a strong password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                required
              />
            </div>

            {/* Account Settings */}
            <div className="rounded-lg border border-border/60 p-4 space-y-3 bg-muted/20">
              <p className="text-sm font-semibold">Account Settings</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Require 2FA on first login</p>
                </div>
                <Switch checked={twoFA} onCheckedChange={setTwoFA} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Account Status</p>
                  <p className="text-xs text-muted-foreground">Set account as active immediately</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" className="flex-1" disabled={submitted}>
                <UserPlus className="h-4 w-4" />
                {submitted ? "Admin Created!" : "Create Admin"}
              </Button>
              <Button type="button" variant="outline">
                <Send className="h-4 w-4" />
                Send Invite
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Admins Table */}
      <Card className="xl:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>All Admins</CardTitle>
              <CardDescription>{data.length} admin accounts on the platform.</CardDescription>
            </div>
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search admins…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {admin.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{admin.fullName}</p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{admin.role}</TableCell>
                  <TableCell>
                    {admin.twoFAEnabled ? (
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[admin.status]} className="capitalize">
                      {admin.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{admin.lastLogin}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Admin</DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuItem>Suspend Admin</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Remove Admin</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No admins found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
