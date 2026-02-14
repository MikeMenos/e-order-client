"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

const MAX_STACK = 50;

type NavigationHistoryContextValue = {
  canGoBack: boolean;
  goBack: () => void;
};

const NavigationHistoryContext = createContext<NavigationHistoryContextValue | null>(null);

export function useNavigationHistory() {
  const ctx = useContext(NavigationHistoryContext);
  return ctx ?? { canGoBack: false, goBack: () => {} };
}

export function NavigationHistoryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [stack, setStack] = useState<string[]>([]);
  const lastBackTargetRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setStack([pathname]);
      return;
    }
    if (lastBackTargetRef.current === pathname) {
      lastBackTargetRef.current = null;
      return;
    }
    setStack((s) => {
      if (s.length > 0 && s[s.length - 1] === pathname) return s;
      return [...s, pathname].slice(-MAX_STACK);
    });
  }, [pathname]);

  const goBack = useCallback(() => {
    setStack((s) => {
      if (s.length <= 1) return s;
      const target = s[s.length - 2];
      lastBackTargetRef.current = target;
      router.push(target);
      return s.slice(0, -1);
    });
  }, [router]);

  const canGoBack = stack.length > 1;

  const value: NavigationHistoryContextValue = {
    canGoBack,
    goBack,
  };

  return (
    <NavigationHistoryContext.Provider value={value}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}
