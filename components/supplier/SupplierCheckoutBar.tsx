"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export type SupplierCheckoutBarProps = {
  supplierUID: string;
  refDate?: string;
  cartItemCount: number;
  cartTotalPcs: number;
};

export function SupplierCheckoutBar({
  supplierUID,
  refDate,
  cartItemCount,
  cartTotalPcs,
}: SupplierCheckoutBarProps) {
  const { t } = useTranslation();
  const cartSummaryText = t("cart_summary")
    .replace("{count}", String(cartItemCount))
    .replace("{pcs}", String(cartTotalPcs));

  const checkoutHref = refDate
    ? `/suppliers/${supplierUID}/checkout?refDate=${encodeURIComponent(
        refDate
      )}`
    : `/suppliers/${supplierUID}/checkout`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 border-t border-slate-200 bg-app-card px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <span className="text-sm font-medium text-slate-700">
        {cartSummaryText}
      </span>
      <Button size="lg" className="shrink-0">
        <Link href={checkoutHref}>{t("checkout_button")}</Link>
      </Button>
    </div>
  );
}
