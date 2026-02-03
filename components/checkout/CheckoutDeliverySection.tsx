"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type CheckoutDeliverySectionProps = {
  selectedDate: string | null;
};

export function CheckoutDeliverySection({
  selectedDate,
}: CheckoutDeliverySectionProps) {
  const { t } = useTranslation();
  const [deliveryOption, setDeliveryOption] = useState<"selected" | "other">(
    "selected"
  );
  const [otherDate, setOtherDate] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDateValue, setDialogDateValue] = useState("");

  const defaultDeliveryLabel = selectedDate ?? "";

  const deliveryLabel =
    deliveryOption === "other" && otherDate
      ? (() => {
          try {
            const d = parseISO(otherDate);
            return format(d, "EEE, d MMM yyyy");
          } catch {
            return otherDate;
          }
        })()
      : defaultDeliveryLabel;

  const openOtherDateDialog = () => {
    setDialogDateValue(
      otherDate ?? selectedDate ?? format(new Date(), "yyyy-MM-dd")
    );
    setDialogOpen(true);
  };

  const confirmOtherDate = () => {
    if (dialogDateValue) {
      setOtherDate(dialogDateValue);
      setDeliveryOption("other");
    }
    setDialogOpen(false);
  };

  return (
    <section className="mb-4">
      <h2 className="mb-2 text-sm font-semibold text-brand-600">
        {t("checkout_delivery")}
      </h2>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={deliveryOption === "selected" ? "outline" : "ghost"}
          className={
            deliveryOption === "selected"
              ? "border-brand-400 text-brand-600"
              : "bg-brand-50 text-brand-600"
          }
          onClick={() => setDeliveryOption("selected")}
        >
          {deliveryLabel || "—"}
        </Button>
        <Button
          type="button"
          variant={deliveryOption === "other" ? "outline" : "ghost"}
          className={
            deliveryOption === "other"
              ? "border-brand-400 text-brand-600"
              : "bg-brand-50 text-brand-600"
          }
          onClick={openOtherDateDialog}
        >
          {t("checkout_delivery_other_date")}
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("checkout_select_delivery_date")}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <Input
              type="date"
              value={dialogDateValue}
              onChange={(e) => setDialogDateValue(e.target.value)}
              className="w-full border-slate-300"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {t("checkout_date_cancel")}
              </Button>
              <Button type="button" onClick={confirmOtherDate}>
                {t("checkout_date_confirm")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
