"use client";

import { useMemo } from "react";
import { useFinanceData } from "@/hooks/use-finance-data";
import { useFilterStore } from "@/store/filter-store";
import { buildBalance } from "@/lib/aggregations";

export function useBalance() {
  const { txns, colors, loading, error } = useFinanceData();
  const period = useFilterStore((s) => s.period);
  const data = useMemo(() => buildBalance(txns, colors, period), [txns, colors, period]);
  return { data, loading, error };
}
