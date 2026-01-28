import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export const useSupplierDisplay = (supplierUID: string | undefined, refDate?: string) => {
  return useQuery({
    queryKey: ["supplier-display", supplierUID, refDate],
    queryFn: async () => {
      const res = await api.post("Shop/Supplier_Display", {
        supplierUID,
        refDate,
      });
      return res.data;
    },
    enabled: !!supplierUID,
  });
};

export const useSupplierProducts = (supplierUID: string | undefined, refDate?: string) => {
  return useQuery({
    queryKey: ["supplier-products", supplierUID, refDate],
    queryFn: async () => {
      const res = await api.post("Shop/Supplier_GetProducts", {
        supplierUID,
        refDate,
        erpCatUID: null,
        page: 0,
        search: null,
        favoritesOnly: false,
      });
      return res.data;
    },
    enabled: !!supplierUID,
  });
};

