import type { Transaction } from "@/types/database";

export type DateRange = "today" | "week" | "month" | "year" | "all" | "custom";

export interface TxnFilters {
  range: DateRange;
  from?: string; // yyyy-mm-dd (custom)
  to?: string;
  category: string | null;
  search: string;
}

export const defaultFilters: TxnFilters = {
  range: "month",
  category: null,
  search: "",
};

const ymd = (d: Date) => d.toISOString().slice(0, 10);

function rangeBounds(range: DateRange, now = new Date()): { from?: string; to?: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  switch (range) {
    case "today":
      return { from: ymd(now), to: ymd(now) };
    case "week": {
      const day = (now.getDay() + 6) % 7; // Pazartesi = 0
      const start = new Date(y, m, now.getDate() - day);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { from: ymd(start), to: ymd(end) };
    }
    case "month":
      return { from: ymd(new Date(y, m, 1)), to: ymd(new Date(y, m + 1, 0)) };
    case "year":
      return { from: ymd(new Date(y, 0, 1)), to: ymd(new Date(y, 11, 31)) };
    case "all":
      return {};
  }
  return {};
}

export function filterTransactions(items: Transaction[], f: TxnFilters): Transaction[] {
  const bounds = f.range === "custom" ? { from: f.from, to: f.to } : rangeBounds(f.range);
  const q = f.search.trim().toLowerCase();

  return items.filter((t) => {
    if (bounds.from && t.date < bounds.from) return false;
    if (bounds.to && t.date > bounds.to) return false;
    if (f.category && t.category !== f.category) return false;
    if (q) {
      const hay = `${t.category} ${t.description ?? ""} ${t.notes ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export const RANGE_LABELS: Record<DateRange, string> = {
  today: "Bugün",
  week: "Bu Hafta",
  month: "Bu Ay",
  year: "Bu Yıl",
  all: "Tümü",
  custom: "Özel",
};
