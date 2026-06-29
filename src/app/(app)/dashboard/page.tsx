"use client";

import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, ShoppingBag,
  ShoppingCart, Utensils, Cpu, Film, Home, Zap, Wifi, Coffee,
  Gamepad2, Plane, Receipt, Shield, Landmark, Building, Droplet,
  Flame, Phone, Heart, Shirt, Bus, Gift, Sparkles, RotateCw,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/shared/stat-card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PeriodToggle } from "@/components/shared/period-toggle";
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart";
import { CategoryPie } from "@/components/charts/category-pie";
import { WeeklyBar } from "@/components/charts/weekly-bar";
import { useDashboard } from "@/hooks/use-dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  Maaş: Wallet, Market: ShoppingCart, Yemek: Utensils, Teknoloji: Cpu,
  Sinema: Film, Kira: Home, Elektrik: Zap, İnternet: Wifi, Kahve: Coffee,
  Oyun: Gamepad2, Tatil: Plane, Vergi: Receipt, Sigorta: Shield,
  Kredi: Landmark, Aidat: Building, Su: Droplet, Doğalgaz: Flame,
  Telefon: Phone, Sağlık: Heart, Giyim: Shirt, Ulaşım: Bus, Hediye: Gift,
};
const iconFor = (name: string) => icons[name] ?? Wallet;

export default function DashboardPage() {
  const { data, loading, error, reload } = useDashboard();

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-sm text-danger">{error}</p>
          <button onClick={reload} className="inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/70">
            <RotateCw className="h-4 w-4" /> Tekrar dene
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Hoş geldin 👋</p>
          <h1 className="text-2xl font-semibold tracking-tight">Genel Bakış</h1>
        </div>
        <div className="flex items-center gap-2">
          <PeriodToggle />
          <ThemeToggle />
        </div>
      </header>

      {data.isEmpty && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Sparkles className="h-6 w-6" />
            </span>
            <p className="font-medium">Henüz kayıt yok</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Gelir, gider ve harcama eklemeye başladığında panel otomatik dolacak.
              (Veri ekleme ekranları Faz 4&apos;te geliyor.)
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="relative overflow-hidden border-none gradient-brand text-white shadow-glass">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <CardContent className="relative">
          <p className="text-sm/none text-white/80">Kalan para</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">{formatCurrency(data.remaining)}</p>
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <span className="text-white/85">Tasarruf <b className="font-semibold">%{data.savingsRate}</b></span>
            <span className="text-white/85">Gelir <b className="font-semibold">{formatCurrency(data.totalIncome)}</b></span>
            <span className="text-white/85">Gider <b className="font-semibold">{formatCurrency(data.totalExpense + data.totalSpending)}</b></span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Toplam Gelir" value={formatCurrency(data.totalIncome)} icon={TrendingUp} accent="success" delay={0.05} />
        <StatCard label="Toplam Gider" value={formatCurrency(data.totalExpense)} icon={TrendingDown} accent="danger" delay={0.1} />
        <StatCard label="Harcanan" value={formatCurrency(data.totalSpending)} icon={ShoppingBag} accent="muted" delay={0.15} />
        <StatCard label="Tasarruf" value={`%${data.savingsRate}`} icon={PiggyBank} accent="primary" delay={0.2} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Aylık Gelir / Gider</CardTitle></CardHeader>
          <CardContent className="pt-3"><IncomeExpenseChart data={data.monthly} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Kategori Dağılımı</CardTitle></CardHeader>
          <CardContent className="pt-3">
            {data.category.length ? (
              <>
                <CategoryPie data={data.category} />
                <ul className="mt-4 space-y-2">
                  {data.category.slice(0, 4).map((c) => (
                    <li key={c.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                        {c.name}
                      </span>
                      <span className="font-medium tabular-nums">{formatCurrency(c.value)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <EmptyMini label="Bu dönemde gider yok" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Haftalık Harcama</CardTitle></CardHeader>
          <CardContent className="pt-3"><WeeklyBar data={data.weekly} /></CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Son İşlemler</CardTitle></CardHeader>
          <CardContent className="space-y-1 pt-3">
            {data.recent.length ? (
              data.recent.map((t) => {
                const Icon = iconFor(t.category);
                const income = t.type === "income";
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/60">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{t.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.description || (income ? "Gelir" : "Gider")} · {formatDate(t.date)}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold tabular-nums ${income ? "text-success" : "text-foreground"}`}>
                      {income ? "+" : "−"}{formatCurrency(Number(t.amount))}
                    </span>
                  </div>
                );
              })
            ) : (
              <EmptyMini label="Henüz işlem yok" />
            )}
          </CardContent>
        </Card>
      </div>

      {data.upcoming.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Yaklaşan Ödemeler</CardTitle></CardHeader>
          <CardContent className="grid gap-3 pt-3 sm:grid-cols-3">
            {data.upcoming.map((p) => {
              const Icon = iconFor(p.name);
              const soon = p.dueInDays <= 3;
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className={`text-xs ${soon ? "text-danger" : "text-muted-foreground"}`}>{p.dueInDays} gün içinde</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{formatCurrency(p.amount)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EmptyMini({ label }: { label: string }) {
  return <div className="grid h-32 place-items-center text-sm text-muted-foreground">{label}</div>;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
