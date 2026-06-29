"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/types/database";

// Son ~13 ayın işlemlerini + kategori renklerini çeken ortak veri kaynağı.
export function useFinanceData() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [colors, setColors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const now = new Date();
      const since = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      const [txnRes, catRes] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .gte("date", since.toISOString().slice(0, 10))
          .order("date", { ascending: false }),
        supabase.from("categories").select("name, color"),
      ]);
      if (txnRes.error) throw txnRes.error;
      const map: Record<string, string> = {};
      ((catRes.data ?? []) as { name: string; color: string }[]).forEach((c) => {
        map[c.name] = c.color;
      });
      setTxns((txnRes.data ?? []) as Transaction[]);
      setColors(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Veri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { txns, colors, loading, error, reload: load };
}
