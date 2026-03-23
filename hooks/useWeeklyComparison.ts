import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type WeeklyComparisonRow = {
  AvgLast2Weeks: number;
  Code: string;
  CurrentWeekQty: number;
  EIDOS: string;
  PROM: string;
  ProjectedWeekTotal: number;
  SHOP: string;
  ShopperStoreUID: string;
  TrendIcon: string;
  WeekMinus1: number;
  WeekMinus2: number;
};

export function useWeeklyComparison() {
  return useQuery<WeeklyComparisonRow[]>({
    queryKey: ["weekly-comparison"],
    queryFn: async () => {
      const { data } = await api.get("/weekly-comparison");
      return data;
    },
  });
}
