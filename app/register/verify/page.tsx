"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RegisterVerifyStepper } from "@/components/register/RegisterVerifyStepper";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { REGISTER_VERIFY_STORAGE_KEY } from "@/lib/register-verification";

export default function RegisterVerifyPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [appUserUID, setAppUserUID] = useState<string | undefined | null>(
    undefined,
  );

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(REGISTER_VERIFY_STORAGE_KEY)?.trim();
      if (v) {
        setAppUserUID(v);
        return;
      }
    } catch {
      /* ignore */
    }
    setAppUserUID(null);
    toast.error(t("register_verify_missing_session"));
    router.replace("/register");
  }, [router, t]);

  if (appUserUID === undefined) {
    return (
      <main
        className="flex min-h-dvh flex-col items-center justify-center bg-cover bg-center bg-no-repeat text-slate-900"
        style={{ backgroundImage: "url(/assets/background.png)" }}
      >
        <p className="text-slate-600">{t("register_verify_submitting")}</p>
      </main>
    );
  }

  if (appUserUID === null) {
    return null;
  }

  return (
    <main
      className="flex min-h-dvh flex-col items-center bg-cover bg-center bg-no-repeat text-slate-900 pb-10"
      style={{ backgroundImage: "url(/assets/background.png)" }}
    >
      <div className="flex w-full max-w-lg items-center justify-between p-4">
        <Link
          href="/register"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
        >
          ← {t("nav_back_home")}
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            i18n.changeLanguage(i18n.language === "en" ? "gr" : "en")
          }
          className="shrink-0 rounded-full border border-slate-200/80 px-3 py-1 text-base font-medium text-slate-700"
        >
          {i18n.language === "gr" ? t("lang_en") : t("lang_gr")}
        </Button>
      </div>
      <div className="mb-4 flex w-full max-w-lg justify-center px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo.png"
          alt="E-Order"
          className="h-20 w-20 object-contain"
        />
      </div>
      <div className="w-full max-w-lg px-4">
        <div className="rounded-2xl border border-slate-200/80 p-6 shadow-lg bg-app-card">
          <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">
            {t("register_verify_title")}
          </h1>
          <RegisterVerifyStepper appUserUID={appUserUID} />
        </div>
      </div>
    </main>
  );
}
