"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    // Log for debugging (e.g. Sentry); avoid logging in prod if not needed
    if (process.env.NODE_ENV === "development") {
      console.error("App error boundary:", error);
    }
  }, [error]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-slate-900">
      <p className="text-center mb-6 max-w-sm">{t("error_app_message")}</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-slate-800 text-white px-4 py-2"
        >
          {t("error_try_again")}
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-300 px-4 py-2"
        >
          {t("nav_home")}
        </Link>
      </div>
    </div>
  );
}
