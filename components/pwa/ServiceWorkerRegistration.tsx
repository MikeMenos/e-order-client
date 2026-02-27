"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for PWA / PWABuilder compatibility.
 * Must run in the browser (client component).
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.debug("Service worker registered", reg.scope);
        })
        .catch((err) => {
          console.warn("Service worker registration failed:", err);
        });
    }
  }, []);

  return null;
}
