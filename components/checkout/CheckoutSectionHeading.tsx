"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export type CheckoutSectionHeadingProps = {
  labelKey: string;
  /** When set, shows a "Delete cart" button (only when hasItems is true) */
  deleteBasket?: {
    hasItems: boolean;
    supplierUID: string;
    onDelete: () => void;
    isDeleting?: boolean;
  };
};

const headingClass =
  "text-base font-semibold text-brand-600 rounded px-2 w-fit";

export function CheckoutSectionHeading({
  labelKey,
  deleteBasket,
}: CheckoutSectionHeadingProps) {
  const { t } = useTranslation();
  const showDelete =
    deleteBasket?.hasItems &&
    deleteBasket.supplierUID &&
    typeof deleteBasket.onDelete === "function";

  return (
    <div className="flex items-center justify-between gap-2 mb-1">
      <h2 className={headingClass}>{t(labelKey)}</h2>
      {showDelete && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          onClick={deleteBasket.onDelete}
          disabled={deleteBasket.isDeleting}
          aria-label={t("checkout_delete_basket")}
        >
          {deleteBasket.isDeleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              {t("checkout_removing")}
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-1" />
              {t("checkout_delete_basket")}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
