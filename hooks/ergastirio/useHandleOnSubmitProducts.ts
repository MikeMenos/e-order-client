"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getFirstBasketKey,
  useAddToCart,
} from "@/hooks/ergastirio/useAddToCart";
import { useGetCart } from "@/hooks/ergastirio/useGetCart";
import type {
  AddToCartPayload,
  IProductItem,
} from "@/lib/ergastirio-interfaces";
import { buildUpdatedLines } from "@/lib/ergastirio-utils";
import { ergastirioStore } from "@/stores/ergastirioStore";
import { useTranslation } from "@/lib/i18n";

export function useHandleOnSubmitProducts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { currentBranch, setBasketId } = ergastirioStore();

  const trdr = currentBranch?.TRDR;
  const branch = currentBranch?.BRANCH;

  const { data: cartData } = useGetCart({ trdr, branch });
  const { mutateAsync: addToCartMutation, isPending } = useAddToCart();

  const onSubmitProducts = async (
    product: IProductItem,
    qty: number,
    isDelete?: boolean,
  ) => {
    // Read latest basketId from store so we reuse an already-fetched key (e.g. from a previous add in the same session)
    let effectiveBasketId = ergastirioStore.getState().basketId;

    if (currentBranch?.BASKET_KEY === "0" && !effectiveBasketId) {
      const trdrNum = Number(currentBranch.TRDR);
      const b = Number(currentBranch.BRANCH);
      if (Number.isNaN(trdrNum) || Number.isNaN(b)) {
        toast.error(t("erg_toast_wrong_store"));
        return;
      }
      try {
        const id = await getFirstBasketKey({ trdr: trdrNum, branch: b });
        if (!id) {
          toast.error(t("erg_toast_basket_not_created"));
          return;
        }
        setBasketId(id);
        effectiveBasketId = id;
        queryClient.invalidateQueries({ queryKey: ["ergastirio", "cart"] });
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
      toast.success(
        isDelete
          ? t("erg_toast_removed_from_cart")
          : t("erg_toast_cart_updated"),
      );
    } catch {
      // errorToast in mutation
    }
  };

  return { onSubmitProducts, isPending };
}
