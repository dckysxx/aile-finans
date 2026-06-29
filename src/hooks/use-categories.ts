"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category, TransactionType } from "@/types/database";

export function useCategories(type: TransactionType) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("type", type)
        .order("name");
      setCategories((data ?? []) as Category[]);
      setLoading(false);
    })();
  }, [type]);

  return { categories, loading };
}
