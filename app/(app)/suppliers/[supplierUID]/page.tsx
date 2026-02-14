"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  useSupplierDisplay,
  useSupplierProducts,
} from "../../../../hooks/useSupplier";
import { useTranslation } from "../../../../lib/i18n";
import { useAppHeaderHeight } from "@/app/(app)/AppHeaderContext";
import { listVariants, listItemVariants } from "../../../../lib/motion";
import type { SupplierProduct, SupplierSection } from "@/lib/types/supplier";
import { SupplierPageBar } from "../../../../components/supplier/SupplierPageBar";
import { SupplierSearchAndTabs } from "../../../../components/supplier/SupplierSearchAndTabs";
import { SupplierProductSection } from "../../../../components/supplier/SupplierProductSection";
import { SupplierCheckoutBar } from "../../../../components/supplier/SupplierCheckoutBar";
import { useMeasuredHeight } from "../../../../lib/utils";
import { Tabs, TabsList, TabsTrigger } from "../../../../components/ui/tabs";

function buildSectionsFromProducts(
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

export default function SupplierPage() {
  const { t } = useTranslation();
  const params = useParams<{ supplierUID: string }>();
  const supplierUID = params.supplierUID;

  const supplierInfoQuery = useSupplierDisplay(supplierUID);
  const productsQuery = useSupplierProducts(supplierUID);

  const selectedDate = supplierInfoQuery.data?.selectedDate ?? undefined;
  const supplier = supplierInfoQuery.data?.supplier ?? null;
  const rawProducts = productsQuery.data?.products ?? [];

  const products = useMemo(
    (): SupplierProduct[] =>
      rawProducts.map((p: any) => {
        const productUID = p.productUID;
        return {
          id: productUID,
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
        };
      }),
    [rawProducts],
  );

  /** Catalog = non-favorite products by category; Favorites = favorite products by category */
  const catalogSections: SupplierSection[] = useMemo(() => {
    const list = products.filter((p) => !p.isFavorite);
    return buildSectionsFromProducts(list);
  }, [products]);

  const favoriteSections: SupplierSection[] = useMemo(() => {
    const list = products.filter((p) => p.isFavorite);
    return buildSectionsFromProducts(list);
  }, [products]);

  const [mainTab, setMainTab] = useState<"catalog" | "favorites">("catalog");
  const currentTabSections =
    mainTab === "catalog" ? catalogSections : favoriteSections;

  const [showDetails, setShowDetails] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))
        setIsInputFocused(true);
    };
    const onFocusOut = () => setIsInputFocused(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return currentTabSections;
    const q = searchQuery.toLowerCase();
    return currentTabSections
      .map((section) => ({
        ...section,
        products: section.products.filter(
          (p) =>
            p.title?.toLowerCase().includes(q) ||
            p.subTitle?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q),
        ),
      }))
      .filter((section) => section.products.length > 0);
  }, [currentTabSections, searchQuery]);

  const layoutHeaderHeight = useAppHeaderHeight();
  const pageBar = useMeasuredHeight<HTMLDivElement>();
  const tabsBar = useMeasuredHeight<HTMLDivElement>();

  /** Fallback when page bar not yet measured so tabs don't overlap it */
  const pageBarHeight = pageBar.height > 0 ? pageBar.height : 52;
  const tabsStickyTop = layoutHeaderHeight + pageBarHeight;

  const stickyOffset =
    layoutHeaderHeight + pageBarHeight + (showDetails ? tabsBar.height : 0);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    filteredSections[0]?.id ?? null,
  );

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setActiveSectionId(filteredSections[0]?.id ?? null);
  }, [mainTab]);

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
              x,
            ): x is {
              id: string;
              top: number;
              bottom: number;
              ratio: number;
            } => !!x.id,
          );

        if (visible.length === 0) return;

        const lineY = stickyOffset;

        const started = visible.filter((v) => v.top <= lineY + 1);

        let activeId: string;

        if (started.length > 0) {
          activeId = started.reduce((best, curr) =>
            curr.top > best.top ? curr : best,
          ).id;
        } else {
          activeId = visible.reduce((best, curr) =>
            curr.top < best.top ? curr : best,
          ).id;
        }

        setActiveSectionId(activeId);
      },
      {
        root: null,
        rootMargin: `-${stickyOffset}px 0px -60% 0px`,
        threshold: [0, 0.01, 0.1, 0.25, 0.5, 1],
      },
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
    <main className="pb-16 text-slate-900 px-3">
      {/* Sticky bar below layout header: full width on mobile, same width as content on desktop */}
      <div
        ref={pageBar.ref}
        className="sticky z-10 w-full"
        style={{ top: layoutHeaderHeight }}
      >
        <div className="w-full bg-app-card/95 backdrop-blur supports-backdrop-filter:bg-app-card/90 rounded-t-lg mt-2">
          <SupplierPageBar supplier={supplier} selectedDate={selectedDate} />
        </div>
      </div>

      <div className="flex flex-col">
        {/* Sticky Tabs/Search: full width on mobile, same width as content on desktop */}
        {showDetails && (
          <div
            ref={tabsBar.ref}
            className="sticky z-20 w-full bg-app-card/95 rounded-b-lg"
            style={{ top: tabsStickyTop }}
          >
            <div className="mx-auto max-w-4xl">
              <Tabs
                value={mainTab}
                onValueChange={(v) =>
                  setMainTab(v === "favorites" ? "favorites" : "catalog")
                }
                className="w-full"
              >
                <TabsList className="mb-2 grid w-full grid-cols-2 rounded-lg bg-slate-100 p-1">
                  <TabsTrigger
                    value="catalog"
                    className="rounded-md font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    {t("supplier_catalog")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="favorites"
                    className="rounded-md font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    {t("supplier_favorites")}
                  </TabsTrigger>
                </TabsList>
                <SupplierSearchAndTabs
                  searchPlaceholder={t("suppliers_search_placeholder")}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  sections={filteredSections}
                  activeSectionId={activeSectionId}
                  onTabClick={handleTabClick}
                />
              </Tabs>
            </div>
          </div>
        )}

        {/* Content */}

        {productsQuery.isLoading && (
          <p className="text-sm text-slate-500">
            {t("supplier_loading_products")}
          </p>
        )}

        {productsQuery.error && (
          <p className="text-sm text-red-400">{t("supplier_error_products")}</p>
        )}

        {filteredSections.length === 0 && !productsQuery.isLoading ? (
          <p className="text-sm text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
            {t("supplier_empty_products")}
          </p>
        ) : (
          <motion.div
            className="space-y-3"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredSections.map((section) => (
              <motion.div key={section.id} variants={listItemVariants}>
                <SupplierProductSection
                  section={section}
                  stickyOffset={stickyOffset}
                  supplierUID={supplierUID}
                  sectionRef={(el) => {
                    sectionRefs.current[section.id] = el;
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <SupplierCheckoutBar
        supplierUID={supplierUID}
        hideWhenInputFocused={isInputFocused}
      />
    </main>
  );
}
