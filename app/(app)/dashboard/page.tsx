"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../stores/auth";
import {
  useDashboardCalendar,
  useSuppliersForDate,
} from "../../../hooks/useDashboardData";
import { Button } from "../../../components/ui/button";

const formatTodayForAthens = () => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const athensDate = new Intl.DateTimeFormat("en-CA", options).format(
    new Date(),
  );
  return athensDate.replace(/\//g, "-");
};

export default function DashboardPage() {
  const { users, selectedUser } = useAuthStore();
  const setStoreAccessToken = useAuthStore((s) => s.setStoreAccessToken);
  const [refDate, setRefDate] = useState<string>(() => formatTodayForAthens());

  // Compute storeUID similar to HomeScreen
  const storeUID = useMemo(() => {
    if (!users && !selectedUser) return null;
    return users?.hasSelectedStore === true
      ? users?.selectedStoreUID
      : selectedUser?.store?.storeUID
        ? selectedUser.store.storeUID
        : (users?.role?.store?.storeUID ?? null);
  }, [users, selectedUser]);

  const selectStoreMutation = useMutation({
    mutationFn: async (storeID: string) => {
      const res = await api.get("Account/User_SelectStore", {
        params: { StoreUID: storeID },
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      setStoreAccessToken(data?.accessToken ?? null);
    },
  });

  useEffect(() => {
    if (storeUID) {
      selectStoreMutation.mutate(storeUID);
    }
  }, [storeUID]);

  // Dashboard calendar (to get calendarDays etc.)
  const calendarQuery = useDashboardCalendar(refDate, !!users);

  // Suppliers list for selected date
  const suppliersQuery = useSuppliersForDate(refDate, !!users);

  const suppliers = suppliersQuery.data?.listSuppliers ?? [];

  return (
    <main className="min-h-screen bg-slate-50 p-6 space-y-6 text-slate-900">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-400">
          Migrated view of the Home screen: calendar + suppliers list.
        </p>
        {users?.userInfos && (
          <p className="text-sm text-slate-300">
            Welcome{" "}
            <span className="font-medium">
              {users.userInfos.fname} {users.userInfos.lname}
            </span>
          </p>
        )}
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">Reference date</p>
            <p className="text-sm font-medium text-slate-100">{refDate}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefDate(formatTodayForAthens())}
          >
            Today
          </Button>
        </div>
        {calendarQuery.isLoading && (
          <p className="text-xs text-slate-400">Loading calendar…</p>
        )}
        {calendarQuery.error && (
          <p className="text-xs text-red-400">Failed to load calendar data.</p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">
            Suppliers for the day
          </h2>
          {suppliersQuery.isLoading && (
            <span className="text-xs text-slate-400">Loading…</span>
          )}
        </div>
        {suppliersQuery.error && (
          <p className="text-xs text-red-400">Failed to load suppliers list.</p>
        )}
        {suppliers.length === 0 && !suppliersQuery.isLoading ? (
          <p className="text-sm text-slate-400">No suppliers found.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((s: any) => (
              <Link
                key={s.supplierUID}
                href={`/suppliers/${encodeURIComponent(
                  s.supplierUID,
                )}?refDate=${encodeURIComponent(refDate)}`}
                className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-2 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {s.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.logo}
                      alt={s.title}
                      className="h-8 w-8 rounded-full bg-slate-950 object-contain"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-50">
                      {s.title}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {s.subTitle}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>
                    <span className="text-slate-400">Order by:</span>{" "}
                    <span className="font-medium">
                      {s.orderTillText ?? s.labelOrderTimeExpiresAt}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400">Delivery:</span>{" "}
                    <span className="font-medium">
                      {s.nextAvailDeliveryText}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
