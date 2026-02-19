import { useMemo } from "react";
import {
  useSupplierDisplay,
  useSupplierProducts,
} from "@/hooks/useSupplier";
import {
  buildSectionsFromProducts,
  mapRawProductsToSupplierProducts,
} from "@/lib/supplier";
import type { SupplierProduct, SupplierSection } from "@/lib/types/supplier";

export function useSupplierPageProducts(supplierUID: string | undefined) {
  const supplierInfoQuery = useSupplierDisplay(supplierUID);
  const productsQuery = useSupplierProducts(supplierUID);

  const selectedDate = supplierInfoQuery.data?.selectedDate ?? undefined;
  const supplier = supplierInfoQuery.data?.supplier ?? null;
  const rawProducts = productsQuery.data?.products ?? [];

  const products = useMemo(
    (): SupplierProduct[] => mapRawProductsToSupplierProducts(rawProducts),
    [rawProducts],
  );

  const catalogSections = useMemo((): SupplierSection[] => {
    const list = products.filter((p) => !p.isFavorite);
    return buildSectionsFromProducts(list);
  }, [products]);

  const favoriteSections = useMemo((): SupplierSection[] => {
    const list = products.filter((p) => p.isFavorite);
    return buildSectionsFromProducts(list);
  }, [products]);

  return {
    supplier,
    selectedDate,
    products,
    catalogSections,
    favoriteSections,
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
  };
}
