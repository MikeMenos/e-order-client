"use client";

import { useMemo } from "react";
import { useSuppliersListForToday } from "@/hooks/useDashboardData";
import { SuppliersSection } from "@/components/dashboard/SuppliersSection";

export default function OrdersOfTheDayPage() {
  const { refDate, suppliers, isLoading, isError, errorMessage } =
    useSuppliersListForToday();

  const suppliersInPrefDaySchedule = useMemo(
    () =>
      suppliers.filter(
        (s: { isInPrefDaySchedule?: boolean }) =>
          s.isInPrefDaySchedule === true,
      ),
    [suppliers],
  );

  return (
    <main className="text-slate-900">
      <SuppliersSection
        refDate={refDate}
        suppliers={suppliersInPrefDaySchedule}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
      />
    </main>
  );
}
