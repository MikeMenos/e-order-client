"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const variantStyles = {
  hide: "border-amber-300 text-amber-700 hover:bg-amber-50",
  emptyBasket: "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300",
  showInPending: "border-green-300 text-green-700 hover:bg-green-50",
} as const;

type Variant = keyof typeof variantStyles;

type Props = {
  variant: Variant;
  labelKey: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
};

export function OrdersOfDayActionButton({
  variant,
  labelKey,
  icon: Icon,
  onClick,
  disabled,
}: Props) {
  const { t } = useTranslation();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "hidden md:flex shrink-0 h-8 gap-1",
        variantStyles[variant],
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      aria-label={t(labelKey)}
    >
      <Icon className="h-4 w-4" />
      {t(labelKey)}
    </Button>
  );
}
