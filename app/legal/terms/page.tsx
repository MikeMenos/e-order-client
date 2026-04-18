"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function TermsOfUsePage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">{t("legal_terms_title")}</h1>
        <div className="mt-6 space-y-4 text-sm leading-6 text-slate-700">
          <p>{t("legal_terms_p1")}</p>
          <p>{t("legal_terms_p2")}</p>
          <p>{t("legal_terms_p3")}</p>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="text-sm font-medium text-brand-600 underline"
          >
            {t("legal_back_to_login")}
          </Link>
        </div>
      </div>
    </main>
  );
}
