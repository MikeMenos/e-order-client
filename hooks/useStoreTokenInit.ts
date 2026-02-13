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
  const {
    users,
    selectedUser,
    selectedStoreUID: cookieStoreUID,
    storeAccessToken,
    accessToken,
  } = useAuthStore();
  const setStoreAccessToken = useAuthStore((s) => s.setStoreAccessToken);
  const setSelectedStoreUID = useAuthStore((s) => s.setSelectedStoreUID);

  const derivedStoreUID = useMemo(() => {
    if (!users && !selectedUser) return null;
    return users?.hasSelectedStore === true
      ? users?.selectedStoreUID
      : selectedUser?.store?.storeUID
        ? selectedUser.store.storeUID
        : (users?.role?.store?.storeUID ?? null);
  }, [users, selectedUser]);

  // Use cookie/persisted store UID first so we can call select-store on return before zustand rehydration
  const storeUID = cookieStoreUID || derivedStoreUID;

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
      // Do not clear store token/cookies on error; only clear on explicit logout
    },
  );

  useEffect(() => {
    // Always refresh store token when returning to app if we have storeUID and accessToken
    // This ensures we get a fresh token even if one exists in cookies
    if (storeUID && accessToken) {
      // Only skip if we're already initializing or if we just initialized
      if (!selectStoreMutation.isPending && !selectStoreMutation.isSuccess) {
        selectStoreMutation.mutate(storeUID);
      }
    }
  }, [storeUID, accessToken]);

  return {
    isInitializing: selectStoreMutation.isPending,
    hasStoreToken: !!storeAccessToken,
  };
}
