"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppHeaderProvider } from "./AppHeaderContext";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-app-bg p-5">
          <div className="mx-auto max-w-4xl w-full" />
        </div>
      }
    >
      <AppHeaderProvider>
        <div className="animate-in fade-in duration-300">{children}</div>
      </AppHeaderProvider>
    </Suspense>
  );
}
