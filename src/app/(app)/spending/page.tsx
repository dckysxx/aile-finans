import { TransactionsPage } from "@/components/transactions/transactions-page";

export default function SpendingPage() {
  return (
    <TransactionsPage
      type="spending"
      title="Harcama Takibi"
      subtitle="Günlük harcamalarını kategorilere ayır."
      addLabel="Harcama Ekle"
    />
  );
}
