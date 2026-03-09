import { create } from "zustand";

type AllSuppliersFilterState = {
  onlyWithBasket: boolean;
  setOnlyWithBasket: (value: boolean) => void;
};

export const useAllSuppliersFilterStore = create<AllSuppliersFilterState>(
  (set) => ({
    onlyWithBasket: false,
    setOnlyWithBasket: (value) => set({ onlyWithBasket: value }),
  }),
);
