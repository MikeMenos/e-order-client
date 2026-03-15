"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import {
  getInformationContent,
  isValidInformationSlug,
  INFORMATION_ITEMS,
} from "@/lib/information-content";

export default function InformationDetailPage() {
  const params = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const slug = params.slug ?? "";

  if (!isValidInformationSlug(slug)) {
    return (
      <main className="text-slate-900 px-2 min-h-screen">
        <div className="mx-auto max-w-xl p-4">
          <p className="mb-4">{t("aria_back")}</p>
          <Link
            href="/settings/information"
            className="text-brand-600 hover:underline"
          >
            ← {t("settings_information")}
          </Link>
        </div>
      </main>
    );
  }

  const content = getInformationContent(slug);
  const item = INFORMATION_ITEMS.find((i) => i.slug === slug);
  const title = item ? t(item.labelKey) : slug;

  return (
    <main className="text-slate-900 px-2 min-h-screen pb-8">
      <div className="mx-auto max-w-xl p-4">
        <h1 className="text-xl font-bold mb-4 text-center">{title}</h1>

        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
            {content ?? ""}
          </div>
        </div>
      </div>
    </main>
  );
}
