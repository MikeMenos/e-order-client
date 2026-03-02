"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSupplierDisplay } from "@/hooks/useSupplier";
import { useBasketItems } from "@/hooks/useBasket";
import { useOrderAdd } from "@/hooks/useOrderAdd";
import { useOrderTempSave } from "@/hooks/useOrderTempSave";
import { getApiErrorMessage } from "@/lib/api-error";
import { isApiSuccess, getApiResponseMessage } from "@/lib/api-response";
import { CheckoutPageHeader } from "@/components/checkout/CheckoutPageHeader";
import { CheckoutBasketSection } from "@/components/checkout/CheckoutBasketSection";
import { CheckoutDeliverySection } from "@/components/checkout/CheckoutDeliverySection";
import { CheckoutCommentsSection } from "@/components/checkout/CheckoutCommentsSection";
import { CheckoutActionBar } from "@/components/checkout/CheckoutActionBar";
import { SubmitOrderConfirmDialog } from "@/components/checkout/SubmitOrderConfirmDialog";
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

function toYyyyMmDd(dateStr: string | null): string | null {
  if (!dateStr?.trim()) return null;
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function isDeliveryDateBlocked(
  effectiveDate: string | null,
  weekDailyAnalysis: {
    dateObj: string;
    dayIsClosed: boolean;
    supplierCanDeliver: boolean;
  }[],
): boolean {
  const key = toYyyyMmDd(effectiveDate);
  if (!key) return false;
  const item = weekDailyAnalysis.find((it) => it.dateObj.slice(0, 10) === key);
  return item ? item.dayIsClosed || !item.supplierCanDeliver : false;
}

function getFirstValidDeliveryDate(
  weekDailyAnalysis: {
    dateObj: string;
    dayIsClosed: boolean;
    supplierCanDeliver: boolean;
  }[],
  fallback: string | null,
): string | null {
  const valid = weekDailyAnalysis.find(
    (it) => !it.dayIsClosed && it.supplierCanDeliver,
  );
  if (!valid) return fallback;
  try {
    return valid.dateObj.slice(0, 10);
  } catch {
    return fallback;
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
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [hasBasketItems, setHasBasketItems] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
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
      if (data != null && isApiSuccess(data as { statusCode?: number })) {
        if (searchParams.get("from") === "orders-of-the-day") {
          router.replace("/orders-of-the-day");
        } else {
          router.replace("/all-suppliers");
        }
      } else {
        toast.error(getApiResponseMessage(data) || t("basket_error"));
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

  const defaultDeliveryDate = useMemo(
    () =>
      getFirstValidDeliveryDate(
        supplier?.weekDailyAnalysis ?? [],
        selectedDate,
      ) ?? selectedDate,
    [supplier?.weekDailyAnalysis, selectedDate],
  );

  const effectiveDeliveryDate = deliveryDate ?? defaultDeliveryDate;
  const isDeliveryDateInvalid = isDeliveryDateBlocked(
    effectiveDeliveryDate,
    supplier?.weekDailyAnalysis ?? [],
  );

  const handleTemporarySave = () => {
    const desiredDeliveryDate = toISOOrNull(effectiveDeliveryDate);
    orderTempSaveMutation.mutate({
      supplierUID,
      extraComments: comments,
      desiredDeliveryDate: desiredDeliveryDate as string,
    });
  };

  const handleSubmitOrderClick = () => {
    setSubmitConfirmOpen(true);
  };

  const handleSubmitOrderConfirm = () => {
    setSubmitConfirmOpen(false);
    const desiredDeliveryDate = toISOOrNull(effectiveDeliveryDate);
    orderAddMutation.mutate({
      supplierUID,
      extraComments: comments,
      desiredDeliveryDate: desiredDeliveryDate as string,
    });
  };

  if (supplierInfoQuery.error) {
    return (
      <main className="min-h-screen flex flex-col pb-36 text-slate-900 px-3 pt-6">
        <p className="text-base text-red-400">
          {getApiErrorMessage(
            supplierInfoQuery.error,
            t("supplier_error_products"),
          )}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col pb-36 text-slate-900 px-3">
      <CheckoutPageHeader
        titleKey="order_completion_title"
        supplierName={supplier?.title ?? null}
      />

      <div className="flex-1 min-h-0 overflow-y-auto -mx-3 px-3 space-y-3">
        <CheckoutBasketSection
          supplierUID={supplierUID}
          onHasItemsChange={setHasBasketItems}
        />
        <CheckoutDeliverySection
          selectedDate={defaultDeliveryDate ?? null}
          initialDeliveryDate={
            basketForSupplier?.desiredDeliveryDate ?? undefined
          }
          onEffectiveDateChange={setDeliveryDate}
          weekDailyAnalysis={supplier?.weekDailyAnalysis ?? []}
        />
        <CheckoutCommentsSection
          labelKey="checkout_comments"
          value={comments}
          onChange={setComments}
        />
      </div>

      <CheckoutActionBar
        temporarySaveLabelKey="checkout_temporary_save"
        submitOrderLabelKey="checkout_submit_order"
        onTemporarySave={handleTemporarySave}
        onSubmitOrder={handleSubmitOrderClick}
        isSubmitting={isSubmitting}
        isTemporarySaveLoading={isSavingTemp}
        isSubmitDisabled={!hasBasketItems || isDeliveryDateInvalid}
      />

      <SubmitOrderConfirmDialog
        open={submitConfirmOpen}
        onOpenChange={setSubmitConfirmOpen}
        onConfirm={handleSubmitOrderConfirm}
        isSubmitting={orderAddMutation.isPending}
      />
    </main>
  );
}
