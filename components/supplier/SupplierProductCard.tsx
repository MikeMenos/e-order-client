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

function toNonNegativeNum(s: string): number {
  const n = Number(s);
  return Number.isNaN(n) || n < 0 ? 0 : Math.floor(n);
}

export function SupplierProductCard({ product }: Props) {
  const { id, title, subTitle, image, qty: initialQty } = product;
  const { t } = useTranslation();

  const [reserveQtyDisplay, setReserveQtyDisplay] = useState("");
  const [basketQtyDisplay, setBasketQtyDisplay] = useState(() => {
    const q = initialQty ?? 0;
    return q === 0 ? "" : String(q);
  });
  const [isLoading, setIsLoading] = useState(false);

  const lastSuggestedQtyRef = useRef<number>(
    toNonNegativeNum(String(initialQty ?? "")),
  );
  const reserveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const basketDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextBasketDebounceRef = useRef(false);
  const reserveTouchedRef = useRef(false);
  const basketTouchedRef = useRef(false);

  const reserveQtyNum = toNonNegativeNum(reserveQtyDisplay);
  const basketQtyNum = toNonNegativeNum(basketQtyDisplay);

  const setReserveFromUser = useCallback((value: string) => {
    reserveTouchedRef.current = true;
    setReserveQtyDisplay(value);
  }, []);

  const setReserveClamped = useCallback((delta: number) => {
    reserveTouchedRef.current = true;
    setReserveQtyDisplay((prev) => {
      const n = toNonNegativeNum(prev) + delta;
      return n <= 0 ? "" : String(n);
    });
  }, []);

  const setBasketFromUser = useCallback((value: string) => {
    basketTouchedRef.current = true;
    skipNextBasketDebounceRef.current = false;
    setBasketQtyDisplay(value);
  }, []);

  const setBasketClamped = useCallback((delta: number) => {
    basketTouchedRef.current = true;
    skipNextBasketDebounceRef.current = false;
    setBasketQtyDisplay((prev) => {
      const n = toNonNegativeNum(prev) + delta;
      return n <= 0 ? "" : String(n);
    });
  }, []);

  const syncFromReserve = useCallback(async () => {
    const stock = reserveQtyNum;
    setIsLoading(true);
    try {
      const { data } = await api.post<{ suggestedQty: number }>(
        "/basket-suggest-qty",
        {
          orderRefDate: new Date().toISOString(),
          productUID: id,
          stock,
        },
      );
      const suggestedQty = data?.suggestedQty ?? 0;
      lastSuggestedQtyRef.current = suggestedQty;
      setBasketQtyDisplay(suggestedQty === 0 ? "" : String(suggestedQty));
      skipNextBasketDebounceRef.current = true;

      const addRes = await api.post<{ message?: string }>(
        "/basket-add-or-update",
        {
          productUID: id,
          qty: suggestedQty,
          stock,
          suggestedQty,
          comments: "",
        },
      );
      const msg = addRes.data?.message?.trim();
      toast.success(msg || t("basket_toast_success"));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    } finally {
      setIsLoading(false);
    }
  }, [id, reserveQtyNum, t]);

  const syncFromBasket = useCallback(async () => {
    if (skipNextBasketDebounceRef.current) {
      skipNextBasketDebounceRef.current = false;
      return;
    }
    const qty = basketQtyNum;
    setIsLoading(true);
    try {
      const suggestedQty = lastSuggestedQtyRef.current ?? qty;
      const res = await api.post<{ message?: string }>(
        "/basket-add-or-update",
        {
          productUID: id,
          qty,
          stock: reserveQtyNum,
          suggestedQty,
          comments: "",
        },
      );
      const msg = res.data?.message?.trim();
      toast.success(msg || t("basket_toast_success"));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    } finally {
      setIsLoading(false);
    }
  }, [id, basketQtyNum, reserveQtyNum, t]);

  useEffect(() => {
    if (!reserveTouchedRef.current) return;
    if (reserveDebounceRef.current) clearTimeout(reserveDebounceRef.current);
    reserveDebounceRef.current = setTimeout(syncFromReserve, DEBOUNCE_MS);
    return () => {
      if (reserveDebounceRef.current) clearTimeout(reserveDebounceRef.current);
    };
  }, [reserveQtyDisplay, syncFromReserve]);

  useEffect(() => {
    if (!basketTouchedRef.current) return;
    if (basketDebounceRef.current) clearTimeout(basketDebounceRef.current);
    basketDebounceRef.current = setTimeout(syncFromBasket, DEBOUNCE_MS);
    return () => {
      if (basketDebounceRef.current) clearTimeout(basketDebounceRef.current);
    };
  }, [basketQtyDisplay, syncFromBasket]);

  return (
    <article
      key={id}
      className="flex gap-2 items-center rounded-lg border border-slate-100 bg-app-card/95 p-2 shadow-sm"
    >
      {image && (
        <img
          src={image}
          alt={title}
          className="h-12 w-12  rounded bg-slate-50 object-contain"
        />
      )}
      <div className="min-w-0 flex-1 flex flex-col gap-1.5 md:flex-row md:items-center md:gap-4">
        <p className="text-sm font-medium text-slate-900 md:flex-1 md:min-w-0">
          {title}
        </p>
        <div className="flex flex-col gap-1.5 md:justify-center">
          {/* Reserve row: label + controls (same h-5, w-7 buttons, w-10 input) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 md:mb-0">
            <span className="w-16 ">{t("supplier_reserve")}</span>
            <div className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1 py-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-7"
                aria-label={t("aria_decrease_reserve")}
                onClick={() => setReserveClamped(-1)}
                disabled={isLoading}
              >
                -
              </Button>
              <Input
                type="number"
                min={0}
                value={reserveQtyDisplay}
                onChange={(e) => setReserveFromUser(e.target.value)}
                placeholder="0"
                className="h-5 w-10 border-0 bg-transparent p-0 text-center [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label={t("aria_reserve_quantity")}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-7"
                aria-label={t("aria_increase_reserve")}
                onClick={() => setReserveClamped(1)}
                disabled={isLoading}
              >
                +
              </Button>
            </div>
          </div>
          {/* Basket row: label + controls (same sizes) */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-900">
            <span className="w-16">{t("supplier_basket")}</span>
            <div className="inline-flex items-center gap-0.5 rounded border border-brand-200 bg-brand-50 px-1 py-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-7"
                aria-label={t("aria_decrease_basket")}
                onClick={() => setBasketClamped(-1)}
                disabled={isLoading}
              >
                -
              </Button>
              <Input
                type="number"
                min={0}
                value={basketQtyDisplay}
                onChange={(e) => setBasketFromUser(e.target.value)}
                placeholder="0"
                className="h-5 w-10 border-0 bg-transparent p-0 text-center [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label={t("aria_basket_quantity")}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-7"
                aria-label={t("aria_increase_basket")}
                onClick={() => setBasketClamped(1)}
                disabled={isLoading}
              >
                +
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
