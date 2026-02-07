"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import { formatDeliveryDateDisplay, parseDateForPicker } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckoutSectionHeading } from "./CheckoutSectionHeading";

export type CheckoutDeliverySectionProps = {
  selectedDate: string | null;
};

export function CheckoutDeliverySection({
  selectedDate,
}: CheckoutDeliverySectionProps) {
  const { t } = useTranslation();
  const [deliveryOption, setDeliveryOption] = useState<"selected" | "other">(
    "selected",
  );
  const [otherDate, setOtherDate] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDateValue, setDialogDateValue] = useState<Date | undefined>(
    undefined,
  );

  const defaultDeliveryLabel =
    formatDeliveryDateDisplay(selectedDate) || (selectedDate ?? "");

  const deliveryLabel =
    deliveryOption === "other" && otherDate
      ? formatDeliveryDateDisplay(otherDate) || otherDate
      : defaultDeliveryLabel;

  const openOtherDateDialog = () => {
    setDialogDateValue(parseDateForPicker(otherDate ?? selectedDate));
    setDialogOpen(true);
  };

  const confirmOtherDate = () => {
    if (dialogDateValue) {
      setOtherDate(format(dialogDateValue, "yyyy-MM-dd"));
      setDeliveryOption("other");
    }
    setDialogOpen(false);
  };

  return (
    <section className="mb-4">
      <CheckoutSectionHeading labelKey="checkout_delivery" />
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
          <div className="mt-4 space-y-3">
            <Calendar
              mode="single"
              selected={dialogDateValue}
              onSelect={setDialogDateValue}
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
