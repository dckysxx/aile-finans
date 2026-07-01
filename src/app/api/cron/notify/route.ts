import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush, type PushPayload } from "@/lib/push/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const THROTTLE_MINUTES = 110; // ~2 saatte bir

// Vercel Cron: CRON_SECRET tanımlıysa Authorization header'ı otomatik ekler.
// Harici zamanlayıcılar için ?key=CRON_SECRET de kabul edilir.
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return new URL(req.url).searchParams.get("key") === secret;
}

// Bildirim içeriğini üretir — ileride farklı tipler eklenebilir.
function buildDuePayload(category: string, transactionId: string): PushPayload {
  return {
    title: "Bugün son ödeme günü",
    body: `${category} ödemesinin bugün son ödeme günü. Ödemeyi unutma.`,
    url: "/notifications",
    tag: `due-${transactionId}`,
  };
}

async function run() {
  const supabase = createAdminClient();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const dayOfMonth = now.getDate();

  // Performans: yalnız bildirimi AÇIK ve ödenmemiş giderler çekilir.
  const { data: txns, error } = await supabase
    .from("transactions")
    .select("id,user_id,category,is_recurring,recurring_day,date,payment_status")
    .eq("type", "expense")
    .eq("notify_enabled", true)
    .neq("payment_status", "paid");
  if (error) throw error;

  // Son ödeme günü BUGÜN olanlar (düzenli: ayın günü; tek seferlik: tarih)
  const due = (txns ?? []).filter(
    (t) => (t.is_recurring && t.recurring_day === dayOfMonth) || t.date === today
  );

  let sent = 0;
  let skipped = 0;
  let cleaned = 0;

  for (const t of due) {
    // 2 saatlik aralık + gün içi mükerrer engelleme
    const { data: logs } = await supabase
      .from("notification_log")
      .select("sent_at")
      .eq("transaction_id", t.id)
      .eq("sent_on", today)
      .order("sent_at", { ascending: false })
      .limit(1);
    if (logs && logs.length) {
      const last = new Date(logs[0].sent_at).getTime();
      if (now.getTime() - last < THROTTLE_MINUTES * 60 * 1000) {
        skipped++;
        continue;
      }
    }

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint,p256dh,auth")
      .eq("user_id", t.user_id);
    if (!subs || subs.length === 0) {
      skipped++;
      continue;
    }

    const payload = buildDuePayload(t.category, t.id);
    let anySent = false;
    for (const s of subs) {
      const res = await sendPush({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth }, payload);
      if (res.ok) anySent = true;
      else if (res.gone) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        cleaned++;
      }
    }

    if (anySent) {
      await supabase.from("notification_log").insert({ user_id: t.user_id, transaction_id: t.id });
      sent++;
    }
  }

  return { checked: due.length, sent, skipped, cleaned };
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await run());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export const POST = GET;
