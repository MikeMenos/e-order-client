"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "../../lib/i18n";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  FileText,
  MoreHorizontal,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import { OrdersOfDayActionButton } from "./OrdersOfDayActionButton";
import { SuppliersListItem } from "@/lib/types/dashboard";
import { Button } from "../ui/button";

type Props = {
  supplier: SuppliersListItem;
  isExpanded?: boolean;
  /** When false, hide delivery date line and week delivery days (e.g. on all-suppliers). */
  showDeliveryInfo?: boolean;
  /** When false, hide basket status pill and show subTitle under title (e.g. on all-suppliers). */
  showBasketStatus?: boolean;
  /** When provided, tile is a link to this href (default: /suppliers/[uid]). */
  href?: string;
  /** When provided, tile is a button and this is called on click (e.g. manage-suppliers menu). */
  onClick?: () => void;
  /** When "settings", use same card style as /settings (centered, rounded-2xl bg-app-card/95 p-6). */
  tileStyle?: "default" | "settings";
  /** When provided, the title is a link to this href (e.g. orders-of-the-day → manage-suppliers). */
  titleHref?: string;
  /** When true (e.g. Πρόχειρες tab), show draft style and text regardless of basketIconStatus. */
  displayAsDraft?: boolean;
  /** When true, list uses all-suppliers style (grid, no delivery/basket) and children (tabs) are hidden. */
  calendarDateView?: boolean;
  /** When provided (manage-suppliers inactive tab), show action button (restore). */
  partnerApprovalAction?: {
    onAction: () => void;
    isPending?: boolean;
    /** i18n key for button label */
    labelKey: string;
    /** Icon to show in the button */
    icon?: LucideIcon;
  };
  /** When provided (orders-of-the-day Pending tab), show Hide button (desktop) and enable swipe-to-reveal (mobile). */
  hideFromListAction?: {
    onHide: () => void;
    isPending?: boolean;
  };
  /** When provided (orders-of-the-day Drafts tab), show Empty basket button (desktop) and enable swipe-to-reveal (mobile). */
  emptyBasketAction?: {
    onEmptyBasket: () => void;
    isPending?: boolean;
  };
  /** When provided (orders-of-the-day All tab), show "Show in Pending" button (desktop) for hidden-from-pending suppliers. */
  showInPendingAction?: {
    onShowInPending: () => void;
    isPending?: boolean;
  };
  /** When true (orders-of-the-day All tab), show subtle indicator that supplier is not in Pending list. */
  isHiddenFromPending?: boolean;
};

const tileClassNameDefault =
  "flex flex-col rounded-lg bg-card/90 shadow-sm cursor-pointer transition hover:border-brand-400/70 hover:shadow-md";
const tileClassNameSettings =
  "flex h-full w-full flex-col items-center justify-center gap-3 rounded-lg bg-card/90 p-6 shadow-sm transition hover:shadow-md cursor-pointer";

