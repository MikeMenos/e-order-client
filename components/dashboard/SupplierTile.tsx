import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useTranslation } from "../../lib/i18n";
import {
  HousePlus,
  AlarmClockCheck,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";
import type { Supplier } from "./types";

type Props = {
  supplier: Supplier;
  refDate: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
};

function SupplierTileExpandedDetails({
  supplier,
  supplierHref,
  isFill,
}: {
  supplier: Supplier;
  supplierHref: string;
  isFill: boolean;
}) {
  const { t } = useTranslation();
  const textMuted = isFill ? "text-slate-700" : "text-slate-500";
  const textLabel = isFill ? "text-slate-700" : "text-slate-400";
  const borderCls = isFill ? "border-slate-300" : "border-slate-100";

  return (
    <div
      className={`mt-2 space-y-1.5 border-t pt-2 text-sm ${borderCls} ${
        isFill ? "text-slate-900" : "text-slate-600"
      }`}
      role="region"
      aria-label={t("aria_supplier_details")}
    >
      {supplier.subTitle && (
        <p className={`truncate ${textMuted}`}>{supplier.subTitle}</p>
      )}
      <p>
        <span className={textLabel}>{t("suppliers_order_by")} </span>
        <span className="font-medium">
          {supplier.orderTillText ?? supplier.labelOrderTimeExpiresAt}
        </span>
      </p>
      <p>
        <span className={textLabel}>{t("suppliers_delivery")} </span>
        <span className="font-medium">{supplier.nextAvailDeliveryText}</span>
      </p>
      {supplier.labelStockForDays && (
        <p className="flex items-center gap-1">
          <HousePlus className={`h-4 w-4 ${textLabel}`} />
          <span className="font-medium">{supplier.labelStockForDays}</span>
        </p>
      )}
      {supplier.weekDeliveryDaysText && (
        <p className="flex items-center gap-1">
          <AlarmClockCheck className={`h-4 w-4 ${textLabel}`} />
          <span className="font-medium">{supplier.weekDeliveryDaysText}</span>
        </p>
      )}
    </div>
  );
}

function getTileStyle(supplier: Supplier): React.CSSProperties {
  const color = supplier.tileColor?.trim();
  const mode = (supplier.tileColorMode?.trim() ?? "").toLowerCase();
  if (!color) return {};
  if (mode === "border") {
    return { borderColor: color };
  }
  if (mode === "fill") {
    return { backgroundColor: color, borderColor: color };
  }
  return { backgroundColor: color, borderColor: color };
}

export function SupplierTile({
  supplier,
  refDate,
  isExpanded,
  onToggleExpanded,
}: Props) {
  const { t } = useTranslation();
  const supplierHref = `/suppliers/${encodeURIComponent(
    supplier.supplierUID
  )}?refDate=${encodeURIComponent(refDate)}`;

  const orderHistoryHref = `/suppliers/${encodeURIComponent(
    supplier.supplierUID
  )}/order-history${refDate ? `?refDate=${encodeURIComponent(refDate)}` : ""}`;

  const tileStyle = getTileStyle(supplier);
  const isFill =
    (supplier.tileColorMode?.trim() ?? "").toLowerCase() === "fill";
  const hasTileColor = !!supplier.tileColor?.trim();

  const textContrast = isFill ? "text-slate-900" : "";
  const textMuted = isFill ? "text-slate-700" : "text-slate-500";
  const textMutedLighter = isFill ? "text-slate-700" : "text-slate-400";

  return (
    <div
      className={`flex flex-col gap-0 rounded-xl border shadow-sm transition hover:border-brand-400/60 bg-app-card/95 ${
        hasTileColor && isFill ? "" : "border-slate-200/80"
      } ${isFill ? "text-slate-900" : ""}`}
      style={hasTileColor ? tileStyle : undefined}
    >
      {/* First row: time + title + chevron + info (chevron stays next to title when expanded) */}
      <div className="flex min-h-0 items-center gap-3 py-2">
        <Link
          href={supplierHref}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1"
        >
          {/* Time column */}
          <div
            className={`flex w-12 shrink-0 flex-col items-center justify-center pl-2 text-xs md:w-14 md:text-sm ${textMuted}`}
          >
            <span>{supplier.labelOrderTimeExpiresAt}</span>
          </div>

          {/* Title only */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {supplier.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={supplier.logo}
                alt={supplier.title}
                className="h-8 w-8 shrink-0 rounded-full bg-slate-100 object-contain"
              />
            )}
            <div className="min-w-0">
              <p
                className={`truncate text-sm font-semibold ${
                  textContrast || "text-slate-900"
                }`}
              >
                {supplier.title}
              </p>
              {supplier.subTitle && !isExpanded && (
                <p className={`truncate text-xs md:text-sm ${textMuted}`}>
                  {supplier.subTitle}
                </p>
              )}
            </div>
          </div>
        </Link>

        {/* Chevron: stays next to title row */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`h-8 w-8 shrink-0 ${textMutedLighter} hover:text-slate-600`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleExpanded();
          }}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse details" : "Expand details"}
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </Button>

        {/* Order history link */}
        <Link
          href={orderHistoryHref}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium md:h-9 md:w-9 ${
            isFill
              ? "border-slate-300 text-slate-900 hover:border-slate-400 hover:text-slate-900"
              : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-700"
          }`}
          aria-label={`${t("supplier_order_history_aria")} ${supplier.title}`}
        >
          <History className="h-4 w-4 md:h-4.5 md:w-4.5" />
        </Link>
      </div>

      {/* Expanded content: full-width row below the title row, aligned with title */}
      {isExpanded && (
        <div className="pb-2 pl-2 pr-2 pt-0 md:pl-14">
          <SupplierTileExpandedDetails
            supplier={supplier}
            supplierHref={supplierHref}
            isFill={isFill}
          />
        </div>
      )}
    </div>
  );
}
