"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction, TransactionType, TransactionInsert } from "@/types/database";

export type TxnFormInput = {
  category: string;
  amount: number;
  description: string | null;
  date: string;
  notes: string | null;
  payment_status: Transaction["payment_status"];
  is_recurring: boolean;
  recurring_day: number | null;
};

export function useTransactions(type: TransactionType) {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("type", type)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setItems((data ?? []) as Transaction[]);
    setLoading(false);
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  async function add(input: TxnFormInput) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Oturum bulunamadı." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("family_id")
      .eq("id", user.id)
      .single();

    const payload: TransactionInsert = {
      user_id: user.id,
      family_id: profile?.family_id ?? null,
      type,
      ...input,
    };
    const { error } = await supabase.from("transactions").insert(payload);
    if (error) return { error: error.message };
    await load();
    return {};
  }

  async function update(id: string, input: TxnFormInput) {
    const supabase = createClient();
    const { error } = await supabase
      .from("transactions")
      .update(input)
      .eq("id", id);
    if (error) return { error: error.message };
    await load();
    return {};
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) return { error: error.message };
    setItems((prev) => prev.filter((t) => t.id !== id));
    return {};
  }

  return { items, loading, error, reload: load, add, update, remove };
}
