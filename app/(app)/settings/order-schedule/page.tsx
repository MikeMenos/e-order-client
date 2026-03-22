"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import Loading from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { usePrefSchedule, usePrefScheduleUpdate } from "@/hooks/useSchedule";
import { useSuppliersListForToday } from "@/hooks/useDashboardData";
import { Switch } from "@/components/ui/switch";
import { ClearableInput } from "@/components/ui/clearable-input";
import type { PrefScheduleSupplier } from "@/lib/types/schedule";
import { formatTimetableDeliveryDays } from "@/lib/types/schedule";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function SupplierScheduleCard({
  schedule,
  weekDeliveryDaysText,
  updateMutation,
  t,
  canEdit,
}: {
  schedule: PrefScheduleSupplier;
  weekDeliveryDaysText?: string;
  updateMutation: ReturnType<typeof usePrefScheduleUpdate>;
  t: (key: string) => string;
  canEdit: boolean;
}) {
  const supplierUID = schedule.supplierUID ?? "";
  const dailyProgram = schedule.dailyProgram ?? [];
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-xl border-2 border-brand-500 bg-app-card shadow-sm overflow-hidden"
    >
      <CollapsibleTrigger asChild>
        <div className="px-4 py-2 space-y-1 cursor-pointer transition hover:bg-slate-100">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-brand-700">
              {schedule.supplierTitle ?? supplierUID}
            </p>

            <ChevronDown
              className={cn(
                "h-5 w-5 text-slate-500 transition-transform",
                open && "rotate-180",
              )}
            />
          </div>

          {schedule.selectedDaysInfo && (
            <p className="text-base text-slate-500">
              {schedule.selectedDaysInfo}
            </p>
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 pb-4">
          <ul className="mt-3">
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
                  key={`${supplierUID}-${day.dayNum}`}
                  className="flex items-center justify-between gap-3 px-1 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-brand-700">
                      {dayLabel}
                    </span>
                    {hasTimeOrAbbrev && (
                      <span className="ml-1.5 text-slate-500">
                        • {timePart}
                      </span>
                    )}
                  </div>

                  {canEdit && (
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
            const { orderTillHour } = formatTimetableDeliveryDays(dailyProgram);
            const daysPart = weekDeliveryDaysText ?? "";
            const hasContent = daysPart || orderTillHour;
            return (
              hasContent && (
                <div className="pt-1 space-y-0.5">
                  {daysPart && (
                    <p className="text-base text-slate-600">
                      <span className="font-medium text-slate-700">
                        {t("timetable_delivery_days")}:{" "}
                      </span>
                      <span>{daysPart}</span>
                    </p>
                  )}
                  {orderTillHour && (
                    <p className="text-base text-slate-600">
                      <span className="font-medium text-slate-700">
                        {t("timetable_order_time_until")}:{" "}
                      </span>
                      <span>{orderTillHour}</span>
                    </p>
                  )}
                </div>
              )
            );
          })()}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function OrderSchedulePage() {
  const { t } = useTranslation();
  const { hasAccess } = useUserPermissions();
  const scheduleQuery = usePrefSchedule();
  const updateMutation = usePrefScheduleUpdate();
  const { suppliers } = useSuppliersListForToday();
  const storeSchedules = scheduleQuery.data?.storeSchedules ?? [];

  const suppliersByUID = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const s of suppliers) {
      if (s.supplierUID) {
        map.set(s.supplierUID.toLowerCase(), s.weekDeliveryDaysText?.trim() ?? "");
      }
    }
    return map;
  }, [suppliers]);

  const [query, setQuery] = React.useState("");

  const filteredSchedules = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return storeSchedules;

    return storeSchedules.filter((s) => {
      const title = (s.supplierTitle ?? "").toLowerCase();
      const uid = (s.supplierUID ?? "").toLowerCase();
      return title.includes(q) || uid.includes(q);
    });
  }, [storeSchedules, query]);

  return (
    <main className="space-y-4 text-slate-900 px-2 pb-12">
      <header className="space-y-2">
        <h1 className="text-xl font-bold text-slate-900 mt-2 text-center my-2">
          {t("settings_order_schedule")}
        </h1>

        <div className="relative max-w-md mx-auto">
          <ClearableInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("suppliers_search_placeholder")}
          />
        </div>
      </header>

      {scheduleQuery.isLoading && <Loading spinnerOnly />}

      {scheduleQuery.error && (
        <ErrorMessage>{t("config_error_schedule")}</ErrorMessage>
      )}

      {!scheduleQuery.isLoading &&
        filteredSchedules.length === 0 &&
        scheduleQuery.data && (
          <p className="text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
            {query.trim()
              ? "No suppliers match your search."
              : t("config_empty_schedule")}
          </p>
        )}

      {filteredSchedules.length > 0 && (
        <div className="space-y-2">
          {filteredSchedules.map((schedule) => (
            <SupplierScheduleCard
              key={schedule.supplierUID}
              schedule={schedule}
              weekDeliveryDaysText={
                suppliersByUID.get((schedule.supplierUID ?? "").toLowerCase()) ?? ""
              }
              updateMutation={updateMutation}
              t={t}
              canEdit={hasAccess("P4")}
            />
          ))}
        </div>
      )}
    </main>
  );
}
