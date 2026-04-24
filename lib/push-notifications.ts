"use client";

import { PushNotifications } from "@capacitor/push-notifications";
import { api } from "@/lib/api";
import { isCapacitorNative } from "@/lib/pwa-env";

let lastRegisteredToken: string | null = null;

async function registerDeviceToken(token: string): Promise<void> {
  await api.post("/push-device-token", {
    token,
    deviceToken: token,
    fcmToken: token,
    platform: "android",
  });
}

export type PushDebugInfo = {
  native: boolean;
  supported: boolean;
  permission: string;
  token: string | null;
};

export async function getPushDebugInfo(): Promise<PushDebugInfo> {
  if (!isCapacitorNative()) {
    return {
      native: false,
      supported: false,
      permission: "unavailable",
      token: lastRegisteredToken,
    };
  }

  const permissionStatus = await PushNotifications.checkPermissions();

  return {
    native: true,
    supported: true,
    permission: permissionStatus.receive,
    token: lastRegisteredToken,
  };
}

export async function initPushNotifications(
  onRefresh?: () => void,
): Promise<void> {
  if (!isCapacitorNative()) return;

  try {
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== "granted") return;

    await PushNotifications.register();

    await PushNotifications.removeAllListeners();

    await PushNotifications.addListener("registration", (token) => {
      lastRegisteredToken = token.value;
      void registerDeviceToken(token.value).catch((error: unknown) => {
        console.error("Failed to register push token:", error);
      });
    });

    await PushNotifications.addListener("registrationError", (error) => {
      console.error("Push registration error:", error);
    });

    await PushNotifications.addListener("pushNotificationReceived", () => {
      onRefresh?.();
    });

    await PushNotifications.addListener("pushNotificationActionPerformed", () => {
      onRefresh?.();
    });
  } catch (error) {
    console.error("Push initialization failed:", error);
  }
}
