"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { useTranslation } from "../../lib/i18n";

type SupplierInfo = {
  supplierUID?: string;
  logo?: string | null;
  title?: string | null;
  tileColorMode?: string | null;
};

type Props = {
  supplier: SupplierInfo | null;
  selectedDate?: string | null;
};

export function SupplierPageBar({ supplier, selectedDate }: Props) {
  const { t } = useTranslation();
  const supplierLabel = supplier?.title ?? t("common_supplier");
  const supplierUID = supplier?.supplierUID;
  const orderHistoryHref =
    supplierUID != null
      ? `/suppliers/${encodeURIComponent(supplierUID)}/order-history${
          selectedDate ? `?refDate=${encodeURIComponent(selectedDate)}` : ""
        }`
      : "#";
  const isFill =
    (supplier?.tileColorMode?.trim() ?? "").toLowerCase() === "fill";

  return (
    <div className="mx-auto flex items-center justify-between gap-4 px-4 py-2">
      <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
        {supplier?.logo && (
          <img
            src={supplier.logo}
            alt={supplierLabel}
            className="h-10 w-10 shrink-0 rounded-full bg-slate-100 object-contain"
          />
        )}
        <div className="min-w-0 flex-1 overflow-hidden">
          <p
            className="truncate text-sm font-semibold text-slate-900"
            title={supplierLabel}
          >
            {supplierLabel}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-sm text-slate-500">
        {/* Order history link */}
        <Link
          href={orderHistoryHref}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium md:h-9 md:w-9 ${
            isFill
              ? "border-slate-300 text-slate-900 hover:border-slate-400 hover:text-slate-900"
              : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-700"
          }`}
          aria-label={`${t("supplier_order_history_aria")} ${
            supplier?.title ?? ""
          }`}
        >
          <History className="h-4 w-4 md:h-4.5 md:w-4.5" />
        </Link>
      </div>
    </div>
  );
}
