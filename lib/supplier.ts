import type { SupplierProduct, SupplierSection } from "@/lib/types/supplier";
import type {
  SupplierProductApi,
  SupplierDisplayCategory,
} from "@/lib/types/supplier-api";

/** Sort sections by category position from supplier. Categories not in the list go last. */
export function sortSectionsByCategoryOrder(
  sections: SupplierSection[],
  categories: SupplierDisplayCategory[],
): SupplierSection[] {
  if (!categories?.length) return sections;
  const positionByLabel = new Map(
    categories.map((c) => [String(c.title).toUpperCase().trim(), c.position]),
  );
  return [...sections].sort((a, b) => {
    const posA = positionByLabel.get(a.label) ?? Number.MAX_SAFE_INTEGER;
    const posB = positionByLabel.get(b.label) ?? Number.MAX_SAFE_INTEGER;
    return posA - posB;
  });
}

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
    suggestedQty: p.basketLastStockQty ?? null,
    isFavorite: p.isFavByShopper,
    favIconColor: p.favIconColor ?? "#9CBDFA",
    favIconMode: p.favIconMode ?? "border",
  }));
}
