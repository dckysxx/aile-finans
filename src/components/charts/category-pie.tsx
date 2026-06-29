"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

type Datum = { name: string; value: number; color: string };

export function CategoryPie({ data }: { data: Datum[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3} stroke="none">
          {data.map((c) => <Cell key={c.name} fill={c.color} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 14, fontSize: 13, color: "hsl(var(--foreground))" }}
          formatter={(v: number, n) => [formatCurrency(v), n]} />
      </PieChart>
    </ResponsiveContainer>
  );
}
