"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "../../lib/i18n";
import {
  Calendar,
  CheckCircle2,
  CircleAlert,
  MoreHorizontal,
} from "lucide-react";
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
};

const tileClassNameDefault =
  "flex flex-col rounded-lg border border-slate-200/80 bg-app-card/95 shadow-sm cursor-pointer transition hover:border-brand-400/70 hover:shadow-md";
const tileClassNameSettings =
  "flex h-full w-full flex-col items-center justify-center gap-3 rounded-lg bg-app-card/95 p-6 shadow-sm transition hover:shadow-md cursor-pointer";

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
}: Props) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const isNotOrdersOfDayPage =
    calendarDateView ||
    pathname === "/all-suppliers" ||
    pathname === "/settings/manage-suppliers" ||
    pathname === "/settings/partner-suppliers";
  const isOrdersOfDayPage =
    pathname === "/orders-of-the-day" && !calendarDateView;

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
    color: "#EEB23E",
    backgroundColor: "#FFF8E6",
  };
  const draftIconStyle = {
    color: "white",
    backgroundColor: "#EEB23E",
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
          <span className="text-xl font-semibold text-slate-500">
            {(supplier.title ?? "").charAt(0).toUpperCase()}
          </span>
        </span>
      )}
      <span className="text-center text-base font-medium text-slate-900 line-clamp-2">
        {supplier.title}
      </span>
    </>
  ) : isNotOrdersOfDayPage ? (
    <div className="flex min-h-[180px] flex-1 flex-col items-center justify-center px-4 py-4 text-center">
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
      <div className="mt-2 flex items-center justify-center gap-1" aria-hidden>
        {showOrangeDot && (
          <span
            className="h-2 w-2 rounded-full bg-orange-500 animate-pulse-strong"
            title={t("suppliers_baskets")}
          />
        )}
        {Array.from({ length: greenDotCount }, (_, i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-green-500"
            title={t("suppliers_orders")}
          />
        ))}
      </div>
      <p className="mt-2 text-base font-semibold text-slate-900 line-clamp-2">
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
                {titleHref ? (
                  <Link
                    href={titleHref}
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold uppercase tracking-wide text-slate-900 hover:text-brand-600 hover:underline block"
                  >
                    {supplier.title ?? supplier.subTitle}
                  </Link>
                ) : (
                  <p className="font-bold uppercase tracking-wide text-slate-900">
                    {supplier.title ?? supplier.subTitle}
                  </p>
                )}
                {showDeliveryInfo && supplier.nextAvailDeliveryText && (
                  <p className="mt-0.5 text-base text-slate-500">
                    {t("suppliers_delivery")} {supplier.nextAvailDeliveryText}
                  </p>
                )}
                {showDeliveryInfo &&
                  supplier.labelOrderTimeExpiresAt != null &&
                  supplier.labelOrderTimeExpiresAt !== "" && (
                    <p className="mt-0.5 text-base text-slate-500">
                      {t("order_delivery_until")}{" "}
                      {supplier.labelOrderTimeExpiresAt}
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
                className="h-2 w-2 rounded-full bg-orange-500 animate-pulse-strong"
                title={t("suppliers_baskets")}
              />
            )}
            {Array.from({ length: greenDotCount }, (_, i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-green-500"
                title={t("suppliers_orders")}
              />
            ))}
          </div>
        )}
      </div>

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
              <CircleAlert
                className="h-5 w-5 shrink-0"
                style={iconStyle}
                aria-hidden
              />
            )}
            <span>{statusDisplay}</span>
            {!displayAsDraft && supplier.basketIconStatus === 3 && (
              <span className="ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-sm bg-brand-500 hover:bg-brand-600 px-2 py-0 font-normal text-white"
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
                  className="rounded-sm bg-white px-2 py-0 font-normal"
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
                  className="rounded-sm bg-brand-500 hover:bg-brand-600 px-2 py-0 font-normal text-white"
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
        <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-4 py-2">
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
