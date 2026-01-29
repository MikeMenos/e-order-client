"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { useTranslation } from "../lib/i18n";

const LOADING_DURATION_MS = 1800;

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), LOADING_DURATION_MS);
    return () => clearTimeout(id);
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#F96C2B22,transparent_50%),linear-gradient(to_bottom,#020617,#0f172a)]" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo-white.png"
            alt="E-Order"
            className="h-48 w-h-48 rounded-2xl object-contain drop-shadow-2xl animate-logo-breathe"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-start justify-center overflow-hidden bg-slate-900 text-slate-50 px-4 pt-32 animate-in fade-in duration-500">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#F96C2B33,transparent_60%),linear-gradient(to_bottom,#020617,#0f172a)]" />

      <div className="min-h-80 pointer-events-auto z-10 w-full max-w-md rounded-3xl bg-white/95 p-6 text-slate-900 shadow-2xl grid items-center">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* If you add logo.png under public/, this will render it */}
            <img
              src="/assets/logo.png"
              alt="E-Order"
              className="h-14 w-14 rounded-lg object-contain"
            />
            <div className="space-y-0.5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                E-ORDER
              </p>
              <h1 className="text-lg font-semibold">
                {t("home_welcome_title")}
              </h1>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              i18n.changeLanguage(i18n.language === "en" ? "gr" : "en")
            }
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm"
          >
            <span>{i18n.language === "gr" ? "GR" : "EN"}</span>
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/login" passHref>
            <Button className="w-full">{t("login_with_email")}</Button>
          </Link>

          <Link href="/signup" passHref>
            <Button variant="outline" className="w-full">
              {t("signup_with_email")}
            </Button>
          </Link>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          {t("home_welcome_body")}
        </p>
      </div>
    </main>
  );
}
