"use client";

import { useMemo, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/shared/modal";
import { FilterBar } from "@/components/shared/filter-bar";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionList } from "@/components/transactions/transaction-list";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { filterTransactions, defaultFilters, type TxnFilters } from "@/lib/filters";
import { formatCurrency } from "@/lib/utils";
import type { Transaction, TransactionType } from "@/types/database";

interface TransactionsPageProps {
  type: TransactionType;
  title: string;
  subtitle: string;
  addLabel: string;
}

export function TransactionsPage({ type, title, subtitle, addLabel }: TransactionsPageProps) {
  const { items, loading, add, update, remove } = useTransactions(type);
  const { categories } = useCategories(type);

  const [filters, setFilters] = useState<TxnFilters>(defaultFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [toDelete, setToDelete] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => filterTransactions(items, filters), [items, filters]);
  const total = useMemo(
    () => filtered.reduce((s, t) => s + Number(t.amount), 0),
    [filtered]
  );
  const isIncome = type === "income";
  const unpaidCount =
    type === "expense" ? filtered.filter((t) => t.payment_status === "unpaid").length : 0;

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(t: Transaction) {
    setEditing(t);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    await remove(toDelete.id);
    setDeleting(false);
    setToDelete(null);
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> {addLabel}
        </Button>
      </header>

      {/* Özet */}
      <Card className={isIncome ? "border-none gradient-brand text-white" : ""}>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={`text-sm ${isIncome ? "text-white/80" : "text-muted-foreground"}`}>
              {filtered.length} kayıt · seçili dönem toplamı
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(total)}
            </p>
          </div>
          {type === "expense" && unpaidCount > 0 && (
            <span className="rounded-xl bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
              {unpaidCount} ödenmemiş
            </span>
          )}
        </CardContent>
      </Card>

      {/* Filtre */}
      <FilterBar filters={filters} onChange={setFilters} categories={categories} />

      {/* Liste */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <TransactionList
          items={filtered}
          income={isIncome}
          onEdit={openEdit}
          onDelete={setToDelete}
        />
      )}

      {/* Ekle / Düzenle modalı */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `${title} düzenle` : addLabel}
      >
        <TransactionForm
          type={type}
          categories={categories}
          initial={editing ?? undefined}
          onSubmit={(input) => (editing ? update(editing.id, input) : add(input))}
          onDone={() => setFormOpen(false)}
        />
      </Modal>

      {/* Silme onayı */}
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Kaydı sil">
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            <b className="text-foreground">{toDelete?.category}</b> ({toDelete && formatCurrency(Number(toDelete.amount))})
            kaydını silmek istediğine emin misin? Bu işlem geri alınamaz.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setToDelete(null)}>
              Vazgeç
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-danger"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
