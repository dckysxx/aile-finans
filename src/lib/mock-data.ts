// Faz 2 demo verisi. Faz 3'te bu değerler Supabase'den gelecek.

export const family = {
  totalIncome: 104000,
  totalExpense: 38500,
  totalSpending: 21300,
};

export const monthly = [
  { month: "Oca", income: 98000, expense: 56000 },
  { month: "Şub", income: 101000, expense: 61000 },
  { month: "Mar", income: 99000, expense: 58000 },
  { month: "Nis", income: 104000, expense: 64000 },
  { month: "May", income: 102000, expense: 59000 },
  { month: "Haz", income: 104000, expense: 59800 },
];

export const categoryBreakdown = [
  { name: "Kira", value: 18000, color: "#ef4444" },
  { name: "Market", value: 9200, color: "#84cc16" },
  { name: "Faturalar", value: 7400, color: "#f59e0b" },
  { name: "Yemek", value: 6100, color: "#f43f5e" },
  { name: "Ulaşım", value: 3200, color: "#06b6d4" },
  { name: "Diğer", value: 5900, color: "#94a3b8" },
];

export const weekly = [
  { day: "Pzt", amount: 420 },
  { day: "Sal", amount: 180 },
  { day: "Çar", amount: 760 },
  { day: "Per", amount: 290 },
  { day: "Cum", amount: 980 },
  { day: "Cmt", amount: 1340 },
  { day: "Paz", amount: 610 },
];

export const recentTransactions = [
  { id: "1", user: "Giray", category: "Market", icon: "shopping-cart", amount: -740, date: "2026-06-28", type: "spending" as const },
  { id: "2", user: "Anne", category: "Maaş", icon: "wallet", amount: 85000, date: "2026-06-27", type: "income" as const },
  { id: "3", user: "Baba", category: "Yemek", icon: "utensils", amount: -320, date: "2026-06-27", type: "spending" as const },
  { id: "4", user: "Giray", category: "Teknoloji", icon: "cpu", amount: -2450, date: "2026-06-26", type: "spending" as const },
  { id: "5", user: "Kardeş", category: "Sinema", icon: "film", amount: -240, date: "2026-06-25", type: "spending" as const },
];

export const upcomingPayments = [
  { id: "1", name: "Kira", icon: "home", amount: 18000, dueInDays: 2 },
  { id: "2", name: "Elektrik", icon: "zap", amount: 1240, dueInDays: 5 },
  { id: "3", name: "İnternet", icon: "wifi", amount: 560, dueInDays: 9 },
];
