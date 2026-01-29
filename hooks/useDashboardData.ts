import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export const useDashboardCalendar = (refDate: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["dashboardCalendar", refDate],
    queryFn: async () => {
      const res = await api.post("/dashboard-calendar", {
        refDate,
      });
      return res.data;
    },
    enabled,
  });
};

export const useSuppliersForDate = (refDate: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["suppliers", refDate],
    queryFn: async () => {
      const res = await api.post("/suppliers-list", {
        refDate,
        setCategories: true,
        setLastOrders: true,
        setDeliverySchedule: true,
        setDailyAnalysisSchedule: true,
      });
      return res.data;
    },
    enabled,
  });
};
