"use client";

import { useFilterStore, type Period } from "@/store/filter-store";
import { cn } from "@/lib/utils";

const options: { value: Period; label: string }[] = [
  { value: "month", label: "Bu Ay" },
  { value: "year", label: "Bu Yıl" },
];

export function PeriodToggle() {
  const { period, setPeriod } = useFilterStore();
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => setPeriod(o.value)}
          className={cn(
            "h-9 rounded-lg px-3 text-sm font-medium transition-colors",
            period === o.value
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
