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
