# Aile Finans Asistanı

Aile içi tüm finansal hareketleri (gelir, gider, günlük harcama) tek yerden yöneten,
davet-only, mobil öncelikli web uygulaması. Microsoft Copilot esintili minimal & premium arayüz.

**Stack:** Next.js 14 · TypeScript · TailwindCSS · Supabase (SSR Auth + RLS) · Recharts · Framer Motion · Zustand · Lucide

---

## Özellikler
- **Dashboard** — toplam gelir/gider, kalan para, tasarruf oranı, aylık gelir-gider grafiği, kategori pastası, haftalık harcama, son işlemler, yaklaşan ödemeler
- **Gelir / Gider / Harcama** — ekle · düzenle · sil · filtrele · ara (gidere özel ödeme durumu + düzenli ödeme)
- **Kalan Para** — büyük hesaplama kartı, kategori yüzdeleri, en çok harcanan kategori, en çok gelir kaynağı, tasarruf
- **Filtreleme & Arama** — Bugün / Hafta / Ay / Yıl / Tümü + kategori + serbest metin
- **Bildirimler** — yaklaşan fatura, düşük bakiye, aylık özet (Profil'den açılıp kapanabilir)
- **Profil** — kullanıcı bilgisi, tema (açık/koyu/otomatik), para birimi, şifre değiştirme, bildirim ayarları, çıkış
- **Tema** — açık/koyu/otomatik, glassmorphism (nav & üst bar), yuvarlatılmış büyük kartlar, akıcı animasyonlar
- **Güvenlik** — Supabase RLS: herkes yalnız kendi kaydını görür; `admin` rolü ileride tüm aileyi görebilir (RLS hazır)

---

## Sıfırdan Kurulum

### 1) Node.js
18.18+ (öneri 20 LTS) → https://nodejs.org · Kontrol: `node --version`

### 2) Bağımlılıklar
```bash
npm install
```

### 3) Supabase
1. https://supabase.com → **New project**
2. **SQL Editor** → `supabase/schema.sql` içeriğinin tamamını yapıştır → **Run**
3. **Project Settings → API** → `Project URL` ve `anon public` key'i al

### 4) Ortam değişkenleri (zorunlu)
```bash
cp .env.example .env.local
```
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 5) Kullanıcı oluştur (davet-only)
Supabase → **Authentication → Users → Add user** → e-posta + şifre, **Auto Confirm User** işaretle.
(Profil satırı trigger ile otomatik oluşur.)

### 6) Çalıştır
```bash
npm run dev
```
http://localhost:3000 → giriş ekranı.

### 7) (Opsiyonel) Test verisi
**Authentication → Users**'tan kendi **User ID**'ni kopyala, `supabase/seed-example.sql` içindeki
`<USER_ID>` yerlerine yapıştır, SQL Editor'da çalıştır.

---

## Klasör Yapısı
```
src/
├─ middleware.ts                 # oturum + route koruması
├─ app/
│  ├─ (auth)/login/              # giriş
│  ├─ (app)/                     # korumalı kabuk (sidebar + bottom nav + mobil üst bar)
│  │  ├─ dashboard/ income/ expenses/ spending/ balance/ notifications/ profile/
│  ├─ layout.tsx · globals.css
├─ components/
│  ├─ ui/         (card, button, input, textarea, skeleton)
│  ├─ shared/     (app-nav, mobile-top-bar, modal, filter-bar, theme-toggle, period-toggle, stat-card, notifications-bell)
│  ├─ transactions/ (transactions-page, transaction-form, transaction-list)
│  └─ charts/     (income-expense, category-pie, weekly-bar)
├─ hooks/   use-dashboard · use-balance · use-finance-data · use-transactions · use-categories · use-profile · use-notifications
├─ store/   filter-store · notification-prefs (zustand)
├─ lib/     utils · aggregations · filters · category-icons · supabase/(client|server|middleware)
└─ types/database.ts             # Database + domain tipleri (tek kaynak)
supabase/  schema.sql · seed-example.sql
```

---

## Yol Haritası
- **Faz 1 ✅** Veri katmanı (şema + RLS + tipler)
- **Faz 2 ✅** İskelet + tasarım sistemi + tema + Dashboard
- **Faz 3 ✅** Auth (davet-only) + Supabase bağlama + store/hook'lar
- **Faz 4 ✅** Gelir · Gider · Harcama · Kalan Para · Bildirimler · Filtre/Arama · Profil
- **Sonraki adımlar (opsiyonel):** aile yönetimi (üye davet + rol atama UI), Supabase Storage ile avatar yükleme, "kullanıcı" filtresiyle aile geneli görünüm, CSV dışa aktarma

