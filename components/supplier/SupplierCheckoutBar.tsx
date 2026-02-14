"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { History } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

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
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");

  const queryParams = new URLSearchParams();
  if (fromParam) queryParams.set("from", fromParam);
  const queryString = queryParams.toString()
    ? `?${queryParams.toString()}`
    : "";

  const checkoutHref = `/suppliers/${supplierUID}/checkout${queryString}`;
  const orderHistoryHref = `/suppliers/${supplierUID}/order-history${queryString}`;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 flex items-center justify-end gap-3 border-t border-slate-200 bg-app-card px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] transition-transform duration-200 md:translate-y-0 ${
        hideWhenInputFocused ? "max-md:translate-y-full" : ""
      }`}
    >
      <Button variant="outline" size="lg" className="shrink-0 gap-2">
        <Link href={orderHistoryHref}>
          <History className="h-4 w-4 shrink-0" aria-hidden />
          {t("nav_history")}
        </Link>
      </Button>
      <Button size="lg" className="shrink-0">
        <Link href={checkoutHref}>{t("checkout_button")}</Link>
      </Button>
    </div>
  );
}
