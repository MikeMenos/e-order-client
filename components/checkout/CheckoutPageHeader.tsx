"use client";

import { useTranslation } from "@/lib/i18n";

export type CheckoutPageHeaderProps = {
  titleKey: string;
  supplierName: string | null;
};

export function CheckoutPageHeader({
  titleKey,
  supplierName,
}: CheckoutPageHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className="my-3">
      <h1 className="text-xl font-bold text-slate-900">{t(titleKey)}</h1>
      <p className="mt-1 text-base text-slate-500">{supplierName ?? "—"}</p>
    </div>
  );
}
