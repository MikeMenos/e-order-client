"use client";

import { startOfDay, isBefore } from "date-fns";
import { useTranslation } from "@/lib/i18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { X } from "lucide-react";

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
      <DialogContent className="relative gap-4">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle>
              {t("suppliers_select_date") ?? "Select date"}
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("suppliers_calendar_close") ?? "Close"}
              className="shrink-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100 -mr-1"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-5" />
            </Button>
          </div>
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
      </DialogContent>
    </Dialog>
  );
}
