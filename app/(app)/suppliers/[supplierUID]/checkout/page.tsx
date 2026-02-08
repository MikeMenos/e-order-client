"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSupplierDisplay } from "@/hooks/useSupplier";
import { api } from "@/lib/api";
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
  const searchParams = useSearchParams();
  const supplierUID = params.supplierUID ?? "";
  const refDate = searchParams.get("refDate") ?? undefined;

  const supplierInfoQuery = useSupplierDisplay(supplierUID, refDate);
  const supplier = supplierInfoQuery.data?.supplier ?? null;
  const selectedDate = supplierInfoQuery.data?.selectedDate ?? null;

  const [comments, setComments] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTemporarySave = () => {
    // Placeholder: API will be added later
  };

  const handleSubmitOrder = async () => {
    const orderRefDate =
      toISOOrNull(selectedDate ?? null) ?? new Date().toISOString();
    const desiredDeliveryDate =
      toISOOrNull(deliveryDate ?? selectedDate) ?? orderRefDate;
    setIsSubmitting(true);
    try {
      const res = await api.post<{ message?: string }>("/order-add", {
        orderRefDate,
        supplierUID,
        extraComments: comments,
        desiredDeliveryDate,
      });
      const msg = res.data?.message?.trim();
      toast.success(msg || t("checkout_submit_order"));
      router.replace("/dashboard");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pb-36 text-slate-900">
      <CheckoutPageHeader
        titleKey="order_completion_title"
        supplierName={supplier?.title ?? null}
      />

      <CheckoutBasketSection supplierUID={supplierUID} />

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
      />
    </main>
  );
}
