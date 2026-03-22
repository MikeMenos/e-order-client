import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type BiOrder = {
  code: string;
  eidos: string;
  shopperStoreUID: string;
  shopperStoreID: number;
  shop: string;
  prom: string;
  qty: number;
  dateIn: string;
  dateOfOrder: string;
  appUserUID: string;
  createdBy: string;
  fullName: string;
  erpCategory: string;
  erpGroup: string;
  orderCode: string;
};

export type ItemStatsForecast = {
  shopperStoreUID: string;
  shop: string;
  prom: string;
  code: string;
  eidos: string;
  firstOrderDate: string;
  lastOrderDate: string;
  daysActive: number;
  totalQty: number;
  dailyAvg: number;
  nextWeekForecast: number;
};

export type OrdersByPromShop = {
  shopperStoreUID: string;
  shop: string;
  prom: string;
  totalOrders: number;
  uniqueProductsCount: number;
  totalQuantity: number;
};

export type OrdersDailySummary = {
  dateOfOrder: string;
  shopperStoreUID: string;
  shop: string;
  totalOrders: number;
};

export type WeeklyCompProjection = {
  shopperStoreUID: string;
  shop: string;
  prom: string;
  code: string;
  eidos: string;
  currentWeekQty: number;
  projectedWeekTotal: number;
  weekMinus1: number;
  weekMinus2: number;
  avgLast2Weeks: number;
  trendIcon: string;
};

export type StoreStatisticsResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  message2?: string;
  message3?: string;
  extraActions?: string;
  bi_orders?: BiOrder[];
  item_stats_forecast?: ItemStatsForecast[];
  orders_by_prom_shop?: OrdersByPromShop[];
  orders_daily_summary?: OrdersDailySummary[];
  weekly_comp_projection?: WeeklyCompProjection[];
};

const emptyStats: StoreStatisticsResponse = {
  weekly_comp_projection: undefined,
  bi_orders: undefined,
  item_stats_forecast: undefined,
  orders_by_prom_shop: undefined,
  orders_daily_summary: undefined,
};

export function useStoreStatistics(statsDisplay = null) {
  return useQuery<StoreStatisticsResponse>({
    queryKey: ["store-statistics", statsDisplay],
    queryFn: async () => {
      const { data } = await api.post<StoreStatisticsResponse>(
        "/store-statistics",
        { stats_display: statsDisplay },
      );
      return data ?? emptyStats;
    },
  });
}
