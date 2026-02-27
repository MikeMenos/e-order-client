"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { TranslationProvider } from "../lib/i18n";
import { PwaGate } from "@/components/pwa/PwaGate";
import { PwaInstallProvider } from "@/components/pwa/PwaInstallContext";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { initAuthFromCookies } from "../lib/cookies";
import { ScrollToTop } from "./(app)/ScrollToTop";

const queryClient = new QueryClient();

export function ClientApp({ children }: { children: ReactNode }) {
  useEffect(() => {
    initAuthFromCookies();
  }, []);

  return (
    <TranslationProvider>
      <QueryClientProvider client={queryClient}>
        <PwaInstallProvider>
          <ServiceWorkerRegistration />
          <PwaGate>
            <ScrollToTop />
            {children}
            <Toaster
              toastOptions={{
                duration: 2500,
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
