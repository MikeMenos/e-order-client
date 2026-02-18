"use client";

import { useMemo, useState } from "react";
import { isSameDay, format } from "date-fns";
import { useSuppliersListForToday } from "@/hooks/useDashboardData";
import { SuppliersSection } from "@/components/dashboard/SuppliersSection";
import {
  OrdersOfTheDayTabs,
  type OrdersOfTheDayTabId,
} from "@/components/dashboard/OrdersOfTheDayTabs";
import { useActiveTabsStore, activeTabKeys } from "@/stores/activeTabs";

export default function OrdersOfTheDayPage() {
  const [calendarRefDate, setCalendarRefDate] = useState<string | null>(null);

  const { suppliers, dayNameShort, isLoading, isError, errorMessage } =
    useSuppliersListForToday(calendarRefDate ?? undefined);

  const suppliersInPrefDaySchedule = useMemo(
    () =>
      suppliers.filter(
        (s: { isInPrefDaySchedule?: boolean }) =>
          s.isInPrefDaySchedule === true,
      ),
    [suppliers],
  );

  const { all, pending, drafts, completed } = useMemo(() => {
    const allList = suppliersInPrefDaySchedule;
    const pendingList = allList.filter(
      (s: { basketIconStatus?: number | null }) => s.basketIconStatus === 3,
    );
    const draftsList = allList.filter(
      (s: { basketIconStatus?: number | null }) => s.basketIconStatus === 2,
    );
    const completedList = allList.filter(
      (s: { basketIconStatus?: number | null }) => s.basketIconStatus === 200,
    );
    return {
      all: allList,
      pending: pendingList,
      drafts: draftsList,
      completed: completedList,
    };
  }, [suppliersInPrefDaySchedule]);

  const key = activeTabKeys.ordersOfTheDay;
  const storedTab = useActiveTabsStore((s) => s.tabs[key]) as
    | OrdersOfTheDayTabId
    | undefined;
  const activeTab: OrdersOfTheDayTabId =
    storedTab === "pending" ||
    storedTab === "drafts" ||
    storedTab === "completed"
      ? storedTab
      : "all";
  const setActiveTab = useActiveTabsStore((s) => s.setActiveTab);
  const handleTabChange = (value: OrdersOfTheDayTabId) =>
    setActiveTab(key, value);

  const suppliersByTab = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return pending;
      case "drafts":
        return drafts;
      case "completed":
        return completed;
      default:
        return all;
    }
  }, [activeTab, all, pending, drafts, completed]);

  const suppliersToShow =
    calendarRefDate != null ? suppliersInPrefDaySchedule : suppliersByTab;

  return (
    <main className="text-slate-900 px-3">
      <SuppliersSection
        suppliers={suppliersToShow}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        displayAsDraft={activeTab === "drafts"}
        showCalendarButton={true}
        onRefDateSelect={(date) => {
          if (isSameDay(date, new Date())) {
            setCalendarRefDate(null);
            return;
          }
          // Use noon UTC so the calendar day is preserved (avoid timezone shifting to previous day)
          setCalendarRefDate(`${format(date, "yyyy-MM-dd")}T12:00:00.000Z`);
        }}
        calendarDateView={calendarRefDate != null}
        selectedRefDate={calendarRefDate}
        calendarDayNameShort={calendarRefDate != null ? dayNameShort : null}
        onShowTodayClick={
          calendarRefDate != null ? () => setCalendarRefDate(null) : undefined
        }
      >
        {calendarRefDate == null && (
          <OrdersOfTheDayTabs
            value={activeTab}
            onValueChange={handleTabChange}
            pendingCount={pending.length}
            draftsCount={drafts.length}
            completedCount={completed.length}
          />
        )}
      </SuppliersSection>
    </main>
  );
}
