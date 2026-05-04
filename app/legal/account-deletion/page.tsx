"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n";

/** Fixed request channel (same as privacy policy). */
const SUPPORT_EMAIL = "info@eorder.gr";

export default function AccountDeletionPage() {
  const { t, i18n } = useTranslation();

  const mailtoHref = useMemo(() => {
    const subject =
      i18n.language === "gr"
        ? "Αίτημα διαγραφής λογαριασμού e-order"
        : "e-order account deletion request";
    const body =
      i18n.language === "gr"
        ? "Παρακαλώ διαγράψτε οριστικά τον λογαριασμό μου e-order.\n\nΌνομα χρήστη:\nΕγγεγραμμένο email:\nΑΦΜ καταστήματος (αν ισχύει):\n"
        : "Please permanently delete my e-order account.\n\nUsername:\nRegistered email:\nStore VAT (if applicable):\n";
    return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [i18n.language]);

  return (
    <main className="safe-area-insets min-h-dvh bg-slate-50 px-4 py-8 text-slate-900 md:px-6">
      <div className="m-5 max-w-2xl md:mx-auto rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-9 md:max-w-3xl md:px-10 md:py-11">
        <h1 className="text-2xl font-semibold md:text-3xl">
          {t("legal_account_deletion_title")}
        </h1>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-700 md:text-lg">
          <p>{t("legal_account_deletion_intro")}</p>
          <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
            {t("legal_account_deletion_steps_title")}
          </h2>
          <ol className="list-decimal space-y-3 pl-5">
            <li>{t("legal_account_deletion_step1")}</li>
            <li>{t("legal_account_deletion_step2")}</li>
            <li>{t("legal_account_deletion_step3")}</li>
          </ol>
          <p className="text-sm text-slate-600 md:text-base">
            {t("legal_account_deletion_note")}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <a
            href={mailtoHref}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-brand-500 px-6 py-3 text-base font-medium text-white transition hover:bg-brand-600"
          >
            {t("legal_account_deletion_cta")}
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-base font-medium text-brand-600 underline"
          >
            {SUPPORT_EMAIL}
          </a>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
          <Link
            href="/settings/account"
            className="text-sm font-medium text-brand-600 underline md:text-base"
          >
            {t("legal_account_deletion_back_to_account")}
          </Link>
        </div>
      </div>
    </main>
  );
}
