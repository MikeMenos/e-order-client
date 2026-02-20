"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  initialDeliveryDate?: string | null;
  onEffectiveDateChange?: (isoDate: string | null) => void;
};

export function CheckoutDeliverySection({
  selectedDate,
  initialDeliveryDate,
  onEffectiveDateChange,
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
  const hasAppliedInitialRef = useRef(false);

  useEffect(() => {
    if (
      hasAppliedInitialRef.current ||
      !initialDeliveryDate?.trim() ||
      !selectedDate
    )
      return;
    const initial = initialDeliveryDate.trim();
    const sel = selectedDate.trim();
    if (initial !== sel) {
      hasAppliedInitialRef.current = true;
      setOtherDate(initial);
      setDeliveryOption("other");
    }
  }, [initialDeliveryDate, selectedDate]);

  const defaultDeliveryLabel =
    formatDeliveryDateDisplay(selectedDate) || (selectedDate ?? "");

  const deliveryLabel =
    deliveryOption === "other" && otherDate
      ? formatDeliveryDateDisplay(otherDate) || otherDate
      : defaultDeliveryLabel;

  const notifyEffectiveDate = useCallback(
    (date: string | null) => {
      onEffectiveDateChange?.(date);
    },
    [onEffectiveDateChange],
  );

  useEffect(() => {
    if (deliveryOption === "selected") {
      notifyEffectiveDate(selectedDate ?? null);
    } else if (otherDate) {
      notifyEffectiveDate(otherDate);
    } else {
      notifyEffectiveDate(selectedDate ?? null);
    }
  }, [deliveryOption, otherDate, selectedDate, notifyEffectiveDate]);

  const startOfToday = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const openOtherDateDialog = () => {
    setDialogDateValue(parseDateForPicker(otherDate ?? selectedDate));
    setDialogOpen(true);
  };

  const confirmOtherDate = () => {
    if (dialogDateValue) {
      const iso = format(dialogDateValue, "yyyy-MM-dd");
      setOtherDate(iso);
      setDeliveryOption("other");
      onEffectiveDateChange?.(iso);
    }
    setDialogOpen(false);
  };

  const selectDefault = () => {
    setDeliveryOption("selected");
    onEffectiveDateChange?.(selectedDate ?? null);
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
              ? "border-2 border-brand-400 bg-brand-100 text-brand-700 font-medium"
              : "border border-slate-300 bg-slate-100/60 text-slate-600"
          }
          onClick={selectDefault}
        >
          {deliveryLabel || "—"}
        </Button>
        <Button
          type="button"
          variant={deliveryOption === "other" ? "outline" : "ghost"}
          className={
            deliveryOption === "other"
              ? "border-2 border-brand-400 bg-brand-100 text-brand-700 font-medium"
              : "border border-slate-300 bg-slate-100/60 text-slate-600"
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
              disabled={{ before: startOfToday }}
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
