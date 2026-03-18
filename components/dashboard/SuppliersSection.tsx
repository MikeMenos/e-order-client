import { useMemo, useState } from "react";
import { useAllSuppliersFilterStore } from "@/stores/allSuppliersFilter";
import { motion } from "framer-motion";
import {
  SwipeableList,
  SwipeableListItem,
  TrailingActions,
  SwipeAction,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  Eye,
  RotateCcw,
  ShoppingCart,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { isHiddenFromPending } from "@/lib/dashboard";
import { OrdersOfDaySwipeContent } from "./OrdersOfDaySwipeContent";
import { useTranslation } from "../../lib/i18n";
import { listVariants, listItemVariants } from "../../lib/motion";
import { Button } from "../ui/button";
import Loading from "../ui/loading";
import { Spinner } from "../ui/spinner";
import { SuppliersSearchBar } from "./SuppliersSearchBar";
import { SupplierTile } from "./SupplierTile";
import { usePathname } from "next/navigation";
import { cn, toDateOnly } from "@/lib/utils";
import { SuppliersListItem } from "@/lib/types/dashboard";
import { useAppHeaderHeight } from "@/app/(app)/AppHeaderContext";
import { RefDateCalendarDialog } from "./RefDateCalendarDialog";
import { Switch } from "../ui/switch";

type Props = {
  suppliers: SuppliersListItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  /** When provided, each tile is a button and this is called instead of linking (e.g. manage-suppliers). */
  onSupplierClick?: (supplier: SuppliersListItem) => void;
  /** Rendered between the search bar and the list (e.g. orders-of-the-day tabs). */
  children?: React.ReactNode;
  /** When true (e.g. on Πρόχειρες tab), all tiles show draft style and text. */
  displayAsDraft?: boolean;
  /** When true, show a calendar button that opens a date picker; on select, onRefDateSelect is called. */
  showCalendarButton?: boolean;
  /** Called when user selects a date in the calendar (orders-of-the-day). */
  onRefDateSelect?: (date: Date) => void;
  /** When true, list uses all-suppliers style (grid, no delivery/basket) and children (tabs) are hidden. */
  calendarDateView?: boolean;
  /** Currently selected date (ISO string). Passed to the calendar dialog so it shows as selected when reopened. */
  selectedRefDate?: string | null;
  /** Day name from API (e.g. "Mon") when in calendar date view; shown centered above the list. */
  calendarDayNameShort?: string | null;
  /** When in calendar date view, called when user clicks "Today's orders" to show today's list. */
  onShowTodayClick?: () => void;
  /** For manage-suppliers inactive tab: send isApproved when Restore clicked. */
  onInactiveApprovalToggle?: (
    supplier: SuppliersListItem,
    isApproved: boolean,
  ) => void | Promise<void>;
  /** For manage-suppliers inactive tab: true when approval mutation is in progress. */
  isInactiveApprovalPending?: boolean;
  /** For orders-of-the-day Pending tab: hide supplier from list. RefDate ISO string for API. */
  hideFromListAction?: {
    onHide: (supplier: SuppliersListItem) => void;
    isPending?: boolean;
    refDate: null;
  };
  /** For orders-of-the-day Drafts tab: empty basket (same as checkout Άδειασμα καλαθιού). Red swipe area. */
  emptyBasketAction?: {
    onEmptyBasket: (supplier: SuppliersListItem) => void;
    isPending?: boolean;
  };
  /** For orders-of-the-day All tab: show in Pending (opposite of hide). Only for basketIconStatus===3 && showInList===false. Green swipe area. */
  showInPendingAction?: {
    onShowInPending: (supplier: SuppliersListItem) => void;
    isPending?: boolean;
    refDate: null;
  };
  /** Supplier UID being hidden (Pending tab) - show overlay + loader on that card. */
  hidePendingSupplierUID?: string;
  /** Supplier UID being emptied (Drafts tab) - show overlay + loader on that card. */
  emptyBasketPendingSupplierUID?: string;
  /** Supplier UID being moved to Pending (All tab) - show overlay + loader on that card. */
  showInPendingSupplierUID?: string;
};

export function SuppliersSection({
  suppliers,
  isLoading,
  isError,
  errorMessage,
  onSupplierClick,
  children,
  displayAsDraft = false,
  showCalendarButton = false,
  onRefDateSelect,
  calendarDateView = false,
  selectedRefDate = null,
  calendarDayNameShort = null,
  onShowTodayClick,
  onInactiveApprovalToggle,
  isInactiveApprovalPending = false,
  hideFromListAction,
  emptyBasketAction,
  showInPendingAction,
  hidePendingSupplierUID,
  emptyBasketPendingSupplierUID,
  showInPendingSupplierUID,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const onlyWithBasket = useAllSuppliersFilterStore((s) => s.onlyWithBasket);
  const setOnlyWithBasket = useAllSuppliersFilterStore(
    (s) => s.setOnlyWithBasket,
  );
  const { t } = useTranslation();
  const pathname = usePathname();
  const headerHeight = useAppHeaderHeight();
  const sectionBackgroundClass =
    pathname === "/settings/manage-suppliers"
      ? "app-bg-image"
      : pathname === "/orders-of-the-day" || pathname === "/all-suppliers"
        ? "bg-brand-100"
        : "bg-white";

  const useAllSuppliersStyle =
    calendarDateView ||
    pathname === "/all-suppliers" ||
    pathname === "/settings/manage-suppliers";
  const showTabs =
    (pathname === "/orders-of-the-day" && !calendarDateView) ||
    pathname === "/settings/manage-suppliers";

  const filteredSuppliers = useMemo(() => {
    let data = [...suppliers];

    if (pathname === "/all-suppliers" && onlyWithBasket) {
      data = data.filter(
        (s: { basketIconStatus?: number | null }) => s.basketIconStatus === 2,
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.subTitle?.toLowerCase().includes(q) ||
          s.companyName?.toLowerCase().includes(q) ||
          s.companyVatNumb?.toLowerCase().includes(q),
      );
    }

    // Alphabetical by title on all-suppliers, manage-suppliers, and calendar date view
    if (
      pathname === "/all-suppliers" ||
      pathname === "/settings/manage-suppliers" ||
      calendarDateView
    ) {
      data.sort((a, b) => {
        const na = (a.title ?? "").toLowerCase();
        const nb = (b.title ?? "").toLowerCase();
        const cmp = na.localeCompare(nb);
        return isAscending ? cmp : -cmp;
      });
    }

    // Sort by nextAvailDeliveryText on orders-of-the-day (tabs view only)
    if (pathname === "/orders-of-the-day" && !calendarDateView) {
      data.sort((a, b) => {
        const na = (a.nextAvailDeliveryText ?? "").toLowerCase();
        const nb = (b.nextAvailDeliveryText ?? "").toLowerCase();
        const cmp = na.localeCompare(nb);
        return isAscending ? cmp : -cmp;
      });
    }

    return data;
  }, [
    suppliers,
    searchQuery,
    isAscending,
    pathname,
    calendarDateView,
    onlyWithBasket,
  ]);

  return (
    <section>
      <div
        className={cn(
          "sticky z-20 -mx-3 w-[calc(100%+1.5rem)] flex shrink-0 flex-col mb-0",
          sectionBackgroundClass,
        )}
        style={{ top: headerHeight }}
      >
        <div className="flex h-9 items-center gap-1 my-2 px-3">
          <SuppliersSearchBar value={searchQuery} onChange={setSearchQuery} />
          {pathname === "/all-suppliers" && (
            <div
              className="relative flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-brand-50 px-2"
              title={
                onlyWithBasket
                  ? t("suppliers_filter_with_basket")
                  : t("suppliers_filter_all_suppliers")
              }
            >
              <ShoppingBag
                className={`h-4 w-4 shrink-0 transition-opacity ${
                  !onlyWithBasket ? "text-slate-700" : "opacity-40"
                }`}
                aria-hidden
              />
              <Switch
                checked={onlyWithBasket}
                onCheckedChange={setOnlyWithBasket}
                aria-label={
                  onlyWithBasket
                    ? t("suppliers_filter_with_basket")
                    : t("suppliers_filter_all_suppliers")
                }
              />
              <ShoppingCart
                className={`h-4 w-4 shrink-0 transition-opacity ${
                  onlyWithBasket ? "text-slate-700" : "opacity-40"
                }`}
                aria-hidden
              />
            </div>
          )}
          {showCalendarButton && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 border-slate-300 text-slate-700"
              aria-label={t("suppliers_select_date") ?? "Select date"}
              onClick={() => setCalendarOpen(true)}
            >
              <CalendarIcon className="h-7 w-7" />
            </Button>
          )}
          {(pathname === "/all-suppliers" ||
            pathname === "/settings/manage-suppliers" ||
            calendarDateView) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 gap-1 border-slate-300  bg-brand-50 text-slate-700"
              aria-label={
                isAscending
                  ? t("suppliers_sort_alpha_asc")
                  : t("suppliers_sort_alpha_desc")
              }
              onClick={() => setIsAscending((v) => !v)}
            >
              {isAscending ? "A → Z" : "Z → A"}
            </Button>
          )}
        </div>
        {showTabs && children}
      </div>

      {isLoading && <Loading spinnerOnly />}
      {isError && (
        <p className="text-base text-red-400">
          {errorMessage ?? t("suppliers_error")}
        </p>
      )}

      {filteredSuppliers.length === 0 && !isLoading ? (
        <p className="text-base text-slate-400 bg-white backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
          {t("suppliers_empty")}
        </p>
      ) : (
        <>
          <RefDateCalendarDialog
            open={calendarOpen}
            onOpenChange={setCalendarOpen}
            selectedDate={
              selectedRefDate ? new Date(selectedRefDate) : undefined
            }
            onSelect={(date) => onRefDateSelect?.(date)}
          />
          {calendarDateView && calendarDayNameShort && !isLoading && (
            <div className="flex items-center gap-2 my-1 justify-between">
              <p className="text-center text-lg text-brand-500 font-medium">
                {calendarDayNameShort}
              </p>
              {onShowTodayClick && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={onShowTodayClick}
                >
                  {t("orders_today_button")}{" "}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          )}
          {hideFromListAction || emptyBasketAction || showInPendingAction ? (
            <SwipeableList
              threshold={0.25}
              className={cn(
                "w-full",
                useAllSuppliersStyle
                  ? "grid grid-cols-2 gap-3 pb-8 pt-1"
                  : "space-y-2 pb-8 pt-1",
              )}
              fullSwipe={false}
            >
              {filteredSuppliers.map((s) => {
                const hiddenFromPending = isHiddenFromPending(s);
                const trailingActions = () => (
                  <TrailingActions>
                    {hideFromListAction ? (
                      <SwipeAction onClick={() => hideFromListAction.onHide(s)}>
                        <OrdersOfDaySwipeContent
                          variant="hide"
                          labelKey="orders_of_day_hide_from_list"
                        />
                      </SwipeAction>
                    ) : emptyBasketAction ? (
                      <SwipeAction
                        onClick={() => emptyBasketAction.onEmptyBasket(s)}
                      >
                        <OrdersOfDaySwipeContent
                          variant="emptyBasket"
                          labelKey="checkout_delete_basket"
                          icon={Trash2}
                        />
                      </SwipeAction>
                    ) : showInPendingAction && hiddenFromPending ? (
                      <SwipeAction
                        onClick={() => showInPendingAction.onShowInPending(s)}
                      >
                        <OrdersOfDaySwipeContent
                          variant="showInPending"
                          labelKey="orders_of_day_show_in_pending"
                          icon={Eye}
                        />
                      </SwipeAction>
                    ) : null}
                  </TrailingActions>
                );
                const isPending =
                  hidePendingSupplierUID === s.supplierUID ||
                  emptyBasketPendingSupplierUID === s.supplierUID ||
                  showInPendingSupplierUID === s.supplierUID;
                return (
                  <SwipeableListItem
                    key={s.supplierUID}
                    trailingActions={trailingActions()}
                    blockSwipe={
                      showInPendingAction ? !hiddenFromPending : undefined
                    }
                  >
                    <div className={cn("relative", isPending && "opacity-60")}>
                      {isPending && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70">
                          <Spinner size={32} />
                        </div>
                      )}
                      <SupplierTile
                        supplier={s}
                        showDeliveryInfo={!useAllSuppliersStyle}
                        showBasketStatus={!useAllSuppliersStyle}
                        displayAsDraft={displayAsDraft}
                        calendarDateView={calendarDateView}
                        tileStyle="default"
                        titleHref={
                          pathname === "/orders-of-the-day" && !calendarDateView
                            ? `/settings/manage-suppliers/${encodeURIComponent(s.supplierUID)}`
                            : undefined
                        }
                        href={
                          onSupplierClick
                            ? undefined
                            : (() => {
                                if (pathname === "/orders-of-the-day") {
                                  if (
                                    !calendarDateView &&
                                    s.basketIconStatus === 200 &&
                                    s.todaysOrderUID
                                  ) {
                                    return `/orders-of-the-day/order/${encodeURIComponent(s.todaysOrderUID)}`;
                                  }
                                  const base = `/suppliers/${encodeURIComponent(s.supplierUID)}?from=orders-of-the-day`;
                                  const refDateOnly =
                                    calendarDateView && selectedRefDate
                                      ? toDateOnly(selectedRefDate)
                                      : null;
                                  return refDateOnly
                                    ? `${base}&refDate=${encodeURIComponent(refDateOnly)}`
                                    : base;
                                }
                                return `/suppliers/${encodeURIComponent(s.supplierUID)}`;
                              })()
                        }
                        onClick={
                          onSupplierClick ? () => onSupplierClick(s) : undefined
                        }
                        hideFromListAction={
                          hideFromListAction
                            ? {
                                onHide: () => hideFromListAction.onHide(s),
                                isPending: hideFromListAction.isPending,
                              }
                            : undefined
                        }
                        emptyBasketAction={
                          emptyBasketAction
                            ? {
                                onEmptyBasket: () =>
                                  emptyBasketAction.onEmptyBasket(s),
                                isPending: emptyBasketAction.isPending,
                              }
                            : undefined
                        }
                        showInPendingAction={
                          showInPendingAction && hiddenFromPending
                            ? {
                                onShowInPending: () =>
                                  showInPendingAction.onShowInPending(s),
                                isPending: showInPendingAction.isPending,
                              }
                            : undefined
                        }
                        isHiddenFromPending={
                          showInPendingAction ? hiddenFromPending : undefined
                        }
                        partnerApprovalAction={
                          pathname === "/settings/manage-suppliers" &&
                          onInactiveApprovalToggle
                            ? {
                                onAction: () =>
                                  onInactiveApprovalToggle(s, true),
                                isPending: isInactiveApprovalPending,
                                labelKey: "manage_suppliers_restore",
                                icon: RotateCcw,
                              }
                            : undefined
                        }
                      />
                    </div>
                  </SwipeableListItem>
                );
              })}
            </SwipeableList>
          ) : (
            <motion.div
              className={cn(
                "w-full",
                useAllSuppliersStyle
                  ? "grid grid-cols-2 gap-3 pb-8 pt-1"
                  : "space-y-2 pb-8 pt-1",
              )}
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredSuppliers.map((s) => (
                <motion.div key={s.supplierUID} variants={listItemVariants}>
                  <SupplierTile
                    supplier={s}
                    showDeliveryInfo={!useAllSuppliersStyle}
                    showBasketStatus={!useAllSuppliersStyle}
                    displayAsDraft={displayAsDraft}
                    calendarDateView={calendarDateView}
                    tileStyle="default"
                    titleHref={
                      pathname === "/orders-of-the-day" && !calendarDateView
                        ? `/settings/manage-suppliers/${encodeURIComponent(s.supplierUID)}`
                        : undefined
                    }
                    href={
                      onSupplierClick
                        ? undefined
                        : (() => {
                            if (pathname === "/orders-of-the-day") {
                              if (
                                !calendarDateView &&
                                s.basketIconStatus === 200 &&
                                s.todaysOrderUID
                              ) {
                                return `/orders-of-the-day/order/${encodeURIComponent(s.todaysOrderUID)}`;
                              }
                              const base = `/suppliers/${encodeURIComponent(s.supplierUID)}?from=orders-of-the-day`;
                              const refDateOnly =
                                calendarDateView && selectedRefDate
                                  ? toDateOnly(selectedRefDate)
                                  : null;
                              return refDateOnly
                                ? `${base}&refDate=${encodeURIComponent(refDateOnly)}`
                                : base;
                            }
                            return `/suppliers/${encodeURIComponent(s.supplierUID)}`;
                          })()
                    }
                    onClick={
                      onSupplierClick ? () => onSupplierClick(s) : undefined
                    }
                    partnerApprovalAction={
                      pathname === "/settings/manage-suppliers" &&
                      onInactiveApprovalToggle
                        ? {
                            onAction: () => onInactiveApprovalToggle(s, true),
                            isPending: isInactiveApprovalPending,
                            labelKey: "manage_suppliers_restore",
                            icon: RotateCcw,
                          }
                        : undefined
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}
    </section>
  );
}
