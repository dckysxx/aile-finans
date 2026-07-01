"use client";

import { useState } from "react";
import {
  Bell, CalendarClock, AlertTriangle, TrendingDown, Sparkles, BellOff,
  BellRing, Loader2, type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useNotifications, type Severity, type AppNotification } from "@/hooks/use-notifications";
import { usePush } from "@/hooks/use-push";
import { createClient } from "@/lib/supabase/client";

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
  const { notifications, loading, reload } = useNotifications();
  const { permission, busy, enable, supported } = usePush();
  const [pushError, setPushError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleNotify(n: AppNotification) {
    if (!n.transactionId) return;
    setPendingId(n.transactionId);
    const supabase = createClient();
    await supabase
      .from("transactions")
      .update({ notify_enabled: !n.notifyEnabled })
      .eq("id", n.transactionId);
    await reload();
    setPendingId(null);
  }

  async function handleEnable() {
    setPushError(null);
    const res = await enable();
    if (!res.ok && res.error) setPushError(res.error);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Bildirimler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Yaklaşan ödemeler, bakiye uyarıları ve aylık özet. Ödeme bazında bildirimleri
          aşağıdaki anahtardan yönetebilirsin.
        </p>
      </header>

      {/* Push izin kartı — yalnız bu sayfa açıldığında ve izin verilmemişse */}
      {supported && permission !== "granted" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <BellRing className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium">Ödeme hatırlatmalarını aç</p>
                <p className="text-xs text-muted-foreground">
                  Son ödeme günü geldiğinde telefonuna bildirim gönderelim.
                </p>
                {pushError && <p className="mt-1 text-xs text-danger">{pushError}</p>}
              </div>
            </div>
            <Button size="sm" onClick={handleEnable} disabled={busy || permission === "denied"}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {permission === "denied" ? "İzin engelli" : "Etkinleştir"}
            </Button>
          </CardContent>
        </Card>
      )}

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
            const hasToggle = n.kind === "bill" && n.transactionId;
            return (
              <li key={n.id}>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${TONE[n.severity]}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                    </div>
                    {hasToggle &&
                      (pendingId === n.transactionId ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <Switch
                          checked={!!n.notifyEnabled}
                          onCheckedChange={() => toggleNotify(n)}
                          aria-label="Bu ödeme için bildirim"
                        />
                      ))}
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
