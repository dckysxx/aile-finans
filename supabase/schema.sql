-- ============================================================
--  AİLE FİNANS ASİSTANI — Veritabanı Şeması
--  Supabase / PostgreSQL
--  Çalıştırma: Supabase Dashboard → SQL Editor → bu dosyayı yapıştır → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
--  1) ENUM TİPLERİ
-- ============================================================
do $$ begin
  create type transaction_type as enum ('income', 'expense', 'spending');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('paid', 'unpaid', 'pending');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('member', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type theme_pref as enum ('light', 'dark', 'system');
exception when duplicate_object then null; end $$;

-- ============================================================
--  2) TABLOLAR
-- ============================================================

-- ---------- families (aile grubu) ----------
create table if not exists public.families (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- ---------- profiles (auth.users uzantısı) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  family_id   uuid references public.families(id) on delete set null,
  full_name   text not null default '',
  avatar_url  text,
  role        user_role  not null default 'member',
  currency    text       not null default 'TRY',
  theme       theme_pref not null default 'system',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- categories ----------
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  family_id   uuid references public.families(id) on delete cascade,
  name        text not null,
  icon        text not null default 'circle',          -- lucide ikon adı
  color       text not null default '#6366f1',         -- hex
  type        transaction_type not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- transactions (gelir + gider + günlük harcama tek tablo) ----------
create table if not exists public.transactions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  family_id       uuid references public.families(id) on delete set null,
  type            transaction_type not null,           -- income | expense | spending
  amount          numeric(14,2) not null check (amount >= 0),
  category        text not null,
  description     text,
  date            date not null default current_date,
  notes           text,
  payment_status  payment_status,                      -- yalnız 'expense' için anlamlı
  is_recurring    boolean not null default false,      -- düzenli gider mi
  recurring_day   smallint check (recurring_day between 1 and 31),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists transactions_user_idx   on public.transactions(user_id);
create index if not exists transactions_family_idx on public.transactions(family_id);
create index if not exists transactions_date_idx   on public.transactions(date);
create index if not exists transactions_type_idx   on public.transactions(type);

-- ============================================================
--  3) TRIGGER FONKSİYONLARI
-- ============================================================

-- updated_at otomatik güncelleme
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists set_transactions_updated_at on public.transactions;
create trigger set_transactions_updated_at
  before update on public.transactions
  for each row execute function public.handle_updated_at();

-- Yeni kullanıcı kaydolduğunda otomatik profil oluştur
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  4) RLS YARDIMCI FONKSİYONLARI
--  (SECURITY DEFINER → policy içinde sonsuz döngüyü önler)
-- ============================================================

create or replace function public.my_family_id()
returns uuid language sql stable security definer set search_path = public as $$
  select family_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

-- ============================================================
--  5) ROW LEVEL SECURITY
-- ============================================================

alter table public.families     enable row level security;
alter table public.profiles     enable row level security;
alter table public.categories   enable row level security;
alter table public.transactions enable row level security;

-- ---------- PROFILES ----------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (
    id = auth.uid()
    or (public.is_admin() and family_id = public.my_family_id())  -- aile yöneticisi
  );

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------- FAMILIES ----------
drop policy if exists families_select on public.families;
create policy families_select on public.families for select
  using (id = public.my_family_id());

-- ---------- TRANSACTIONS ----------
drop policy if exists transactions_select on public.transactions;
create policy transactions_select on public.transactions for select
  using (
    user_id = auth.uid()
    or (public.is_admin() and family_id = public.my_family_id())  -- yönetici tüm aileyi görür
  );

drop policy if exists transactions_insert on public.transactions;
create policy transactions_insert on public.transactions for insert
  with check (user_id = auth.uid());

drop policy if exists transactions_update on public.transactions;
create policy transactions_update on public.transactions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists transactions_delete on public.transactions;
create policy transactions_delete on public.transactions for delete
  using (user_id = auth.uid());

-- ---------- CATEGORIES ----------
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories for select
  using (is_default or family_id = public.my_family_id());

drop policy if exists categories_insert on public.categories;
create policy categories_insert on public.categories for insert
  with check (family_id = public.my_family_id());

drop policy if exists categories_update on public.categories;
create policy categories_update on public.categories for update
  using (family_id = public.my_family_id());

drop policy if exists categories_delete on public.categories;
create policy categories_delete on public.categories for delete
  using (family_id = public.my_family_id() and not is_default);

-- ============================================================
--  6) VARSAYILAN KATEGORİLER (seed)
-- ============================================================
insert into public.categories (name, icon, color, type, is_default) values
  -- Gelir
  ('Maaş',       'wallet',       '#22c55e', 'income',   true),
  ('Ticket',     'ticket',       '#14b8a6', 'income',   true),
  ('Ek Gelir',   'plus-circle',  '#10b981', 'income',   true),
  ('Yatırım',    'trending-up',  '#0ea5e9', 'income',   true),
  -- Gider (düzenli faturalar)
  ('Kira',       'home',         '#ef4444', 'expense',  true),
  ('Elektrik',   'zap',          '#f59e0b', 'expense',  true),
  ('Su',         'droplet',      '#06b6d4', 'expense',  true),
  ('Doğalgaz',   'flame',        '#f97316', 'expense',  true),
  ('Telefon',    'phone',        '#8b5cf6', 'expense',  true),
  ('İnternet',   'wifi',         '#3b82f6', 'expense',  true),
  ('Aidat',      'building',     '#64748b', 'expense',  true),
  ('Kredi',      'landmark',     '#e11d48', 'expense',  true),
  ('Vergi',      'receipt',      '#dc2626', 'expense',  true),
  ('Sigorta',    'shield',       '#0891b2', 'expense',  true),
  -- Harcama (günlük)
  ('Yemek',      'utensils',     '#f43f5e', 'spending', true),
  ('Market',     'shopping-cart','#84cc16', 'spending', true),
  ('Kahve',      'coffee',       '#a16207', 'spending', true),
  ('Sinema',     'film',         '#7c3aed', 'spending', true),
  ('Oyun',       'gamepad-2',    '#6366f1', 'spending', true),
  ('Lego',       'blocks',       '#eab308', 'spending', true),
  ('Teknoloji',  'cpu',          '#0ea5e9', 'spending', true),
  ('Giyim',      'shirt',        '#ec4899', 'spending', true),
  ('Sağlık',     'heart-pulse',  '#ef4444', 'spending', true),
  ('Ulaşım',     'bus',          '#f59e0b', 'spending', true),
  ('Tatil',      'plane',        '#06b6d4', 'spending', true),
  ('Ev',         'sofa',         '#8b5cf6', 'spending', true),
  ('Eğlence',    'party-popper', '#d946ef', 'spending', true),
  ('Hediye',     'gift',         '#f43f5e', 'spending', true),
  ('Diğer',      'more-horizontal','#94a3b8','spending', true)
on conflict do nothing;

-- ============================================================
--  SON
-- ============================================================
