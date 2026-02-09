"use client";

import { useEffect, useMemo, useState } from "react";
import ErgastirioClientsTable from "@/components/ergastirio/ClientsTable";
import { Input } from "@/components/ui/input";
import { useGetClientsAll } from "@/hooks/ergastirio/useGetClientsAll";
import { ergastirioStore } from "@/stores/ergastirioStore";
import type { IStoreInfo } from "@/lib/ergastirio-interfaces";
import { useTranslation } from "@/lib/i18n";

const PAGE_SIZE = 20;

export default function ErgastirioClientsPage() {
  const { t } = useTranslation();
  const vat = ergastirioStore((s) => s.vat);
  const setCurrentBranch = ergastirioStore((s) => s.setCurrentBranch);
  const isSpecialAfm = vat === "999999999" || vat === "987654321";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useGetClientsAll(true);

  useEffect(() => {
    setCurrentBranch(undefined);
  }, [setCurrentBranch]);

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (vat === "999999999") {
      const bySalesman = list.filter(
        (c: IStoreInfo) => (c.SALESMAN ?? "") === "16"
      );
      if (!search.trim()) return bySalesman;
      const q = search.trim().toLowerCase();
      return bySalesman.filter(
        (c: IStoreInfo) =>
          (c.NAME ?? "").toLowerCase().includes(q) ||
          (c.AFM ?? "").toLowerCase().includes(q) ||
          (c.CITY ?? "").toLowerCase().includes(q)
      );
    }
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (c: IStoreInfo) =>
        (c.NAME ?? "").toLowerCase().includes(q) ||
        (c.AFM ?? "").toLowerCase().includes(q) ||
        (c.CITY ?? "").toLowerCase().includes(q)
    );
  }, [data, vat, search]);

  const paginated = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{t("erg_clients")}</h1>
        <Input
          placeholder={t("erg_clients_search_placeholder")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="max-w-xs border-slate-200 bg-white"
        />
      </div>
      <ErgastirioClientsTable
        clients={paginated}
        loading={isLoading}
        error={error ?? null}
      />
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-slate-200 bg-app-card px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50"
          >
            {t("erg_prev_page")}
          </button>
          <span className="text-sm text-slate-600">
            {t("erg_page")
              .replace("{current}", String(page + 1))
              .replace("{total}", String(totalPages))}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg border border-slate-200 bg-app-card px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50"
          >
            {t("erg_next_page")}
          </button>
        </div>
      )}
    </div>
  );
}
