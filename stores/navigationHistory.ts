import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_STACK = 50;

type NavigationHistoryState = {
  stack: string[];
  /** In-memory only (not persisted): set when we navigate via goBack so we don't push on the next pathname change */
  lastBackTarget: string | null;
  pushPath: (pathname: string) => void;
  setLastBackTarget: (target: string | null) => void;
  popAndGetBackTarget: () => string | null;
};

export const useNavigationHistoryStore = create<NavigationHistoryState>()(
  persist(
    (set, get) => ({
      stack: [],
      lastBackTarget: null,

      pushPath: (pathname) =>
        set((state) => {
          if (state.lastBackTarget === pathname) {
            return { lastBackTarget: null };
          }
          if (
            state.stack.length > 0 &&
            state.stack[state.stack.length - 1] === pathname
          ) {
            return {};
          }
          return {
            stack: [...state.stack, pathname].slice(-MAX_STACK),
            lastBackTarget: null,
          };
        }),

      setLastBackTarget: (target) => set({ lastBackTarget: target }),

      popAndGetBackTarget: () => {
        const { stack } = get();
        if (stack.length <= 1) return null;
        const target = stack[stack.length - 2];
        set({
          stack: stack.slice(0, -1),
          lastBackTarget: target,
        });
        return target;
      },
    }),
    {
      name: "nav-history-storage",
      partialize: (state) => ({ stack: state.stack }),
    },
  ),
);
