"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

type ChartDatum = Record<string, string | number>;

type TremorChartProps = {
  data: ChartDatum[];
  index: string;
  categories: string[];
  colors?: string[];
  className?: string;
  valueFormatter?: (value: number) => string;
};

const palette = ["#635bff", "#0ea5e9", "#10b981", "#f59e0b"];

type TooltipPayloadItem = {
  color?: string;
  dataKey?: string | number;
  name?: string | number;
  value?: string | number;
  payload?: { name?: string };
};

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  valueFormatter: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-40 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-xs shadow-[0_10px_30px_rgb(24_24_27/0.12)]">
      <p className="mb-2 font-semibold text-zinc-900">{label}</p>
      <div className="space-y-1.5">
        {payload.map((item, index) => (
          <div key={`${item.dataKey ?? item.name}-${index}`} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-2 text-zinc-500">
              <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: item.color }} />
              {item.payload?.name ?? item.name ?? item.dataKey}
            </span>
            <span className="font-semibold tabular-nums text-zinc-900">
              {valueFormatter(Number(item.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const axisStyle = { fontSize: 11, fill: "#71717a" };

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return mounted;
}

export function TremorAreaChart({
  data,
  index,
  categories,
  colors = palette,
  className,
  valueFormatter = (value) => new Intl.NumberFormat("en-IN").format(value),
}: TremorChartProps) {
  const mounted = useMounted();
  if (!mounted) return <div className={cn("h-72 min-w-0", className)} />;

  return (
    <div className={cn("h-72 min-w-0", className)}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 640, height: 288 }}>
        <RechartsAreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            {categories.map((category, position) => (
              <linearGradient key={category} id={`fill-${category.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[position] ?? palette[position]} stopOpacity={0.2} />
                <stop offset="95%" stopColor={colors[position] ?? palette[position]} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="#e4e4e7" strokeDasharray="3 3" />
          <XAxis dataKey={index} tick={axisStyle} tickLine={false} axisLine={false} dy={8} />
          <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={42} tickFormatter={valueFormatter} />
          <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} cursor={{ stroke: "#d4d4d8", strokeWidth: 1 }} />
          {categories.map((category, position) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stroke={colors[position] ?? palette[position]}
              strokeWidth={2}
              fill={`url(#fill-${category.replace(/\s+/g, "-")})`}
              activeDot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TremorSparkAreaChart({
  data,
  index,
  category,
  color = palette[0],
  className,
}: {
  data: ChartDatum[];
  index: string;
  category: string;
  color?: string;
  className?: string;
}) {
  const mounted = useMounted();
  const gradientId = `spark-${category.replace(/\s+/g, "-")}`;
  if (!mounted) return <div className={cn("h-14 min-w-0", className)} />;

  return (
    <div className={cn("h-14 min-w-0", className)}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 160, height: 56 }}>
        <RechartsAreaChart data={data} margin={{ top: 4, right: 1, bottom: 1, left: 1 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.22} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey={index} hide />
          <Tooltip content={<ChartTooltip valueFormatter={(item: number) => new Intl.NumberFormat("en-IN").format(item)} />} cursor={false} />
          <Area type="monotone" dataKey={category} stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} activeDot={{ r: 3 }} />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
