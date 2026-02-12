import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useMemo } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import type {
  SupplierBasicInfoResponse,
  SupplierBasicInfoSupplier,
  SuppliersListResponse,
  SelectStoreResponse,
} from "../lib/types/dashboard";

export type {
  SupplierBasicInfoSupplier,
  SupplierBasicInfoResponse,
} from "../lib/types/dashboard";

export const useDashboardCalendar = (enabled: boolean) => {
  return useQuery({
    queryKey: ["dashboardCalendar"],
    queryFn: async () => {
      const res = await api.post("/dashboard-calendar", {});
      return res.data;
    },
    enabled,
  });
};

export const useSuppliersForDate = (enabled: boolean) => {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async (): Promise<SuppliersListResponse> => {
      const res = await api.post<SuppliersListResponse>("/suppliers-list", {
        setCategories: true,
        setLastOrders: true,
        setDeliverySchedule: true,
        setDailyAnalysisSchedule: true,
      });
      return res.data;
    },
    enabled,
  });
};

/**
 * Fetches suppliers for today with store token. Use on all-suppliers and orders-of-the-day pages.
 */
export function useSuppliersListForToday() {
  const { users, selectedUser } = useAuthStore();
  const setStoreAccessToken = useAuthStore((s) => s.setStoreAccessToken);
  const storeAccessToken = useAuthStore((s) => s.storeAccessToken);
  const refDate = format(new Date(), "yyyy-MM-dd");

  const storeUID = useMemo(() => {
    if (!users && !selectedUser) return null;
    return users?.hasSelectedStore === true
      ? users?.selectedStoreUID
      : selectedUser?.store?.storeUID
        ? selectedUser.store.storeUID
        : (users?.role?.store?.storeUID ?? null);
  }, [users, selectedUser]);

  const selectStoreMutation = useMutation<SelectStoreResponse, unknown, string>(
    {
      mutationFn: async (storeID: string) => {
        const res = await api.get<SelectStoreResponse>("/select-store", {
          params: { StoreUID: storeID },
        });
        return res.data;
      },
      onSuccess: (data) => {
        setStoreAccessToken(data?.accessToken ?? null);
      },
    },
  );

  useEffect(() => {
    if (storeUID && !storeAccessToken) {
      selectStoreMutation.mutate(storeUID);
    }
  }, [storeUID, storeAccessToken]);

  const hasStoreToken = !!storeAccessToken;
  const enabled = !!users && hasStoreToken;
  const suppliersListQuery = useSuppliersForDate(enabled);
  const suppliers = suppliersListQuery.data?.listSuppliers ?? [];
  const errorMessage = (suppliersListQuery.error as Error)?.message;

  return {
    refDate,
    suppliers,
    isLoading: suppliersListQuery.isLoading,
    isError: !!suppliersListQuery.error,
    errorMessage,
  };
}

/**
 * GET Shop/Supplier_BasicInfos.
 * When supplierUID is null/undefined, calls with no params (backend may return list for today).
 */
export const useSupplierBasicInfos = (
  supplierUID: string | null | undefined,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ["supplier-basic-infos", supplierUID],
    queryFn: async (): Promise<SupplierBasicInfoResponse> => {
      const res = await api.get<SupplierBasicInfoResponse>(
        "/supplier-basic-infos",
        supplierUID ? { params: { SupplierUID: supplierUID } } : {},
      );
      return res.data;
    },
    enabled,
  });
};
