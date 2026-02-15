"use client";

import { useTranslation } from "@/lib/i18n";

export type CheckoutSectionHeadingProps = {
  labelKey: string;
};

const headingClass =
  "mb-2 text-base font-semibold text-brand-600 rounded px-2 w-fit";

export function CheckoutSectionHeading({
  labelKey,
}: CheckoutSectionHeadingProps) {
  const { t } = useTranslation();
  return <h2 className={headingClass}>{t(labelKey)}</h2>;
}
