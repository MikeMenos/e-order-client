import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { ClientApp } from "./ClientApp";

export const metadata: Metadata = {
  title: "eorder",
  description: "e-order B2B PWA",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "eorder",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="el">
      <head>
        <link
          rel="apple-touch-icon"
          href="/web-app-manifest-192x192.png"
          sizes="192x192"
        />
      </head>
      <body className="min-h-dvh safe-area-insets">
        <ClientApp>{children}</ClientApp>
      </body>
    </html>
  );
}
