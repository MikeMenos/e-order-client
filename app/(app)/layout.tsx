"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppHeaderProvider } from "./AppHeaderContext";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { logout } = useAuthStore();

  const showSettingsFooter = pathname === "/settings";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-app-bg p-5">
          <div className="mx-auto max-w-4xl w-full" />
        </div>
      }
    >
      <AppHeaderProvider>
        <main className="min-h-[100dvh] flex flex-col text-slate-900">
          {/* CONTENT */}
          <div className="flex-1 animate-in fade-in duration-300">
            {children}
          </div>

          {/* FOOTER – only on /settings */}
          {showSettingsFooter && (
            <footer className="px-4 py-4">
              <button
                type="button"
                onClick={logout}
                className="inline-flex w-full items-center justify-center rounded-2xl
                           bg-[#E77A43] px-4 py-4 text-base font-semibold text-white
                           shadow-sm transition active:scale-[0.99]"
              >
                {t("logout")}
              </button>
            </footer>
          )}
        </main>
      </AppHeaderProvider>
    </Suspense>
  );
}
