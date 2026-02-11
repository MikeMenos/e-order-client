"use client";

import { useEffect, type ReactNode } from "react";
import { isIOS, isAndroid, isStandalone } from "@/lib/pwa-env";
import { useTranslation } from "@/lib/i18n";
import { IOSInstallScreen } from "./IOSInstallScreen";
import { AndroidInstallScreen } from "./AndroidInstallScreen";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0";

/** In development we skip PWA strictness so you can test the app in the browser (e.g. localhost). */
const isDev =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_PWA_STRICT !== "true";

export function PwaGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  useEffect(() => {
    if (isDev) return;
    const checkVersion = async () => {
      try {
        const res = await fetch("/version.json?t=" + Date.now());
        const data = await res.json();
        const serverVersion = data?.version;
        if (
          serverVersion &&
          serverVersion !== APP_VERSION &&
          window.confirm(t("pwa_update_available"))
        ) {
          window.location.reload();
        }
      } catch {
        // ignore
      }
    };
    checkVersion();
  }, [t]);

  const onIOS = isIOS();
  const onAndroid = isAndroid();
  const standalone = isStandalone();

  if (!isDev && onIOS && !standalone) {
    return <IOSInstallScreen />;
  }

  if (!isDev && onAndroid && !standalone) {
    return <AndroidInstallScreen />;
  }

  return <>{children}</>;
}
