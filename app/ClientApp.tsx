"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { TranslationProvider } from "../lib/i18n";
import { PwaGate } from "@/components/pwa/PwaGate";
import { PwaInstallProvider } from "@/components/pwa/PwaInstallContext";

const queryClient = new QueryClient();

export function ClientApp({ children }: { children: ReactNode }) {
  return (
    <TranslationProvider>
      <QueryClientProvider client={queryClient}>
        <PwaInstallProvider>
          <PwaGate>
            {children}
            <Toaster
              position="bottom-center"
              containerStyle={{
                position: "fixed",
                bottom: 10,
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
