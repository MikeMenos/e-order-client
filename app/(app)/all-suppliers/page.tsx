"use client";

import { useSuppliersListForToday } from "@/hooks/useDashboardData";
import { SuppliersSection } from "@/components/dashboard/SuppliersSection";

export default function AllSuppliersPage() {
  const { refDate, suppliers, isLoading, isError, errorMessage } =
    useSuppliersListForToday();

  return (
    <main className="text-slate-900p px-2">
      <SuppliersSection
        refDate={refDate}
        suppliers={suppliers}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
      />
    </main>
  );
}
