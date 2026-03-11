"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { usePrefSchedule, usePrefScheduleUpdate } from "@/hooks/useSchedule";
import { formatTimetableDeliveryDays } from "@/lib/types/schedule";
import { Switch } from "@/components/ui/switch";
import Loading from "@/components/ui/loading";

export default function TimetablePage() {
  const { t } = useTranslation();
  const { hasAccess } = useUserPermissions();
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
    <main className="space-y-4 text-slate-900 px-2 pb-12">
      <header className="space-y-1 mb-1">
        <h1 className="text-xl font-bold text-slate-900 mt-2 text-center my-2">
          {t("settings_order_schedule")}
        </h1>
      </header>

      {scheduleQuery.isLoading && <Loading spinnerOnly />}

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
          <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-4 space-y-1 mb-1">
            {supplierSchedule.supplierTitle && (
              <p className="text-slate-600">{supplierSchedule.supplierTitle}</p>
            )}
            {supplierSchedule.selectedDaysInfo && (
              <p className="text-base text-slate-500">
                {supplierSchedule.selectedDaysInfo}
              </p>
            )}
            <ul>
              {dailyProgram.map((day) => {
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
                    {hasAccess("P4") && (
                      <Switch
                        checked={day.isMarked}
                        onCheckedChange={(checked) => {
                          updateMutation.mutate({
                            supplierUID,
                            dayNum: day.dayNum,
                            isMarked: !!checked,
                          });
                        }}
                        aria-label={`${dayLabel} ${t("timetable_enabled")}`}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
            <hr className="my-2 border-slate-200" />
            {(() => {
              const { daysPart, orderTillHour } =
                formatTimetableDeliveryDays(dailyProgram);
              const hasContent = daysPart || orderTillHour;
              return (
                hasContent && (
                  <div className="text-base text-slate-600 pt-1 space-y-0.5">
                    {daysPart && (
                      <p>
                        <span className="font-medium text-slate-700">
                          {t("timetable_delivery_days")}:{" "}
                        </span>
                        <span className="text-slate-600">{daysPart}</span>
                      </p>
                    )}
                    {orderTillHour && (
                      <p>
                        <span className="font-medium text-slate-700">
                          {t("timetable_order_time_until")}:{" "}
                        </span>
                        <span className="text-slate-600">{orderTillHour}</span>
                      </p>
                    )}
                  </div>
                )
              );
            })()}
          </div>
          {/* Program list: day + time/abbrev + toggle */}
        </div>
      )}
    </main>
  );
}
