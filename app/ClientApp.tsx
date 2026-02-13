"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { TranslationProvider } from "../lib/i18n";
import { PwaGate } from "@/components/pwa/PwaGate";
import { PwaInstallProvider } from "@/components/pwa/PwaInstallContext";
import { initAuthFromCookies } from "../lib/cookies";

const queryClient = new QueryClient();

export function ClientApp({ children }: { children: ReactNode }) {
  // Run auth init after mount to avoid module-load exceptions on Android (e.g. after redirect to /dashboard)
  useEffect(() => {
    initAuthFromCookies();
  }, []);

  return (
    <TranslationProvider>
      <QueryClientProvider client={queryClient}>
        <PwaInstallProvider>
          <PwaGate>
            {children}
            <Toaster
              toastOptions={{
                duration: 4000,
              }}
              position="bottom-center"
              containerStyle={{
                position: "fixed",
                bottom: 30,
                left: 0,
                right: 0,
              }}
            />
          </PwaGate>
        </PwaInstallProvider>
      </QueryClientProvider>
    </TranslationProvider>
  );
}
