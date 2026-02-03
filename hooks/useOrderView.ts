import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { OrderViewOrder, OrderViewResponse } from "../lib/types/order";

export type { OrderViewOrder, OrderViewResponse } from "../lib/types/order";

export function useOrderView(orderUID: string | null) {
  return useQuery({
    queryKey: ["order-view", orderUID],
    queryFn: async (): Promise<OrderViewResponse> => {
      const res = await api.get<OrderViewResponse>("/orders-view", {
        params: { OrderUID: orderUID },
      });
      return res.data;
    },
    enabled: !!orderUID,
  });
}
