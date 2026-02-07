import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { useTranslation } from "../../lib/i18n";
import { listVariants, listItemVariants } from "../../lib/motion";
import type { Supplier } from "./types";
import { SuppliersSectionHeader } from "./SuppliersSectionHeader";
import { SuppliersSearchBar } from "./SuppliersSearchBar";
import { SupplierTile } from "./SupplierTile";
import { usePathname } from "next/navigation";

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
  const [statusFilter, setStatusFilter] = useState("");
  const { t } = useTranslation();
  const pathname = usePathname();

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    suppliers.forEach((s) => {
      const d = s.basketIconStatusDescr?.trim();
      if (d) set.add(d);
    });
    return Array.from(set).sort();
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    let data = [...suppliers];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter((s) => s.title?.toLowerCase().includes(q));
    }

    if (statusFilter) {
      data = data.filter(
        (s) => (s.basketIconStatusDescr?.trim() ?? "") === statusFilter,
      );
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
  }, [suppliers, searchQuery, statusFilter, isAscending]);

  const isToday = (() => {
    try {
      const ref = parseISO(refDate);
      const today = new Date();
      return (
        ref.getFullYear() === today.getFullYear() &&
        ref.getMonth() === today.getMonth() &&
        ref.getDate() === today.getDate()
      );
    } catch {
      return false;
    }
  })();

  const dateFormatted = (() => {
    try {
      return format(parseISO(refDate), "EEEE d MMMM");
    } catch {
      return refDate;
    }
  })();

  return (
    <section>
      <div className="mb-2 flex flex-col gap-2">
        {pathname !== "/all-suppliers" && (
          <p className="text-xl text-slate-900 mt-2 text-center">
            {isToday ? (
              <>
                <span className="font-medium text-green-600">
                  {t("calendar_today")}
                </span>
                <span> – {dateFormatted}</span>
              </>
            ) : (
              dateFormatted
            )}
          </p>
        )}
        <SuppliersSearchBar value={searchQuery} onChange={setSearchQuery} />
        <SuppliersSectionHeader
          isAscending={isAscending}
          onSortToggle={() => setIsAscending((v) => !v)}
          statusOptions={statusOptions}
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
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
              <SupplierTile supplier={s} refDate={refDate} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
