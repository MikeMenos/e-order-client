"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSupplierDisplay } from "@/hooks/useSupplier";
import { useOrderAdd } from "@/hooks/useOrderAdd";
import { getApiErrorMessage } from "@/lib/api-error";
import { CheckoutPageHeader } from "@/components/checkout/CheckoutPageHeader";
import { CheckoutBasketSection } from "@/components/checkout/CheckoutBasketSection";
import { CheckoutDeliverySection } from "@/components/checkout/CheckoutDeliverySection";
import { CheckoutCommentsSection } from "@/components/checkout/CheckoutCommentsSection";
import { CheckoutActionBar } from "@/components/checkout/CheckoutActionBar";
import { useTranslation } from "@/lib/i18n";

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

  const orderAddMutation = useOrderAdd({
    onSuccess: (data) => {
      const msg = data?.message?.trim();
      toast.success(msg || t("checkout_submit_order"));
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
  const isSubmitting = orderAddMutation.isPending;

  const handleTemporarySave = () => {
    // Placeholder: API will be added later
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
        isSubmitDisabled={!hasBasketItems}
      />
    </main>
  );
}
