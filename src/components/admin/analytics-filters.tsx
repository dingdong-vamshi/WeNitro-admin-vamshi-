"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AnalyticsRange } from "@/types/admin";

const RANGES: { label: string; value: AnalyticsRange }[] = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 12 Months", value: "12m" },
];

type Props = {
  current: AnalyticsRange;
  paramKey?: string;
  csvRows: Record<string, string | number>[];
  csvFilename: string;
};

function downloadCsv(rows: Record<string, string | number>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function AnalyticsFilters({ current, paramKey = "range", csvRows, csvFilename }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setRange(value: AnalyticsRange) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKey, value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {RANGES.map((r) => (
          <Button
            key={r.value}
            variant={current === r.value ? "default" : "outline"}
            size="sm"
            onClick={() => setRange(r.value)}
          >
            {r.label}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => downloadCsv(csvRows, csvFilename)}
      >
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
}
