"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export function DashboardBarChart({
  data,
  label,
  horizontal = false,
}: {
  data: { name: string; count: number }[];
  label: string;
  horizontal?: boolean;
}) {
  return (
    <ChartContainer
      config={{ count: { label, color: "var(--chart-1)" } }}
      className="h-64 w-full aspect-auto"
    >
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: horizontal ? 8 : 0, right: 8, bottom: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        {horizontal ? (
          <>
            <XAxis type="number" allowDecimals={false} hide />
            <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
          </>
        )}
        <Tooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} maxBarSize={32} />
      </BarChart>
    </ChartContainer>
  );
}

export function DashboardSection({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border bg-card ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
