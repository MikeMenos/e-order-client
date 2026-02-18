"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
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
import { Button } from "../../../../components/ui/button";
import Loading from "../../../../components/ui/loading";
import { useActiveTabsStore, activeTabKeys } from "@/stores/activeTabs";

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

  const mainTabKey = activeTabKeys.supplierMain(supplierUID ?? "");
  const sectionTabKey = activeTabKeys.supplierSection(supplierUID ?? "");
  const storedMainTab = useActiveTabsStore((s) => s.tabs[mainTabKey]);
  const mainTab: "catalog" | "favorites" =
    storedMainTab === "catalog" ? "catalog" : "favorites";
  const setActiveTab = useActiveTabsStore((s) => s.setActiveTab);
  const setMainTab = (tab: "catalog" | "favorites") =>
    setActiveTab(mainTabKey, tab);
  const currentTabSections =
    mainTab === "catalog" ? catalogSections : favoriteSections;

  const [showDetails, setShowDetails] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const threshold =
        typeof window !== "undefined" ? window.innerHeight * 0.5 : 400;
      setShowBackToTop(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const headerHeight = useAppHeaderHeight();
  const scrollOffset = headerHeight;

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevMainTabRef = useRef<string | null>(null);
  const hasRestoredSectionRef = useRef(false);

  useEffect(() => {
    if (filteredSections.length === 0) return;
    if (hasRestoredSectionRef.current) return;
    hasRestoredSectionRef.current = true;
    const stored = useActiveTabsStore.getState().getActiveTab(sectionTabKey);
    if (stored && filteredSections.some((s) => s.id === stored)) {
      setActiveSectionId(stored);
    } else {
      setActiveSectionId(filteredSections[0].id);
    }
  }, [filteredSections, sectionTabKey]);

  useEffect(() => {
    if (prevMainTabRef.current !== null && prevMainTabRef.current !== mainTab) {
      setActiveSectionId(filteredSections[0]?.id ?? null);
    }
    prevMainTabRef.current = mainTab;
  }, [mainTab, filteredSections]);

  useEffect(() => {
    if (activeSectionId) setActiveTab(sectionTabKey, activeSectionId);
  }, [activeSectionId, sectionTabKey, setActiveTab]);

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

        const lineY = scrollOffset;

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
        rootMargin: `-${scrollOffset}px 0px -60% 0px`,
        threshold: [0, 0.01, 0.1, 0.25, 0.5, 1],
      },
    );

    filteredSections.forEach((section) => {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [filteredSections, scrollOffset]);

  const handleTabClick = (id: string) => {
    const el = sectionRefs.current[id];
    if (!el) return;

    lockActiveUntilRef.current = Date.now() + 600;

    setActiveSectionId(id);

    const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <main className="pb-16 text-slate-900 px-3">
      <div className="w-full rounded-t-lg mt-2 bg-app-card/95 backdrop-blur supports-backdrop-filter:bg-app-card/90">
        <SupplierPageBar
          supplier={supplier}
          selectedDate={selectedDate}
          mainTab={mainTab}
          onMainTabChange={setMainTab}
        />
      </div>

      <div className="flex flex-col">
        {showDetails && (
          <div
            className="sticky z-20 w-full rounded-b-lg bg-app-card/95 backdrop-blur supports-backdrop-filter:bg-app-card/90 pb-1"
            style={{ top: headerHeight }}
          >
            <div className="mx-auto max-w-4xl">
              <SupplierSearchAndTabs
                searchPlaceholder={t("products_search_placeholder")}
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

        {productsQuery.isLoading && <Loading spinnerOnly />}

        {productsQuery.error && (
          <p className="text-base text-red-400">
            {t("supplier_error_products")}
          </p>
        )}

        {filteredSections.length === 0 && !productsQuery.isLoading ? (
          <p className="text-base text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
            {t("supplier_empty_products")}
          </p>
        ) : (
          <motion.div
            className="space-y-3 pb-16"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredSections.map((section) => (
              <motion.div key={section.id} variants={listItemVariants}>
                <SupplierProductSection
                  section={section}
                  stickyOffset={scrollOffset}
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

      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-20 md:bottom-6 md:right-6"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-full border-slate-200 shadow-lg hover:bg-slate-50"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label={t("nav_back_to_top")}
            >
              <ChevronUp className="h-6 w-6 text-brand-500" aria-hidden />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
