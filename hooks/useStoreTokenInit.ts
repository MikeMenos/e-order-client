import { useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import type { SelectStoreResponse } from "../lib/types/dashboard";

/**
 * Hook to ensure store token is initialized when user returns to the app.
 * This should be used in the app layout to ensure store token is available
 * before making any store-related API calls.
 */
export function useStoreTokenInit() {
  const { users, selectedUser, storeAccessToken, accessToken } = useAuthStore();
  const setStoreAccessToken = useAuthStore((s) => s.setStoreAccessToken);

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
      onError: (error) => {
        // If select-store fails, clear the store token to prevent using stale token
        setStoreAccessToken(null);
      },
    },
  );

  useEffect(() => {
    if (storeUID && accessToken && !storeAccessToken) {
      selectStoreMutation.mutate(storeUID);
    }
  }, [storeUID, accessToken, storeAccessToken]);

  return {
    isInitializing: selectStoreMutation.isPending,
    hasStoreToken: !!storeAccessToken,
  };
}
