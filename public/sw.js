// Aile Finans — service worker (v2)
// Güvenlik: giriş yapılmış sayfa (navigation) HTML'i ÖNBELLEĞE ALINMAZ.
// Böylece çıkış sonrası eski sayfalar geri getirilemez ve güncellemeler daima tazedir.
const CACHE = "aile-finans-v2";
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/icon-192.png", "/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE);
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Dış istekler (Supabase vb.) olduğu gibi ağa gider — asla önbelleğe alınmaz
  if (url.origin !== self.location.origin) return;

  // Sayfa gezintileri: yalnız ağ (önbelleğe yazma yok). Çevrimdışıysa offline sayfası.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          return (await caches.match(OFFLINE_URL)) || Response.error();
        }
      })()
    );
    return;
  }

  // Statik varlıklar (js/css/img/font): önbellekten ver, arka planda tazele
  if (["style", "script", "image", "font"].includes(req.destination)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        const fetching = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              caches.open(CACHE).then((c) => c.put(req, res.clone()));
            }
            return res;
          })
          .catch(() => cached);
        return cached || fetching;
      })()
    );
  }
});

// ---------- Web Push ----------
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = data.title || "Aile Finans";
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || undefined,
    data: { url: data.url || "/notifications" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/notifications";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of all) {
        if ("focus" in c) {
          try { await c.navigate(url); } catch {}
          return c.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })()
  );
});
