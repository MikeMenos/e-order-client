"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useMeasuredHeight } from "@/lib/utils";
import { Header } from "@/components/dashboard/Header";
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
  const pathname = usePathname();
  const header = useMeasuredHeight<HTMLDivElement>();
  const isDashboard = pathname === "/dashboard";

  const value = useMemo(
    () => ({
      headerHeight:
        isDashboard || header.height <= 0
          ? 0
          : header.height || FALLBACK_HEADER_HEIGHT,
    }),
    [header.height, isDashboard],
  );

  return (
    <AppHeaderContext.Provider value={value}>
      <div className="min-h-screen w-full pt-5">
        {!isDashboard && (
          <div
            ref={header.ref}
            className="sticky top-0 z-30 -mt-5 rounded-b-lg border-b-0 bg-app-card shadow-sm"
          >
            <Header />
            <AppBreadcrumb />
          </div>
        )}
        <div className="mx-auto max-w-4xl w-full">{children}</div>
      </div>
    </AppHeaderContext.Provider>
  );
}