export function SupplierTile({
  supplier,
  showDeliveryInfo = true,
  showBasketStatus = true,
  href: hrefProp,
  onClick,
  tileStyle = "default",
  displayAsDraft = false,
  calendarDateView = false,
  titleHref,
  partnerApprovalAction,
  hideFromListAction,
  emptyBasketAction,
  showInPendingAction,
  isHiddenFromPending,
}: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const isNotOrdersOfDayPage =
    calendarDateView ||
    pathname === "/all-suppliers" ||
    pathname === "/settings/manage-suppliers";
  const isOrdersOfDayPage =
    pathname === "/orders-of-the-day" && !calendarDateView;

  const orderTimeDisplay =
    supplier.labelOrderTimeExpiresAt != null &&
    supplier.labelOrderTimeExpiresAt !== ""
      ? supplier.labelOrderTimeExpiresAt
      : supplier.orderTillText != null && supplier.orderTillText !== ""
        ? (() => {
            const match = supplier.orderTillText!.match(/\d{1,2}:\d{2}$/);
            return match ? match[0] : null;
          })()
        : null;

  const openBaskets = supplier.counterOpenBaskets ?? 0;
  const todayOrders = supplier.counterTodayOrders ?? 0;
  const showDotArea =
    !calendarDateView && (isNotOrdersOfDayPage || isOrdersOfDayPage);
  const showOrangeDot = showDotArea && isNotOrdersOfDayPage && openBaskets > 0;
  const greenDotCount = Math.min(todayOrders, 10);

  const defaultHref = isOrdersOfDayPage
    ? `/suppliers/${encodeURIComponent(supplier.supplierUID)}?from=orders-of-the-day`
    : `/suppliers/${encodeURIComponent(supplier.supplierUID)}`;
  const href = hrefProp ?? defaultHref;

  const useDraftDisplay = displayAsDraft || supplier.basketIconStatus === 2;
  const statusDescr = useDraftDisplay
    ? ""
    : (supplier.basketIconStatusDescr ?? "");
  const statusDisplay = useDraftDisplay
    ? t("supplier_status_draft")
    : statusDescr || "—";

  const draftPillStyle = {
    color: "#034D71",
    backgroundColor: "rgba(196, 214, 224, 0.7)",
  };
  const draftIconStyle = {
    color: "white",
    backgroundColor: "#034D71",
    borderRadius: "50%",
  };

  const pillStyle = displayAsDraft
    ? draftPillStyle
    : supplier.basketIconColor
      ? {
          color: supplier.basketIconColor,
          backgroundColor:
            supplier.basketIconColor.startsWith("#") &&
            supplier.basketIconColor.length === 7
              ? `${supplier.basketIconColor}1A`
              : supplier.basketIconColor,
        }
      : undefined;
  const iconStyle = displayAsDraft
    ? draftIconStyle
    : supplier.basketIconColor
      ? {
          color: "white",
          backgroundColor: supplier.basketIconColor,
          borderRadius: "50%",
        }
      : undefined;
  const isSettingsStyle = tileStyle === "settings";

  const content = isSettingsStyle ? (
    <>
      {supplier.logo ? (
        <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white/80">
          <img
            src={supplier.logo}
            alt={supplier.title ?? ""}
            className="h-full w-full object-contain"
          />
        </span>
      ) : (
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <span className="text-xl font-semibold text-brand-800">
            {(supplier.title ?? "").charAt(0).toUpperCase()}
          </span>
        </span>
      )}
      <span className="text-center text-base font-medium t text-brand-800 line-clamp-2">
        {supplier.title}
      </span>
    </>
  ) : isNotOrdersOfDayPage ? (
    <div className="flex min-h-[180px] flex-1 flex-col items-center justify-center px-4 py-4 text-center">
      <div className="flex flex-col items-center gap-1">
        {supplier.logo ? (
          <img
            src={supplier.logo}
            alt={supplier.title ?? ""}
            className="h-14 w-14 shrink-0 rounded-full bg-slate-100 object-contain"
          />
        ) : (
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <span className="text-2xl font-semibold text-slate-500">
              {(supplier.title ?? "").charAt(0).toUpperCase()}
            </span>
          </span>
        )}
        {partnerApprovalAction && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1 gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              partnerApprovalAction.onAction();
            }}
            disabled={partnerApprovalAction.isPending}
            aria-label={t(partnerApprovalAction.labelKey)}
          >
            {partnerApprovalAction.icon && (
              <partnerApprovalAction.icon className="h-4 w-4 shrink-0" />
            )}
            {t(partnerApprovalAction.labelKey)}
          </Button>
        )}
      </div>
      <div className="mt-2 flex items-center justify-center gap-1" aria-hidden>
        {showOrangeDot && (
          <span
            className="relative inline-flex h-4 w-4 items-center justify-center"
            title={t("suppliers_baskets")}
          >
            <FileText className="h-4 w-4 text-orange-600" aria-hidden />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-orange-500 animate-pulse-strong" />
          </span>
        )}
        {Array.from({ length: greenDotCount }, (_, i) => (
          <span
            key={i}
            className="relative inline-flex h-4 w-4 items-center justify-center"
            title={t("suppliers_orders")}
          >
            <ShoppingBasket className="h-4 w-4 text-green-600" aria-hidden />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500" />
          </span>
        ))}
      </div>
      <p className="text-base font-semibold text-brand-800 line-clamp-2">
        {supplier.title}
      </p>
      {supplier.subTitle && (
        <p className="mt-0.5 text-base text-slate-500 line-clamp-2">
          {supplier.subTitle}
        </p>
      )}
    </div>
  ) : (
    <>
      {/* Top: logo + title + delivery (or subTitle on all-suppliers) + dots (all-suppliers / orders-of-the-day) */}
      {titleHref && isOrdersOfDayPage ? (
        <div
          className={`flex items-center gap-3 px-4 py-2 pb-2 hover:bg-slate-50/50 transition-colors ${
            showDotArea ? "md:items-center md:justify-between" : ""
          }`}
        >
          <Link
            href={titleHref}
            onClick={(e) => e.stopPropagation()}
            className="flex items-start gap-3"
          >
            {supplier.logo && (
              <img
                src={supplier.logo}
                alt={supplier.title ?? ""}
                className="h-10 w-10 shrink-0 rounded-full bg-slate-100 object-contain"
              />
            )}
            <div className="min-w-0 flex-1">
              {!showBasketStatus && supplier.subTitle && (
                <p className="font-bold uppercase tracking-wide text-slate-900">
                  {supplier.subTitle}
                </p>
              )}

              {isOrdersOfDayPage ? (
                <>
                  <p className="font-bold uppercase tracking-wide text-brand-800 flex items-center gap-2">
                    {supplier.title ?? supplier.subTitle}
                    {isHiddenFromPending && (
                      <span
                        className="inline-flex shrink-0"
                        title={t("orders_of_day_not_in_pending")}
                      >
                        <EyeOff className="h-5 w-5" aria-hidden />
                      </span>
                    )}
                  </p>
                  {showDeliveryInfo && supplier.nextAvailDeliveryText && (
                    <p className="mt-0.5 text-base text-slate-500">
                      {t("suppliers_delivery")} {supplier.nextAvailDeliveryText}
                    </p>
                  )}
                  {showDeliveryInfo && orderTimeDisplay && (
                    <p className="mt-0.5 text-base text-slate-500">
                      {t("order_delivery_until")} {orderTimeDisplay}
                    </p>
                  )}
                </>
              ) : (
                <>
                  {showDeliveryInfo && supplier.nextAvailDeliveryText && (
                    <p className="mt-0.5 text-base text-slate-500">
                      {t("suppliers_delivery")} {supplier.nextAvailDeliveryText}
                    </p>
                  )}
                  <p className="mt-0.5 text-base text-slate-500 ">
                    {supplier.title}
                  </p>
                </>
              )}
            </div>
          </Link>
          <div>
            {hideFromListAction && (
              <OrdersOfDayActionButton
                variant="hide"
                labelKey="orders_of_day_hide_from_list"
                icon={EyeOff}
                onClick={hideFromListAction.onHide}
                disabled={hideFromListAction.isPending}
              />
            )}
            <div>
              {emptyBasketAction && (
                <OrdersOfDayActionButton
                  variant="emptyBasket"
                  labelKey="checkout_delete_basket"
                  icon={Trash2}
                  onClick={emptyBasketAction.onEmptyBasket}
                  disabled={emptyBasketAction.isPending}
                />
              )}
              {showInPendingAction && (
                <OrdersOfDayActionButton
                  variant="showInPending"
                  labelKey="orders_of_day_show_in_pending"
                  icon={Eye}
                  onClick={showInPendingAction.onShowInPending}
                  disabled={showInPendingAction.isPending}
                />
              )}

              {/* Dots: all-suppliers = orange (blink if open baskets) + green (today orders); orders-of-the-day = green only */}
              {showDotArea && (
                <div
                  className="flex items-center gap-1 shrink-0 ml-2"
                  aria-hidden
                >
                  {showOrangeDot && (
                    <span
                      className="relative inline-flex h-4 w-4 items-center justify-center"
                      title={t("suppliers_baskets")}
                    >
                      <FileText
                        className="h-4 w-4 text-orange-600"
                        aria-hidden
                      />
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-orange-500 animate-pulse-strong" />
                    </span>
                  )}
                  {Array.from({ length: greenDotCount }, (_, i) => (
                    <span
                      key={i}
                      className="relative inline-flex h-4 w-4 items-center justify-center"
                      title={t("suppliers_orders")}
                    >
                      <ShoppingBasket
                        className="h-4 w-4 text-green-600"
                        aria-hidden
                      />
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500" />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`flex items-center gap-3 px-4 py-2 pb-2 ${
            showDotArea ? "md:items-center md:justify-between" : ""
          }`}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {supplier.logo && (
              <img
                src={supplier.logo}
                alt={supplier.title ?? ""}
                className="h-10 w-10 shrink-0 rounded-full bg-slate-100 object-contain"
              />
            )}
            <div className="min-w-0 flex-1">
              {!showBasketStatus && supplier.subTitle && (
                <p className="font-bold uppercase tracking-wide text-slate-900">
                  {supplier.subTitle}
                </p>
              )}

              {isOrdersOfDayPage ? (
                <>
                  <p className="font-bold uppercase tracking-wide text-slate-900">
                    {supplier.title ?? supplier.subTitle}
                  </p>
                  {showDeliveryInfo && supplier.nextAvailDeliveryText && (
                    <p className="mt-0.5 text-base text-slate-500">
                      {t("suppliers_delivery")} {supplier.nextAvailDeliveryText}
                    </p>
                  )}
                  {showDeliveryInfo && orderTimeDisplay && (
                    <p className="mt-0.5 text-base text-slate-500">
                      {t("order_delivery_until")} {orderTimeDisplay}
                    </p>
                  )}
                </>
              ) : (
                <>
                  {showDeliveryInfo && supplier.nextAvailDeliveryText && (
                    <p className="mt-0.5 text-base text-slate-500">
                      {t("suppliers_delivery")} {supplier.nextAvailDeliveryText}
                    </p>
                  )}
                  <p className="mt-0.5 text-base text-slate-500 ">
                    {supplier.title}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Dots: all-suppliers = orange (blink if open baskets) + green (today orders); orders-of-the-day = green only */}
          {showDotArea && (
            <div className="flex items-center gap-1 shrink-0 ml-2" aria-hidden>
              {showOrangeDot && (
                <span
                  className="relative inline-flex h-4 w-4 items-center justify-center"
                  title={t("suppliers_baskets")}
                >
                  <FileText className="h-4 w-4 text-orange-600" aria-hidden />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-orange-500 animate-pulse-strong" />
                </span>
              )}
              {Array.from({ length: greenDotCount }, (_, i) => (
                <span
                  key={i}
                  className="relative inline-flex h-4 w-4 items-center justify-center"
                  title={t("suppliers_orders")}
                >
                  <ShoppingBasket
                    className="h-4 w-4 text-green-600"
                    aria-hidden
                  />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500" />
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Middle: status pill (hidden on all-suppliers); colored by basketIconColor */}
      {showBasketStatus && (
        <div className="flex items-center gap-2 px-4 py-2">
          <span
            className="inline-flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium bg-slate-100 text-slate-800"
            style={pillStyle}
          >
            {!displayAsDraft && supplier.basketIconStatus === 200 && (
              <CheckCircle2
                className="h-5 w-5 shrink-0"
                style={iconStyle}
                aria-hidden
              />
            )}
            {(displayAsDraft || supplier.basketIconStatus === 2) && (
              <MoreHorizontal
                className="h-5 w-5 shrink-0"
                style={iconStyle}
                aria-hidden
              />
            )}
            {!displayAsDraft && supplier.basketIconStatus === 3 && (
              <CircleAlert className="h-5 w-5 shrink-0" aria-hidden />
            )}
            <span>{statusDisplay}</span>
            {!displayAsDraft && supplier.basketIconStatus === 3 && (
              <span className="ml-auto">
                {/* paraggelia button*/}
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-sm bg-brand-50 text-brand-700 px-2 py-0 font-normal"
                  size="sm"
                >
                  {t("supplier_order")}
                </Button>
              </span>
            )}
            {(displayAsDraft || supplier.basketIconStatus === 2) && (
              <span className="ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-sm bg-brand-50 text-brand-700 px-2 py-0 font-normal"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  size="sm"
                >
                  {t("supplier_continue")}
                </Button>
              </span>
            )}
            {!displayAsDraft && supplier.basketIconStatus === 200 && (
              <span className="ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-sm bg-brand-50 text-brand-700 px-2 py-0 font-normal"
                  size="sm"
                >
                  {t("supplier_open")}
                </Button>
              </span>
            )}
          </span>
        </div>
      )}

      {/* Bottom: order days (hidden on all-suppliers) */}
      {showDeliveryInfo && supplier.weekDeliveryDaysText && (
        <div className="flex items-center justify-center gap-2 border-t border-neutral-200 px-4 py-2">
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span className="font-semibold text-green-600">
            {supplier.weekDeliveryDaysText}
          </span>
        </div>
      )}
    </>
  );

  const tileClassName = isSettingsStyle
    ? tileClassNameSettings
    : isNotOrdersOfDayPage
      ? `${tileClassNameDefault} h-full flex flex-col`
      : tileClassNameDefault;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left ${tileClassName}`}
      >
        {content}
      </button>
    );
  }

  if (titleHref) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push(href)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            router.push(href);
          }
        }}
        className={tileClassName}
      >
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={tileClassName}>
      {content}
    </Link>
  );
}
