"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSupplierDisplay } from "@/hooks/useSupplier";
import { useBasketItems } from "@/hooks/useBasket";
import { useOrderAdd } from "@/hooks/useOrderAdd";
import { useOrderTempSave } from "@/hooks/useOrderTempSave";
import { getApiErrorMessage } from "@/lib/api-error";
import { isApiSuccess } from "@/lib/api-response";
import { CheckoutPageHeader } from "@/components/checkout/CheckoutPageHeader";
import { CheckoutBasketSection } from "@/components/checkout/CheckoutBasketSection";
import { CheckoutDeliverySection } from "@/components/checkout/CheckoutDeliverySection";
import { CheckoutCommentsSection } from "@/components/checkout/CheckoutCommentsSection";
import { CheckoutActionBar } from "@/components/checkout/CheckoutActionBar";
import { useTranslation } from "@/lib/i18n";
import type { BasketGetItemsResponse } from "@/lib/types/checkout-basket";

function toISOOrNull(dateStr: string | null): string | null {
  if (!dateStr?.trim()) return null;
  try {
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

export default function SupplierCheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ supplierUID: string }>();
  const supplierUID = params.supplierUID ?? "";
  const searchParams = useSearchParams();
  const supplierInfoQuery = useSupplierDisplay(supplierUID);
  const supplier = supplierInfoQuery.data?.supplier ?? null;
  const selectedDate = supplierInfoQuery.data?.selectedDate ?? null;

  const [comments, setComments] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);
  const [hasBasketItems, setHasBasketItems] = useState(false);
  const hasPrefilledFromBasketRef = useRef(false);

  const basketQuery = useBasketItems({
    SupplierUID: supplierUID,
    enabled: !!supplierUID,
  });
  const basketData = basketQuery.data as BasketGetItemsResponse | undefined;
  const basketForSupplier =
    basketData?.basketsList?.find((b) => b.supplierUID === supplierUID) ??
    basketData?.basketsList?.[0];

  useEffect(() => {
    if (hasPrefilledFromBasketRef.current || !basketForSupplier) return;
    hasPrefilledFromBasketRef.current = true;
    if (basketForSupplier.desiredDeliveryDate?.trim()) {
      setDeliveryDate(basketForSupplier.desiredDeliveryDate.trim());
    }
    if (
      basketForSupplier.shopperComments != null &&
      basketForSupplier.shopperComments !== ""
    ) {
      setComments(basketForSupplier.shopperComments);
    }
  }, [basketForSupplier]);

  const orderAddMutation = useOrderAdd({
    onSuccess: (data) => {
      if (searchParams.get("from") === "orders-of-the-day") {
        router.replace("/orders-of-the-day");
      } else {
        router.replace("/all-suppliers");
      }
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });
  const orderTempSaveMutation = useOrderTempSave({
    onSuccess: (data) => {
      if (data != null && isApiSuccess(data)) {
        toast.success(data?.message?.trim() || t("checkout_temporary_save"));
      } else {
        toast.error(
          data?.message ?? data?.detailedMessage ?? t("basket_error"),
        );
      }
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });

  const isSubmitting = orderAddMutation.isPending;
  const isSavingTemp = orderTempSaveMutation.isPending;

  const handleTemporarySave = () => {
    const orderRefDate =
      toISOOrNull(selectedDate ?? null) ?? new Date().toISOString();
    const desiredDeliveryDate =
      toISOOrNull(deliveryDate ?? selectedDate) ?? orderRefDate;
    orderTempSaveMutation.mutate({
      orderRefDate,
      supplierUID,
      extraComments: comments,
      desiredDeliveryDate,
    });
  };

  const handleSubmitOrder = () => {
    const orderRefDate =
      toISOOrNull(selectedDate ?? null) ?? new Date().toISOString();
    const desiredDeliveryDate =
      toISOOrNull(deliveryDate ?? selectedDate) ?? orderRefDate;
    orderAddMutation.mutate({
      orderRefDate,
      supplierUID,
      extraComments: comments,
      desiredDeliveryDate,
    });
  };

  return (
    <main className="pb-36 text-slate-900 px-3">
      <CheckoutPageHeader
        titleKey="order_completion_title"
        supplierName={supplier?.title ?? null}
      />

      <CheckoutBasketSection
        supplierUID={supplierUID}
        onHasItemsChange={setHasBasketItems}
      />

      <CheckoutDeliverySection
        selectedDate={selectedDate ?? null}
        initialDeliveryDate={
          basketForSupplier?.desiredDeliveryDate ?? undefined
        }
        onEffectiveDateChange={setDeliveryDate}
      />

      <CheckoutCommentsSection
        labelKey="checkout_comments"
        value={comments}
        onChange={setComments}
      />

      <CheckoutActionBar
        temporarySaveLabelKey="checkout_temporary_save"
        submitOrderLabelKey="checkout_submit_order"
        onTemporarySave={handleTemporarySave}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
        isTemporarySaveLoading={isSavingTemp}
        isSubmitDisabled={!hasBasketItems}
      />
    </main>
  );
}
