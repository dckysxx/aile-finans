"use client";

import { useCallback, useEffect, useState } from "react";
import { isPushSupported, subscribeToPush } from "@/lib/push/client";

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export function usePush() {
  const [permission, setPermission] = useState<PushPermission>("default");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PushPermission);
  }, []);

  const enable = useCallback(async () => {
    setBusy(true);
    const res = await subscribeToPush();
    setBusy(false);
    if (isPushSupported()) setPermission(Notification.permission as PushPermission);
    return res;
  }, []);

  return { permission, busy, enable, supported: permission !== "unsupported" };
}
