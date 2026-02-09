"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "../../lib/i18n";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import type { Supplier } from "./types";
import { Button } from "../ui/button";

type Props = {
  supplier: Supplier;
  refDate: string;
  isExpanded?: boolean;
  /** When false, hide delivery date line and week delivery days (e.g. on all-suppliers). */
  showDeliveryInfo?: boolean;
  /** When false, hide basket status pill and show subTitle under title (e.g. on all-suppliers). */
  showBasketStatus?: boolean;
  /** When provided, tile is a link to this href (default: /suppliers/[uid]?refDate=). */
  href?: string;
  /** When provided, tile is a button and this is called on click (e.g. manage-suppliers menu). */
  onClick?: () => void;
  /** When "settings", use same card style as /settings (centered, rounded-2xl bg-app-card/95 p-6). */
  tileStyle?: "default" | "settings";
};

const STATUS_COMPLETED = "Ολοκληρώθηκε";
const STATUS_PENDING = "Σε αναμονή";
const STATUS_PENDING_SHIPMENT = "Σε αναμονή αποστολής";

function getStatusStyle(descr: string | null | undefined): {
  text: string;
  bg: string;
  icon: React.ReactNode;
} {
  const d = descr ?? "";
  if (d === STATUS_COMPLETED) {
    return {
      text: "text-green-600",
      bg: "bg-green-200",
      icon: (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" aria-hidden />
      ),
    };
  }
  if (d === STATUS_PENDING) {
    return {
      text: "text-orange-600",
      bg: "bg-orange-200",
      icon: (
        <MoreHorizontal
          className="h-4 w-4 text-orange-500 shrink-0"
          aria-hidden
        />
      ),
    };
  }
  if (d === STATUS_PENDING_SHIPMENT) {
    return {
      text: "text-slate-500",
      bg: "bg-slate-200",
      icon: <Clock className="h-4 w-4 text-slate-400 shrink-0" aria-hidden />,
    };
  }
  return {
    text: "text-red-600",
    bg: "bg-red-100",
    icon: <AlertCircle className="h-4 w-4 text-red-500 shrink-0" aria-hidden />,
  };
}

const tileClassNameDefault =
  "flex flex-col rounded-2xl border border-slate-200/80 bg-app-card/95 shadow-sm cursor-pointer transition hover:border-brand-400/70 hover:shadow-md";
const tileClassNameSettings =
  "flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-app-card/95 p-6 shadow-sm transition hover:shadow-md cursor-pointer";

