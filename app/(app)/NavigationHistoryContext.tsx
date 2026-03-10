"use client";

import { createContext, useCallback, useContext, useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useNavigationHistoryStore } from "@/stores/navigationHistory";

type NavigationHistoryContextValue = {
  canGoBack: boolean;
  goBack: () => void;
};

const NavigationHistoryContext =
  createContext<NavigationHistoryContextValue | null>(null);

export function useNavigationHistory() {
  const ctx = useContext(NavigationHistoryContext);
  return ctx ?? { canGoBack: false, goBack: () => {} };
}

export function NavigationHistoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const stack = useNavigationHistoryStore((s) => s.stack);
  const pushPath = useNavigationHistoryStore((s) => s.pushPath);
  const popAndGetBackTarget = useNavigationHistoryStore(
    (s) => s.popAndGetBackTarget,
  );

  const fullPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  useEffect(() => {
    pushPath(fullPath);
  }, [fullPath, pushPath]);

  const goBack = useCallback(() => {
    const target = popAndGetBackTarget();
    if (target) router.push(target);
  }, [router, popAndGetBackTarget]);

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
