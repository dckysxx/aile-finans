"use client";

import { TrendingDown, TrendingUp, PiggyBank, Crown, RotateCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PeriodToggle } from "@/components/shared/period-toggle";
import { iconFor } from "@/lib/category-icons";
import { useBalance } from "@/hooks/use-balance";
import { formatCurrency } from "@/lib/utils";

export default function BalancePage() {
  const { data, loading, error } = useBalance();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card><CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-danger">{error}</p>
        <button onClick={() => location.reload()} className="inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/70">
          <RotateCw className="h-4 w-4" /> Tekrar dene
        </button>
      </CardContent></Card>
    );
  }

  const negative = data.remaining < 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kalan Para</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gelir, gider ve harcamanın özeti.</p>
        </div>
        <PeriodToggle />
      </header>

      {/* Büyük hesaplama kartı */}
      <Card className="relative overflow-hidden border-none gradient-brand text-white shadow-glass">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <CardContent className="relative py-7">
          <p className="text-sm text-white/80">Bu dönem kalan</p>
          <p className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">
            {formatCurrency(data.remaining)}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-white/70">Gelir</p>
              <p className="mt-0.5 font-semibold tabular-nums">{formatCurrency(data.income)}</p>
            </div>
            <div>
              <p className="text-white/70">Gider</p>
              <p className="mt-0.5 font-semibold tabular-nums">{formatCurrency(data.expense)}</p>
            </div>
            <div>
              <p className="text-white/70">Harcama</p>
              <p className="mt-0.5 font-semibold tabular-nums">{formatCurrency(data.spending)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Özet kutuları */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Tasarruf oranı" value={`%${data.savingsRate}`} icon={PiggyBank} tone={negative ? "danger" : "success"} />
        <MiniStat label="Harcama oranı" value={`%${data.spendingRate}`} icon={TrendingDown} tone="muted" />
        <MiniStat label="Tasarruf miktarı" value={formatCurrency(Math.max(data.remaining, 0))} icon={TrendingUp} tone="primary" />
        <MiniStat label="En çok gelir" value={data.topIncome?.name ?? "—"} icon={Crown} tone="success" />
      </div>

      {/* Kategori yüzdeleri */}
      <Card>
        <CardHeader><CardTitle>Kategori Dağılımı</CardTitle></CardHeader>
        <CardContent className="space-y-3 pt-3">
          {data.categories.length ? (
            data.categories.map((c) => {
              const Icon = iconFor(c.name);
              return (
                <div key={c.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <Icon className="h-4 w-4" style={{ color: c.color }} /> {c.name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatCurrency(c.value)} · %{c.percent}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${c.percent}%`, background: c.color }} />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Bu dönemde gider yok.</p>
          )}
        </CardContent>
      </Card>

      {/* En çok harcanan + en çok gelir */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Highlight title="En fazla harcanan kategori" item={data.topCategory} />
        <Highlight title="En fazla gelir sağlayan kaynak" item={data.topIncome} />
      </div>
    </div>
  );
}

function MiniStat({
  label, value, icon: Icon, tone,
}: { label: string; value: string; icon: typeof PiggyBank; tone: "success" | "danger" | "primary" | "muted" }) {
  const map = {
    success: "text-success bg-success/10",
    danger: "text-danger bg-danger/10",
    primary: "text-primary bg-primary/10",
    muted: "text-muted-foreground bg-muted",
  } as const;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${map[tone]}`}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-3 truncate text-xl font-semibold tracking-tight tabular-nums">{value}</p>
    </Card>
  );
}

function Highlight({ title, item }: { title: string; item: { name: string; value: number } | null }) {
  const Icon = item ? iconFor(item.name) : PiggyBank;
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="flex items-center gap-3 pt-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-base font-semibold">{item?.name ?? "—"}</p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {item ? formatCurrency(item.value) : "Kayıt yok"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
