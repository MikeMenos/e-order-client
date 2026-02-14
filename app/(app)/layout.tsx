"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppHeaderProvider } from "./AppHeaderContext";
import { NavigationHistoryProvider } from "./NavigationHistoryContext";
import { useStoreTokenInit } from "@/hooks/useStoreTokenInit";

function StoreTokenInitializer() {
  useStoreTokenInit();
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
      <NavigationHistoryProvider>
        <AppHeaderProvider>
          <StoreTokenInitializer />
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
