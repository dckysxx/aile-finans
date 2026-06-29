"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  type TxnFilters, type DateRange, RANGE_LABELS,
} from "@/lib/filters";
import type { Category } from "@/types/database";
import { cn } from "@/lib/utils";

const RANGES: DateRange[] = ["today", "week", "month", "year", "all"];

interface FilterBarProps {
  filters: TxnFilters;
  onChange: (f: TxnFilters) => void;
  categories: Category[];
}

export function FilterBar({ filters, onChange, categories }: FilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => onChange({ ...filters, range: r })}
            className={cn(
              "h-9 rounded-xl border px-3 text-sm font-medium transition-colors",
              filters.range === r
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ara: açıklama, kategori, not…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
        <select
          value={filters.category ?? ""}
          onChange={(e) =>
            onChange({ ...filters, category: e.target.value || null })
          }
          className="h-12 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 sm:w-48"
        >
          <option value="">Tüm kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