export function SupplierTile({
  supplier,
  refDate,
  showDeliveryInfo = true,
  showBasketStatus = true,
  href: hrefProp,
  onClick,
  tileStyle = "default",
}: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isAllSuppliersPage = pathname === "/all-suppliers";
  const isOrdersOfDayPage = pathname === "/orders-of-the-day";
  const [isMobileExtraOpen, setIsMobileExtraOpen] = useState(false);

  const hasExtraCounters =
    isAllSuppliersPage &&
    ((supplier.counterOpenBaskets ?? null) !== null ||
      (supplier.counterTodayOrders ?? null) !== null);

  const defaultHref = `/suppliers/${encodeURIComponent(
    supplier.supplierUID,
  )}?refDate=${encodeURIComponent(refDate)}`;
  const href = hrefProp ?? defaultHref;

  const statusDescr = supplier.basketIconStatusDescr ?? "";
  const statusStyle = getStatusStyle(statusDescr);
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
          <span className="text-lg font-semibold text-slate-500">
            {(supplier.title ?? "").charAt(0).toUpperCase()}
          </span>
        </span>
      )}
      <span className="text-center text-sm font-medium text-slate-900 line-clamp-2">
        {supplier.title}
      </span>
    </>
  ) : (
    <>
      {/* Top: logo + title + subTitle or delivery (delivery hidden on all-suppliers) */}
      <div
        className={`flex items-center gap-3 px-4 py-2 pb-2 ${
          hasExtraCounters ? "md:items-center md:justify-between" : ""
        }`}
      >
        <div className="flex items-start gap-3 flex-1">
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

            {/* Title + delivery info ordering:
                - On orders-of-the-day: show title first, then delivery (as before).
                - Elsewhere: keep delivery first, then title. */}
            {isOrdersOfDayPage ? (
              <>
                <p className="font-bold uppercase tracking-wide text-slate-900">
                  {supplier.title}
                </p>
                {showDeliveryInfo && supplier.nextAvailDeliveryText && (
                  <p className="mt-0.5 text-sm text-slate-500">
                    {t("suppliers_delivery")} {supplier.nextAvailDeliveryText}
                  </p>
                )}
              </>
            ) : (
              <>
                {showDeliveryInfo && supplier.nextAvailDeliveryText && (
                  <p className="mt-0.5 text-sm text-slate-500">
                    {t("suppliers_delivery")} {supplier.nextAvailDeliveryText}
                  </p>
                )}
                <p className="mt-0.5 text-sm text-slate-500 ">
                  {supplier.title}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Desktop extra counters (only on all-suppliers) */}
        {hasExtraCounters && (
          <div className="hidden md:flex flex-col items-end gap-0.5 text-sm text-slate-600 ml-3">
            {supplier.counterOpenBaskets !== null &&
              supplier.counterOpenBaskets !== undefined && (
                <span>
                  {t("suppliers_baskets")} ({supplier.counterOpenBaskets})
                </span>
              )}
            {supplier.counterTodayOrders !== null &&
              supplier.counterTodayOrders !== undefined && (
                <span>
                  {t("suppliers_orders")} ({supplier.counterTodayOrders})
                </span>
              )}
          </div>
        )}

        {/* Mobile expand arrow (only on all-suppliers) */}
        {hasExtraCounters && (
          <Button
            type="button"
            variant="ghost"
            className="ml-2 inline-flex items-center justify-center rounded-full p-1 text-slate-500 hover:text-slate-700 md:hidden"
            onClick={(e) => {
              // Prevent navigating the link when toggling the extra info
              e.preventDefault();
              e.stopPropagation();
              setIsMobileExtraOpen((v) => !v);
            }}
            aria-label={
              isMobileExtraOpen ? "Hide supplier info" : "Show supplier info"
            }
          >
            <ChevronDown
              className={`h-6 w-6 transform transition-transform ${
                isMobileExtraOpen ? "rotate-180" : ""
              }`}
              aria-hidden
            />
          </Button>
        )}
      </div>

      {/* Mobile extra counters (expandable, only on all-suppliers) */}
      {hasExtraCounters && (
        <div
          className={`border-t border-slate-100 px-4 py-2 text-sm text-slate-600 space-y-1 md:hidden ${
            isMobileExtraOpen ? "block" : "hidden"
          }`}
        >
          {supplier.counterOpenBaskets !== null &&
            supplier.counterOpenBaskets !== undefined && (
              <p>
                {t("suppliers_baskets")} ({supplier.counterOpenBaskets})
              </p>
            )}
          {supplier.counterTodayOrders !== null &&
            supplier.counterTodayOrders !== undefined && (
              <p>
                {t("suppliers_orders")} ({supplier.counterTodayOrders})
              </p>
            )}
        </div>
      )}

      {/* Middle: status pill (hidden on all-suppliers) */}
      {showBasketStatus && (
        <div className="flex items-center gap-2 px-4 py-2">
          <span
            className={`inline-flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium ${statusStyle.bg} ${statusStyle.text}`}
          >
            {statusStyle.icon}
            <span>{statusDescr || "—"}</span>
          </span>
        </div>
      )}

      {/* Bottom: order days (hidden on all-suppliers) */}
      {showDeliveryInfo && supplier.weekDeliveryDaysText && (
        <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-4 py-2">
          <Calendar className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span className="text-slate-600">
            {supplier.weekDeliveryDaysText}
          </span>
        </div>
      )}
    </>
  );

  const tileClassName = isSettingsStyle
    ? tileClassNameSettings
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

  return (
    <Link href={href} className={tileClassName}>
      {content}
    </Link>
  );
}
