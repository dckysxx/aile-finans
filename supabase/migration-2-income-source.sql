-- ============================================================
--  MIGRATION 2 — Gider/Harcamalara gelir kaynağı ilişkisi
--  Güvenli: kolon nullable eklenir, mevcut kayıtlar bozulmaz.
--  Supabase → SQL Editor'da bir kez çalıştır.
-- ============================================================

alter table public.transactions
  add column if not exists income_source_id uuid
  references public.categories(id) on delete set null;

create index if not exists transactions_income_source_idx
  on public.transactions(income_source_id);
