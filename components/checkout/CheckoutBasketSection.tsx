"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { getApiErrorMessage } from "@/lib/api-error";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckoutSectionHeading } from "./CheckoutSectionHeading";
import {
  useBasketItems,
  useBasketRemoveItem,
  useBasketAddOrUpdate,
} from "@/hooks/useBasket";
import type {
  BasketGetItemsResponse,
  BasketGetItemsProduct,
} from "@/lib/types/checkout-basket";

function toNonNegativeNum(s: string): number {
  const n = Number(s);
  return Number.isNaN(n) || n < 0 ? 0 : Math.floor(n);
}

type Props = {
  supplierUID: string;
  onHasItemsChange?: (hasItems: boolean) => void;
};

const DEBOUNCE_MS = 800;

function BasketItemRow({
  item,
  onRemove,
  onQtyChange,
  isRemoving,
  isUpdating,
}: {
  item: BasketGetItemsProduct;
  onRemove: () => void;
  onQtyChange: (newQty: number) => Promise<void>;
  isRemoving: boolean;
  isUpdating: boolean;
}) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(
    item.qty <= 0 ? "" : String(item.qty),
  );
  const isBusy = isRemoving || isUpdating;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingQtyRef = useRef<number>(item.qty);
  const originalValueOnFocusRef = useRef<string>("");
  const wasClearedOnFocusRef = useRef(false);

  useEffect(() => {
    setInputValue(item.qty <= 0 ? "" : String(item.qty));
  }, [item.qty]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const scheduleQtyUpdate = useCallback(
    (next: number) => {
      pendingQtyRef.current = next;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        onQtyChange(pendingQtyRef.current);
      }, DEBOUNCE_MS);
    },
    [onQtyChange],
  );

  const handleDecrement = () => {
    const n = toNonNegativeNum(inputValue || String(item.qty));
    if (n <= 1) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      onRemove();
      return;
    }
    const next = n - 1;
    setInputValue(String(next));
    // Debounce API call for button clicks (800ms delay)
    scheduleQtyUpdate(next);
  };

  const handleIncrement = () => {
    const n = toNonNegativeNum(inputValue || String(item.qty));
    const next = n + 1;
    setInputValue(String(next));
    // Debounce API call for button clicks (800ms delay)
    scheduleQtyUpdate(next);
  };

  const handleInputFocus = () => {
    // Store original value when focus happens (before Input component clears it)
    if (inputValue !== "" && originalValueOnFocusRef.current === "") {
      originalValueOnFocusRef.current = inputValue;
    }
    // Note: Input component calls onChange("") BEFORE onFocus
    // So by the time this runs, inputValue might already be ""
    // The original value is captured in handleInputChange when onChange("") is called
    // Don't reset wasClearedOnFocusRef here - it's set in handleInputChange
  };

  const handleInputChange = (value: string) => {
    // If value becomes empty, we're likely clearing on focus
    // Capture the original value BEFORE it gets cleared (React state updates are async)
    if (value === "") {
      // Always capture the current display value if we don't have one stored yet
      // This handles the case where Input clears the value before onFocus runs
      if (originalValueOnFocusRef.current === "" && inputValue !== "") {
        originalValueOnFocusRef.current = inputValue;
      }
      // Only proceed if we successfully captured a non-empty original value
      if (originalValueOnFocusRef.current !== "") {
        wasClearedOnFocusRef.current = true;
        // Don't schedule update - this is just clearing on focus
        setInputValue(value);
        return;
      }
    }

    // User typed something, so it's a real change
    if (value !== "") {
      wasClearedOnFocusRef.current = false;
      // Reset original value ref since user is making a real change
      originalValueOnFocusRef.current = "";
    }

    setInputValue(value);
  };

  const handleInputBlur = () => {
    // If value is empty and was cleared on focus, restore original without API call
    // Use refs to avoid stale closure issues
    if (
      wasClearedOnFocusRef.current &&
      originalValueOnFocusRef.current !== ""
    ) {
      const currentValue = inputValue;
      // Only restore if current value is empty (user didn't type anything)
      if (currentValue === "") {
        // Cancel any pending debounced calls
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }
        setInputValue(originalValueOnFocusRef.current);
        wasClearedOnFocusRef.current = false;
        originalValueOnFocusRef.current = "";
        return;
      }
    }

    const n = toNonNegativeNum(inputValue);
    if (n === 0) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      onRemove();
      return;
    }

    // Normalize the display value
    setInputValue(String(n));

    // Only trigger API call if value actually changed from original
    const originalNum = toNonNegativeNum(
      originalValueOnFocusRef.current || String(item.qty),
    );
    if (n !== originalNum) {
      // Cancel any pending debounced calls
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      scheduleQtyUpdate(n);
    } else if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    wasClearedOnFocusRef.current = false;
    originalValueOnFocusRef.current = "";
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <li className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">{item.productTitle || "—"}</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="text-base text-slate-600 shrink-0">
            {t("checkout_quantity")}:
          </span>
          <div className="inline-flex items-center overflow-hidden rounded-lg border bg-white">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 min-w-10 flex-1 basis-10 shrink-0 border-0 border-r  bg-white p-0 text-2xl font-semibold text-slate-900 hover:bg-emerald-50/50 disabled:opacity-50"
              aria-label={t("aria_decrease_basket")}
              onClick={handleDecrement}
              disabled={isBusy}
            >
              −
            </Button>
            <Input
              type="number"
              min={0}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              placeholder="0"
              className="h-7 w-12 border-0 bg-brand-50 p-0 text-center text-lg [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label={t("aria_basket_quantity")}
              disabled={isBusy}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 min-w-10 flex-1 basis-10 shrink-0 border  bg-white p-0 text-2xl font-semibold text-slate-900 hover:bg-emerald-50/50 disabled:opacity-50"
              aria-label={t("aria_increase_basket")}
              onClick={handleIncrement}
              disabled={isBusy}
            >
              +
            </Button>
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
        aria-label={t("checkout_remove_item")}
        onClick={onRemove}
        disabled={isBusy}
      >
        {isRemoving ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Trash2 className="h-5 w-5" />
        )}
      </Button>
    </li>
  );
}

