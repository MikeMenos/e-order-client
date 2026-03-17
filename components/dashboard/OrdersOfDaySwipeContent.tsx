"use client";

import type { LucideIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const variantStyles = {
  hide: "bg-amber-500",
  emptyBasket: "bg-red-600",
  showInPending: "bg-green-600",
} as const;

type Variant = keyof typeof variantStyles;

type Props = {
  variant: Variant;
  labelKey: string;
  icon?: LucideIcon;
};

export function OrdersOfDaySwipeContent({
  variant,
  labelKey,
  icon: Icon,
}: Props) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "flex items-center justify-center gap-1.5 text-white font-medium px-4 h-full min-w-[80px]",
        variantStyles[variant],
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {t(labelKey)}
    </span>
  );
}
