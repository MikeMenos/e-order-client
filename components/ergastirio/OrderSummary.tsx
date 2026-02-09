"use client";

import type { ICart, IProductItem } from "@/lib/ergastirio-interfaces";
import ErgastirioProductCard from "./ProductCard";
import { useHandleOnSubmitProducts } from "@/hooks/ergastirio/useHandleOnSubmitProducts";
import { useTranslation } from "@/lib/i18n";

interface OrderSummaryProps {
  items?: ICart;
  onQtyChange?: (product: IProductItem, qty: number) => void;
}

export function ErgastirioOrderSummary({
  items,
  onQtyChange,
}: OrderSummaryProps) {
  const { onSubmitProducts, isPending } = useHandleOnSubmitProducts();
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-2 justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          {t("erg_order_summary")}
        </h1>
      </div>
      {items?.data.map((item) => (
        <ErgastirioProductCard
          key={item.MTRL}
          product={item}
          onQtyChange={onQtyChange}
          onSubmitProducts={onSubmitProducts}
          isPending={isPending}
        />
      ))}
    </div>
  );
}
