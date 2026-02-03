"use client";

import { useTranslation } from "@/lib/i18n";

export type CheckoutTotalProps = {
  labelKey: string;
  amount: string;
};

export function CheckoutTotal({ labelKey, amount }: CheckoutTotalProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
      <span className="text-sm font-semibold text-brand-600">
        {t(labelKey)}
      </span>
      <span className="text-base font-medium text-slate-900">{amount}</span>
    </div>
  );
}
