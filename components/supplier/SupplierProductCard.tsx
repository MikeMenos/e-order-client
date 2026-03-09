"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Star, Loader2 } from "lucide-react";
import { useTranslation } from "../../lib/i18n";
import { api } from "../../lib/api";
import { useBasketItems, useBasketRemoveItem } from "@/hooks/useBasket";
import { getApiErrorMessage } from "../../lib/api-error";
import { useWishlistToggle } from "../../hooks/useWishlistToggle";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Stepper } from "../ui/stepper";
import type { SupplierProduct } from "@/lib/types/supplier";

const DEBOUNCE_MS = 800;

type Props = {
  product: SupplierProduct;
  supplierUID?: string;
  compact?: boolean;
};

function toNonNegativeNum(s: string): number {
  const n = Number(s);
  return Number.isNaN(n) || n < 0 ? 0 : Math.floor(n);
}

export function SupplierProductCard({
  product,
  supplierUID,
  compact = false,
}: Props) {
  const { hasAccess } = useUserPermissions();
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

  const [basketQtyDisplay, setBasketQtyDisplay] = useState(() => {
    const q = Math.max(0, Number(initialQty) || 0);
    return q === 0 ? "" : String(q);
  });
  const [isLoading, setIsLoading] = useState(false);

  const wishlistToggle = useWishlistToggle({
    supplierUID: supplierUID ?? undefined,
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });
  const isTogglingFavorite = wishlistToggle.isPending;

  useBasketItems({
    SupplierUID: supplierUID ?? undefined,
    enabled: !!supplierUID,
  });
  const removeItemMutation = useBasketRemoveItem({
    supplierUID: supplierUID ?? undefined,
    onSuccess: () => {
      if (supplierUID != null) {
        void queryClient.invalidateQueries({
          queryKey: ["supplier-products", supplierUID],
        });
      }
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });

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
  }, [reserveQtyDisplay]);

  const handleBasketFocus = useCallback(() => {
    // Store original value when focus happens (before Input component clears it)
    if (
      basketQtyDisplay !== "" &&
      basketOriginalValueOnFocusRef.current === ""
    ) {
      basketOriginalValueOnFocusRef.current = basketQtyDisplay;
    }
  }, [basketQtyDisplay]);

  const setReserveFromUser = useCallback(
    (value: string) => {
      if (value === "") {
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
      const newValue = newNum <= 0 ? "0" : String(newNum);

      // Update state
      setBasketQtyDisplay(newValue);

      // Cancel any pending debounced calls
      if (basketDebounceRef.current) {
        clearTimeout(basketDebounceRef.current);
        basketDebounceRef.current = null;
      }

      if (newNum === 0) {
        basketDebounceRef.current = setTimeout(() => {
          basketDebounceRef.current = null;
          syncFromBasketRef.current(0);
        }, DEBOUNCE_MS);
      } else if (newNum > 0) {
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
      if (hasAccess("P6")) wishlistToggle.mutate({ productUID: id, rank: 0 });
    },
    [id, wishlistToggle, hasAccess],
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

  const syncFromBasket = useCallback(
    async (overrideQty?: number) => {
      if (skipNextBasketDebounceRef.current) {
        skipNextBasketDebounceRef.current = false;
        return;
      }
      const qtyToSend = overrideQty ?? basketQtyNum;
      setIsLoading(true);
      try {
        if (qtyToSend === 0 && supplierUID) {
          let data = queryClient.getQueryData<{
            basketsList?: Array<{
              supplierUID: string;
              items?: Array<{ basketUID: string; productUID: string }>;
            }>;
          }>(["basket-items", supplierUID]);
          if (!data) {
            const res = await api.get<typeof data>("/basket-items", {
              params: { SupplierUID: supplierUID },
            });
            data = res.data;
          }
          const basket = data?.basketsList?.find(
            (b) => b.supplierUID === supplierUID,
          );
          const item = basket?.items?.find((i) => i.productUID === id);
          if (item?.basketUID) {
            await removeItemMutation.mutateAsync(item.basketUID);
          }
        } else {
          const suggestedQty = lastSuggestedQtyRef.current ?? qtyToSend;
          await api.post<{ message?: string }>("/basket-add-or-update", {
            productUID: id,
            qty: qtyToSend,
            stock: reserveQtyNum,
            suggestedQty,
            comments: "",
          });
          if (supplierUID != null) {
            void queryClient.invalidateQueries({
              queryKey: ["supplier-products", supplierUID],
            });
          }
          void queryClient.invalidateQueries({ queryKey: ["basket-items"] });
          void queryClient.invalidateQueries({ queryKey: ["basket-counter"] });
        }
      } catch (err: unknown) {
        toast.error(getApiErrorMessage(err, t("basket_error")));
      } finally {
        setIsLoading(false);
      }
    },
    [
      id,
      basketQtyNum,
      reserveQtyNum,
      supplierUID,
      queryClient,
      t,
      removeItemMutation,
    ],
  );

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
      className={cn(
        "flex flex-col rounded-lg border border-slate-200 bg-white px-2",
        compact ? "gap-0.5 py-1.5" : "gap-1 py-2",
      )}
    >
      {/* Title, subtitle, price (left) | Image, star (right) */}
      <div
        className={cn(
          "flex items-center justify-between",
          compact ? "gap-1.5" : "gap-2",
        )}
      >
        <div className="min-w-0 flex-1">
          {supplierUID ? (
            <Link
              href={`/suppliers/${supplierUID}/product/${id}`}
              className={cn(
                "font-bold text-slate-900 leading-tight hover:text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded",
                compact && "text-base",
              )}
            >
              {title}
            </Link>
          ) : (
            <p
              className={cn(
                "font-bold text-slate-900 leading-tight",
                compact && "text-base",
              )}
            >
              {title}
            </p>
          )}
          {!compact && subTitle ? (
            <p className="mt-0.5 text-base text-slate-700 leading-snug">
              {subTitle}
            </p>
          ) : null}
        </div>
        <div className={cn("flex shrink-0 items-center gap-2")}>
          {image ? (
            <img
              src={image}
              alt={title}
              className={cn("rounded object-contain object-center h-14 w-14")}
            />
          ) : null}
          {hasAccess("P6") && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
              className={cn(
                "flex shrink-0 items-center justify-center text-slate-400 hover:text-slate-600 disabled:pointer-events-none",
                compact ? "p-1" : "px-2",
              )}
              title={isFavorite ? "Favorite" : undefined}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              {isTogglingFavorite ? (
                <Loader2
                  className={cn("animate-spin", "h-7 w-7")}
                  aria-hidden
                />
              ) : (
                <Star
                  className="h-7 w-7"
                  fill={
                    isFavorite ? (favIconColor ?? "#9CBDFA") : "transparent"
                  }
                  stroke={
                    isFavorite ? (favIconColor ?? "#9CBDFA") : "currentColor"
                  }
                  strokeWidth={1.5}
                />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Value inputs below: Reserve, then Basket (hidden in compact mode) */}
      {!compact && (
        <div className="flex justify-between gap-2 border-t border-slate-100 pt-1">
          <Stepper
            label={t("supplier_reserve")}
            value={reserveQtyDisplay}
            onDec={() => setReserveClamped(-1)}
            onInc={() => setReserveClamped(1)}
            onChange={(e) => setReserveFromUser(e.target.value)}
            onFocus={handleReserveFocus}
            onBlur={handleReserveBlur}
            ariaDec={t("aria_decrease_reserve")}
            ariaInc={t("aria_increase_reserve")}
            ariaValue={t("aria_reserve_quantity")}
            disabled={isLoading}
            tone="reserve"
          />

          <Stepper
            label={t("supplier_basket")}
            value={basketQtyDisplay}
            onDec={() => setBasketClamped(-1)}
            onInc={() => setBasketClamped(1)}
            onChange={(e) => setBasketFromUser(e.target.value)}
            onFocus={handleBasketFocus}
            onBlur={handleBasketBlur}
            ariaDec={t("aria_decrease_basket")}
            ariaInc={t("aria_increase_basket")}
            ariaValue={t("aria_basket_quantity")}
            disabled={isLoading}
            tone="basket"
          />
        </div>
      )}
    </article>
  );
}
