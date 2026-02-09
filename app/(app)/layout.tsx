"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppHeaderProvider } from "./AppHeaderContext";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-app-bg p-5">
          <div className="mx-auto max-w-4xl w-full" />
        </div>
      }
    >
      <AppHeaderProvider>
        <main className="min-h-dvh flex flex-col text-slate-900">
          <div className="flex-1 animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </AppHeaderProvider>
    </Suspense>
  );
}
