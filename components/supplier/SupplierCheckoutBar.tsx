"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export type SupplierCheckoutBarProps = {
  supplierUID: string;
};

export function SupplierCheckoutBar({
  supplierUID,
}: SupplierCheckoutBarProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");

  const queryParams = new URLSearchParams();
  if (fromParam) queryParams.set("from", fromParam);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const checkoutHref = `/suppliers/${supplierUID}/checkout${queryString}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-end gap-3 border-t border-slate-200 bg-app-card px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <Button size="lg" className="shrink-0">
        <Link href={checkoutHref}>{t("checkout_button")}</Link>
      </Button>
    </div>
  );
}
