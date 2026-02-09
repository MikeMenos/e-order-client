"use client";

import type { ICart, IProductItem } from "@/lib/ergastirio-interfaces";
import ErgastirioProductCard from "./ProductCard";
import { useHandleOnSubmitProducts } from "@/hooks/ergastirio/useHandleOnSubmitProducts";
import { useTranslation } from "@/lib/i18n";

interface OrderSummaryProps {
  items?: ICart;
  onQtyChange?: (product: IProductItem, qty: number) => void;
  showVatPricing?: boolean;
  isPricingLoading?: boolean;
  sumAmnt?: string;
}

export function ErgastirioOrderSummary({
  items,
  onQtyChange,
  showVatPricing,
  isPricingLoading,
  sumAmnt,
}: OrderSummaryProps) {
  const { onSubmitProducts, isPending } = useHandleOnSubmitProducts();
  const { t } = useTranslation();
  const showTotal = showVatPricing && sumAmnt != null && sumAmnt !== "";
  const showSkeleton = showVatPricing && isPricingLoading;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-2 justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          {t("erg_order_summary")}
        </h1>
        {showSkeleton && (
          <p className="text-sm font-medium text-slate-700">
            {t("erg_total_with_vat")}{" "}
            <span className="inline-block h-5 w-16 bg-slate-200 rounded animate-pulse" />
          </p>
        )}
        {showTotal && !showSkeleton && (
          <span className="text-sm font-medium text-slate-700">
            {t("erg_total_with_vat")}{" "}
            <span className="text-lg font-bold text-slate-900">{sumAmnt}€</span>
          </span>
        )}
      </div>
      {items?.data.map((item) => (
        <ErgastirioProductCard
          key={item.MTRL}
          product={item}
          onQtyChange={onQtyChange}
          onSubmitProducts={onSubmitProducts}
          isPending={isPending}
          showCartVatPricing={showVatPricing}
          isPricingLoading={isPricingLoading}
        />
      ))}
    </div>
  );
}
