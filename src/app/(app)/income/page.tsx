import { TransactionsPage } from "@/components/transactions/transactions-page";

export default function IncomePage() {
  return (
    <TransactionsPage
      type="income"
      title="Gelir"
      subtitle="Her gelir kaynağı kendi bakiyesiyle."
      addLabel="Gelir Ekle"
      variant="income"
    />
  );
}
