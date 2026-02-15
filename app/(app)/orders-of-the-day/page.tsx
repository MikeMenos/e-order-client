"use client";

import { useMemo } from "react";
import { useSuppliersListForToday } from "@/hooks/useDashboardData";
import { SuppliersSection } from "@/components/dashboard/SuppliersSection";
import { OrdersOfTheDayTabs, type OrdersOfTheDayTabId } from "@/components/dashboard/OrdersOfTheDayTabs";
import { useActiveTabsStore, activeTabKeys } from "@/stores/activeTabs";

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

  const { all, pending, drafts } = useMemo(() => {
    const allList = suppliersInPrefDaySchedule;
    const pendingList = allList.filter(
      (s: { basketIconStatus?: number | null }) => s.basketIconStatus === 2,
    );
    const draftsList = allList.filter(
      (s: { basketIconStatus?: number | null }) => s.basketIconStatus === 0,
    );
    return { all: allList, pending: pendingList, drafts: draftsList };
  }, [suppliersInPrefDaySchedule]);

  const key = activeTabKeys.ordersOfTheDay;
  const storedTab = useActiveTabsStore((s) => s.tabs[key]) as
    | OrdersOfTheDayTabId
    | undefined;
  const activeTab: OrdersOfTheDayTabId =
    storedTab === "pending" || storedTab === "drafts" ? storedTab : "all";
  const setActiveTab = useActiveTabsStore((s) => s.setActiveTab);
  const handleTabChange = (value: OrdersOfTheDayTabId) =>
    setActiveTab(key, value);

  const suppliersByTab = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return pending;
      case "drafts":
        return drafts;
      default:
        return all;
    }
  }, [activeTab, all, pending, drafts]);

  return (
    <main className="text-slate-900 px-3">
      <SuppliersSection
        refDate={refDate}
        suppliers={suppliersByTab}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
      >
        <OrdersOfTheDayTabs
          value={activeTab}
          onValueChange={handleTabChange}
          pendingCount={pending.length}
          draftsCount={drafts.length}
        />
      </SuppliersSection>
    </main>
  );
}
