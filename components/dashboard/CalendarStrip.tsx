import { Button } from "../ui/button";
import { useTranslation } from "../../lib/i18n";
import { format, parseISO } from "date-fns";

type CalendarDay = {
  dateFormattedValue: string;
  day: number;
  dayNameShort: string;
  isSelected?: boolean;
  isToday?: boolean;
};

type Props = {
  days: CalendarDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToday: () => void;
};

export function CalendarStrip({
  days,
  selectedDate,
  onSelectDate,
  onToday,
}: Props) {
  const { t } = useTranslation();
  const date =
    typeof selectedDate === "string" ? parseISO(selectedDate) : selectedDate;

  const day = format(date, "dd");
  const rest = format(date, "EEE MMM yyyy");

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between my-1">
        <p className="text-slate-900 flex items-baseline">
          <span className="font-bold text-2xl mr-1">{day}</span>
          <span className="text-sm font-medium text-slate-500">{rest}</span>
        </p>

        <Button variant="outline" size="sm" onClick={onToday}>
          {t("calendar_today")}
        </Button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto rounded-xl border border-slate-200 bg-white px-3 py-2">
        {days.map((d) => {
          const isSelected = d.dateFormattedValue === selectedDate;
          const isToday = d.isToday;
          return (
            <button
              key={d.dateFormattedValue}
              type="button"
              onClick={() => onSelectDate(d.dateFormattedValue)}
              className={[
                "flex w-12 flex-col items-center justify-center rounded-lg border px-2 py-1 text-sm transition-colors",
                isSelected
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-transparent bg-slate-50 text-slate-700 hover:border-slate-300",
              ].join(" ")}
            >
              <span className="text-[10px] uppercase tracking-wide">
                {d.dayNameShort}
              </span>
              <span className="text-sm font-semibold leading-none">
                {d.day}
              </span>
              {isToday && (
                <span className="mt-1 h-1 w-1 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
