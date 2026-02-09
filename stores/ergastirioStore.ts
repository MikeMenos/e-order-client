import type { IStoreInfo } from "@/lib/ergastirio-interfaces";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ErgastirioState = {
  currentBranch?: IStoreInfo;
  setCurrentBranch: (branch?: IStoreInfo) => void;
  vat?: string;
  setVat: (value?: string) => void;
  basketId?: string;
  setBasketId: (value?: string) => void;
  hydrated: boolean;
  setHydrated: () => void;
  clientData?: IStoreInfo[];
  setClientData: (data?: IStoreInfo[]) => void;
  resetState: () => void;
};

export const ergastirioStore = create<ErgastirioState>()(
  persist(
    (set) => ({
      currentBranch: undefined,
      setCurrentBranch: (currentBranch) => set({ currentBranch }),
      vat: undefined,
      setVat: (vat) => set({ vat }),
      basketId: undefined,
      setBasketId: (basketId) => set({ basketId }),
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      clientData: undefined,
      setClientData: (clientData) => set({ clientData }),
      resetState: () =>
        set({
          vat: undefined,
          basketId: undefined,
          currentBranch: undefined,
          clientData: undefined,
        }),
    }),
    { name: "ergastirio-storage", skipHydration: true }
  )
);
