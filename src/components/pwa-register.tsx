"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // İlk yüklemede kontrol eden SW yoksa güncelleme reload'unu tetikleme
    const hadController = !!navigator.serviceWorker.controller;
    let refreshing = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController || refreshing) return;
      refreshing = true;
      window.location.reload(); // yeni sürüm sunucudan otomatik alınır
    });

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
