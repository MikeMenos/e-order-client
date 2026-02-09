"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

interface ErgastirioHeadingProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  showVatPricing?: boolean;
  sumAmnt?: string;
  isPricingLoading?: boolean;
}

export default function ErgastirioHeading({
  title,
  description,
  actions,
  className,
  showVatPricing,
  sumAmnt,
  isPricingLoading,
}: ErgastirioHeadingProps) {
  const { t } = useTranslation();
  const showTotal = showVatPricing && sumAmnt != null && sumAmnt !== "";
  const showSkeleton = showVatPricing && isPricingLoading;

  return (
    <Card
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-0 shadow-none bg-transparent",
        className,
      )}
    >
      <CardContent
        className={`flex flex-col gap-1 items-center ${showVatPricing ? "items-start" : ""}`}
      >
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && <p className="text-sm text-slate-500">{description}</p>}
        {showSkeleton && (
          <p className="text-sm font-medium text-slate-700">
            {t("erg_total_with_vat")}{" "}
            <span className="inline-block h-5 w-16 bg-slate-200 rounded animate-pulse" />
          </p>
        )}
        {showTotal && !showSkeleton && (
          <p className="text-sm font-medium text-slate-700">
            {t("erg_total_with_vat")}{" "}
            <span className="text-xl font-bold text-slate-900">{sumAmnt}€</span>
          </p>
        )}
      </CardContent>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </Card>
  );
}
