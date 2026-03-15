"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import Image from "next/image";
import { INFORMATION_ITEMS } from "@/lib/information-content";

const iconMap = {
  "what-is-eorder": () => (
    <Image src="/icon0.svg" alt="" width={32} height={32} aria-hidden />
  ),
  "how-it-works": "⚙️",
  "how-to-become-member": "👤",
  "useful-instructions": "📋",
  advantages: "⭐",
  contact: "💬",
  "terms-of-use": "📄",
  "privacy-policy": "📄",
} as const;

export default function InformationPage() {
  const { t } = useTranslation();

  return (
    <main className="text-slate-900 overflow-hidden px-2">
      <div className="mx-auto flex max-w-xl flex-col p-4 justify-center">
        <h1 className="mb-4 text-2xl font-bold">{t("settings_information")}</h1>

        <div className="rounded-2xl bg-white shadow-sm overflow-hidden border border-slate-100">
          {INFORMATION_ITEMS.map(({ slug, labelKey }) => (
            <Link
              key={slug}
              href={`/settings/information/${slug}`}
              className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center text-xl">
                {slug === "what-is-eorder" ? (
                  <Image src="/icon0.svg" alt="" width={32} height={32} />
                ) : (
                  ((iconMap as unknown as Record<string, string>)[slug] ?? "📄")
                )}
              </span>
              <span className="flex-1 font-medium text-slate-900">
                {t(labelKey)}
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
