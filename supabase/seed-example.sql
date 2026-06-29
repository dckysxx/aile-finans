-- ============================================================
--  ÖRNEK VERİ (test için, opsiyonel)
--  1) Supabase → Authentication → Users → kendi kullanıcının ID'sini kopyala
--  2) Aşağıdaki <USER_ID> ifadelerinin TAMAMINI o ID ile değiştir
--  3) SQL Editor'da çalıştır → Dashboard dolacak
-- ============================================================

insert into public.transactions
  (user_id, type, amount, category, description, date, payment_status, is_recurring, recurring_day)
values
  -- Gelirler (bu ay)
  ('<USER_ID>', 'income',  85000, 'Maaş',     'Aylık maaş',      date_trunc('month', now())::date + 0,  null, false, null),
  ('<USER_ID>', 'income',  14000, 'Ek Gelir', 'Yan proje',       date_trunc('month', now())::date + 3,  null, false, null),

  -- Düzenli giderler (faturalar)
  ('<USER_ID>', 'expense', 18000, 'Kira',     'Ev kirası',       date_trunc('month', now())::date + 1,  'paid',   true, 1),
  ('<USER_ID>', 'expense',  1240, 'Elektrik', 'Aylık fatura',    date_trunc('month', now())::date + 5,  'unpaid', true, 15),
  ('<USER_ID>', 'expense',   560, 'İnternet', 'Fiber',           date_trunc('month', now())::date + 8,  'unpaid', true, 20),

  -- Günlük harcamalar (bu hafta görünür olsun diye now() etrafında)
  ('<USER_ID>', 'spending',  740, 'Market',   'Haftalık alışveriş', current_date - 1, null, false, null),
  ('<USER_ID>', 'spending',  320, 'Yemek',    'Öğle yemeği',        current_date - 1, null, false, null),
  ('<USER_ID>', 'spending', 2450, 'Teknoloji','Kulaklık',           current_date - 2, null, false, null),
  ('<USER_ID>', 'spending',  240, 'Sinema',   'Bilet',              current_date,     null, false, null),
  ('<USER_ID>', 'spending',  180, 'Kahve',    'Kafe',               current_date,     null, false, null);
