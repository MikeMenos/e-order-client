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
import { initPushNotifications } from "@/lib/push-notifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

export function ClientApp({ children }: { children: ReactNode }) {
  useEffect(() => {
    initAuthFromCookies();
  }, []);

  useEffect(() => {
    void initPushNotifications(() => {
      void queryClient.invalidateQueries({
        queryKey: ["notifications-count-unread"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["notifications-get-items"],
      });
    });
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
