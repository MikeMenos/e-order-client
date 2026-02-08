"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppHeaderProvider } from "./AppHeaderContext";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth";

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { logout } = useAuthStore();

  const showSettingsFooter = pathname === "/settings";

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <Suspense
      fallback={
        <div className="mmin-h-dvhfull bg-app-bg p-5">
          <div className="mx-auto max-w-4xl w-full" />
        </div>
      }
    >
      <AppHeaderProvider>
        <main className="min-h-dvh flex flex-col text-slate-900">
          <div className="flex-1 animate-in fade-in duration-300">
            {children}
          </div>

          {showSettingsFooter && (
            <footer className="sticky bottom-0 left-0 right-0 mt-auto px-4 pb-4 pt-2 bg-app-bg">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center rounded-2xl
                           bg-brand-500 px-4 py-4 text-base font-semibold text-white
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
