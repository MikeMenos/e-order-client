"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getFirstBasketKey, useAddToCart } from "@/hooks/ergastirio/useAddToCart";
import { useGetCart } from "@/hooks/ergastirio/useGetCart";
import type { AddToCartPayload, IProductItem } from "@/lib/ergastirio-interfaces";
import { buildUpdatedLines } from "@/lib/ergastirio-utils";
import { useGetClientsAll } from "@/hooks/ergastirio/useGetClientsAll";
import { ergastirioStore } from "@/stores/ergastirioStore";
import { useTranslation } from "@/lib/i18n";

export function useHandleOnSubmitProducts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { basketId, vat, currentBranch, setBasketId, setCurrentBranch } =
    ergastirioStore();

  const isSpecialAfm = vat === "999999999" || vat === "987654321";
  const { refetch: refetchClientsAll } = useGetClientsAll(isSpecialAfm);

  const trdr = currentBranch?.TRDR;
  const branch = currentBranch?.BRANCH;

  const { data: cartData } = useGetCart({ trdr, branch });
  const { mutateAsync: addToCartMutation, isPending } = useAddToCart();

  const onSubmitProducts = async (
    product: IProductItem,
    qty: number,
    isDelete?: boolean
  ) => {
    let effectiveBasketId = basketId;

    if (currentBranch?.BASKET_KEY === "0") {
      const t = Number(currentBranch.TRDR);
      const b = Number(currentBranch.BRANCH);
      if (Number.isNaN(t) || Number.isNaN(b)) {
        toast.error(t("erg_toast_wrong_store"));
        return;
      }
      try {
        const id = await getFirstBasketKey({ trdr: t, branch: b });
        if (!id) {
          toast.error(t("erg_toast_basket_not_created"));
          return;
        }
        setBasketId(id);
        effectiveBasketId = id;
        queryClient.invalidateQueries({ queryKey: ["ergastirio", "cart"] });
        if (isSpecialAfm) {
          const { data: res } = await refetchClientsAll();
          const updated = res?.data?.find(
            (x) =>
              String(x.TRDR) === String(currentBranch.TRDR) &&
              String(x.BRANCH) === String(currentBranch.BRANCH)
          );
          if (updated) setCurrentBranch(updated);
        }
      } catch {
        toast.error(t("erg_toast_basket_create_error"));
        return;
      }
    }

    if (!effectiveBasketId) {
      toast.error(t("erg_toast_basket_not_found"));
      return;
    }

    const updatedLines = buildUpdatedLines({
      cartLines: cartData?.data,
      product,
      qty,
      isDelete,
    });

    const payload: AddToCartPayload = {
      service: "setData",
      OBJECT: "SALDOC",
      KEY: effectiveBasketId,
      LOCATEINFO:
        "ITELINES:MTRL,LINENUM,QTY1,QTY2,MTRL_MTRL_CODE,MTRL_MTRL_NAME",
      data: {
        ITELINES:
          updatedLines?.length === 0 && isDelete
            ? [{ MTRL: 2924, QTY2: 0.1 }]
            : updatedLines,
      },
    };

    try {
      await addToCartMutation(payload);
      if (vat === "999999999") {
        queryClient.invalidateQueries({ queryKey: ["ergastirio", "cart-pricing"] });
      }
      toast.success(
        isDelete ? t("erg_toast_removed_from_cart") : t("erg_toast_cart_updated")
      );
    } catch {
      // errorToast in mutation
    }
  };

  return { onSubmitProducts, isPending };
}
