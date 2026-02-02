import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

// --- useSupplierDisplay types ---

export type WeekDeliveryScheduleItem = {
  deliveryDay: string;
  shortDay: string;
  description: string;
  orderTillDay: string;
};

export type WeekDailyAnalysisItem = {
  shortDay: string;
  infos: string;
  dateObj: string;
  supplierCanDeliver: boolean;
  supplierCanProcessOrder: boolean;
  dayIsClosed: boolean;
  shopperCanOrder: boolean;
  shopperCanOrderTheNextDay: boolean;
};

export type SupplierDisplayCategory = {
  categoryUID: string;
  title: string;
  position: number;
  image: string;
};

export type SupplierDisplay = {
  title: string;
  supplierUID: string;
  logo: string | null;
  bgImage: string | null;
  productsImage: string | null;
  subTitle: string | null;
  nextAvailDeliveryMessage: string | null;
  nextAvailDeliveryText: string | null;
  nextAvailDeliveryDate: string | null;
  orderTillText: string | null;
  orderTillDate: string | null;
  labelOrderTimeExpiresAt: string | null;
  dayTillNextDeliveryText: string | null;
  labelStockForDays: string | null;
  weekDeliveryDaysText: string | null;
  weekDeliverySchedule: WeekDeliveryScheduleItem[];
  weekDailyAnalysis: WeekDailyAnalysisItem[];
  tileColor: string | null;
  tileColorMode: string | null;
  basketIconColor: string | null;
  basketIconMode: string | null;
  basketIconStatus: number | null;
  basketIconStatusDescr: string | null;
  minOrderAmount: number | null;
  deliveryCost: number | null;
  isInPrefDaySchedule: boolean;
  categories: SupplierDisplayCategory[];
};

export type SupplierDisplayResponse = {
  selectedDate: string;
  dayNameShort: string;
  supplier: SupplierDisplay;
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
};

// --- useSupplierProducts types ---

export type SupplierProduct = {
  productUID: string;
  productTitle: string;
  productOriginalTitle: string;
  productImage: string | null;
  productPackaging: string;
  productDescription: string;
  productCategories: string;
  productSlug: string;
  price: number;
  basketQty: number | null;
  isAvailable: boolean;
  isInWishlist: boolean;
  isInOrders: boolean;
  isFavBySupplier: boolean;
  isFavByShopper: boolean;
  isFavByPlatform: boolean;
  favIconColor: string | null;
  favIconMode: string | null;
  supplierUID: string;
};

export type SupplierProductsResponse = {
  selectedDate: string;
  dayNameShort: string;
  products: SupplierProduct[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
};

// --- hooks ---

export const useSupplierDisplay = (
  supplierUID: string | undefined,
  refDate?: string
) => {
  return useQuery({
    queryKey: ["supplier-display", supplierUID, refDate],
    queryFn: async (): Promise<SupplierDisplayResponse> => {
      const res = await api.post<SupplierDisplayResponse>(
        "/suppliers-display",
        {
          supplierUID,
          refDate,
        }
      );
      return res.data;
    },
    enabled: !!supplierUID,
  });
};

export const useSupplierProducts = (
  supplierUID: string | undefined,
  refDate?: string
) => {
  return useQuery({
    queryKey: ["supplier-products", supplierUID, refDate],
    queryFn: async (): Promise<SupplierProductsResponse> => {
      const res = await api.post<SupplierProductsResponse>(
        "/suppliers-products",
        {
          supplierUID,
          refDate,
          erpCatUID: null,
          page: 0,
          search: null,
          favoritesOnly: false,
        }
      );
      return res.data;
    },
    enabled: !!supplierUID,
  });
};
