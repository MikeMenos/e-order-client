"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import {
  useSupplierDisplay,
  useSupplierProducts,
} from "../../../../hooks/useSupplier";
import { DashboardHeader } from "../../../../components/dashboard/Header";
import { useTranslation } from "../../../../lib/i18n";
import type {
  SupplierProduct,
  SupplierSection,
} from "../../../../components/supplier/types";
import { SupplierPageBar } from "../../../../components/supplier/SupplierPageBar";
import { SupplierSearchAndTabs } from "../../../../components/supplier/SupplierSearchAndTabs";
import { SupplierProductSection } from "../../../../components/supplier/SupplierProductSection";

export default function SupplierPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ supplierUID: string }>();
  const searchParams = useSearchParams();
  const supplierUID = params.supplierUID;
  const refDate = searchParams.get("refDate") ?? undefined;

  const supplierInfoQuery = useSupplierDisplay(
    supplierUID,
    refDate ?? undefined
  );
  const productsQuery = useSupplierProducts(supplierUID, refDate ?? undefined);

  const selectedDate = supplierInfoQuery.data?.selectedDate ?? null;
  const supplier = supplierInfoQuery.data?.supplier ?? null;
  const rawProducts = productsQuery.data?.products ?? [];

  const products = useMemo(
    (): SupplierProduct[] =>
      rawProducts.map((p: any) => ({
        id: p.productUID,
        title: p.productTitle ?? p.productOriginalTitle,
        subTitle: p.productPackaging ?? "",
        description: p.productDescription ?? "",
        image: p.productImage ?? null,
        category: p.productCategories ?? "OTHER",
        price: p.price,
        qty: p.basketQty ?? 0,
        isFavorite:
          p.isFavByShopper || p.isFavBySupplier || p.isFavByPlatform || false,
        favIconColor: p.favIconColor ?? "#9CBDFA",
        favIconMode: p.favIconMode ?? "border",
      })),
    [rawProducts]
  );

  // Build sections: favorites + categories
  const sections: SupplierSection[] = useMemo(() => {
    if (!products || products.length === 0) return [];

    const favorites = products.filter((p) => p.isFavorite);
    const result: SupplierSection[] = [];

    if (favorites.length > 0) {
      result.push({
        id: "favorites",
        label: "FAVORITES",
        products: favorites,
      });
    }

    const byCategory = new Map<string, any[]>();

    products.forEach((p) => {
      const rawCategory = p.category ?? "OTHER";
      const key = String(rawCategory).toUpperCase();
      if (!byCategory.has(key)) {
        byCategory.set(key, []);
      }
      byCategory.get(key)!.push(p);
    });

    for (const [label, list] of byCategory.entries()) {
      if (label === "FAVORITES") continue; // already handled
      result.push({
        id: label.toLowerCase().replace(/\s+/g, "-"),
        label,
        products: list,
      });
    }

    return result;
  }, [products]);

  // Scroll spy for sections
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    sections[0]?.id ?? null
  );
  const sectionRefs = useRef<Record<string, HTMLDivElement | null | undefined>>(
    {}
  );
  const [showDetails, setShowDetails] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setActiveSectionId(sections[0]?.id ?? null);
  }, [sections]);

  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLDivElement).offsetTop -
              (b.target as HTMLDivElement).offsetTop
          );

        if (visible[0]) {
          const id = visible[0].target.getAttribute("data-section-id");
          if (id && id !== activeSectionId) {
            setActiveSectionId(id);
          }
        }
      },
      {
        root: null,
        threshold: 0.25,
      }
    );

    sections.forEach((section) => {
      const el = sectionRefs.current[
        section.id
      ] as unknown as HTMLElement | null;
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, activeSectionId]);

  const handleTabClick = (id: string) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBack = () => {
    router.back();
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery) return sections;

    const q = searchQuery.toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        products: section.products.filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            p.subTitle?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        ),
      }))
      .filter((section) => section.products.length > 0);
  }, [sections, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-50 pb-12 text-slate-900">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50 backdrop-blur supports-backdrop-filter:bg-slate-50/90">
        <DashboardHeader embedded />
        <SupplierPageBar
          supplier={supplier}
          selectedDate={selectedDate}
          onBack={handleBack}
        />
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4">
          {showDetails && (
            <SupplierSearchAndTabs
              searchPlaceholder={t("supplier_search_placeholder")}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sections={filteredSections}
              activeSectionId={activeSectionId}
              onTabClick={handleTabClick}
            />
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 pt-2">
        {/* Sections */}
        <div className="space-y-4">
          {productsQuery.isLoading && (
            <p className="text-sm text-slate-500">Loading products…</p>
          )}
          {productsQuery.error && (
            <p className="text-sm text-red-400">Failed to load products.</p>
          )}

          {filteredSections.length === 0 && !productsQuery.isLoading ? (
            <p className="text-sm text-slate-600">
              {t("supplier_empty_products")}
            </p>
          ) : (
            filteredSections.map((section) => (
              <SupplierProductSection
                key={section.id}
                section={section}
                sectionRef={(el) => {
                  sectionRefs.current[section.id] = el;
                }}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
