import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  SupplierDisplayResponse,
  SupplierProductsResponse,
  ProductDisplayResponse,
} from "../lib/types/supplier-api";

export type {
  WeekDeliveryScheduleItem,
  WeekDailyAnalysisItem,
  SupplierDisplayCategory,
  SupplierDisplay,
  SupplierDisplayResponse,
  SupplierProductApi,
  SupplierProductsResponse,
  ProductDisplayOrder,
  ProductDisplayProduct,
  ProductDisplayResponse,
} from "../lib/types/supplier-api";

export const useSupplierDisplay = (supplierUID: string | undefined) => {
  return useQuery({
    queryKey: ["supplier-display", supplierUID],
    queryFn: async (): Promise<SupplierDisplayResponse> => {
      const res = await api.post<SupplierDisplayResponse>(
        "/suppliers-display",
        {
          supplierUID,
        },
      );
      return res.data;
    },
    enabled: !!supplierUID,
  });
};

export const useSupplierProducts = (supplierUID: string | undefined) => {
  return useQuery({
    queryKey: ["supplier-products", supplierUID],
    queryFn: async (): Promise<SupplierProductsResponse> => {
      const res = await api.post<SupplierProductsResponse>(
        "/suppliers-products",
        {
          supplierUID,
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

/** POST Product_Display: body { productUID, refDate? } — refDate is undefined when not provided */
export const useProductDisplay = (productUID: string | undefined) => {
  return useQuery({
    queryKey: ["product-display", productUID],
    queryFn: async (): Promise<ProductDisplayResponse> => {
      const res = await api.post<ProductDisplayResponse>("/product-display", {
        productUID,
        refDate: null,
      });
      return res.data;
    },
    enabled: !!productUID,
  });
};
