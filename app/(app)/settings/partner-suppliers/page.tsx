"use client";

import { useCallback } from "react";
import { useSuppliersNoPartners } from "@/hooks/useDashboardData";
import { SuppliersSection } from "@/components/dashboard/SuppliersSection";

export default function PartnerSuppliersPage() {
  const { suppliers, isLoading, isError, errorMessage } =
    useSuppliersNoPartners();

  const handleSupplierClick = useCallback(() => {}, []);

  return (
    <main className="text-slate-900 px-3">
      <SuppliersSection
        suppliers={suppliers}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onSupplierClick={handleSupplierClick}
      />
    </main>
  );
}
