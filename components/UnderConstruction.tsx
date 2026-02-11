"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Construction } from "lucide-react";

export function UnderConstruction() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-[60dvh] flex-col items-center justify-center px-6 py-12 text-slate-900">
      <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-slate-200/80 bg-app-card p-8 shadow-lg">
        <div className="relative mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo.png"
            alt="E-Order"
            className="h-20 w-20 rounded-xl object-contain"
          />
          <div className="absolute -bottom-1 -right-8 rounded-full bg-amber-100 p-1.5">
            <Construction className="h-5 w-5 text-amber-600" aria-hidden />
          </div>
        </div>
        <h1 className="text-center text-xl font-semibold text-slate-900">
          {t("under_construction_title")}
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
          {t("under_construction_message")}
        </p>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "mt-6 w-full",
          )}
        >
          {t("under_construction_back")}
        </Link>
      </div>
    </main>
  );
}
