"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatCurrency } from "@/lib/utils";

type Datum = { day: string; amount: number };

export function WeeklyBar({ data }: { data: Datum[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ left: 0, right: 0, top: 8 }}>
        <XAxis dataKey="day" tickLine={false} axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 14, fontSize: 13, color: "hsl(var(--foreground))" }}
          formatter={(v: number) => [formatCurrency(v), "Harcama"]} />
        <Bar dataKey="amount" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} maxBarSize={34} />
      </BarChart>
    </ResponsiveContainer>
  );
}
