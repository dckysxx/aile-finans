"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { iconFor } from "@/lib/category-icons";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Category, Transaction } from "@/types/database";

interface IncomeCategoryCardsProps {
  items: Transaction[];
  categories: Category[];
}

// Her gelir kategorisi kendi bağımsız toplam bakiyesini gösterir.
export function IncomeCategoryCards({ items, categories }: IncomeCategoryCardsProps) {
  const cards = useMemo(() => {
    const map = new Map<string, { total: number; lastDate: string }>();
    for (const t of items) {
      const cur = map.get(t.category) ?? { total: 0, lastDate: "" };
      cur.total += Number(t.amount);
      if (t.date > cur.lastDate) cur.lastDate = t.date;
      map.set(t.category, cur);
    }
    const colorOf = (name: string) =>
      categories.find((c) => c.name === name)?.color ?? "#6366f1";
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v, color: colorOf(name) }))
      .sort((a, b) => b.total - a.total);
  }, [items, categories]);

  if (cards.length === 0) {
    return (
      <Card className="border-dashed">
        <div className="grid place-items-center py-10 text-center text-sm text-muted-foreground">
          Bu dönemde gelir kaydı yok.
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {cards.map((c, i) => {
        const Icon = iconFor(c.name);
        return (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
          >
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-muted-foreground">{c.name}</span>
                <span
                  className="grid h-9 w-9 place-items-center rounded-xl"
                  style={{ background: `${c.color}1a`, color: c.color }}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">
                {formatCurrency(c.total)}
              </p>
              {c.lastDate && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Son işlem · {formatDate(c.lastDate)}
                </p>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
