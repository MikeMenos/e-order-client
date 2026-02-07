"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSupplierDisplay } from "@/hooks/useSupplier";
import { CheckoutPageHeader } from "@/components/checkout/CheckoutPageHeader";
import { CheckoutBasketSection } from "@/components/checkout/CheckoutBasketSection";
import { CheckoutDeliverySection } from "@/components/checkout/CheckoutDeliverySection";
import { CheckoutCommentsSection } from "@/components/checkout/CheckoutCommentsSection";
import { CheckoutActionBar } from "@/components/checkout/CheckoutActionBar";

export default function SupplierCheckoutPage() {
  const params = useParams<{ supplierUID: string }>();
  const searchParams = useSearchParams();
  const supplierUID = params.supplierUID ?? "";
  const refDate = searchParams.get("refDate") ?? undefined;

  const supplierInfoQuery = useSupplierDisplay(supplierUID, refDate);
  const supplier = supplierInfoQuery.data?.supplier ?? null;
  const selectedDate = supplierInfoQuery.data?.selectedDate ?? null;

  const [comments, setComments] = useState("");

  const handleTemporarySave = () => {
    // Placeholder: API will be added later
  };

  const handleSubmitOrder = () => {
    // Placeholder: API will be added later
  };

  return (
    <main className="pb-36 text-slate-900">
      <CheckoutPageHeader
        titleKey="order_completion_title"
        supplierName={supplier?.title ?? null}
      />

      <CheckoutBasketSection supplierUID={supplierUID} />

      <CheckoutDeliverySection selectedDate={selectedDate ?? null} />

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
      />
    </main>
  );
}
