import { create } from "zustand";
import { persist } from "zustand/middleware";

export type NotifKind = "bill" | "lowBalance" | "summary";

interface PrefsState {
  enabled: Record<NotifKind, boolean>;
  toggle: (kind: NotifKind) => void;
}

// Bildirim tercihleri (tarayıcıda kalıcı).
export const useNotificationPrefs = create<PrefsState>()(
  persist(
    (set) => ({
      enabled: { bill: true, lowBalance: true, summary: true },
      toggle: (kind) =>
        set((s) => ({ enabled: { ...s.enabled, [kind]: !s.enabled[kind] } })),
    }),
    { name: "aile-finans-notif-prefs" }
  )
);
