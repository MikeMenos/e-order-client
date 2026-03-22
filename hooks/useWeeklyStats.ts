import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type WeeklyStatsRow = {
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

export function useWeeklyStats() {
  return useQuery<WeeklyStatsRow[]>({
    queryKey: ["weekly-stats"],
    queryFn: async () => {
      const { data } = await api.get("/weekly-stats");
      return data;
    },
  });
}
