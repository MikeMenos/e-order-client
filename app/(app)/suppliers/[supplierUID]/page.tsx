"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "../../../../lib/i18n";
import { useAppHeaderHeight } from "@/app/(app)/AppHeaderContext";
import { useMeasuredHeight } from "@/lib/utils";
import { listVariants, listItemVariants } from "../../../../lib/motion";
import { SupplierPageBar } from "../../../../components/supplier/SupplierPageBar";
import { SupplierSearchAndTabs } from "../../../../components/supplier/SupplierSearchAndTabs";
import { SupplierProductSection } from "../../../../components/supplier/SupplierProductSection";
import { SupplierCheckoutBar } from "../../../../components/supplier/SupplierCheckoutBar";
import { BackToTopButton } from "../../../../components/ui/BackToTopButton";
import Loading from "../../../../components/ui/loading";
import { useActiveTabsStore, activeTabKeys } from "@/stores/activeTabs";
import { useSupplierPageProducts } from "../../../../hooks/useSupplierPageProducts";
import { useSupplierSectionScrollSpy } from "../../../../hooks/useSupplierSectionScrollSpy";
import { useBackToTop } from "../../../../hooks/useBackToTop";
import { useInputFocusTracking } from "../../../../hooks/useInputFocusTracking";

export default function SupplierPage() {
  const { t } = useTranslation();
  const params = useParams<{ supplierUID: string }>();
  const supplierUID = params.supplierUID;

  const {
    supplier,
    selectedDate,
    catalogSections,
    favoriteSections,
    isLoading,
    error,
  } = useSupplierPageProducts(supplierUID);

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

  const [searchQuery, setSearchQuery] = useState("");
  const showBackToTop = useBackToTop();
  const isInputFocused = useInputFocusTracking();

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
  const stickyBarMeasurement = useMeasuredHeight<HTMLDivElement>();
  const stickyBarHeight = stickyBarMeasurement.height;
  const scrollOffset =
    headerHeight + (stickyBarHeight > 0 ? stickyBarHeight : 100);

  const { activeSectionId, setSectionRef, handleTabClick } =
    useSupplierSectionScrollSpy({
      filteredSections,
      mainTab,
      sectionTabKey,
      scrollOffset,
    });

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
        <div
          ref={stickyBarMeasurement.ref}
          className="sticky z-20 w-full rounded-b-lg bg-app-card/95 backdrop-blur supports-backdrop-filter:bg-app-card/90"
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

        {isLoading && <Loading spinnerOnly />}

        {error && (
          <p className="text-base text-red-400">
            {t("supplier_error_products")}
          </p>
        )}

        {filteredSections.length === 0 && !isLoading ? (
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
                  sectionRef={(el) => setSectionRef(section.id, el)}
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

      <BackToTopButton
        show={showBackToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        ariaLabel={t("nav_back_to_top")}
      />
    </main>
  );
}
