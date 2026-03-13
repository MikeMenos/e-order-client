"use client";

import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import {
  formatDeliveryDateDisplay,
  parseDateForPicker,
  toDateOnly,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InterpolatedText } from "@/components/ui/interpolated-text";
import { DeliveryDatePickerDialog } from "@/components/checkout/DeliveryDatePickerDialog";
import { CheckoutSectionHeading } from "./CheckoutSectionHeading";
import type { WeekDailyAnalysisItem } from "@/lib/types/supplier-api";

function toYyyyMmDd(dateStr: string | null): string | null {
  if (!dateStr?.trim()) return null;
  const slice = dateStr.trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(slice)) return slice;
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

export type CheckoutDeliverySectionProps = {
  selectedDate: string | null;
  desiredDeliveryDateFromBasket?: string | null;
  initialDeliveryDate?: string | null;
  onEffectiveDateChange?: (isoDate: string) => void;
  weekDailyAnalysis?: WeekDailyAnalysisItem[];
  refDateNotInRange?: boolean;
  isEmptyAnalysis?: boolean;
  refDateDisplay?: string | null;
};

export function CheckoutDeliverySection({
  selectedDate,
  desiredDeliveryDateFromBasket,
  initialDeliveryDate,
  onEffectiveDateChange,
  weekDailyAnalysis = [],
  refDateNotInRange = false,
  isEmptyAnalysis = false,
  refDateDisplay = null,
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

  // Use desiredDeliveryDateFromBasket as default when it's not today/past and in weekDailyAnalysis and deliverable
  const effectiveDefaultDate = useMemo(() => {
    const desiredStr = toYyyyMmDd(desiredDeliveryDateFromBasket ?? null);
    const todayStr = format(new Date(), "yyyy-MM-dd");
    if (!desiredStr || desiredStr <= todayStr) return selectedDate;
    const item = weekDailyAnalysis.find(
      (it) => toDateOnly(it.dateObj) === desiredStr,
    );
    if (!item || item.dayIsClosed || !item.supplierCanDeliver) {
      return selectedDate;
    }
    return desiredStr;
  }, [desiredDeliveryDateFromBasket, selectedDate, weekDailyAnalysis]);

  useEffect(() => {
    if (
      hasAppliedInitialRef.current ||
      !initialDeliveryDate?.trim() ||
      !effectiveDefaultDate
    )
      return;
    const initial =
      toYyyyMmDd(initialDeliveryDate) ?? initialDeliveryDate.trim();
    const sel = (effectiveDefaultDate ?? "").trim();
    if (initial !== sel) {
      hasAppliedInitialRef.current = true;
      setOtherDate(initial);
      setDeliveryOption("other");
    }
  }, [initialDeliveryDate, effectiveDefaultDate]);

  const defaultDeliveryLabel =
    formatDeliveryDateDisplay(effectiveDefaultDate) ||
    (effectiveDefaultDate ?? "");

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
      notifyEffectiveDate(effectiveDefaultDate ?? null);
    } else if (otherDate) {
      notifyEffectiveDate(otherDate);
    } else {
      notifyEffectiveDate(effectiveDefaultDate ?? null);
    }
  }, [deliveryOption, otherDate, effectiveDefaultDate, notifyEffectiveDate]);

  const { disabledDatesSet, minDateOnly, maxDateOnly, isEmpty } =
    useMemo(() => {
      const set = new Set<string>();
      let min: string | null = null;
      let max: string | null = null;
      for (const item of weekDailyAnalysis) {
        const dateOnly = toDateOnly(item.dateObj);
        if (dateOnly) {
          if (item.dayIsClosed || !item.supplierCanDeliver) {
            set.add(dateOnly);
          }
          if (!min || dateOnly < min) min = dateOnly;
          if (!max || dateOnly > max) max = dateOnly;
        }
      }
      return {
        disabledDatesSet: set,
        minDateOnly: min,
        maxDateOnly: max,
        isEmpty: weekDailyAnalysis.length === 0,
      };
    }, [weekDailyAnalysis]);

  const isDateDisabled = useCallback(
    (date: Date) => {
      if (isEmpty) return true;
      const key = format(date, "yyyy-MM-dd");
      if (disabledDatesSet.has(key)) return true;
      if (minDateOnly && key < minDateOnly) return true;
      if (maxDateOnly && key > maxDateOnly) return true;
      return false;
    },
    [disabledDatesSet, minDateOnly, maxDateOnly, isEmpty],
  );

  const openOtherDateDialog = () => {
    setDialogDateValue(parseDateForPicker(otherDate ?? effectiveDefaultDate));
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

  if (refDateNotInRange) {
    const messageKey = isEmptyAnalysis
      ? "checkout_order_cannot_process_no_dates"
      : "checkout_order_cannot_process_date";
    const message = isEmptyAnalysis ? (
      t(messageKey)
    ) : (
      <InterpolatedText
        template={t(messageKey)}
        values={{ date: formatDeliveryDateDisplay(refDateDisplay ?? "") }}
      />
    );
    return (
      <section className="mb-4">
        <CheckoutSectionHeading labelKey="checkout_delivery" />
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {message}
        </p>
      </section>
    );
  }

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
