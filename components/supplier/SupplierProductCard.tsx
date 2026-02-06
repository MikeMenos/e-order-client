"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "../../lib/i18n";
import { api } from "../../lib/api";
import { getApiErrorMessage } from "../../lib/api-error";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { SupplierProduct } from "./types";

const DEBOUNCE_MS = 800;

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

  const lastSuggestedQtyRef = useRef<number>(initialQty ?? 0);
  const reserveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const basketDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextBasketDebounceRef = useRef(false);
  const reserveTouchedRef = useRef(false);
  const basketTouchedRef = useRef(false);

  const setReserveClamped = useCallback((value: number) => {
    reserveTouchedRef.current = true;
    setReserveQty(clampNonNegative(value));
  }, []);

  const setBasketClamped = useCallback((value: number) => {
    basketTouchedRef.current = true;
    setBasketQty(clampNonNegative(value));
  }, []);

  const syncFromReserve = useCallback(async () => {
    try {
      const { data } = await api.post<{ suggestedQty: number }>(
        "/basket-suggest-qty",
        {
          orderRefDate: new Date().toISOString(),
          productUID: id,
          stock: reserveQty,
        },
      );
      const suggestedQty = data?.suggestedQty ?? 0;
      lastSuggestedQtyRef.current = suggestedQty;
      setBasketQty(suggestedQty);
      skipNextBasketDebounceRef.current = true;

      await api.post("/basket-add-or-update", {
        productUID: id,
        qty: suggestedQty,
        stock: reserveQty,
        suggestedQty,
        comments: "",
      });
      toast.success(t("basket_toast_success"));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    }
  }, [id, reserveQty, t]);

  const syncFromBasket = useCallback(async () => {
    if (skipNextBasketDebounceRef.current) {
      skipNextBasketDebounceRef.current = false;
      return;
    }
    try {
      const suggestedQty = lastSuggestedQtyRef.current ?? basketQty;
      await api.post("/basket-add-or-update", {
        productUID: id,
        qty: basketQty,
        stock: reserveQty,
        suggestedQty,
        comments: "",
      });
      toast.success(t("basket_toast_success"));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    }
  }, [id, basketQty, reserveQty, t]);

  useEffect(() => {
    if (!reserveTouchedRef.current) return;
    if (reserveDebounceRef.current) clearTimeout(reserveDebounceRef.current);
    reserveDebounceRef.current = setTimeout(syncFromReserve, DEBOUNCE_MS);
    return () => {
      if (reserveDebounceRef.current) clearTimeout(reserveDebounceRef.current);
    };
  }, [reserveQty, syncFromReserve]);

  useEffect(() => {
    if (!basketTouchedRef.current) return;
    if (basketDebounceRef.current) clearTimeout(basketDebounceRef.current);
    basketDebounceRef.current = setTimeout(syncFromBasket, DEBOUNCE_MS);
    return () => {
      if (basketDebounceRef.current) clearTimeout(basketDebounceRef.current);
    };
  }, [basketQty, syncFromBasket]);

  return (
    <article
      key={id}
      className="flex items-center gap-2 rounded-lg border border-slate-100 bg-app-card/95 px-3 py-2 shadow-sm"
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
              aria-label={t("aria_decrease_reserve")}
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
              aria-label={t("aria_reserve_quantity")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0 text-sm"
              aria-label={t("aria_increase_reserve")}
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
          aria-label={t("aria_decrease_basket")}
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
          aria-label={t("aria_basket_quantity")}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0 text-sm"
          aria-label={t("aria_increase_basket")}
          onClick={() => setBasketClamped(basketQty + 1)}
        >
          +
        </Button>
      </div>
    </article>
  );
}
