"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { cn, useMeasuredHeight } from "@/lib/utils";
import { Header } from "@/components/dashboard/Header";

type AppHeaderContextValue = { headerHeight: number };

/** Fallback when header height not yet measured (avoids sticky overlap on first paint) */
const FALLBACK_HEADER_HEIGHT = 72;

const AppHeaderContext = createContext<AppHeaderContextValue>({
  headerHeight: FALLBACK_HEADER_HEIGHT,
});

function shouldShowHeaderImage(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname === "/settings" ||
    pathname === "/settings/manage-suppliers" ||
    pathname?.startsWith("/settings/manage-suppliers/")
  );
}

export function useAppHeaderHeight() {
  const { headerHeight } = useContext(AppHeaderContext);
  return headerHeight || FALLBACK_HEADER_HEIGHT;
}

export function AppHeaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const header = useMeasuredHeight<HTMLDivElement>(pathname);
  const isDashboard = pathname === "/dashboard";
  const showHeaderImage = shouldShowHeaderImage(pathname ?? "");

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
            className={cn(
              "sticky top-0 z-30 -mt-5 border-b-0 shadow-sm",
              showHeaderImage ? "app-bg-image" : "bg-white",
            )}
          >
            <Header />
          </div>
        )}
        <div className="mx-auto max-w-4xl w-full">{children}</div>
      </div>
    </AppHeaderContext.Provider>
  );
}
