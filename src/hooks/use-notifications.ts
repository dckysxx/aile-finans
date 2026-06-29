"use client";

import { useMemo } from "react";
import { useFinanceData } from "@/hooks/use-finance-data";
import { useNotificationPrefs, type NotifKind } from "@/store/notification-prefs";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types/database";

export type Severity = "info" | "warning" | "danger";

export interface AppNotification {
  id: string;
  kind: NotifKind;
  icon: string; // lucide adı
  title: string;
  body: string;
  severity: Severity;
}

const num = (v: number | string) => Number(v) || 0;

function daysUntilRecurring(day: number, now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), now.getMonth(), day);
  if (next < today) next = new Date(now.getFullYear(), now.getMonth() + 1, day);
  return Math.round((next.getTime() - today.getTime()) / 86400000);
}

function build(txns: Transaction[], enabled: Record<NotifKind, boolean>): AppNotification[] {
  const now = new Date();
  const list: AppNotification[] = [];

  // Yaklaşan / ödenmemiş düzenli faturalar
  if (enabled.bill) {
    txns
      .filter((t) => t.type === "expense" && t.is_recurring && t.recurring_day && t.payment_status !== "paid")
      .map((t) => ({ t, d: daysUntilRecurring(t.recurring_day as number, now) }))
      .filter(({ d }) => d <= 7)
      .sort((a, b) => a.d - b.d)
      .forEach(({ t, d }) =>
        list.push({
          id: `bill-${t.id}`,
          kind: "bill",
          icon: "calendar-clock",
          title: `${t.category} ödemesi yaklaşıyor`,
          body: `${formatCurrency(num(t.amount))} · ${d === 0 ? "bugün" : `${d} gün içinde`}`,
          severity: d <= 2 ? "danger" : "warning",
        })
      );
  }

  // Bu ay özeti + düşük bakiye
  const monthTx = txns.filter((t) => {
    const dt = new Date(t.date);
    return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
  });
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + num(t.amount), 0);
  const outflow = monthTx.filter((t) => t.type !== "income").reduce((s, t) => s + num(t.amount), 0);
  const remaining = income - outflow;

  if (enabled.lowBalance && income > 0) {
    if (remaining < 0) {
      list.push({
        id: "low-neg",
        kind: "lowBalance",
        icon: "alert-triangle",
        title: "Giderler geliri aştı",
        body: `Bu ay ${formatCurrency(Math.abs(remaining))} açık var.`,
        severity: "danger",
      });
    } else if (remaining < income * 0.1) {
      list.push({
        id: "low-warn",
        kind: "lowBalance",
        icon: "trending-down",
        title: "Bakiyen azalıyor",
        body: `Bu ay kalan: ${formatCurrency(remaining)}.`,
        severity: "warning",
      });
    }
  }

  if (enabled.summary && monthTx.length > 0) {
    const rate = income > 0 ? Math.round((remaining / income) * 100) : 0;
    list.push({
      id: "summary",
      kind: "summary",
      icon: "sparkles",
      title: "Bu ayın özeti",
      body: `Gelir ${formatCurrency(income)} · Gider ${formatCurrency(outflow)} · Tasarruf %${rate}`,
      severity: "info",
    });
  }

  return list;
}

export function useNotifications() {
  const { txns, loading, error } = useFinanceData();
  const enabled = useNotificationPrefs((s) => s.enabled);
  const notifications = useMemo(() => build(txns, enabled), [txns, enabled]);
  return { notifications, loading, error };
}
