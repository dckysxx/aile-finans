import { create } from "zustand";

export type Period = "month" | "year";

interface FilterState {
  period: Period;
  setPeriod: (p: Period) => void;
}

// Sayfalar arası paylaşılan filtre durumu (Zustand).
export const useFilterStore = create<FilterState>((set) => ({
  period: "month",
  setPeriod: (period) => set({ period }),
}));
