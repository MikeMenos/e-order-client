"use client";

import Loading from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { getApiErrorMessage } from "@/lib/api-error";
import { useTranslation } from "@/lib/i18n";
import { useStoreStatistics } from "@/hooks/useStoreStatistics";
import { StatisticsCharts } from "./StatisticsCharts";

export function StatisticsPageContent() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error } = useStoreStatistics();

  if (isLoading) {
    return <Loading spinnerOnly />;
  }

  if (isError) {
    return (
      <ErrorMessage>{getApiErrorMessage(error, t("stats_error"))}</ErrorMessage>
    );
  }

  return (
    <div className="w-full min-w-0">
      <StatisticsCharts stats={data ?? null} chartId="store" t={t} />
    </div>
  );
}
