export type PrefScheduleDay = {
  dayNum: number;
  day?: string;
  dayShort?: string;
  isMarked: boolean;
  orderTillHour?: string;
  orderExpectedDelivDay?: string;
};

export type PrefScheduleSupplier = {
  supplierUID: string;
  supplierTitle?: string;
  selectedDaysInfo?: string;
  dailyProgram: PrefScheduleDay[];
  supplierDeliveryDays?: string[];
};

export type PrefScheduleResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  storeSchedules?: PrefScheduleSupplier[];
};

export type PrefScheduleUpdatePayload = {
  supplierUID: string;
  dayNum: number;
  isMarked: boolean;
};

export type TimetableDeliveryInfo = {
  daysPart: string;
  orderTillHour: string | null;
};

/** Extract delivery days (dayShorts) and orderTillHour from dailyProgram. */
export function formatTimetableDeliveryDays(
  dailyProgram: PrefScheduleDay[],
): TimetableDeliveryInfo {
  const withDeliv = dailyProgram.filter((d) => d.orderExpectedDelivDay);
  const dayShorts =
    withDeliv.length > 0
      ? withDeliv
          .map((d) => d.dayShort ?? d.orderExpectedDelivDay ?? "")
          .filter(Boolean)
          .join(" - ")
      : "";
  const orderTillHour =
    withDeliv.find((d) => d.orderTillHour)?.orderTillHour ?? null;
  return { daysPart: dayShorts, orderTillHour };
}
