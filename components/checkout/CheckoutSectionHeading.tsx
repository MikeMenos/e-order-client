"use client";

import { useTranslation } from "@/lib/i18n";

export type CheckoutSectionHeadingProps = {
  labelKey: string;
};

const headingClass = "mb-2 text-sm font-semibold text-brand-600";

export function CheckoutSectionHeading({
  labelKey,
}: CheckoutSectionHeadingProps) {
  const { t } = useTranslation();
  return <h2 className={headingClass}>{t(labelKey)}</h2>;
}
