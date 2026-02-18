import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../../lib/i18n";
import { listVariants, listItemVariants } from "../../lib/motion";
import { Button } from "../ui/button";
import Loading from "../ui/loading";
import { SuppliersSearchBar } from "./SuppliersSearchBar";
import { SupplierTile } from "./SupplierTile";
import { usePathname } from "next/navigation";
import { SuppliersListItem } from "@/lib/types/dashboard";
import { useAppHeaderHeight } from "@/app/(app)/AppHeaderContext";

type Props = {
  suppliers: SuppliersListItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  /** When provided, each tile is a button and this is called instead of linking (e.g. manage-suppliers). */
  onSupplierClick?: (supplier: SuppliersListItem) => void;
  /** Rendered between the search bar and the list (e.g. orders-of-the-day tabs). */
  children?: React.ReactNode;
  /** When true (e.g. on Πρόχειρες tab), all tiles show draft style and text. */
  displayAsDraft?: boolean;
};

export function SuppliersSection({
  suppliers,
  isLoading,
  isError,
  errorMessage,
  onSupplierClick,
  children,
  displayAsDraft = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const { t } = useTranslation();
  const pathname = usePathname();
  const headerHeight = useAppHeaderHeight();

  const filteredSuppliers = useMemo(() => {
    let data = [...suppliers];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.subTitle?.toLowerCase().includes(q),
      );
    }

    if (statusFilter) {
      data = data.filter(
        (s) => (s.basketIconStatusDescr?.trim() ?? "") === statusFilter,
      );
    }

    // Sort by nextAvailDeliveryText on orders-of-the-day
    if (pathname === "/orders-of-the-day") {
      data.sort((a, b) => {
        const na = (a.nextAvailDeliveryText ?? "").toLowerCase();
        const nb = (b.nextAvailDeliveryText ?? "").toLowerCase();
        const cmp = na.localeCompare(nb);
        return isAscending ? cmp : -cmp;
      });
    }

    // Alphabetical by title on all-suppliers and manage-suppliers
    if (
      pathname === "/all-suppliers" ||
      pathname === "/settings/manage-suppliers"
    ) {
      data.sort((a, b) => {
        const na = (a.title ?? "").toLowerCase();
        const nb = (b.title ?? "").toLowerCase();
        const cmp = na.localeCompare(nb);
        return isAscending ? cmp : -cmp;
      });
    }

    return data;
  }, [suppliers, searchQuery, statusFilter, isAscending, pathname]);

  return (
    <section>
      <div
        className="sticky z-20 -mx-3 mb-2 w-[calc(100%+1.5rem)] flex flex-col gap-2 bg-app-bg-solid"
        style={{ top: headerHeight }}
      >
        <div className="flex h-9 items-center gap-2 mt-2">
          <SuppliersSearchBar value={searchQuery} onChange={setSearchQuery} />
          {(pathname === "/all-suppliers" ||
            pathname === "/settings/manage-suppliers") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 gap-1 border-slate-300 text-slate-700"
              aria-label={
                isAscending
                  ? t("suppliers_sort_alpha_asc")
                  : t("suppliers_sort_alpha_desc")
              }
              onClick={() => setIsAscending((v) => !v)}
            >
              {isAscending ? "A → Z" : "Z → A"}
            </Button>
          )}
        </div>
        {pathname === "/orders-of-the-day" && children}
      </div>

      {isLoading && <Loading spinnerOnly />}
      {isError && (
        <p className="text-base text-red-400">
          {errorMessage ?? t("suppliers_error")}
        </p>
      )}

      {filteredSuppliers.length === 0 && !isLoading ? (
        <p className="text-base text-slate-400 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
          {t("suppliers_empty")}
        </p>
      ) : (
        <motion.div
          className={
            pathname === "/all-suppliers" ||
            pathname === "/settings/manage-suppliers"
              ? "grid grid-cols-2 gap-3 pb-8"
              : "space-y-2 pb-8"
          }
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredSuppliers.map((s) => (
            <motion.div key={s.supplierUID} variants={listItemVariants}>
              <SupplierTile
                supplier={s}
                showDeliveryInfo={
                  pathname !== "/all-suppliers" &&
                  pathname !== "/settings/manage-suppliers"
                }
                showBasketStatus={
                  pathname !== "/all-suppliers" &&
                  pathname !== "/settings/manage-suppliers"
                }
                displayAsDraft={displayAsDraft}
                tileStyle="default"
                href={
                  onSupplierClick
                    ? undefined
                    : (() => {
                        if (pathname === "/orders-of-the-day") {
                          if (s.basketIconStatus === 200 && s.todaysOrderUID) {
                            return `/orders-of-the-day/order/${encodeURIComponent(s.todaysOrderUID)}`;
                          }
                          return `/suppliers/${encodeURIComponent(s.supplierUID)}?from=orders-of-the-day`;
                        }
                        return `/suppliers/${encodeURIComponent(s.supplierUID)}`;
                      })()
                }
                onClick={onSupplierClick ? () => onSupplierClick(s) : undefined}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
