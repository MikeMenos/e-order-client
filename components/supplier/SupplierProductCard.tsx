"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Star, Loader2 } from "lucide-react";
import { useTranslation } from "../../lib/i18n";
import { api } from "../../lib/api";
import { getApiErrorMessage } from "../../lib/api-error";
import { useWishlistToggle } from "../../hooks/useWishlistToggle";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { SupplierProduct } from "@/lib/types/supplier";

const DEBOUNCE_MS = 800;

type Props = {
  product: SupplierProduct;
  supplierUID?: string;
};

function toNonNegativeNum(s: string): number {
  const n = Number(s);
  return Number.isNaN(n) || n < 0 ? 0 : Math.floor(n);
}

export function SupplierProductCard({ product, supplierUID }: Props) {
  const {
    id,
    title,
    subTitle,
    image,
    isFavorite,
    favIconColor,
    qty: initialQty,
    productPackaging,
    suggestedQty: initialSuggestedQty,
  } = product;
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [reserveQtyDisplay, setReserveQtyDisplay] = useState(() => {
    const q = Math.max(0, Number(initialSuggestedQty) || 0);
    return q === 0 ? "" : String(q);
  });
  /** Basket input = total qty in basket for this product (from basket-items). User can increment or decrement; we send this total. */
  const [basketQtyDisplay, setBasketQtyDisplay] = useState(() => {
    const q = Math.max(0, Number(initialQty) || 0);
    return q === 0 ? "" : String(q);
  });
  const [isLoading, setIsLoading] = useState(false);

  const wishlistToggle = useWishlistToggle({
    supplierUID: supplierUID ?? undefined,
    onSuccess: (data) => {
      const msg = data?.message?.trim();
      if (msg) toast.success(msg);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });
  const isTogglingFavorite = wishlistToggle.isPending;

  const lastSuggestedQtyRef = useRef<number>(initialSuggestedQty ?? 0);
  const reserveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const basketDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextBasketDebounceRef = useRef(false);
  const reserveTouchedRef = useRef(false);
  const basketTouchedRef = useRef(false);
  const reserveOriginalValueOnFocusRef = useRef<string>("");
  const basketOriginalValueOnFocusRef = useRef<string>("");
  const reserveWasClearedOnFocusRef = useRef(false);
  const basketWasClearedOnFocusRef = useRef(false);

  const reserveQtyNum = toNonNegativeNum(reserveQtyDisplay);
  const basketQtyNum = toNonNegativeNum(basketQtyDisplay);

  const handleReserveFocus = useCallback(() => {
    // Store original value when focus happens (before Input component clears it)
    if (
      reserveQtyDisplay !== "" &&
      reserveOriginalValueOnFocusRef.current === ""
    ) {
      reserveOriginalValueOnFocusRef.current = reserveQtyDisplay;
    }
    // Note: Input component calls onChange("") BEFORE onFocus
    // So by the time this runs, reserveQtyDisplay might already be ""
    // The original value is captured in setReserveFromUser when onChange("") is called
    // Don't reset reserveWasClearedOnFocusRef here - it's set in setReserveFromUser
  }, [reserveQtyDisplay]);

  const handleBasketFocus = useCallback(() => {
    // Store original value when focus happens (before Input component clears it)
    if (
      basketQtyDisplay !== "" &&
      basketOriginalValueOnFocusRef.current === ""
    ) {
      basketOriginalValueOnFocusRef.current = basketQtyDisplay;
    }
    // Note: Input component calls onChange("") BEFORE onFocus
    // So by the time this runs, basketQtyDisplay might already be ""
    // The original value is captured in setBasketFromUser when onChange("") is called
    // Don't reset basketWasClearedOnFocusRef here - it's set in setBasketFromUser
  }, [basketQtyDisplay]);

  const setReserveFromUser = useCallback(
    (value: string) => {
      // If value becomes empty, we're likely clearing on focus
      // Capture the original value BEFORE it gets cleared (React state updates are async)
      if (value === "") {
        // Always capture the current display value if we don't have one stored yet
        // This handles the case where Input clears the value before onFocus runs
        if (
          reserveOriginalValueOnFocusRef.current === "" &&
          reserveQtyDisplay !== ""
        ) {
          reserveOriginalValueOnFocusRef.current = reserveQtyDisplay;
        }
        // Only proceed if we successfully captured a non-empty original value
        if (reserveOriginalValueOnFocusRef.current !== "") {
          reserveWasClearedOnFocusRef.current = true;
          reserveTouchedRef.current = false; // Don't trigger API call
          setReserveQtyDisplay(value);
          return;
        }
      }

      // User typed something, so it's a real change - mark as touched to allow API calls
      if (value !== "") {
        reserveWasClearedOnFocusRef.current = false;
        reserveTouchedRef.current = true;
        // Reset original value ref since user is making a real change
        reserveOriginalValueOnFocusRef.current = "";
      }
      setReserveQtyDisplay(value);
    },
    [reserveQtyDisplay],
  );

  const setBasketFromUser = useCallback(
    (value: string) => {
      // If value becomes empty, we're likely clearing on focus
      // Capture the original value BEFORE it gets cleared (React state updates are async)
      if (value === "") {
        // Always capture the current display value if we don't have one stored yet
        // This handles the case where Input clears the value before onFocus runs
        if (
          basketOriginalValueOnFocusRef.current === "" &&
          basketQtyDisplay !== ""
        ) {
          basketOriginalValueOnFocusRef.current = basketQtyDisplay;
        }
        // Only proceed if we successfully captured a non-empty original value
        if (basketOriginalValueOnFocusRef.current !== "") {
          basketWasClearedOnFocusRef.current = true;
          basketTouchedRef.current = false; // Don't trigger API call
          skipNextBasketDebounceRef.current = false;
          setBasketQtyDisplay(value);
          return;
        }
      }

      // User typed something, so it's a real change - mark as touched to allow API calls
      if (value !== "") {
        basketWasClearedOnFocusRef.current = false;
        basketTouchedRef.current = true;
        skipNextBasketDebounceRef.current = false;
        // Reset original value ref since user is making a real change
        basketOriginalValueOnFocusRef.current = "";
      }
      setBasketQtyDisplay(value);
    },
    [basketQtyDisplay],
  );

  const handleReserveBlur = useCallback(() => {
    // If value is empty and was cleared on focus, restore original without API call
    // Use refs to avoid stale closure issues
    if (
      reserveWasClearedOnFocusRef.current &&
      reserveOriginalValueOnFocusRef.current !== ""
    ) {
      const currentValue = reserveQtyDisplay;
      // Only restore if current value is empty (user didn't type anything)
      if (currentValue === "") {
        // Cancel any pending debounced calls
        if (reserveDebounceRef.current) {
          clearTimeout(reserveDebounceRef.current);
          reserveDebounceRef.current = null;
        }
        setReserveQtyDisplay(reserveOriginalValueOnFocusRef.current);
        reserveWasClearedOnFocusRef.current = false;
        reserveOriginalValueOnFocusRef.current = "";
        reserveTouchedRef.current = false; // Reset touched to prevent API call

        // Invalidate suppliers-list to refresh the data
        void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        return;
      }
    }

    // Only trigger API call if value actually changed from original
    const currentNum = toNonNegativeNum(reserveQtyDisplay);
    // Use stored original value, or fall back to initial suggested qty if not stored
    const originalValue =
      reserveOriginalValueOnFocusRef.current ||
      String(initialSuggestedQty ?? 0);
    const originalNum = toNonNegativeNum(originalValue);

    if (reserveTouchedRef.current && currentNum !== originalNum) {
      // Cancel any pending debounced calls
      if (reserveDebounceRef.current) {
        clearTimeout(reserveDebounceRef.current);
        reserveDebounceRef.current = null;
      }
      syncFromReserveRef.current();
    }

    // Reset refs
    reserveWasClearedOnFocusRef.current = false;
    reserveOriginalValueOnFocusRef.current = "";
    reserveTouchedRef.current = false;
  }, [reserveQtyDisplay, queryClient]);

  const handleBasketBlur = useCallback(() => {
    // If value is empty and was cleared on focus, restore original without API call
    if (basketWasClearedOnFocusRef.current && basketQtyDisplay === "") {
      // Cancel any pending debounced calls
      if (basketDebounceRef.current) {
        clearTimeout(basketDebounceRef.current);
        basketDebounceRef.current = null;
      }
      setBasketQtyDisplay(basketOriginalValueOnFocusRef.current);
      basketWasClearedOnFocusRef.current = false;
      basketOriginalValueOnFocusRef.current = "";
      basketTouchedRef.current = false; // Reset touched to prevent API call

      // Invalidate suppliers-list to refresh the data
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      return;
    }

    // Only trigger API call if value actually changed from original
    const currentNum = toNonNegativeNum(basketQtyDisplay);
    // Use stored original value, or fall back to initial qty if not stored
    const originalValue =
      basketOriginalValueOnFocusRef.current || String(initialQty ?? 0);
    const originalNum = toNonNegativeNum(originalValue);

    if (basketTouchedRef.current && currentNum !== originalNum) {
      // Cancel any pending debounced calls
      if (basketDebounceRef.current) {
        clearTimeout(basketDebounceRef.current);
        basketDebounceRef.current = null;
      }
      syncFromBasketRef.current();
    }

    // Reset refs
    basketWasClearedOnFocusRef.current = false;
    basketOriginalValueOnFocusRef.current = "";
    basketTouchedRef.current = false;
  }, [basketQtyDisplay, queryClient]);

  const setReserveClamped = useCallback(
    (delta: number) => {
      reserveTouchedRef.current = true;
      // Calculate new value first
      const currentNum = toNonNegativeNum(reserveQtyDisplay);
      const newNum = currentNum + delta;
      const newValue = newNum <= 0 ? "" : String(newNum);

      // Update state
      setReserveQtyDisplay(newValue);

      // Cancel any pending debounced calls
      if (reserveDebounceRef.current) {
        clearTimeout(reserveDebounceRef.current);
        reserveDebounceRef.current = null;
      }

      // Debounce API call for button clicks (800ms delay)
      if (newNum > 0) {
        reserveDebounceRef.current = setTimeout(() => {
          reserveDebounceRef.current = null;
          syncFromReserveRef.current();
        }, DEBOUNCE_MS);
      }
    },
    [reserveQtyDisplay],
  );

  const setBasketClamped = useCallback(
    (delta: number) => {
      basketTouchedRef.current = true;
      skipNextBasketDebounceRef.current = false;
      // Calculate new value first
      const currentNum = toNonNegativeNum(basketQtyDisplay);
      const newNum = currentNum + delta;
      const newValue = newNum <= 0 ? "" : String(newNum);

      // Update state
      setBasketQtyDisplay(newValue);

      // Cancel any pending debounced calls
      if (basketDebounceRef.current) {
        clearTimeout(basketDebounceRef.current);
        basketDebounceRef.current = null;
      }

      // Debounce API call for button clicks (800ms delay)
      if (newNum > 0) {
        basketDebounceRef.current = setTimeout(() => {
          basketDebounceRef.current = null;
          syncFromBasketRef.current();
        }, DEBOUNCE_MS);
      }
    },
    [basketQtyDisplay],
  );

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      if (e?.nativeEvent && !(e.nativeEvent as MouseEvent).isTrusted) return;
      wishlistToggle.mutate(id);
    },
    [id, wishlistToggle],
  );

  const syncFromReserve = useCallback(async () => {
    const stock = reserveQtyNum;
    setIsLoading(true);
    try {
      const { data } = await api.post<{ suggestedQty: number }>(
        "/basket-suggest-qty",
        {
          productUID: id,
          stock,
        },
      );
      const suggestedTotal = data?.suggestedQty ?? 0;
      lastSuggestedQtyRef.current = suggestedTotal;
      setBasketQtyDisplay(suggestedTotal === 0 ? "" : String(suggestedTotal));
      skipNextBasketDebounceRef.current = true;

      const addRes = await api.post<{ message?: string }>(
        "/basket-add-or-update",
        {
          productUID: id,
          qty: suggestedTotal,
          stock,
          suggestedQty: suggestedTotal,
          comments: "",
        },
      );
      const msg = addRes.data?.message?.trim();
      toast.success(msg || t("basket_toast_success"));
      if (supplierUID != null) {
        void queryClient.invalidateQueries({
          queryKey: ["supplier-products", supplierUID],
        });
      }
      void queryClient.invalidateQueries({ queryKey: ["basket-items"] });
      void queryClient.invalidateQueries({ queryKey: ["basket-counter"] });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    } finally {
      setIsLoading(false);
    }
  }, [id, reserveQtyNum, supplierUID, queryClient, t]);

  const syncFromBasket = useCallback(async () => {
    if (skipNextBasketDebounceRef.current) {
      skipNextBasketDebounceRef.current = false;
      return;
    }
    const qtyToSend = basketQtyNum;
    setIsLoading(true);
    try {
      const suggestedQty = lastSuggestedQtyRef.current ?? qtyToSend;
      const res = await api.post<{ message?: string }>(
        "/basket-add-or-update",
        {
          productUID: id,
          qty: qtyToSend,
          stock: reserveQtyNum,
          suggestedQty,
          comments: "",
        },
      );
      const msg = res.data?.message?.trim();
      toast.success(msg || t("basket_toast_success"));
      if (supplierUID != null) {
        void queryClient.invalidateQueries({
          queryKey: ["supplier-products", supplierUID],
        });
      }
      void queryClient.invalidateQueries({ queryKey: ["basket-items"] });
      void queryClient.invalidateQueries({ queryKey: ["basket-counter"] });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    } finally {
      setIsLoading(false);
    }
  }, [id, basketQtyNum, reserveQtyNum, supplierUID, queryClient, t]);

  const syncFromReserveRef = useRef(syncFromReserve);
  const syncFromBasketRef = useRef(syncFromBasket);
  syncFromReserveRef.current = syncFromReserve;
  syncFromBasketRef.current = syncFromBasket;

  useEffect(() => {
    const q = Math.max(0, Number(initialQty) || 0);
    setBasketQtyDisplay(q === 0 ? "" : String(q));
    skipNextBasketDebounceRef.current = true;
  }, [initialQty]);

  useEffect(() => {
    lastSuggestedQtyRef.current = initialSuggestedQty ?? 0;
  }, [initialSuggestedQty]);

  return (
    <article
      key={id}
      className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-app-card/95 p-3 shadow-sm"
    >
      {/* Title, subtitle, price (left) | Image, star (right) */}
      <div className="flex gap-2 items-start justify-between">
        <div className="min-w-0 flex-1">
          {supplierUID ? (
            <Link
              href={`/suppliers/${supplierUID}/product/${id}`}
              className="font-bold text-slate-900 leading-tight hover:text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
            >
              {title}
            </Link>
          ) : (
            <p className="font-bold text-slate-900 leading-tight">{title}</p>
          )}
          {subTitle ? (
            <p className="mt-0.5 text-base text-slate-700 leading-snug">
              {subTitle}
            </p>
          ) : null}
          {productPackaging ? (
            <p className="mt-0.5 text-base text-slate-700 leading-snug">
              {t("product_packaging")} {productPackaging}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-20 w-[100px] rounded border border-slate-200 bg-white object-contain object-left"
            />
          ) : null}
          <Button
            type="button"
            variant="ghost"
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className="px-2 flex shrink-0 items-center justify-center text-slate-400 hover:text-slate-600 disabled:pointer-events-none"
            title={isFavorite ? "Favorite" : undefined}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            {isTogglingFavorite ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Star
                className="h-5 w-5"
                fill={isFavorite ? (favIconColor ?? "#9CBDFA") : "transparent"}
                stroke={
                  isFavorite ? (favIconColor ?? "#9CBDFA") : "currentColor"
                }
                strokeWidth={1.5}
              />
            )}
          </Button>
        </div>
      </div>

      {/* Value inputs below: Reserve, then Basket */}
      <div className="flex gap-1.5 border-t border-slate-100 pt-2 justify-between">
        <div className="flex flex-col items-start gap-1.5 text-base text-slate-500">
          <span className="w-16">{t("supplier_reserve")}</span>
          <div className="inline-flex items-center overflow-hidden rounded-lg border bg-white">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 min-w-10 flex-1 basis-10 shrink-0 border-0 border-r bg-white p-0 text-2xl font-bold text-slate-900 hover:bg-emerald-50/50 disabled:opacity-50"
              aria-label={t("aria_decrease_reserve")}
              onClick={() => setReserveClamped(-1)}
              disabled={isLoading}
            >
              −
            </Button>
            <Input
              type="number"
              min={0}
              value={reserveQtyDisplay}
              onChange={(e) => setReserveFromUser(e.target.value)}
              onFocus={handleReserveFocus}
              onBlur={handleReserveBlur}
              placeholder="0"
              className="h-7 w-12 border-0 bg-brand-50 p-0 text-center text-lg rounded [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label={t("aria_reserve_quantity")}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 min-w-10 flex-1 basis-10 shrink-0 border-0 border-l bg-white p-0 text-2xl font-bold text-slate-900 hover:bg-emerald-50/50 disabled:opacity-50"
              aria-label={t("aria_increase_reserve")}
              onClick={() => setReserveClamped(1)}
              disabled={isLoading}
            >
              +
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-start gap-1.5 text-base text-slate-500">
          <span className="w-16">{t("supplier_basket")}</span>
          <div className="inline-flex items-center overflow-hidden rounded-lg border bg-white">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 min-w-10 flex-1 basis-10 shrink-0 border-0 border-r bg-white p-0 text-2xl font-bold text-slate-900 hover:bg-emerald-50/50 disabled:opacity-50"
              aria-label={t("aria_decrease_basket")}
              onClick={() => setBasketClamped(-1)}
              disabled={isLoading}
            >
              −
            </Button>
            <Input
              type="number"
              min={0}
              value={basketQtyDisplay}
              onChange={(e) => setBasketFromUser(e.target.value)}
              onFocus={handleBasketFocus}
              onBlur={handleBasketBlur}
              placeholder="0"
              className="h-7 w-12 border-0 bg-brand-50 p-0 text-center text-lg rounded [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label={t("aria_basket_quantity")}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 min-w-10 flex-1 basis-10 shrink-0 border-0 border-l  bg-white p-0 text-2xl font-bold text-slate-900 hover:bg-emerald-50/50 disabled:opacity-50"
              aria-label={t("aria_increase_basket")}
              onClick={() => setBasketClamped(1)}
              disabled={isLoading}
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
