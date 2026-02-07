import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export type BasketItemsData = {
  basketsList?: Array<{
    supplierUID: string;
    totalItems?: number;
    items: unknown[];
  }>;
  totalBasketsCount?: number;
  totalBasketsCost?: number;
};

export const useBasketItems = (params?: { SupplierUID?: string }) => {
  return useQuery({
    queryKey: ["basket-items", params?.SupplierUID],
    queryFn: async () => {
      const res = await api.get<BasketItemsData>("/basket-items", {
        params: params ?? {},
      });
      return res.data;
    },
  });
};

export const useBasketCounter = () => {
  return useQuery({
    queryKey: ["basket-counter"],
    queryFn: async () => {
      const res = await api.get("/basket-counter", {
        params: {},
      });
      return res.data;
    },
  });
};
