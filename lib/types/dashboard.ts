/** Response shape from Shop/Supplier_BasicInfos */
export type SupplierBasicInfoSupplier = {
  originalTitle?: string;
  customTitle?: string;
  supplierUID?: string;
  logo?: string | null;
  phone?: string | null;
  customPhone?: string | null;
  email?: string | null;
  customEmail?: string | null;
  vat?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  mainActivity?: string | null;
  personalNotes?: string | null;
  minOrderAmount?: number | null;
  deliveryCost?: number | null;
  weekDeliveryDaysText?: string | null;
  weekDeliverySchedule?: Array<{
    deliveryDay?: string;
    shortDay?: string;
    description?: string;
    orderTillDay?: string;
  }>;
  weekDailyAnalysis?: Array<{
    shortDay?: string;
    infos?: string;
    dateObj?: string;
    supplierCanDeliver?: boolean;
    supplierCanProcessOrder?: boolean;
    dayIsClosed?: boolean;
    shopperCanOrder?: boolean;
    shopperCanOrderTheNextDay?: boolean;
  }>;
  [key: string]: unknown;
};

export type SupplierBasicInfoResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  supplier?: SupplierBasicInfoSupplier;
  /** Some backends may return a list when no SupplierUID is passed */
  suppliers?: SupplierBasicInfoSupplier[];
};
