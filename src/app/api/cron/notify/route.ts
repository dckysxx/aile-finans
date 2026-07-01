import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPush, type PushPayload } from "@/lib/push/web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Vercel Cron: CRON_SECRET tanımlıysa Authorization header'ı otomatik ekler.
// Harici zamanlayıcılar için ?key=CRON_SECRET de kabul edilir.
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return new URL(req.url).searchParams.get("key") === secret;
}

// Kullanıcı başına TEK toplu bildirim üretir — ileride farklı tipler eklenebilir.
function buildGroupedPayload(categories: string[]): PushPayload {
  const count = categories.length;
  if (count === 1) {
    return {
      title: "Bugün son ödeme günü",
      body: `${categories[0]} ödemesinin bugün son ödeme günü. Ödemeyi unutma.`,
      url: "/notifications",
      tag: "due-today",
    };
  }
  const preview = categories.slice(0, 3).join(", ");
  const extra = count > 3 ? ` +${count - 3}` : "";
  return {
    title: "Bugün son ödeme günü",
    body: `Bugün son ödeme günü olan ${count} ödemen var: ${preview}${extra}.`,
    url: "/notifications",
    tag: "due-today",
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

  // Kullanıcı bazında grupla → her kullanıcıya tek bildirim
  const byUser = new Map<string, { id: string; category: string }[]>();
  for (const t of due) {
    const arr = byUser.get(t.user_id) ?? [];
    arr.push({ id: t.id, category: t.category });
    byUser.set(t.user_id, arr);
  }

  let sent = 0;
  let skipped = 0;
  let cleaned = 0;

  for (const [userId, items] of Array.from(byUser.entries())) {
    // Bugün bu kullanıcıya zaten gönderildiyse tekrar gönderme (günde bir kez)
    const { data: logs } = await supabase
      .from("notification_log")
      .select("id")
      .eq("user_id", userId)
      .eq("sent_on", today)
      .limit(1);
    if (logs && logs.length) {
      skipped++;
      continue;
    }

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint,p256dh,auth")
      .eq("user_id", userId);
    if (!subs || subs.length === 0) {
      skipped++;
      continue;
    }

    const payload = buildGroupedPayload(items.map((i) => i.category));
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
      // Bugün gönderildi işareti (kapsanan her ödeme için)
      await supabase
        .from("notification_log")
        .insert(items.map((i) => ({ user_id: userId, transaction_id: i.id })));
      sent++;
    }
  }

  return { users: byUser.size, sent, skipped, cleaned };
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
