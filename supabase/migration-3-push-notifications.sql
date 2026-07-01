-- ============================================================
--  MIGRATION 3 — Web Push bildirimleri
--  Güvenli: kolon nullable/defaultlu eklenir, mevcut kayıtlar bozulmaz.
--  Supabase → SQL Editor'da bir kez çalıştır.
-- ============================================================

-- 1) Ödeme bazlı bildirim tercihi (varsayılan: açık)
alter table public.transactions
  add column if not exists notify_enabled boolean not null default true;

-- 2) Push abonelikleri (kullanıcı bazlı)
create table if not exists public.push_subscriptions (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists push_subs_select on public.push_subscriptions;
create policy push_subs_select on public.push_subscriptions for select
  using (user_id = auth.uid());

drop policy if exists push_subs_insert on public.push_subscriptions;
create policy push_subs_insert on public.push_subscriptions for insert
  with check (user_id = auth.uid());

drop policy if exists push_subs_delete on public.push_subscriptions;
create policy push_subs_delete on public.push_subscriptions for delete
  using (user_id = auth.uid());

-- 3) Gönderim kaydı (mükerrer engelleme + 2 saat aralık kontrolü)
create table if not exists public.notification_log (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  sent_on        date not null default current_date,
  sent_at        timestamptz not null default now()
);
create index if not exists notification_log_txn_idx
  on public.notification_log(transaction_id, sent_on);

-- notification_log yalnız sunucu (service role) tarafından yazılır/okunur.
alter table public.notification_log enable row level security;
