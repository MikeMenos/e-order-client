"use client";

import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { format, parseISO } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import { formatDeliveryDateDisplay, parseDateForPicker } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DeliveryDatePickerDialog } from "@/components/checkout/DeliveryDatePickerDialog";
import { CheckoutSectionHeading } from "./CheckoutSectionHeading";
import type { WeekDailyAnalysisItem } from "@/lib/types/supplier-api";

export type CheckoutDeliverySectionProps = {
  selectedDate: string | null;
  initialDeliveryDate?: string | null;
  onEffectiveDateChange?: (isoDate: string) => void;
  weekDailyAnalysis?: WeekDailyAnalysisItem[];
};

export function CheckoutDeliverySection({
  selectedDate,
  initialDeliveryDate,
  onEffectiveDateChange,
  weekDailyAnalysis = [],
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
      onEffectiveDateChange?.(date as string);
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

  const disabledDates = useMemo(() => {
    const set = new Set<string>();
    for (const item of weekDailyAnalysis) {
      if (item.dayIsClosed || !item.supplierCanDeliver) {
        try {
          const d = parseISO(item.dateObj);
          set.add(format(d, "yyyy-MM-dd"));
        } catch {
          // Skip invalid dates
        }
      }
    }
    return set;
  }, [weekDailyAnalysis]);

  const isDateDisabled = useCallback(
    (date: Date) => {
      const key = format(date, "yyyy-MM-dd");
      return disabledDates.has(key);
    },
    [disabledDates],
  );

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
    onEffectiveDateChange?.(selectedDate as string);
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

      <DeliveryDatePickerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedDate={dialogDateValue}
        onDateSelect={setDialogDateValue}
        onConfirm={confirmOtherDate}
        disabledDates={isDateDisabled}
      />
    </section>
  );
}
