import { useMemo } from "react";
import { useSupplierDisplay, useSupplierProducts } from "@/hooks/useSupplier";
import {
  buildSectionsFromProducts,
  mapRawProductsToSupplierProducts,
  sortSectionsByCategoryOrder,
} from "@/lib/supplier";
import type { SupplierProduct, SupplierSection } from "@/lib/types/supplier";

export type UseSupplierPageProductsParams = {
  mainTab: "catalog" | "favorites";
  search?: string;
  refDate?: string | null;
};

export function useSupplierPageProducts(
  supplierUID: string | undefined,
  params?: UseSupplierPageProductsParams,
) {
  const supplierInfoQuery = useSupplierDisplay(supplierUID);
  const mainTab = params?.mainTab ?? "catalog";
  const search = params?.search ?? "";

  const productsQuery = useSupplierProducts(supplierUID, {
    favoritesOnly: mainTab === "favorites",
    search: search.trim() || null,
  });

  const selectedDate = supplierInfoQuery.data?.selectedDate ?? undefined;
  const supplier = supplierInfoQuery.data?.supplier ?? null;
  const rawProducts = productsQuery.data?.products ?? [];

  const products = useMemo(
    (): SupplierProduct[] => mapRawProductsToSupplierProducts(rawProducts),
    [rawProducts],
  );

  const categories = supplier?.categories ?? [];

  const catalogSections = useMemo((): SupplierSection[] => {
    const list = products.filter((p) => !p.isFavorite);
    const sections = buildSectionsFromProducts(list);
    return sortSectionsByCategoryOrder(sections, categories);
  }, [products, categories]);

  const favoriteSections = useMemo((): SupplierSection[] => {
    const list = products.filter((p) => p.isFavorite);
    const sections = buildSectionsFromProducts(list);
    return sortSectionsByCategoryOrder(sections, categories);
  }, [products, categories]);

  return {
    supplier,
    selectedDate,
    products,
    catalogSections,
    favoriteSections,
    isLoading: supplierInfoQuery.isLoading || productsQuery.isLoading,
    isFetching: productsQuery.isFetching,
    error: supplierInfoQuery.error ?? productsQuery.error,
  };
}
