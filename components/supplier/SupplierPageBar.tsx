"use client";

import { useTranslation } from "../../lib/i18n";
import { Button } from "../ui/button";

type SupplierInfo = {
  logo?: string | null;
  title?: string | null;
};

type Props = {
  supplier: SupplierInfo | null;
  selectedDate: string | null;
};

export function SupplierPageBar({ supplier, selectedDate }: Props) {
  const { t } = useTranslation();
  const supplierLabel = supplier?.title ?? t("common_supplier");
  return (
    <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-2">
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
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white">
          i
        </span>
      </div>
    </div>
  );
}
