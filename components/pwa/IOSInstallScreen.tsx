"use client";

import { useTranslation } from "@/lib/i18n";

export function IOSInstallScreen() {
  const { t } = useTranslation();

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
        <h1 className="mb-4 text-center text-xl font-semibold">
          {t("pwa_ios_install_title")}
        </h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          {t("pwa_ios_install_subtitle")}
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>{t("pwa_ios_install_step1")}</li>
          <li>{t("pwa_ios_install_step2")}</li>
        </ol>
      </div>
    </div>
  );
}