---

## Güncelleme Notu (gelir kaynağı ilişkisi)
Yeni sürümde gider/harcamalar bir **gelir kaynağına** bağlanır ve her gelir kategorisi
kendi bakiyesini bağımsız hesaplar. Mevcut Supabase veritabanında **bir kez** şu migration'ı çalıştır:
`supabase/migration-2-income-source.sql` (SQL Editor). Güvenlidir: kolon nullable eklenir,
mevcut kayıtlar bozulmaz. Eski kayıtların kaynağı boş kalır; yeni eklemelerde kaynak seçimi zorunludur.

---

## iOS'ta Uygulama Gibi Kurma (PWA)
Uygulama App Store gerektirmez. Yayındaki (Vercel) HTTPS adresini kullan:
1. **iPhone Safari** ile siteyi aç (Chrome değil).
2. Alttaki **Paylaş** butonu → **Ana Ekrana Ekle**.
3. Ana ekrandaki ikondan aç → Safari arayüzü olmadan, tam ekran, splash ekranıyla açılır.

Android (Chrome): menü (⋮) → **Uygulamayı yükle**.

Notlar: PWA yalnızca HTTPS'te (yayında) tam çalışır; `npm run dev` yerine `npm run build && npm start`
ile lokalde de denenebilir. Güncellemeler sunucudan otomatik alınır (yeni sürüm açılışta uygulanır).
Giriş yapmayan kullanıcı hiçbir sayfaya erişemez; çıkış sonrası geri tuşuyla eski sayfalar açılamaz.

---

## Push Bildirimleri (Web Push) Kurulumu
Son ödeme günü gelen ödemeler için, uygulama kapalıyken bile bildirim gönderir.

1) **Migration:** Supabase → SQL Editor → `supabase/migration-3-push-notifications.sql` çalıştır.
2) **VAPID anahtarları üret:**
   ```bash
   npx web-push generate-vapid-keys
   ```
3) **Ortam değişkenlerini** hem `.env.local`'e hem Vercel'e ekle (bkz. `.env.example`):
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
   - `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API → service_role — yalnız sunucuda kullanılır)
   - `CRON_SECRET` (rastgele uzun bir değer)
4) **Zamanlayıcı:** `vercel.json` içindeki cron `/api/cron/notify`'ı her 2 saatte bir tetikler.
   - Not: Vercel **Hobby** planında cron günde yalnız 1 kez çalışır. Her 2 saatte bir için ya **Pro** plan
     gerekir ya da harici bir zamanlayıcı (ör. cron-job.org) şu adresi çağırır:
     `https://SITEN/api/cron/notify?key=CRON_SECRET`

### iOS notu (önemli)
Web Push, iPhone'da yalnız **ana ekrana eklenmiş** PWA'da ve **iOS 16.4+** ile çalışır
(normal Safari sekmesinde çalışmaz). Kullanıcı Bildirimler sayfasındaki **Etkinleştir**
düğmesine bastığında izin istenir (ilk girişte istenmez).

### Mantık
- Cron her gün **TR 13:00'da (UTC 10:00)** bir kez çalışır (`vercel.json`: `0 10 * * *`).
- O gün son ödeme günü olan, ödenmemiş ve bildirimi **açık** kayıtlar bulunur.
- Her kullanıcıya **tek toplu bildirim** gönderilir (birden fazla ödeme varsa: "Bugün son ödeme günü olan N ödemen var: …").
- Aynı gün ikinci kez gönderilmez; ertesi gün o kayıt tekrar tetiklemez.
- Ödeme kartındaki **yeşil anahtar** o ödeme için bildirimi açar/kapatır (kullanıcı bazında saklanır).
- Yalnız bildirimi açık kullanıcılar sorgulanır → gereksiz sorgu yok, ölçeklenebilir.

> Not: Vercel Hobby planı cron'u günde 1 kez çalıştırır; bu tasarım tam da buna uygundur.
> Vercel cron saati yaklaşıktır (13:00–13:59 arası tetiklenebilir), günlük tek bildirim için sorun değildir.
