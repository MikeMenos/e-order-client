"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { usePrefSchedule, usePrefScheduleUpdate } from "@/hooks/useSchedule";
import { Switch } from "@/components/ui/switch";

export default function TimetablePage() {
  const { t } = useTranslation();
  const params = useParams<{ supplierUID: string }>();
  const supplierUID = params.supplierUID as string;

  const scheduleQuery = usePrefSchedule();
  const updateMutation = usePrefScheduleUpdate();

  const schedules = scheduleQuery.data?.storeSchedules ?? [];
  const supplierSchedule = schedules.find(
    (s) =>
      (s.supplierUID ?? "").toLowerCase() === (supplierUID ?? "").toLowerCase(),
  );
  const dailyProgram = supplierSchedule?.dailyProgram ?? [];

  return (
    <main className="space-y-4 text-slate-900 px-3 pb-12">
      <header className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900 text-center mt-2">
          {t("settings_order_schedule")}
        </h1>
      </header>

      {scheduleQuery.isLoading && (
        <p className=" text-slate-500">{t("config_loading_schedule")}</p>
      )}

      {scheduleQuery.error && (
        <p className=" text-red-400">{t("config_error_schedule")}</p>
      )}

      {!supplierSchedule && !scheduleQuery.isLoading && scheduleQuery.data && (
        <p className=" text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
          {t("config_error_schedule")}
        </p>
      )}

      {supplierSchedule && dailyProgram.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Card header: basic info */}
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-4 space-y-1">
            {supplierSchedule.supplierTitle && (
              <p className="text-slate-600">{supplierSchedule.supplierTitle}</p>
            )}
            {supplierSchedule.selectedDaysInfo && (
              <p className="text-sm text-slate-500">
                {supplierSchedule.selectedDaysInfo}
              </p>
            )}
            {supplierSchedule.supplierDeliveryDays &&
              supplierSchedule.supplierDeliveryDays.length > 0 && (
                <p className="text-sm text-slate-600 pt-1">
                  <span className="font-medium text-slate-700">
                    {t("timetable_delivery_days")}:{" "}
                  </span>
                  {supplierSchedule.supplierDeliveryDays.map((day) => (
                    <p key={day} className="text-slate-600">
                      {day}
                    </p>
                  ))}
                </p>
              )}
          </div>
          {/* Program list: day + time/abbrev + toggle */}
          <ul className="divide-y divide-slate-100">
            {dailyProgram.map((day) => {
              const isUpdating =
                updateMutation.isPending &&
                updateMutation.variables?.supplierUID === supplierUID &&
                updateMutation.variables?.dayNum === day.dayNum;
              const dayLabel = day.day ?? day.dayShort ?? String(day.dayNum);
              const hasTimeOrAbbrev =
                (day.orderTillHour ?? "").trim() !== "" ||
                (day.dayShort ?? "").trim() !== "" ||
                (day.orderExpectedDelivDay ?? "").trim() !== "";
              const timePart = [
                day.orderTillHour,
                day.dayShort ?? day.orderExpectedDelivDay,
              ]
                .filter(Boolean)
                .join(" • ");
              return (
                <li
                  key={day.dayNum}
                  className="flex items-center justify-between gap-3 px-4 py-3 "
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-slate-900">
                      {dayLabel}
                    </span>
                    {hasTimeOrAbbrev && (
                      <span className="ml-1.5 text-slate-500">
                        • {timePart}
                      </span>
                    )}
                  </div>
                  <Switch
                    checked={day.isMarked}
                    onCheckedChange={(checked) => {
                      updateMutation.mutate({
                        supplierUID,
                        dayNum: day.dayNum,
                        isMarked: !!checked,
                      });
                    }}
                    disabled={isUpdating}
                    aria-label={`${dayLabel} ${t("timetable_enabled")}`}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </main>
  );
}
