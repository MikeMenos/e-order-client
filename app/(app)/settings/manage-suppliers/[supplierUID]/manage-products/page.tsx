"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { useAppHeaderHeight } from "@/app/(app)/AppHeaderContext";
import { useMeasuredHeight } from "@/lib/utils";
import { listVariants, listItemVariants } from "@/lib/motion";
import { SupplierPageBar } from "@/components/supplier/SupplierPageBar";
import { SupplierSearchAndTabs } from "@/components/supplier/SupplierSearchAndTabs";
import { SupplierProductSection } from "@/components/supplier/SupplierProductSection";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import Loading from "@/components/ui/loading";
import { getApiErrorMessage } from "@/lib/api-error";
import { useActiveTabsStore, activeTabKeys } from "@/stores/activeTabs";
import { useSupplierPageProducts } from "@/hooks/useSupplierPageProducts";
import { useSupplierSectionScrollSpy } from "@/hooks/useSupplierSectionScrollSpy";
import { useBackToTop } from "@/hooks/useBackToTop";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function ManageProductsPage() {
  const { t } = useTranslation();
  const params = useParams<{ supplierUID: string }>();
  const supplierUID = params.supplierUID;

  const mainTabKey = activeTabKeys.supplierMain(supplierUID ?? "");
  const sectionTabKey = activeTabKeys.supplierSection(supplierUID ?? "");
  const storedMainTab = useActiveTabsStore((s) => s.tabs[mainTabKey]);
  const mainTab: "catalog" | "favorites" =
    storedMainTab === "catalog" ? "catalog" : "favorites";
  const setActiveTab = useActiveTabsStore((s) => s.setActiveTab);
  const setMainTab = (tab: "catalog" | "favorites") =>
    setActiveTab(mainTabKey, tab);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 500);

  const { supplier, catalogSections, favoriteSections, isLoading, isFetching, error } =
    useSupplierPageProducts(supplierUID, {
      mainTab,
      search: debouncedSearch,
    });

  const currentTabSections =
    mainTab === "catalog" ? catalogSections : favoriteSections;
  const prevMainTabRef = useRef(mainTab);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [mainTab]);

  useEffect(() => {
    if (!isLoading && !isFetching) {
      prevMainTabRef.current = mainTab;
    }
  }, [mainTab, isLoading, isFetching]);

  const isTabChanging =
    prevMainTabRef.current !== mainTab && (isFetching || isLoading);

  const showBackToTop = useBackToTop();

  const headerHeight = useAppHeaderHeight();
  const stickyBarMeasurement = useMeasuredHeight<HTMLDivElement>();
  const stickyBarHeight = stickyBarMeasurement.height;
  const scrollOffset =
    headerHeight + (stickyBarHeight > 0 ? stickyBarHeight : 100);

  const { activeSectionId, setSectionRef, handleTabClick } =
    useSupplierSectionScrollSpy({
      filteredSections: currentTabSections,
      mainTab,
      sectionTabKey,
      scrollOffset,
    });

  return (
    <main className="pb-16 text-slate-900 px-3">
      <h1 className="text-center text-xl font-bold text-slate-900 mt-2 mb-1">
        {t("settings_edit_products")}
      </h1>
      <div className="flex flex-col">
        <div
          ref={stickyBarMeasurement.ref}
          className="sticky z-20 flex shrink-0 flex-col w-full rounded-lg bg-app-card/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-app-card/90"
          style={{ top: headerHeight }}
        >
          <div className="w-full rounded-t-lg bg-app-card/95 backdrop-blur supports-backdrop-filter:bg-app-card/90">
            <SupplierPageBar
              supplier={supplier}
              mainTab={mainTab}
              onMainTabChange={setMainTab}
              hideCartIcon
              centerLayout
            />
          </div>
          <div className="mx-auto w-full max-w-4xl rounded-b-lg bg-app-card/95 backdrop-blur supports-backdrop-filter:bg-app-card/90">
            <SupplierSearchAndTabs
              searchPlaceholder={t("products_search_placeholder")}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sections={currentTabSections}
              activeSectionId={activeSectionId}
              onTabClick={handleTabClick}
              hideTabs={isLoading || isTabChanging}
            />
          </div>
        </div>

        {(isLoading || isTabChanging) && <Loading spinnerOnly />}

        {error && (
          <p className="text-base text-red-400">
            {getApiErrorMessage(error, t("supplier_error_products"))}
          </p>
        )}

        {!(isLoading || isTabChanging) &&
          (currentTabSections.length === 0 && !error ? (
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
            {currentTabSections.map((section) => (
              <motion.div key={section.id} variants={listItemVariants}>
                <SupplierProductSection
                  section={section}
                  stickyOffset={scrollOffset}
                  supplierUID={supplierUID}
                  sectionRef={(el) => setSectionRef(section.id, el)}
                  compact
                />
              </motion.div>
            ))}
          </motion.div>
          ))}
      </div>

      <BackToTopButton
        show={showBackToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        ariaLabel={t("nav_back_to_top")}
      />
    </main>
  );
}
