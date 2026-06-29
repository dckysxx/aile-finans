"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact, formatCurrency } from "@/lib/utils";

type Datum = { month: string; income: number; expense: number };

export function IncomeExpenseChart({ data }: { data: Datum[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ left: -10, right: 6, top: 8 }}>
        <defs>
          <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--danger))" stopOpacity={0.28} />
            <stop offset="100%" stopColor="hsl(var(--danger))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tickLine={false} axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} width={44}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          tickFormatter={(v) => formatCompact(v)} />
        <Tooltip
          cursor={{ stroke: "hsl(var(--border))" }}
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 14, fontSize: 13, color: "hsl(var(--foreground))" }}
          formatter={(v: number, n) => [formatCurrency(v), n === "income" ? "Gelir" : "Gider"]} />
        <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#inc)" />
        <Area type="monotone" dataKey="expense" stroke="hsl(var(--danger))" strokeWidth={2.5} fill="url(#exp)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
