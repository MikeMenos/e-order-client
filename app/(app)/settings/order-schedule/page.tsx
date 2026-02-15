"use client";

import Link from "next/link";
import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { usePrefSchedule, usePrefScheduleUpdate } from "@/hooks/useSchedule";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { PrefScheduleSupplier } from "@/lib/types/schedule";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function SupplierScheduleCard({
  schedule,
  updateMutation,
  t,
}: {
  schedule: PrefScheduleSupplier;
  updateMutation: ReturnType<typeof usePrefScheduleUpdate>;
  t: (key: string) => string;
}) {
  const supplierUID = schedule.supplierUID ?? "";
  const dailyProgram = schedule.dailyProgram ?? [];
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      <CollapsibleTrigger asChild>
        <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-4 space-y-1 mb-1 cursor-pointer transition hover:bg-slate-100/60">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-slate-900">
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
        <div className="px-4 py-4">
          <ul className="mt-3 divide-y divide-slate-100">
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
                  key={`${supplierUID}-${day.dayNum}`}
                  className="flex items-center justify-between gap-3 px-1 py-3"
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
          {schedule.supplierDeliveryDays?.length ? (
            <div className="pt-1">
              <div className="text-base text-slate-600">
                <span className="font-medium text-slate-700">
                  {t("timetable_delivery_days")}:
                </span>
              </div>

              <ul className="mt-1 space-y-0.5">
                {schedule.supplierDeliveryDays.map((day) => (
                  <li key={day} className="text-base text-slate-600">
                    {day}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function OrderSchedulePage() {
  const { t } = useTranslation();
  const scheduleQuery = usePrefSchedule();
  const updateMutation = usePrefScheduleUpdate();
  const storeSchedules = scheduleQuery.data?.storeSchedules ?? [];

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
    <main className="space-y-4 text-slate-900 px-3 pb-12">
      <header className="space-y-2">
        <h1 className="text-xl font-bold text-slate-900 mt-2 text-center mt-2">
          {t("settings_order_schedule")}
        </h1>

        {/* Filter input with clear button */}
        <div className="relative max-w-md mx-auto">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("suppliers_search_placeholder")}
            className="pr-10"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700 transition"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {scheduleQuery.isLoading && (
        <p className="text-slate-500">{t("config_loading_schedule")}</p>
      )}

      {scheduleQuery.error && (
        <p className="text-red-400">{t("config_error_schedule")}</p>
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
              updateMutation={updateMutation}
              t={t}
            />
          ))}
        </div>
      )}
    </main>
  );
}
