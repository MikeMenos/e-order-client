import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  OrderHistoryOrder,
  OrderHistoryResponse,
} from "../lib/types/order";

export type {
  OrderLineItem,
  OrderHistoryOrder,
  OrderHistoryResponse,
} from "../lib/types/order";

type Options = {
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  enabled?: boolean;
};

export function useSupplierOrderHistory(
  supplierUID: string | undefined,
  options: Options = {}
) {
  const { dateFrom, dateTo, page = 1, enabled = !!supplierUID } = options;

  return useQuery({
    queryKey: ["supplier-order-history", supplierUID, dateFrom, dateTo, page],
    queryFn: async (): Promise<OrderHistoryResponse> => {
      const res = await api.post<OrderHistoryResponse>("/orders-get-list", {
        supplierUID,
        dateFrom: dateFrom ?? undefined,
        dateTo: dateTo ?? undefined,
        search: "",
        status: null,
        page,
      });
      return res.data;
    },
    enabled,
  });
}
