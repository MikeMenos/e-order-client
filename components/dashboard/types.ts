export type Supplier = {
  supplierUID: string;
  title: string;
  subTitle?: string;
  logo?: string | null;
  counterOpenBaskets?: number | null;
  counterTodayOrders?: number | null;
  labelOrderTimeExpiresAt?: string | null;
  orderTillText?: string | null;
  nextAvailDeliveryText?: string | null;
  basketIconStatus?: number | string;
  basketIconStatusDescr?: string | null;
  labelStockForDays?: string | null;
  weekDeliveryDaysText?: string | null;
  tileColor?: string | null;
  tileColorMode?: string | null;
};
