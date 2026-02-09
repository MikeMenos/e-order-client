"use client";

import { useCallback, useMemo, useState } from "react";
import { ErgastirioCartCheckoutDialog } from "@/components/ergastirio/CartCheckoutDialog";
import { ErgastirioCartTotals } from "@/components/ergastirio/CartTotals";
import ErgastirioEmptyCart from "@/components/ergastirio/EmptyCart";
import { ErgastirioOrderSummary } from "@/components/ergastirio/OrderSummary";
import Loading from "@/components/ui/loading";
import { useAddToCart } from "@/hooks/ergastirio/useAddToCart";
import { useGetCart } from "@/hooks/ergastirio/useGetCart";
import { useGetCartPricing } from "@/hooks/ergastirio/useGetCartPricing";
import type { AddToCartPayload, IProductItem } from "@/lib/ergastirio-interfaces";
import { ergastirioStore } from "@/stores/ergastirioStore";
import toast from "react-hot-toast";
import { useTranslation } from "@/lib/i18n";

const BASE_LINENUM = 9000001;

export default function ErgastirioCartPage() {
  const { t } = useTranslation();
  const { basketId, vat, currentBranch } = ergastirioStore();
  const [editedQuantities, setEditedQuantities] = useState<
    Record<number, number>
  >({});
  const [comments, setComments] = useState("");
  const [delivDate, setDelivDate] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const trdr = currentBranch?.TRDR ? String(currentBranch.TRDR) : undefined;
  const branch = currentBranch?.BRANCH
    ? String(currentBranch.BRANCH)
    : undefined;

  const { data, isLoading } = useGetCart({ trdr, branch });
  const isVat999999999 = vat === "999999999";
  const { data: pricingData, isLoading: isPricingLoading } = useGetCartPricing({
    basketId: basketId ?? undefined,
    enabled: isVat999999999,
  });

  const enrichedCart = useMemo(() => {
    if (!data?.data) return data;
    if (!isVat999999999 || !pricingData?.data?.ITELINES) return data;
    const itelines = pricingData.data.ITELINES;
    const enriched = data.data.map((item: IProductItem) => {
      const match = itelines.find(
        (line: { MTRL: string }) => String(line.MTRL) === String(item.MTRL)
      );
      if (!match) return item;
      return {
        ...item,
        LINEVAL: match.LINEVAL,
        SXPERC: match.SXPERC,
      };
    });
    return { ...data, data: enriched };
  }, [data, isVat999999999, pricingData?.data?.ITELINES]);

  const sumAmnt = pricingData?.data?.SALDOC?.[0]?.SUMAMNT;

  const cartForDisplay = useMemo(() => {
    if (!enrichedCart?.data) return enrichedCart;
    const hasEdits = Object.keys(editedQuantities).length > 0;
    if (!hasEdits) return enrichedCart;
    return {
      ...enrichedCart,
      data: enrichedCart.data.map((item: IProductItem) => {
        const edited = editedQuantities[Number(item.MTRL)];
        if (edited === undefined) return item;
        return { ...item, Qty2: edited };
      }),
    };
  }, [enrichedCart, editedQuantities]);

  const { mutateAsync: addToCart, isPending } = useAddToCart();

  const handleSendOrder = useCallback(
    async ({
      comments: c,
      delivDate: d,
    }: {
      comments: string;
      delivDate: string;
    }) => {
      if (!data?.data?.length || !basketId || !currentBranch) return;

      const existingLines = data.data.map((line: IProductItem, index: number) => ({
        LINENUM: BASE_LINENUM + index,
        MTRL: Number(line.MTRL),
        QTY2: Number(line.Qty2),
      }));

      const updatedLines = existingLines.map((line) => {
        const delta = editedQuantities[line.MTRL];
        if (delta === undefined) return line;
        return { ...line, QTY2: delta };
      });

      const series =
        currentBranch.GROUP_CHAIN === "L'ARTIGIANO" ? "7020" : "7024";
      const orderComments =
        vat === "999999999"
          ? `Order16: ${c}`
          : vat === "987654321"
            ? `FromC: ${c}`
            : c;

      const orderPayload: AddToCartPayload = {
        service: "setData",
        OBJECT: "SALDOC",
        KEY: "",
        data: {
          SALDOC: [
            {
              SERIES: series,
              TRDR: Number(currentBranch.TRDR),
              TRDBRANCH: Number(currentBranch.BRANCH),
              PAYMENT: 1003,
              TRUCKS: 2,
              DELIVDATE: d,
              COMMENTS: orderComments,
              REMARKS: "",
            },
          ],
          MTRDOC: [
            {
              TRUCKS: 2,
              DELIVDATE: d,
              DEPTRDR:
                currentBranch.GROUP_CHAIN === "L'ARTIGIANO" ? 185 : undefined,
              BILLTRDR:
                currentBranch.GROUP_CHAIN === "L'ARTIGIANO" ? 185 : undefined,
            },
          ],
          ITELINES: updatedLines,
        },
      };

      const basketDeletionPayload: AddToCartPayload = {
        service: "setData",
        OBJECT: "SALDOC",
        KEY: basketId,
        data: {
          SALDOC: [
            {
              SERIES: "7001",
              TRDR: Number(currentBranch.TRDR),
              TRDBRANCH: Number(currentBranch.BRANCH),
              PAYMENT: 1003,
              TRUCKS: 2,
              DELIVDATE: "",
              COMMENTS: "",
              REMARKS: "",
            },
          ],
          MTRDOC: [{ TRUCKS: 2, DELIVDATE: "" }],
          ITELINES: [{ MTRL: 2924, QTY2: 0.1 }],
        },
      };

      try {
        await addToCart(orderPayload);
        await addToCart(basketDeletionPayload);
        toast.success(t("erg_toast_order_sent"));
        setComments("");
        setDelivDate("");
        setEditedQuantities({});
        setCheckoutOpen(false);
      } catch {
        // toast handled by useAddToCart
      }
    },
    [
      addToCart,
      basketId,
      currentBranch,
      data?.data,
      editedQuantities,
      vat,
    ]
  );

  const handleQtyEdit = useCallback((product: IProductItem, newQty: number) => {
    setEditedQuantities((prev) => ({
      ...prev,
      [Number(product.MTRL)]: newQty,
    }));
  }, []);

  if (isLoading) return <Loading />;
  if (data?.count === 0) return <ErgastirioEmptyCart />;

  const orderDetailsContent = (
    <div className="space-y-4">
      <ErgastirioCartTotals
        items={data?.data}
        onSendOrder={handleSendOrder}
        comments={comments}
        setComments={setComments}
        delivDate={delivDate}
        setDelivDate={setDelivDate}
        isPending={isPending}
        currentBranch={currentBranch}
      />
    </div>
  );

  return (
    <>
      <div className="pb-36 md:pb-24">
        <ErgastirioOrderSummary
          items={cartForDisplay}
          onQtyChange={handleQtyEdit}
          showVatPricing={isVat999999999}
          isPricingLoading={isPricingLoading}
          sumAmnt={sumAmnt}
        />
      </div>
      <ErgastirioCartCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        showVatPricing={isVat999999999}
        sumAmnt={sumAmnt}
        isPricingLoading={isPricingLoading}
      >
        {orderDetailsContent}
      </ErgastirioCartCheckoutDialog>
    </>
  );
}
