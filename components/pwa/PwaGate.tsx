"use client";

import { type ReactNode } from "react";
import {
  isIOS,
  isAndroid,
  isStandalone,
  isCapacitorNative,
} from "@/lib/pwa-env";
import { IOSInstallScreen } from "./IOSInstallScreen";
import { AndroidInstallScreen } from "./AndroidInstallScreen";

/** In development we skip PWA strictness so you can test the app in the browser (e.g. localhost). */
const isDev =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_PWA_STRICT !== "true";

export function PwaGate({ children }: { children: ReactNode }) {
  const onIOS = isIOS();
  const onAndroid = isAndroid();
  const standalone = isStandalone();
  const nativeApp = isCapacitorNative();

  if (!isDev && !nativeApp && onIOS && !standalone) {
    return <IOSInstallScreen />;
  }

  if (!isDev && !nativeApp && onAndroid && !standalone) {
    return <AndroidInstallScreen />;
  }

  return <>{children}</>;
}
