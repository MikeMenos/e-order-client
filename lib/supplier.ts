import type { SupplierProduct, SupplierSection } from "@/lib/types/supplier";
import type { SupplierProductApi } from "@/lib/types/supplier-api";

export function buildSectionsFromProducts(
  products: SupplierProduct[],
): SupplierSection[] {
  if (!products || products.length === 0) return [];
  const byCategory = new Map<string, SupplierProduct[]>();
  products.forEach((p) => {
    const rawCategory = p.category ?? "OTHER";
    const key = String(rawCategory).toUpperCase();
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(p);
  });
  return Array.from(byCategory.entries()).map(([label, list]) => ({
    id: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    products: list,
  }));
}

export function mapRawProductsToSupplierProducts(
  raw: SupplierProductApi[],
): SupplierProduct[] {
  return raw.map((p) => ({
    id: p.productUID,
    title: p.productTitle ?? p.productOriginalTitle,
    subTitle: p.productDescription ?? "",
    description: p.productDescription ?? "",
    image: p.productImage ?? null,
    category: p.productCategories ?? "OTHER",
    price: p.price,
    productPackaging: p.productPackaging ?? "",
    qty: p.basketQty ?? 0,
    suggestedQty: p.basketSuggestedQty ?? null,
    isFavorite: p.isFavByShopper,
    favIconColor: p.favIconColor ?? "#9CBDFA",
    favIconMode: p.favIconMode ?? "border",
  }));
}
