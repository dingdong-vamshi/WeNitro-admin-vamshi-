"use client";

import { useQuery } from "@tanstack/react-query";

import { getReports } from "@/lib/api";
import { AdminDataState } from "@/components/admin/admin-data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const priorityVariant = {
  low: "secondary",
  medium: "warning",
  high: "danger",
} as const;

const statusVariant = {
  pending: "warning",
  investigating: "secondary",
  resolved: "success",
} as const;

export function ReportsTable() {
  const query = useQuery({
    queryKey: ["reports"],
    queryFn: getReports,
  });

  if (query.isLoading) return <AdminDataState title="reports" loading />;
  if (query.isError) return <AdminDataState title="reports" error={query.error} onRetry={() => void query.refetch()} />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Report ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Target</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {query.data?.map((report) => (
          <TableRow key={report.id}>
            <TableCell className="font-medium">{report.id}</TableCell>
            <TableCell className="capitalize">{report.type}</TableCell>
            <TableCell>{report.target}</TableCell>
            <TableCell>
              <Badge variant={priorityVariant[report.priority]}>{report.priority}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[report.status]}>{report.status}</Badge>
            </TableCell>
            <TableCell>{report.createdAt}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">Resolve</Button>
                <Button variant="destructive" size="sm">Suspend</Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
