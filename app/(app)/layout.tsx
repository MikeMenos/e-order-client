"use client";

import type { ReactNode } from "react";
import { Suspense, useEffect } from "react";
import { AppHeaderProvider } from "./AppHeaderContext";
import { NavigationHistoryProvider } from "./NavigationHistoryContext";
import { AppBackground } from "./AppBackground";
import { useStoreTokenInit } from "@/hooks/useStoreTokenInit";
import { useNotificationsCountUnread } from "@/hooks/useNotifications";
import { isCapacitorNative } from "@/lib/pwa-env";
import { Badge } from "@capawesome/capacitor-badge";

function StoreTokenInitializer() {
  useStoreTokenInit();
  return null;
}

function NativeBadgeInitializer() {
  const { data } = useNotificationsCountUnread();
  const unreadCounter = Math.max(0, Number(data?.unreadCounter ?? 0));

  useEffect(() => {
    if (!isCapacitorNative()) return;

    const syncBadge = async () => {
      try {
        const { isSupported } = await Badge.isSupported();
        if (!isSupported) return;
        await Badge.set({ count: unreadCounter });
      } catch {
        // Best-effort only: the app should keep working if badge sync fails.
      }
    };

    void syncBadge();
  }, [unreadCounter]);

  return null;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh p-5">
          <div className="mx-auto max-w-4xl w-full" />
        </div>
      }
    >
      <AppBackground />
      <NavigationHistoryProvider>
        <AppHeaderProvider>
          <StoreTokenInitializer />
          <NativeBadgeInitializer />
          <main className="min-h-dvh flex flex-col text-slate-900">
            <div className="flex-1 animate-in fade-in duration-300">
              {children}
            </div>
          </main>
        </AppHeaderProvider>
      </NavigationHistoryProvider>
    </Suspense>
  );
}
