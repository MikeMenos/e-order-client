"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isSameDay, format } from "date-fns";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatCalendarDateDisplay } from "@/lib/utils";
import { el } from "date-fns/locale";
import { useSuppliersListForToday } from "@/hooks/useDashboardData";
import { useSupplierTempHideFromList } from "@/hooks/useSupplierTempHideFromList";
import { useBasketDelete } from "@/hooks/useBasket";
import { getApiErrorMessage } from "@/lib/api-error";
import { useTranslation } from "@/lib/i18n";
import { SuppliersSection } from "@/components/dashboard/SuppliersSection";
import { DeleteBasketConfirmDialog } from "@/components/checkout/DeleteBasketConfirmDialog";
import { HideFromPendingConfirmDialog } from "@/components/dashboard/HideFromPendingConfirmDialog";
import {
  OrdersOfTheDayTabs,
  type OrdersOfTheDayTabId,
} from "@/components/dashboard/OrdersOfTheDayTabs";
import { useActiveTabsStore, activeTabKeys } from "@/stores/activeTabs";
import type { SuppliersListItem } from "@/lib/types/dashboard";
import { isPendingVisible } from "@/lib/dashboard";

export default function OrdersOfTheDayPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  /** Calendar day (yyyy-MM-dd) kept in the URL so back from supplier restores this view. */
  const calendarRefDate = useMemo(() => {
    const raw = searchParams.get("refDate");
    if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
    return `${raw}T12:00:00.000Z`;
  }, [searchParams]);

  const setCalendarRefDate = useCallback(
    (isoOrNull: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (isoOrNull == null) {
        params.delete("refDate");
      } else {
        const day = isoOrNull.trim().slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
          params.set("refDate", day);
        }
      }
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );
  const [deleteConfirmSupplier, setDeleteConfirmSupplier] =
    useState<SuppliersListItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hideConfirmSupplier, setHideConfirmSupplier] =
    useState<SuppliersListItem | null>(null);
  const [hideDialogOpen, setHideDialogOpen] = useState(false);
  const [showInPendingSupplierUID, setShowInPendingSupplierUID] = useState<
    string | null
  >(null);

  const { suppliers, isLoading, isError, errorMessage } =
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
    const pendingList = allList.filter(isPendingVisible);
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

  const hideFromListMutation = useSupplierTempHideFromList({
    onSuccess: (data) => {
      setHideDialogOpen(false);
      setHideConfirmSupplier(null);
      toast.success(data?.message?.trim() || t("orders_of_day_hide_success"));
    },
    onError: (err) => {
      setHideDialogOpen(false);
      setHideConfirmSupplier(null);
      toast.error(getApiErrorMessage(err, t("suppliers_error")));
    },
  });

  const showInPendingMutation = useSupplierTempHideFromList({
    onSuccess: (data) =>
      toast.success(
        data?.message?.trim() || t("orders_of_day_show_in_pending_success"),
      ),
    onError: (err) =>
      toast.error(getApiErrorMessage(err, t("suppliers_error"))),
  });

  useEffect(() => {
    if (!showInPendingMutation.isPending) {
      setShowInPendingSupplierUID(null);
    }
  }, [showInPendingMutation.isPending]);

  const basketDeleteMutation = useBasketDelete({
    onSuccess: (data) => {
      setDeleteDialogOpen(false);
      setDeleteConfirmSupplier(null);
      toast.success(data?.message?.trim() || t("checkout_delete_basket"));
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("suppliers_error")));
      setDeleteDialogOpen(false);
      setDeleteConfirmSupplier(null);
    },
  });

  const handleDeleteBasketConfirm = useCallback(() => {
    if (deleteConfirmSupplier) {
      basketDeleteMutation.mutate({
        supplierUID: deleteConfirmSupplier.supplierUID,
      });
    }
  }, [deleteConfirmSupplier, basketDeleteMutation]);

  const handleHideConfirm = useCallback(() => {
    if (hideConfirmSupplier) {
      hideFromListMutation.mutate({
        supplierUID: hideConfirmSupplier.supplierUID,
        refDate: null,
        hideFromList: true,
      });
    }
  }, [hideConfirmSupplier, hideFromListMutation]);

  return (
    <main className="text-slate-900 px-2">
      <SuppliersSection
        suppliers={suppliersToShow}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        displayAsDraft={activeTab === "drafts"}
        showCalendarButton={true}
        hideFromListAction={
          activeTab === "pending" && calendarRefDate == null
            ? {
                onHide: (s) => {
                  setHideConfirmSupplier(s);
                  setHideDialogOpen(true);
                },
                isPending: hideFromListMutation.isPending,
                refDate: null,
              }
            : undefined
        }
        hidePendingSupplierUID={
          hideFromListMutation.isPending ? hideConfirmSupplier?.supplierUID : undefined
        }
        emptyBasketAction={
          activeTab === "drafts" && calendarRefDate == null
            ? {
                onEmptyBasket: (s) => {
                  setDeleteConfirmSupplier(s);
                  setDeleteDialogOpen(true);
                },
                isPending: basketDeleteMutation.isPending,
              }
            : undefined
        }
        emptyBasketPendingSupplierUID={
          basketDeleteMutation.isPending ? deleteConfirmSupplier?.supplierUID : undefined
        }
        showInPendingAction={
          activeTab === "all" && calendarRefDate == null
            ? {
                onShowInPending: (s) => {
                  setShowInPendingSupplierUID(s.supplierUID);
                  showInPendingMutation.mutate({
                    supplierUID: s.supplierUID,
                    refDate: null,
                    hideFromList: false,
                  });
                },
                isPending: showInPendingMutation.isPending,
                refDate: null,
              }
            : undefined
        }
        showInPendingSupplierUID={
          showInPendingMutation.isPending ? showInPendingSupplierUID ?? undefined : undefined
        }
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
        calendarDayNameShort={
          calendarRefDate != null
            ? formatCalendarDateDisplay(
                calendarRefDate,
                i18n.language === "gr" ? el : undefined,
              )
            : null
        }
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

      <DeleteBasketConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteBasketConfirm}
        isDeleting={basketDeleteMutation.isPending}
      />

      <HideFromPendingConfirmDialog
        open={hideDialogOpen}
        onOpenChange={setHideDialogOpen}
        onConfirm={handleHideConfirm}
        isHiding={hideFromListMutation.isPending}
      />
    </main>
  );
}
