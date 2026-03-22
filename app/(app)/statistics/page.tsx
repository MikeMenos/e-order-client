"use client";

import { useTranslation } from "@/lib/i18n";
import { StatisticsPageContent } from "@/components/statistics/StatisticsPageContent";

export default function StatisticsPage() {
  const { t } = useTranslation();

  return (
    <main className="px-1 sm:px-3 py-6 max-w-6xl mx-auto w-full">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
        {t("dashboard_card_statistics")}
      </h1>
      <StatisticsPageContent />
    </main>
  );
}
