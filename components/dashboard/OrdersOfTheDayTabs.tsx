"use client";

import { useTranslation } from "@/lib/i18n";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type OrdersOfTheDayTabId = "all" | "pending" | "drafts";

type Props = {
  value: OrdersOfTheDayTabId;
  onValueChange: (value: OrdersOfTheDayTabId) => void;
  pendingCount: number;
  draftsCount: number;
};

const tabTriggerClass = cn(
  "group rounded-lg px-4 py-2 text-base font-medium bg-brand-200 text-slate-700 cursor-pointer",
  "data-[state=active]:!bg-brand-500 data-[state=active]:!text-white data-[state=active]:shadow-none",
  "after:bg-transparent after:bottom-0",
);

export function OrdersOfTheDayTabs({
  value,
  onValueChange,
  pendingCount,
  draftsCount,
}: Props) {
  const { t } = useTranslation();

  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as OrdersOfTheDayTabId)}
      className="w-full"
    >
      <TabsList
        variant="line"
        className="mb-4 w-full justify-start gap-1.5 rounded-lg bg-white p-0"
      >
        <TabsTrigger value="all" className={tabTriggerClass}>
          {t("orders_of_day_tab_all")}
        </TabsTrigger>
        <TabsTrigger value="pending" className={tabTriggerClass}>
          {t("orders_of_day_tab_pending")}
          {pendingCount > 0 && (
            <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-medium text-white group-data-[state=active]:bg-white group-data-[state=active]:text-brand-600">
              {pendingCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="drafts" className={tabTriggerClass}>
          {t("orders_of_day_tab_drafts")}
          {draftsCount > 0 && (
            <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-medium text-white group-data-[state=active]:bg-white group-data-[state=active]:text-brand-600">
              {draftsCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
