import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  UsersAddOrUpdateRequest,
  UsersAddOrUpdateResponse,
  UsersSetPermissionsRequest,
} from "@/lib/types/users";

export const useUsersForStore = (storeUID: string | null) => {
  return useQuery({
    queryKey: ["mystore-users", storeUID],
    queryFn: async () => {
      const res = await api.post("/store-users", null, {
        params: { StoreUID: storeUID },
      });
      return res.data;
    },
    enabled: !!storeUID,
  });
};

export const useUserProfile = (appUserUID: string | null) => {
  return useQuery({
    queryKey: ["user-profile", appUserUID],
    queryFn: async () => {
      const res = await api.get("/users-view-profile", {
        params: { AppUserUID: appUserUID },
      });
      return res.data;
    },
    enabled: !!appUserUID,
  });
};

export const useUsersToggleActive = (options?: {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appUserUID: string) => {
      const res = await api.post("/users-toggle-active", { appUserUID });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mystore-users"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};

export const useUsersAddOrUpdate = (options?: {
  onSuccess?: (data: UsersAddOrUpdateResponse) => void;
  onError?: (err: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      body: UsersAddOrUpdateRequest,
    ): Promise<UsersAddOrUpdateResponse> => {
      const res = await api.post("/users-add-or-update", body);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mystore-users"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export const useUsersSetPermissions = (options?: {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UsersSetPermissionsRequest) => {
      const res = await api.post("/users-set-permissions", body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mystore-users"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
};
