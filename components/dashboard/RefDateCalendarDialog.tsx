"use client";

import { startOfDay, isBefore } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Currently selected date (e.g. from calendarRefDate). Shown as selected when opening the calendar. */
  selectedDate: Date | undefined;
  onSelect: (date: Date) => void;
};

const todayStart = () => startOfDay(new Date());

export function RefDateCalendarDialog({
  open,
  onOpenChange,
  selectedDate,
  onSelect,
}: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4">
        <DialogHeader>
          <DialogTitle>
            {t("suppliers_select_date") ?? "Select date"}
          </DialogTitle>
        </DialogHeader>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              onSelect(date);
              onOpenChange(false);
            }
          }}
          disabled={(date) => isBefore(startOfDay(date), todayStart())}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-center"
          onClick={() => onOpenChange(false)}
        >
          {t("suppliers_calendar_close") ?? "Close"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
