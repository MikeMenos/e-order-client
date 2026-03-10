"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { History } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { Button } from "@/components/ui/button";
import { useBasketItems } from "@/hooks/useBasket";

export type SupplierCheckoutBarProps = {
  supplierUID: string;
  /** When true, hide the bar on mobile (e.g. when an input is focused). */
  hideWhenInputFocused?: boolean;
};

export function SupplierCheckoutBar({
  supplierUID,
  hideWhenInputFocused = false,
}: SupplierCheckoutBarProps) {
  const { t } = useTranslation();
  const { hasAccess } = useUserPermissions();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const refDateParam = searchParams.get("refDate");

  const { data: basketData } = useBasketItems(
    supplierUID ? { SupplierUID: supplierUID } : undefined,
  );
  const totalBasketsCount = basketData?.totalBasketsCount ?? 0;
  const supplierBasket = basketData?.basketsList?.find(
    (b) => b.supplierUID === supplierUID,
  );
  const hasItems =
    totalBasketsCount > 0 || (supplierBasket?.totalItems ?? 0) > 0;

  const queryParams = new URLSearchParams();
  if (fromParam) queryParams.set("from", fromParam);
  if (refDateParam) queryParams.set("refDate", refDateParam);
  const queryString = queryParams.toString()
    ? `?${queryParams.toString()}`
    : "";

  const checkoutHref = `/suppliers/${supplierUID}/checkout${queryString}`;
  const orderHistoryHref = `/suppliers/${supplierUID}/order-history${queryString}`;

  const hasAnyButton = hasAccess("P5") || hasItems;

  if (!hasAnyButton) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-1 border-t border-slate-200 bg-app-card p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] transition-transform duration-200 md:translate-y-0 ${
        hideWhenInputFocused ? "max-md:translate-y-full" : ""
      }`}
    >
      {hasAccess("P5") && (
        <Button variant="outline" size="lg">
          <Link href={orderHistoryHref} className="flex items-center gap-1">
            <History className="h-4 w-4 shrink-0" aria-hidden />
            {t("nav_history")}
          </Link>
        </Button>
      )}
      {hasItems && (
        <Button size="lg">
          <Link href={checkoutHref}>{t("checkout_button")}</Link>
        </Button>
      )}
    </div>
  );
}
