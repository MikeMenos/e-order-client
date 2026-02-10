"use client";

import { createContext, useContext, useMemo } from "react";
import { useMeasuredHeight } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/Header";
import { AppBreadcrumb } from "@/components/dashboard/AppBreadcrumb";

type AppHeaderContextValue = { headerHeight: number };

/** Fallback when header height not yet measured (avoids sticky overlap on first paint) */
const FALLBACK_HEADER_HEIGHT = 72;

const AppHeaderContext = createContext<AppHeaderContextValue>({
  headerHeight: FALLBACK_HEADER_HEIGHT,
});

export function useAppHeaderHeight() {
  const { headerHeight } = useContext(AppHeaderContext);
  return headerHeight || FALLBACK_HEADER_HEIGHT;
}

export function AppHeaderProvider({ children }: { children: React.ReactNode }) {
  const header = useMeasuredHeight<HTMLDivElement>();

  const value = useMemo(
    () => ({
      headerHeight: header.height > 0 ? header.height : FALLBACK_HEADER_HEIGHT,
    }),
    [header.height],
  );

  return (
    <AppHeaderContext.Provider value={value}>
      <div className="min-h-screen w-full p-5">
        <div
          ref={header.ref}
          className="sticky top-0 z-10 -mx-5 -mt-5 rounded-b-2xl border-b-0 bg-app-card shadow-sm"
        >
          <DashboardHeader embedded />
          <AppBreadcrumb />
        </div>
        <div className="mx-auto max-w-4xl w-full">{children}</div>
      </div>
    </AppHeaderContext.Provider>
  );
}
