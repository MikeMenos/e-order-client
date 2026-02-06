"use client";

import "./globals.css";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { TranslationProvider } from "../lib/i18n";

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TranslationProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
              position="bottom-center"
              containerStyle={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
              }}
            />
          </QueryClientProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
