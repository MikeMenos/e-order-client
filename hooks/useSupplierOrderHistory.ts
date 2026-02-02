import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

/** Line item from order (list or Order_View response) */
export type OrderLineItem = {
  productUID?: string;
  productTitle?: string;
  productOriginalTitle?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  productImage?: string | null;
  productPackaging?: string;
  productDescription?: string;
  [key: string]: unknown;
};

export type OrderHistoryOrder = {
  orderID: number;
  orderUID: string;
  supplierTitle: string | null;
  supplierLogo: string | null;
  supplierSubtitle: string | null;
  supplierUID: string;
  storeTitle: string;
  storeUID: string;
  shopperUID: string;
  shipAddress: string | null;
  deliveryCost: number | null;
  productsCost: number | null;
  totalCost: number | null;
  totalItems: number | null;
  deliveryDate: string | null;
  deliveryDateText: string | null;
  orderRefDate: string | null;
  orderRefDateText: string | null;
  dateCreated: string | null;
  createdBy: string | null;
  shopperComments: string | null;
  supplierComments: string | null;
  statusID: number | null;
  statusDescription: string | null;
  statusColor: string | null;
  items: OrderLineItem[];
  orderCode: string | null;
  minOrderAmount?: number | null;
  remainingAmount?: number | null;
  nextAvailDeliveryMessage?: string | null;
};

export type OrderHistoryResponse = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  listOrders: OrderHistoryOrder[];
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
};

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
