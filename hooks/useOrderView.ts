import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { OrderLineItem } from "./useSupplierOrderHistory";

export type OrderViewOrder = {
  orderUID?: string;
  items?: OrderLineItem[];
  [key: string]: unknown;
};

export type OrderViewResponse = {
  statusCode?: number;
  message?: string;
  order?: OrderViewOrder;
};

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
