"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";
import { useSuppliersNoPartners } from "@/hooks/useDashboardData";
import { usePrefCollaborationUpdate } from "@/hooks/usePrefCollaborationUpdate";
import { SuppliersSection } from "@/components/dashboard/SuppliersSection";
import { getApiErrorMessage } from "@/lib/api-error";
import { useTranslation } from "@/lib/i18n";

export default function PartnerSuppliersPage() {
  const { t } = useTranslation();
  const { suppliers, isLoading, isError, errorMessage } =
    useSuppliersNoPartners();

  const updateMutation = usePrefCollaborationUpdate({
    onError: (err) =>
      toast.error(getApiErrorMessage(err, t("suppliers_error"))),
  });

  const handleSupplierClick = useCallback(() => {}, []);

  const handlePartnerApprovalToggle = useCallback(
    (supplier: { supplierUID: string }, isApproved: boolean) => {
      updateMutation.mutate({
        supplierUID: supplier.supplierUID,
        isApproved,
      });
    },
    [updateMutation],
  );

  return (
    <main className="text-slate-900 px-3">
      <SuppliersSection
        suppliers={suppliers}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onSupplierClick={handleSupplierClick}
        onPartnerApprovalToggle={handlePartnerApprovalToggle}
        isPartnerApprovalPending={updateMutation.isPending}
      />
    </main>
  );
}
