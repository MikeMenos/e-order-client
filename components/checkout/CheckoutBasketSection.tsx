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
} from "./checkout-basket-types";

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
    scheduleQtyUpdate(next);
  };

  const handleIncrement = () => {
    const n = toNonNegativeNum(inputValue || String(item.qty));
    const next = n + 1;
    setInputValue(String(next));
    scheduleQtyUpdate(next);
  };

  const handleInputBlur = () => {
    const n = toNonNegativeNum(inputValue);
    if (n === 0) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      onRemove();
      return;
    }
    setInputValue(String(n));
    if (n !== item.qty) {
      scheduleQtyUpdate(n);
    } else if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
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
          <span className="text-sm text-slate-600 shrink-0">
            {t("checkout_quantity")}:
          </span>
          <div className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1 py-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-base"
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
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              placeholder="0"
              className="h-7 w-12 border-0 bg-transparent p-0 text-center text-base [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label={t("aria_basket_quantity")}
              disabled={isBusy}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-base"
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
    onSuccess: (d) => {
      toast.success(d?.message?.trim() || t("basket_toast_success"));
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
        <p className=" text-slate-500">{t("checkout_basket_empty")}</p>
      )}
      {!isLoading && !isError && items.length > 0 && (
        <ul className="max-h-[50vh] space-y-1 overflow-y-auto pr-1">
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
