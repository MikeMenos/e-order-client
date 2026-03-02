"use client";

import { addDays, format } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDisabledDayButton } from "@/components/ui/calendar-disabled-day-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeliveryDatePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onConfirm: () => void;
  disabledDates?: (date: Date) => boolean;
};

const startOfToday = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

const endOfValidRange = addDays(startOfToday, 14);

export function DeliveryDatePickerDialog({
  open,
  onOpenChange,
  selectedDate,
  onDateSelect,
  onConfirm,
  disabledDates = () => false,
}: DeliveryDatePickerDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("checkout_select_delivery_date")}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            disabled={(date) =>
              date < startOfToday ||
              date > endOfValidRange ||
              disabledDates(date)
            }
            components={{ DayButton: CalendarDisabledDayButton }}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("checkout_date_cancel")}
            </Button>
            <Button type="button" onClick={handleConfirm}>
              {t("checkout_date_confirm")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
