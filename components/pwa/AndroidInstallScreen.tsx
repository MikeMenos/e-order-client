"use client";

import { useTranslation } from "@/lib/i18n";
import { usePwaInstall } from "@/components/pwa/PwaInstallContext";
import { Button } from "@/components/ui/button";

export function AndroidInstallScreen() {
  const { t } = useTranslation();
  const { showInstallButton, promptInstall } = usePwaInstall();

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center bg-app-bg px-6 py-8 text-slate-900"
      style={{
        backgroundImage: "url(/assets/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Logo above the message box */}
      <div className="mb-6 flex w-full max-w-sm items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo.png"
          alt="E-Order"
          className="h-20 w-20 rounded-xl object-contain"
        />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-app-card p-6 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-semibold">
          {t("pwa_android_install_title")}
        </h1>
        <p className="mb-4 text-center text-base text-slate-600">
          {t("pwa_android_install_subtitle")}
        </p>

        {showInstallButton ? (
          <Button
            type="button"
            className="mt-2 w-full"
            onClick={() => void promptInstall()}
          >
            {t("pwa_android_install_button")}
          </Button>
        ) : (
          <p className="mt-2 text-center text-base text-slate-500">
            {t("pwa_android_install_fallback")}
          </p>
        )}
      </div>
    </div>
  );
}
