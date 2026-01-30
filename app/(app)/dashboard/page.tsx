"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../stores/auth";
import {
  useDashboardCalendar,
  useSuppliersForDate,
} from "../../../hooks/useDashboardData";
import { DashboardHeader } from "../../../components/dashboard/Header";
import { CalendarStrip } from "../../../components/dashboard/CalendarStrip";
import { SuppliersSection } from "../../../components/dashboard/SuppliersSection";

const formatTodayForAthens = () => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const athensDate = new Intl.DateTimeFormat("en-CA", options).format(
    new Date()
  );
  return athensDate.replace(/\//g, "-");
};

export default function DashboardPage() {
  const { users, selectedUser } = useAuthStore();
  const setStoreAccessToken = useAuthStore((s) => s.setStoreAccessToken);
  const storeAccessToken = useAuthStore((s) => s.storeAccessToken);
  const [refDate, setRefDate] = useState<string>(() => formatTodayForAthens());

  // Compute storeUID similar to HomeScreen
  const storeUID = useMemo(() => {
    if (!users && !selectedUser) return null;
    return users?.hasSelectedStore === true
      ? users?.selectedStoreUID
      : selectedUser?.store?.storeUID
      ? selectedUser.store.storeUID
      : users?.role?.store?.storeUID ?? null;
  }, [users, selectedUser]);

  const selectStoreMutation = useMutation({
    mutationFn: async (storeID: string) => {
      const res = await api.get("/select-store", {
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

  const hasStoreToken = !!storeAccessToken;

  // Dashboard calendar (to get calendarDays etc.)
  const calendarQuery = useDashboardCalendar(refDate, !!users && hasStoreToken);

  // Suppliers list for selected date
  const suppliersQuery = useSuppliersForDate(refDate, !!users && hasStoreToken);

  const suppliers = suppliersQuery.data?.listSuppliers ?? [];
  const calendarDays = calendarQuery.data?.calendarDays.slice(0, 7) ?? [];

  const suppliersErrorMessage =
    (suppliersQuery.error as any)?.message ?? undefined;

  const handleToday = () => setRefDate(formatTodayForAthens());

  const handleSelectDate = (date: string) => {
    setRefDate(date);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-5 space-y-4 text-slate-900">
      <div className="sticky top-0 z-10 -mx-5 -mt-5 border-b border-slate-200 bg-slate-50 px-5 pt-5 pb-2 shadow-sm mb-2">
        <DashboardHeader />
        <CalendarStrip
          days={calendarDays}
          selectedDate={refDate}
          onSelectDate={handleSelectDate}
          onToday={handleToday}
        />
      </div>
      <SuppliersSection
        refDate={refDate}
        suppliers={suppliers}
        isLoading={suppliersQuery.isLoading}
        isError={!!suppliersQuery.error}
        errorMessage={suppliersErrorMessage}
      />
    </main>
  );
}
