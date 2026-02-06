import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  SupplierDisplayResponse,
  SupplierProductsResponse,
} from "../lib/types/supplier-api";

export type {
  WeekDeliveryScheduleItem,
  WeekDailyAnalysisItem,
  SupplierDisplayCategory,
  SupplierDisplay,
  SupplierDisplayResponse,
  SupplierProductApi,
  SupplierProductsResponse,
} from "../lib/types/supplier-api";

export const useSupplierDisplay = (
  supplierUID: string | undefined,
  refDate?: string,
) => {
  return useQuery({
    queryKey: ["supplier-display", supplierUID, refDate],
    queryFn: async (): Promise<SupplierDisplayResponse> => {
      const res = await api.post<SupplierDisplayResponse>(
        "/suppliers-display",
        {
          supplierUID,
          refDate,
        },
      );
      return res.data;
    },
    enabled: !!supplierUID,
  });
};

export const useSupplierProducts = (
  supplierUID: string | undefined,
  refDate?: string,
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
        },
      );
      return res.data;
    },
    enabled: !!supplierUID,
  });
};
