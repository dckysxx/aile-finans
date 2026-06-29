import { TransactionsPage } from "@/components/transactions/transactions-page";

export default function IncomePage() {
  return (
    <TransactionsPage
      type="income"
      title="Gelir"
      subtitle="Maaş, ek gelir ve diğer kaynaklar."
      addLabel="Gelir Ekle"
    />
  );
}
