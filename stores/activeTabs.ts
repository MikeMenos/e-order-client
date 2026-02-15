import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "active-tabs-storage";

type ActiveTabsState = {
  tabs: Record<string, string>;
  getActiveTab: (key: string) => string | undefined;
  setActiveTab: (key: string, value: string) => void;
};

export const useActiveTabsStore = create<ActiveTabsState>()(
  persist(
    (set, get) => ({
      tabs: {},

      getActiveTab: (key) => get().tabs[key],

      setActiveTab: (key, value) =>
        set((state) => ({
          tabs: { ...state.tabs, [key]: value },
        })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ tabs: state.tabs }),
    },
  ),
);

/** Keys for known tab contexts */
export const activeTabKeys = {
  ordersOfTheDay: "orders-of-the-day",
  supplierMain: (supplierUID: string) => `supplier-main-${supplierUID}`,
  supplierSection: (supplierUID: string) => `supplier-section-${supplierUID}`,
} as const;
