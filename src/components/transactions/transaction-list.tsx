"use client";

import { Pencil, Trash2 } from "lucide-react";
import { iconFor } from "@/lib/category-icons";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types/database";

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-success/10 text-success",
  unpaid: "bg-danger/10 text-danger",
  pending: "bg-muted text-muted-foreground",
};
const STATUS_LABEL: Record<string, string> = {
  paid: "Ödendi",
  unpaid: "Ödenmedi",
  pending: "Beklemede",
};

interface TransactionListProps {
  items: Transaction[];
  income?: boolean;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}

export function TransactionList({ items, income, onEdit, onDelete }: TransactionListProps) {
  if (!items.length) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        Bu filtreye uygun kayıt yok.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((t) => {
        const Icon = iconFor(t.category);
        return (
          <li
            key={t.id}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-muted/40"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
              <Icon className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{t.category}</p>
                {t.payment_status && (
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLE[t.payment_status]}`}>
                    {STATUS_LABEL[t.payment_status]}
                  </span>
                )}
                {t.is_recurring && (
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    Düzenli
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {t.description || "—"} · {formatDate(t.date)}
              </p>
            </div>

            <span className={`shrink-0 text-sm font-semibold tabular-nums ${income ? "text-success" : "text-foreground"}`}>
              {income ? "+" : "−"}{formatCurrency(Number(t.amount))}
            </span>

            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => onEdit(t)}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Düzenle"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(t)}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                aria-label="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
