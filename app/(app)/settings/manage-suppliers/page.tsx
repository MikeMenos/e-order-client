"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSuppliersManageSuppliers } from "@/hooks/useDashboardData";
import { useBasketDelete } from "@/hooks/useBasket";
import { usePrefCollaborationUpdate } from "@/hooks/usePrefCollaborationUpdate";
import { SuppliersSection } from "@/components/dashboard/SuppliersSection";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/lib/api-error";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { SuppliersListItem } from "@/lib/types/dashboard";

export type ManageSuppliersTabId = "active" | "inactive";

const tabTriggerClass = cn(
  "group rounded-lg px-4 py-2 text-base font-medium bg-brand-200 text-slate-700 cursor-pointer",
  "data-[state=active]:!bg-brand-500 data-[state=active]:!text-white data-[state=active]:shadow-none",
);

export default function ManageSuppliersPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ManageSuppliersTabId>("active");

  const { suppliers, isLoading, isError, errorMessage } =
    useSuppliersManageSuppliers(activeTab);

  const updateMutation = usePrefCollaborationUpdate({
    onError: (err) =>
      toast.error(getApiErrorMessage(err, t("suppliers_error"))),
  });

  const handleSupplierClick = useCallback(
    (s: SuppliersListItem) => {
      router.push(
        `/settings/manage-suppliers/${encodeURIComponent(s.supplierUID)}`,
      );
    },
    [router],
  );

  const basketDeleteMutation = useBasketDelete({
    onError: (err) =>
      toast.error(getApiErrorMessage(err, t("suppliers_error"))),
  });

  const handleInactiveApprovalToggle = useCallback(
    async (supplier: SuppliersListItem, isApproved: boolean) => {
      const hasBasket =
        supplier.basketIconStatus === 2 ||
        (supplier.counterOpenBaskets ?? 0) > 0;
      if (hasBasket) {
        await basketDeleteMutation.mutateAsync({
          supplierUID: supplier.supplierUID,
          silent: true,
        });
      }
      updateMutation.mutate({
        supplierUID: supplier.supplierUID,
        isApproved,
      });
    },
    [updateMutation, basketDeleteMutation, t],
  );

  const noop = useCallback(() => {}, []);

  return (
    <main className="text-slate-900 px-2">
      <SuppliersSection
        suppliers={suppliers}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onSupplierClick={activeTab === "inactive" ? noop : handleSupplierClick}
        onInactiveApprovalToggle={
          activeTab === "inactive" ? handleInactiveApprovalToggle : undefined
        }
        isInactiveApprovalPending={
          activeTab === "inactive"
            ? updateMutation.isPending || basketDeleteMutation.isPending
            : false
        }
      >
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ManageSuppliersTabId)}
        >
          <div>
            <TabsList
              variant="line"
              className="inline-flex w-max min-w-full flex-nowrap justify-start rounded-lg bg-white p-0"
            >
              <TabsTrigger value="active" className={tabTriggerClass}>
                {t("manage_suppliers_tab_active")}
              </TabsTrigger>
              <TabsTrigger value="inactive" className={tabTriggerClass}>
                {t("manage_suppliers_tab_inactive")}
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </SuppliersSection>
    </main>
  );
}
