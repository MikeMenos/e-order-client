import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { api } from "../lib/api";
import { useAuthStore, useEffectiveSelectedUser } from "../stores/auth";
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

export const useSuppliersForDate = (
  enabled: boolean,
  refDate?: string | null,
) => {
  const hasRefDate = refDate != null && refDate !== "";

  return useQuery({
    queryKey: ["suppliers", hasRefDate ? refDate : "today"],
    queryFn: async (): Promise<SuppliersListResponse> => {
      const body: Record<string, unknown> = {
        setCategories: true,
        setLastOrders: true,
        setDeliverySchedule: true,
        setDailyAnalysisSchedule: true,
      };
      if (hasRefDate) {
        body.refDate = refDate;
      } else {
        body.refDate = null;
      }
      const res = await api.post<SuppliersListResponse>("/suppliers-list", body);
      return res.data;
    },
    enabled,
  });
};

/**
 * Fetches suppliers for today (or for refDateOverride when provided) with store token.
 * Use on all-suppliers and orders-of-the-day pages.
 * @param refDateOverride - Optional ISO date string (e.g. "2026-02-18T10:39:44.364Z"). When set, list is for that date.
 */
export function useSuppliersListForToday(refDateOverride?: string | null) {
  const users = useAuthStore((s) => s.users);
  const effectiveUser = useEffectiveSelectedUser();
  const selectedStoreUID = useAuthStore((s) => s.selectedStoreUID);
  const setStoreAccessToken = useAuthStore((s) => s.setStoreAccessToken);
  const setSelectedStoreUID = useAuthStore((s) => s.setSelectedStoreUID);
  const storeAccessToken = useAuthStore((s) => s.storeAccessToken);
  const refDate = useMemo(
    () =>
      refDateOverride != null && refDateOverride !== ""
        ? refDateOverride
        : null,
    [refDateOverride],
  );

  const derivedStoreUID = useMemo(() => {
    if (!users && !effectiveUser) return null;
    return users?.hasSelectedStore === true
      ? users?.selectedStoreUID
      : effectiveUser?.store?.storeUID
        ? effectiveUser.store.storeUID
        : (users?.role?.store?.storeUID ?? null);
  }, [users, effectiveUser]);

  const storeUID = selectedStoreUID || derivedStoreUID;

  const selectStoreMutation = useMutation<SelectStoreResponse, unknown, string>(
    {
      mutationFn: async (storeID: string) => {
        const res = await api.get<SelectStoreResponse>("/select-store", {
          params: { StoreUID: storeID },
        });
        return res.data;
      },
      onSuccess: (data, storeID) => {
        setStoreAccessToken(data?.accessToken ?? null);
        setSelectedStoreUID(storeID);
      },
    },
  );

  useEffect(() => {
    // Always refresh store token when we have storeUID
    // This ensures we get a fresh token even if one exists
    if (storeUID && !selectStoreMutation.isPending) {
      selectStoreMutation.mutate(storeUID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeUID]);

  const hasStoreToken = !!storeAccessToken;
  // Only run store-dependent API when we actually have a store token.
  const enabled = !!users && hasStoreToken;
  const suppliersListQuery = useSuppliersForDate(enabled, refDate);
  const suppliers = suppliersListQuery.data?.listSuppliers ?? [];
  const dayNameShort = suppliersListQuery.data?.dayNameShort;
  const errorMessage = (suppliersListQuery.error as Error)?.message;

  return {
    refDate,
    suppliers,
    dayNameShort,
    isLoading: suppliersListQuery.isLoading,
    isError: !!suppliersListQuery.error,
    errorMessage,
  };
}

/**
 * GET Shop/SuppliersNoPartners_GetList.
 * Use on settings/partner-suppliers page.
 */
export function useSuppliersNoPartners() {
  const query = useQuery({
    queryKey: ["suppliers-no-partners"],
    queryFn: async (): Promise<SuppliersListResponse> => {
      const res = await api.get<SuppliersListResponse>("/suppliers-no-partners");
      return res.data;
    },
  });

  const suppliers = query.data?.listSuppliers ?? [];
  return {
    suppliers,
    isLoading: query.isLoading,
    isError: !!query.error,
    errorMessage: (query.error as Error)?.message,
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
