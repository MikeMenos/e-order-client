"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSuppliersNoPartners } from "@/hooks/useDashboardData";
import { SuppliersSection } from "@/components/dashboard/SuppliersSection";
import type { SuppliersListItem } from "@/lib/types/dashboard";

export default function PartnerSuppliersPage() {
  const router = useRouter();

  const { suppliers, isLoading, isError, errorMessage } =
    useSuppliersNoPartners();

  // const handleSupplierClick = React.useCallback(
  //   (s: SuppliersListItem) => {
  //     router.push(
  //       `/settings/manage-suppliers/${encodeURIComponent(s.supplierUID)}`,
  //     );
  //   },
  //   [router],
  // );

  return (
    <main className="text-slate-900 px-3">
      <SuppliersSection
        suppliers={suppliers}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        // onSupplierClick={handleSupplierClick}
      />
    </main>
  );
}
