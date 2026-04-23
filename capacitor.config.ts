import type { CapacitorConfig } from "@capacitor/cli";
import { config as loadEnv } from "dotenv";

loadEnv();

const serverUrl = "https://mobile.e-order.pro/";

const config: CapacitorConfig = {
  appId: "pro.eorder.mobile",
  appName: "eorder",
  // Minimal local fallback required by Capacitor tooling even when server.url is used.
  webDir: "capacitor-web",
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"),
        },
      }
    : {}),
};

export default config;
