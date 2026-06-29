import { TransactionsPage } from "@/components/transactions/transactions-page";

export default function ExpensesPage() {
  return (
    <TransactionsPage
      type="expense"
      title="Gider"
      subtitle="Kira, faturalar ve düzenli ödemeler."
      addLabel="Gider Ekle"
    />
  );
}
