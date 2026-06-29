"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildDashboard, type DashboardData } from "@/lib/aggregations";
import { useFilterStore } from "@/store/filter-store";
import type { Transaction } from "@/types/database";

export function useDashboard() {
  const period = useFilterStore((s) => s.period);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const now = new Date();
      const sixAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const since = sixAgo < yearStart ? sixAgo : yearStart;

      const [txnRes, catRes] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .gte("date", since.toISOString().slice(0, 10))
          .order("date", { ascending: false }),
        supabase.from("categories").select("name, color"),
      ]);

      if (txnRes.error) throw txnRes.error;

      const colors: Record<string, string> = {};
      const cats = (catRes.data ?? []) as { name: string; color: string }[];
      cats.forEach((c) => {
        colors[c.name] = c.color;
      });

      setData(buildDashboard((txnRes.data ?? []) as Transaction[], colors, period));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Veri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
