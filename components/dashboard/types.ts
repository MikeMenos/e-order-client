export type Supplier = {
  supplierUID: string;
  title: string;
  subTitle?: string;
  logo?: string | null;
  labelOrderTimeExpiresAt?: string | null;
  orderTillText?: string | null;
  nextAvailDeliveryText?: string | null;
  basketIconStatus?: number | string;
  labelStockForDays?: string | null;
  weekDeliveryDaysText?: string | null;
  tileColor?: string | null;
  tileColorMode?: string | null;
};
