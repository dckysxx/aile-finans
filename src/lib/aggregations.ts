import type { Transaction } from "@/types/database";
import type { Period } from "@/store/filter-store";

const MONTHS_TR = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];
// getDay() index: 0=Pazar
const DAYS_TR = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  totalSpending: number;
  remaining: number;
  savingsRate: number;
  monthly: { month: string; income: number; expense: number }[];
  category: { name: string; value: number; color: string }[];
  weekly: { day: string; amount: number }[];
  recent: Transaction[];
  upcoming: { id: string; name: string; amount: number; dueInDays: number }[];
  incomeBalances: IncomeBalance[];
  isEmpty: boolean;
}

export interface IncomeBalance {
  name: string;
  color: string;
  income: number;
  out: number;
  remaining: number;
}

const num = (v: number | string) => Number(v) || 0;
const ymd = (d: Date) => d.toISOString().slice(0, 10);

function startOfWeekMon(d: Date) {
  const r = new Date(d);
  const day = (r.getDay() + 6) % 7; // Pazartesi = 0
  r.setDate(r.getDate() - day);
  r.setHours(0, 0, 0, 0);
  return r;
}

function daysUntilRecurring(day: number, now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), now.getMonth(), day);
  if (next < today) next = new Date(now.getFullYear(), now.getMonth() + 1, day);
  return Math.round((next.getTime() - today.getTime()) / 86400000);
}

export function buildDashboard(
  txns: Transaction[],
  categoryColors: Record<string, string>,
  period: Period,
  idToName: Record<string, string> = {}
): DashboardData {
  const now = new Date();

  const inScope = (t: Transaction) => {
    const d = new Date(t.date);
    if (period === "year") return d.getFullYear() === now.getFullYear();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };

  const scoped = txns.filter(inScope);
  const sumType = (arr: Transaction[], type: Transaction["type"]) =>
    arr.filter((t) => t.type === type).reduce((s, t) => s + num(t.amount), 0);

  const totalIncome = sumType(scoped, "income");
  const totalExpense = sumType(scoped, "expense");
  const totalSpending = sumType(scoped, "spending");
  const remaining = totalIncome - totalExpense - totalSpending;
  const savingsRate = totalIncome > 0 ? Math.round((remaining / totalIncome) * 100) : 0;

  // Son 6 ay gelir/gider trendi
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const mt = txns.filter((t) => {
      const td = new Date(t.date);
      return td.getMonth() === m && td.getFullYear() === y;
    });
    return {
      month: MONTHS_TR[m],
      income: mt.filter((t) => t.type === "income").reduce((s, t) => s + num(t.amount), 0),
      expense: mt.filter((t) => t.type !== "income").reduce((s, t) => s + num(t.amount), 0),
    };
  });

  // Kategori dağılımı (gider + harcama)
  const catMap = new Map<string, number>();
  scoped
    .filter((t) => t.type !== "income")
    .forEach((t) => catMap.set(t.category, (catMap.get(t.category) ?? 0) + num(t.amount)));
  const category = Array.from(catMap.entries())
    .map(([name, value]) => ({ name, value, color: categoryColors[name] ?? "#94a3b8" }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Bu haftanın günlük harcaması
  const weekStart = startOfWeekMon(now);
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const key = ymd(d);
    const amount = txns
      .filter((t) => t.type === "spending" && t.date === key)
      .reduce((s, t) => s + num(t.amount), 0);
    return { day: DAYS_TR[d.getDay()], amount };
  });

  // Son işlemler
  const recent = [...txns]
    .sort((a, b) =>
      a.date === b.date
        ? b.created_at.localeCompare(a.created_at)
        : b.date.localeCompare(a.date)
    )
    .slice(0, 5);

  // Yaklaşan düzenli ödemeler
  const upcoming = txns
    .filter((t) => t.type === "expense" && t.is_recurring && t.recurring_day)
    .map((t) => ({
      id: t.id,
      name: t.category,
      amount: num(t.amount),
      dueInDays: daysUntilRecurring(t.recurring_day as number, now),
    }))
    .sort((a, b) => a.dueInDays - b.dueInDays)
    .slice(0, 3);

  // Gelir kaynağı bazlı bakiyeler (her kaynak bağımsız)
  const incomeMap = new Map<string, number>();
  scoped
    .filter((t) => t.type === "income")
    .forEach((t) => incomeMap.set(t.category, (incomeMap.get(t.category) ?? 0) + num(t.amount)));

  const outMap = new Map<string, number>();
  scoped
    .filter((t) => t.type !== "income" && t.income_source_id)
    .forEach((t) => {
      const name = idToName[t.income_source_id as string];
      if (!name) return;
      outMap.set(name, (outMap.get(name) ?? 0) + num(t.amount));
    });

  const incomeBalances: IncomeBalance[] = Array.from(incomeMap.entries())
    .map(([name, income]) => {
      const out = outMap.get(name) ?? 0;
      return {
        name,
        color: categoryColors[name] ?? "#6366f1",
        income,
        out,
        remaining: income - out,
      };
    })
    .sort((a, b) => b.income - a.income);

  return {
    totalIncome, totalExpense, totalSpending, remaining, savingsRate,
    monthly, category, weekly, recent, upcoming, incomeBalances,
    isEmpty: txns.length === 0,
  };
}

// ============================================================
//  Kalan Para ekranı için hesaplama
// ============================================================
export interface BalanceData {
  income: number;
  outflow: number;
  expense: number;
  spending: number;
  remaining: number;
  savingsRate: number;
  spendingRate: number;
  categories: { name: string; value: number; percent: number; color: string }[];
  incomeSources: { name: string; value: number; percent: number }[];
  topCategory: { name: string; value: number } | null;
  topIncome: { name: string; value: number } | null;
  isEmpty: boolean;
}

export function buildBalance(
  txns: Transaction[],
  categoryColors: Record<string, string>,
  period: Period
): BalanceData {
  const now = new Date();
  const scoped = txns.filter((t) => {
    const d = new Date(t.date);
    if (period === "year") return d.getFullYear() === now.getFullYear();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const sumType = (type: Transaction["type"]) =>
    scoped.filter((t) => t.type === type).reduce((s, t) => s + num(t.amount), 0);

  const income = sumType("income");
  const expense = sumType("expense");
  const spending = sumType("spending");
  const outflow = expense + spending;
  const remaining = income - outflow;
  const savingsRate = income > 0 ? Math.round((remaining / income) * 100) : 0;
  const spendingRate = income > 0 ? Math.round((outflow / income) * 100) : 0;

  const catMap = new Map<string, number>();
  scoped
    .filter((t) => t.type !== "income")
    .forEach((t) => catMap.set(t.category, (catMap.get(t.category) ?? 0) + num(t.amount)));
  const categories = Array.from(catMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percent: outflow > 0 ? Math.round((value / outflow) * 100) : 0,
      color: categoryColors[name] ?? "#94a3b8",
    }))
    .sort((a, b) => b.value - a.value);

  const incMap = new Map<string, number>();
  scoped
    .filter((t) => t.type === "income")
    .forEach((t) => incMap.set(t.category, (incMap.get(t.category) ?? 0) + num(t.amount)));
  const incomeSources = Array.from(incMap.entries())
    .map(([name, value]) => ({
      name,
      value,
      percent: income > 0 ? Math.round((value / income) * 100) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    income, outflow, expense, spending, remaining, savingsRate, spendingRate,
    categories, incomeSources,
    topCategory: categories[0] ?? null,
    topIncome: incomeSources[0] ?? null,
    isEmpty: scoped.length === 0,
  };
}
