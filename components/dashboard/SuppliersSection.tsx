import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../../lib/i18n";
import { listVariants, listItemVariants } from "../../lib/motion";
import type { Supplier } from "./types";
import { SuppliersSectionHeader } from "./SuppliersSectionHeader";
import { SuppliersSearchBar } from "./SuppliersSearchBar";
import { SupplierTile } from "./SupplierTile";

type Props = {
  refDate: string;
  suppliers: Supplier[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
};

export function SuppliersSection({
  refDate,
  suppliers,
  isLoading,
  isError,
  errorMessage,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { t } = useTranslation();

  const toggleExpanded = (supplierUID: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(supplierUID)) next.delete(supplierUID);
      else next.add(supplierUID);
      return next;
    });
  };

  const filteredSuppliers = useMemo(() => {
    let data = [...suppliers];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((s) => s.title?.toLowerCase().includes(q));
    }

    if (showCompleted) {
      const completed = suppliers.filter(
        (s) => String(s.basketIconStatus) === "2"
      );
      const map = new Map<string, Supplier>();
      [...data, ...completed].forEach((s) => {
        map.set(s.supplierUID, s);
      });
      data = Array.from(map.values());
    }

    const getTimeValue = (time?: string | null) => {
      if (!time) return 0;
      const [hours, minutes] = time.split(":").map(Number);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
      return hours * 60 + minutes;
    };

    data.sort((a, b) => {
      const av = getTimeValue(a.labelOrderTimeExpiresAt ?? undefined);
      const bv = getTimeValue(b.labelOrderTimeExpiresAt ?? undefined);
      return isAscending ? av - bv : bv - av;
    });

    return data;
  }, [suppliers, searchQuery, showCompleted, isAscending]);

  return (
    <section>
      <div className="flex flex-col gap-2 mb-2">
        <SuppliersSearchBar value={searchQuery} onChange={setSearchQuery} />
        <SuppliersSectionHeader
          isAscending={isAscending}
          onSortToggle={() => setIsAscending((v) => !v)}
          showCompleted={showCompleted}
          onShowCompletedChange={setShowCompleted}
        />
      </div>

      {isLoading && (
        <p className="text-sm text-slate-400">{t("suppliers_loading")}</p>
      )}
      {isError && (
        <p className="text-sm text-red-400">
          {errorMessage ?? t("suppliers_error")}
        </p>
      )}

      {filteredSuppliers.length === 0 && !isLoading ? (
        <p className="text-sm text-slate-400">{t("suppliers_empty")}</p>
      ) : (
        <motion.div
          className="space-y-3"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredSuppliers.map((s) => (
            <motion.div key={s.supplierUID} variants={listItemVariants}>
              <SupplierTile
                supplier={s}
                refDate={refDate}
                isExpanded={expandedIds.has(s.supplierUID)}
                onToggleExpanded={() => toggleExpanded(s.supplierUID)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