export function CheckoutBasketSection({
  supplierUID,
  onHasItemsChange,
}: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, error } = useBasketItems({
    SupplierUID: supplierUID,
    enabled: !!supplierUID,
  });
  const typedData = data as BasketGetItemsResponse | undefined;
  const basket =
    typedData?.basketsList?.find((b) => b.supplierUID === supplierUID) ??
    typedData?.basketsList?.[0];
  const items = (basket?.items ?? []) as BasketGetItemsProduct[];

  const [removingBasketUID, setRemovingBasketUID] = useState<string | null>(
    null,
  );
  const [updatingProductUID, setUpdatingProductUID] = useState<string | null>(
    null,
  );
  const hasItems = items.length > 0;

  const removeItemMutation = useBasketRemoveItem({
    supplierUID,
    onSuccess: (d) => {
      toast.success(d?.message?.trim() || t("checkout_remove_item"));
      setRemovingBasketUID(null);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
      setRemovingBasketUID(null);
    },
  });

  const addOrUpdateMutation = useBasketAddOrUpdate({
    supplierUID,
    onSuccess: () => {
      setUpdatingProductUID(null);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
      setUpdatingProductUID(null);
    },
  });

  useEffect(() => {
    onHasItemsChange?.(hasItems);
  }, [hasItems, onHasItemsChange]);

  const handleRemove = useCallback(
    (basketUID: string) => {
      setRemovingBasketUID(basketUID);
      removeItemMutation.mutate(basketUID);
    },
    [removeItemMutation],
  );

  const handleQtyChange = useCallback(
    async (item: BasketGetItemsProduct, newQty: number) => {
      if (newQty < 1) {
        handleRemove(item.basketUID);
        return;
      }
      setUpdatingProductUID(item.productUID);
      try {
        await addOrUpdateMutation.mutateAsync({
          productUID: item.productUID,
          qty: newQty,
          stock: 0,
          suggestedQty: 0,
          comments: item.comments ?? "",
        });
      } finally {
        setUpdatingProductUID(null);
      }
    },
    [handleRemove, addOrUpdateMutation],
  );

  return (
    <section className="mb-6">
      <CheckoutSectionHeading labelKey="checkout_basket_items" />
      {isLoading && <p className=" text-slate-500">{t("suppliers_loading")}</p>}
      {isError && (
        <p className=" text-red-500">
          {error instanceof Error ? error.message : t("basket_error")}
        </p>
      )}
      {!isLoading && !isError && items.length === 0 && (
        <p className="text-slate-500 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
          {t("checkout_basket_empty")}
        </p>
      )}
      {!isLoading && !isError && items.length > 0 && (
        <ul className="max-h-[50vh] space-y-1 mb-1 overflow-y-auto pr-1">
          {items.map((item) => (
            <BasketItemRow
              key={item.basketUID}
              item={item}
              onRemove={() => handleRemove(item.basketUID)}
              onQtyChange={(newQty) => handleQtyChange(item, newQty)}
              isRemoving={removingBasketUID === item.basketUID}
              isUpdating={updatingProductUID === item.productUID}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
