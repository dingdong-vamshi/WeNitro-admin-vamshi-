"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, ChevronRight, Search } from "lucide-react";
import Link from "next/link";

import { AdminDataState } from "@/components/admin/admin-data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { searchPartnerApplications } from "@/lib/partner-admin";
import type { PartnerApplicationStatus } from "@/types/admin";

const statuses: Array<{ value: PartnerApplicationStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "DRAFT", label: "Draft" },
];

const statusVariant: Record<PartnerApplicationStatus, "success" | "warning" | "danger" | "secondary"> = {
  DRAFT: "secondary",
  UNDER_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  SUSPENDED: "danger",
};

function humanStatus(status: PartnerApplicationStatus) {
  return status.replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
}

function displayDate(value: string | null) {
  return value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not submitted";
}

export function PartnerApplicationsScreen() {
  const [status, setStatus] = useState<PartnerApplicationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [category, setCategory] = useState("all");
  const [submittedAfter, setSubmittedAfter] = useState("");
  const debouncedSearch = useDebounce(search);
  const query = useQuery({
    queryKey: ["partner-applications", status, city, category, submittedAfter],
    queryFn: () => searchPartnerApplications({
      status,
      city,
      category,
      submittedFrom: submittedAfter ? `${submittedAfter}T00:00:00` : undefined,
    }),
  });

  const rows = useMemo(() => query.data ?? [], [query.data]);
  const cityOptions = useMemo(
    () => Array.from(new Set(rows.map((row) => row.city).filter(Boolean))).sort(),
    [rows],
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(rows.flatMap((row) => row.activityTypes))).sort(),
    [rows],
  );
  const filtered = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !needle || [
        row.businessName,
        row.applicant.fullName,
        row.applicant.username,
        row.applicant.email,
        String(row.userId),
      ].some((value) => value.toLowerCase().includes(needle));
      return matchesSearch;
    });
  }, [debouncedSearch, rows]);

  if (query.isLoading) return <AdminDataState title="Partner applications" loading />;
  if (query.isError) return <AdminDataState title="Partner applications" error={query.error} onRetry={() => void query.refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <BriefcaseBusiness className="h-5 w-5 text-primary" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Partner Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review Partner applicants, masked payout details, decisions, and review history.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Applications</CardTitle>
          <CardDescription>{filtered.length.toLocaleString("en-IN")} matching records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-border/70">
            {statuses.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`border-b-2 px-2 pb-2 text-sm font-semibold ${status === item.value ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}
                onClick={() => setStatus(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="relative xl:col-span-2">
              <span className="sr-only">Search applications</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm"
                placeholder="Search applicant, business, email, or ID"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <select className="h-10 rounded-lg border bg-background px-3 text-sm" value={city} onChange={(event) => setCity(event.target.value)}>
              <option value="all">All cities</option>
              {cityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className="h-10 rounded-lg border bg-background px-3 text-sm" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All activity types</option>
              {categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <label className="space-y-1">
              <span className="sr-only">Submitted on or after</span>
              <input
                type="date"
                aria-label="Submitted on or after"
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                value={submittedAfter}
                onChange={(event) => setSubmittedAfter(event.target.value)}
              />
            </label>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Applicant</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Activity types</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No Partner applications match these filters.</TableCell></TableRow>
                ) : filtered.map((application) => (
                  <TableRow key={application.userId}>
                    <TableCell>
                      <p className="font-medium">{application.applicant.fullName}</p>
                      <p className="text-xs text-muted-foreground">{application.applicant.email || `User ${application.userId}`}</p>
                    </TableCell>
                    <TableCell className="font-medium">{application.businessName}</TableCell>
                    <TableCell><p>{application.city}</p><p className="text-xs text-muted-foreground">{application.activityLocation}</p></TableCell>
                    <TableCell className="max-w-64"><div className="flex flex-wrap gap-1">{application.activityTypes.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}</div></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{displayDate(application.submittedAt)}</TableCell>
                    <TableCell><Badge variant={statusVariant[application.status]}>{humanStatus(application.status)}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/business/${application.userId}`}>Review <ChevronRight className="h-4 w-4" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
