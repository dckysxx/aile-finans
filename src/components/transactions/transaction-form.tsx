"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { iconFor } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { Category, Transaction, TransactionType, PaymentStatus } from "@/types/database";
import type { TxnFormInput } from "@/hooks/use-transactions";

const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "paid", label: "Ödendi" },
  { value: "unpaid", label: "Ödenmedi" },
  { value: "pending", label: "Beklemede" },
];

interface TransactionFormProps {
  type: TransactionType;
  categories: Category[];
  incomeCategories?: Category[];
  initial?: Transaction;
  onSubmit: (input: TxnFormInput) => Promise<{ error?: string }>;
  onDone: () => void;
}

export function TransactionForm({
  type, categories, incomeCategories = [], initial, onSubmit, onDone,
}: TransactionFormProps) {
  const isExpense = type === "expense";
  const needsSource = type === "expense" || type === "spending";
  const today = new Date().toISOString().slice(0, 10);

  const [category, setCategory] = useState(initial?.category ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [date, setDate] = useState(initial?.date ?? today);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    initial?.payment_status ?? "unpaid"
  );
  const [isRecurring, setIsRecurring] = useState(initial?.is_recurring ?? false);
  const [recurringDay, setRecurringDay] = useState(
    initial?.recurring_day ? String(initial.recurring_day) : ""
  );
  const [incomeSourceId, setIncomeSourceId] = useState(initial?.income_source_id ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const value = parseFloat(amount.replace(",", "."));
    if (!category) return setError("Kategori seçin.");
    if (!value || value <= 0) return setError("Geçerli bir tutar girin.");
    if (needsSource && !incomeSourceId) return setError("Gelir kaynağı seçin.");

    setSaving(true);
    setError(null);
    const { error } = await onSubmit({
      category,
      amount: value,
      date,
      description: description.trim() || null,
      notes: notes.trim() || null,
      payment_status: isExpense ? paymentStatus : null,
      is_recurring: isExpense ? isRecurring : false,
      recurring_day: isExpense && isRecurring && recurringDay ? Number(recurringDay) : null,
      income_source_id: needsSource ? incomeSourceId : null,
    });
    setSaving(false);
    if (error) return setError(error);
    onDone();
  }

  return (
    <div className="space-y-5">
      {/* Kategori */}
      <div>
        <Label>Kategori</Label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {categories.map((c) => {
            const Icon = iconFor(c.name);
            const active = category === c.name;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.name)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" style={active ? undefined : { color: c.color }} />
                <span className="truncate">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gelir kaynağı (gider & harcama için zorunlu) */}
      {needsSource && (
        <div>
          <Label>Bu harcama hangi gelir kaynağından düşülsün?</Label>
          <select
            value={incomeSourceId}
            onChange={(e) => setIncomeSourceId(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Gelir kaynağı seçin…</option>
            {incomeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tutar + Tarih */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tutar (₺)</Label>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <Label>Tarih</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {/* Açıklama */}
      <div>
        <Label>Açıklama</Label>
        <Input
          placeholder="Örn. Haftalık market"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Gidere özel: ödeme durumu + düzenli ödeme */}
      {isExpense && (
        <>
          <div>
            <Label>Ödeme Durumu</Label>
            <div className="flex gap-2">
              {PAYMENT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setPaymentStatus(o.value)}
                  className={cn(
                    "h-10 flex-1 rounded-xl border text-sm font-medium transition-colors",
                    paymentStatus === o.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <p className="text-sm font-medium">Düzenli ödeme</p>
              <p className="text-xs text-muted-foreground">Her ay tekrarlayan fatura</p>
            </div>
            <button
              type="button"
              onClick={() => setIsRecurring((v) => !v)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                isRecurring ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  isRecurring ? "left-[22px]" : "left-0.5"
                )}
              />
            </button>
          </div>

          {isRecurring && (
            <div>
              <Label>Ödeme günü (ayın kaçı)</Label>
              <Input
                type="number"
                min={1}
                max={31}
                placeholder="Örn. 15"
                value={recurringDay}
                onChange={(e) => setRecurringDay(e.target.value)}
              />
            </div>
          )}
        </>
      )}

      {/* Not */}
      <div>
        <Label>Not (opsiyonel)</Label>
        <Textarea
          placeholder="Ek bilgi…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button className="w-full" onClick={handleSubmit} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {initial ? "Güncelle" : "Kaydet"}
      </Button>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-sm font-medium text-muted-foreground">{children}</p>;
}
