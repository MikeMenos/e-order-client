"use client";

import { useTranslation } from "@/lib/i18n";

export type CheckoutPageHeaderProps = {
  titleKey: string;
  supplierName: string | null;
  supplierLogo?: string | null;
};

export function CheckoutPageHeader({
  titleKey,
  supplierName,
  supplierLogo,
}: CheckoutPageHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="my-3">
      <h1 className="text-xl font-bold text-slate-900">{t(titleKey)}</h1>
      <div className="mt-1 flex items-center gap-2">
        {supplierLogo && (
          <img
            src={supplierLogo}
            alt={supplierName ?? ""}
            className="h-8 w-8 shrink-0 rounded-full bg-slate-100 object-contain"
          />
        )}
        <p className="text-base text-slate-500">{supplierName ?? "—"}</p>
      </div>
    </div>
  );
}
