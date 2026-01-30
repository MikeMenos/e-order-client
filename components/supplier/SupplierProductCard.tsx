"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "../../lib/i18n";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { SupplierProduct } from "./types";

type Props = {
  product: SupplierProduct;
};

function clampNonNegative(n: number): number {
  return Math.max(0, Math.floor(n));
}

export function SupplierProductCard({ product }: Props) {
  const { id, title, subTitle, image, qty: initialQty } = product;
  const { t } = useTranslation();

  const [reserveQty, setReserveQty] = useState(0);
  const [basketQty, setBasketQty] = useState(initialQty ?? 0);

  const setReserveClamped = useCallback((value: number) => {
    setReserveQty(clampNonNegative(value));
  }, []);

  const setBasketClamped = useCallback((value: number) => {
    setBasketQty(clampNonNegative(value));
  }, []);

  return (
    <article
      key={id}
      className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-sm"
    >
      {image && (
        <img
          src={image}
          alt={title}
          className="h-12 w-12 shrink-0 rounded bg-slate-50 object-contain"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{title}</p>
        {subTitle && (
          <p className="truncate text-xs text-slate-500">{subTitle}</p>
        )}
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
          <span className="shrink-0">{t("supplier_reserve")}</span>
          <div className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 py-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 text-sm"
              aria-label="Decrease reserve quantity"
              onClick={() => setReserveClamped(reserveQty - 1)}
            >
              -
            </Button>
            <Input
              type="number"
              min={0}
              value={reserveQty}
              onChange={(e) => setReserveClamped(Number(e.target.value) || 0)}
              className="h-5 w-8 shrink-0 border-0 bg-transparent p-0 text-center text-sm [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label="Reserve quantity"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 text-sm"
              aria-label="Increase reserve quantity"
              onClick={() => setReserveClamped(reserveQty + 1)}
            >
              +
            </Button>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 rounded border border-brand-200 bg-brand-50 px-1.5 py-1 text-xs font-medium text-slate-900">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0 text-sm"
          aria-label="Decrease basket quantity"
          onClick={() => setBasketClamped(basketQty - 1)}
        >
          -
        </Button>
        <Input
          type="number"
          min={0}
          value={basketQty}
          onChange={(e) => setBasketClamped(Number(e.target.value) || 0)}
          className="h-5 w-8 shrink-0 border-0 bg-transparent p-0 text-center text-sm [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label="Basket quantity"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0 text-sm"
          aria-label="Increase basket quantity"
          onClick={() => setBasketClamped(basketQty + 1)}
        >
          +
        </Button>
      </div>
    </article>
  );
}
