"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { TranslationProvider } from "../lib/i18n";
import { PwaGate } from "@/components/pwa/PwaGate";
import { PwaInstallProvider } from "@/components/pwa/PwaInstallContext";
import { initAuthFromCookies } from "../lib/cookies";

const queryClient = new QueryClient();

// Initialize auth from cookies synchronously before React renders
if (typeof window !== "undefined") {
  initAuthFromCookies();
}

export function ClientApp({ children }: { children: ReactNode }) {
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
