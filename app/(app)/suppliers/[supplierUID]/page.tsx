"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
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
import { useMeasuredHeight } from "../../../../lib/utils";

export default function SupplierPage() {
  const { t } = useTranslation();
  const params = useParams<{ supplierUID: string }>();
  const searchParams = useSearchParams();
  const supplierUID = params.supplierUID;
  const refDate = searchParams.get("refDate") ?? undefined;

  const supplierInfoQuery = useSupplierDisplay(
    supplierUID,
    refDate ?? undefined
  );
  const productsQuery = useSupplierProducts(supplierUID, refDate ?? undefined);

  const selectedDate = refDate ?? supplierInfoQuery.data?.selectedDate ?? null;
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

    const byCategory = new Map<string, SupplierProduct[]>();

    products.forEach((p) => {
      const rawCategory = p.category ?? "OTHER";
      const key = String(rawCategory).toUpperCase();
      if (!byCategory.has(key)) byCategory.set(key, []);
      byCategory.get(key)!.push(p);
    });

    for (const [label, list] of byCategory.entries()) {
      if (label === "FAVORITES") continue;
      result.push({
        id: label.toLowerCase().replace(/\s+/g, "-"),
        label,
        products: list,
      });
    }

    return result;
  }, [products]);

  const [showDetails, setShowDetails] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const header = useMeasuredHeight<HTMLDivElement>();

  const tabsBar = useMeasuredHeight<HTMLDivElement>();

  const stickyOffset = header.height + (showDetails ? tabsBar.height : 0);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    filteredSections[0]?.id ?? null
  );

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (filteredSections.length === 0) {
      setActiveSectionId(null);
      return;
    }

    if (
      !activeSectionId ||
      !filteredSections.some((s) => s.id === activeSectionId)
    ) {
      setActiveSectionId(filteredSections[0].id);
    }
  }, [filteredSections, activeSectionId]);

  const lockActiveUntilRef = useRef<number>(0);

  useEffect(() => {
    if (filteredSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockActiveUntilRef.current) return;

        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => {
            const id = e.target.getAttribute("data-section-id");
            return {
              id,
              top: e.boundingClientRect.top,
              bottom: e.boundingClientRect.bottom,
              ratio: e.intersectionRatio,
            };
          })
          .filter(
            (
              x
            ): x is {
              id: string;
              top: number;
              bottom: number;
              ratio: number;
            } => !!x.id
          );

        if (visible.length === 0) return;

        const lineY = stickyOffset;

        const started = visible.filter((v) => v.top <= lineY + 1);

        let activeId: string;

        if (started.length > 0) {
          activeId = started.reduce((best, curr) =>
            curr.top > best.top ? curr : best
          ).id;
        } else {
          activeId = visible.reduce((best, curr) =>
            curr.top < best.top ? curr : best
          ).id;
        }

        setActiveSectionId(activeId);
      },
      {
        root: null,
        rootMargin: `-${stickyOffset}px 0px -60% 0px`,
        threshold: [0, 0.01, 0.1, 0.25, 0.5, 1],
      }
    );

    filteredSections.forEach((section) => {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [filteredSections, stickyOffset]);

  const handleTabClick = (id: string) => {
    const el = sectionRefs.current[id];
    if (!el) return;

    lockActiveUntilRef.current = Date.now() + 600;

    setActiveSectionId(id);

    const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-12 text-slate-900">
      {/* Sticky Header */}
      <div
        ref={header.ref}
        className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50 backdrop-blur supports-backdrop-filter:bg-slate-50/90"
      >
        <DashboardHeader embedded selectedDate={selectedDate} />
        <SupplierPageBar supplier={supplier} selectedDate={selectedDate} />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 pt-2">
        {/* Sticky Tabs/Search */}
        {showDetails && (
          <div
            ref={tabsBar.ref}
            className="sticky z-20 -mx-4"
            style={{ top: header.height }}
          >
            <div className="border-b border-slate-200 bg-slate-50 px-4 pt-0">
              <SupplierSearchAndTabs
                searchPlaceholder={t("supplier_search_placeholder")}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sections={filteredSections}
                activeSectionId={activeSectionId}
                onTabClick={handleTabClick}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {productsQuery.isLoading && (
            <p className="text-sm text-slate-500">
              {t("supplier_loading_products")}
            </p>
          )}

          {productsQuery.error && (
            <p className="text-sm text-red-400">
              {t("supplier_error_products")}
            </p>
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
                stickyOffset={stickyOffset}
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
