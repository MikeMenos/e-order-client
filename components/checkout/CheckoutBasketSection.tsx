"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { CheckoutSectionHeading } from "./CheckoutSectionHeading";
import type {
  BasketGetItemsResponse,
  BasketGetItemsProduct,
} from "./checkout-basket-types";

type Props = {
  supplierUID: string;
};

const BASKET_ITEMS_QUERY_KEY = "basket-items";

function useBasketItems(supplierUID: string) {
  return useQuery({
    queryKey: [BASKET_ITEMS_QUERY_KEY, supplierUID],
    queryFn: async () => {
      const res = await api.get<BasketGetItemsResponse>("/basket-items", {
        params: { SupplierUID: supplierUID },
      });
      return res.data;
    },
    enabled: !!supplierUID,
  });
}

function BasketItemRow({
  item,
  onRemove,
  isRemoving,
}: {
  item: BasketGetItemsProduct;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  const { t } = useTranslation();
  return (
    <li className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2">
      {item.productImage ? (
        <img
          src={item.productImage}
          alt=""
          className="h-12 w-12 shrink-0 rounded object-contain bg-white"
        />
      ) : (
        <div className="h-12 w-12 shrink-0 rounded bg-slate-200" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">{item.productTitle || "—"}</p>
        <div className="mt-0.5 flex items-center gap-2 text-sm text-slate-600">
          <span>
            {t("checkout_quantity")}:{" "}
            <span className="font-bold">{item.qty}</span>
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-12 w-12 shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
        aria-label={t("checkout_remove_item")}
        onClick={onRemove}
        disabled={isRemoving}
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

export function CheckoutBasketSection({ supplierUID }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useBasketItems(supplierUID);
  const [removingBasketUID, setRemovingBasketUID] = useState<string | null>(
    null,
  );

  const basket =
    data?.basketsList?.find((b) => b.supplierUID === supplierUID) ??
    data?.basketsList?.[0];
  const items = basket?.items ?? [];

  const handleRemove = async (basketUID: string) => {
    setRemovingBasketUID(basketUID);
    try {
      const res = await api.post<{ message?: string }>("/basket-remove-item", {
        basketUID,
      });
      const msg = res.data?.message?.trim();
      toast.success(msg || t("checkout_remove_item"));
      await queryClient.invalidateQueries({
        queryKey: [BASKET_ITEMS_QUERY_KEY, supplierUID],
      });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    } finally {
      setRemovingBasketUID(null);
    }
  };

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
              isRemoving={removingBasketUID === item.basketUID}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
