"use client";

import {
  Bell, CalendarClock, AlertTriangle, TrendingDown, Sparkles, BellOff,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications, type Severity } from "@/hooks/use-notifications";

const ICONS: Record<string, LucideIcon> = {
  "calendar-clock": CalendarClock,
  "alert-triangle": AlertTriangle,
  "trending-down": TrendingDown,
  sparkles: Sparkles,
  bell: Bell,
};

const TONE: Record<Severity, string> = {
  danger: "text-danger bg-danger/10",
  warning: "text-amber-500 bg-amber-500/10",
  info: "text-primary bg-primary/10",
};

export default function NotificationsPage() {
  const { notifications, loading } = useNotifications();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Bildirimler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Yaklaşan ödemeler, bakiye uyarıları ve aylık özet. Tercihleri Profil&apos;den
          ayarlayabilirsin.
        </p>
      </header>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <BellOff className="h-7 w-7" />
            </span>
            <p className="font-medium">Şimdilik bildirim yok</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Yaklaşan faturalar ve uyarılar burada görünecek.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const Icon = ICONS[n.icon] ?? Bell;
            return (
              <li key={n.id}>
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${TONE[n.severity]}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
