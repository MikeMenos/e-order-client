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
    onMutate: async (appUserUID) => {
      await queryClient.cancelQueries({ queryKey: ["mystore-users"] });
      await queryClient.cancelQueries({
        queryKey: ["user-profile", appUserUID],
      });
      const previousUsers = queryClient.getQueriesData<{
        listUsers?: { appUserUID?: string; isActive?: boolean }[];
      }>({ queryKey: ["mystore-users"] });
      const previousProfile = queryClient.getQueryData<{
        userProfile?: { appUserUID?: string; isActive?: boolean } | null;
      }>(["user-profile", appUserUID]);

      const flipIsActive = (u: { isActive?: boolean }) => ({
        ...u,
        isActive: !(u.isActive ?? true),
      });

      queryClient.setQueriesData<{ listUsers?: { appUserUID?: string; isActive?: boolean }[] }>(
        { queryKey: ["mystore-users"] },
        (old) => {
          if (!old?.listUsers) return old;
          return {
            ...old,
            listUsers: old.listUsers.map((u) =>
              u.appUserUID === appUserUID ? flipIsActive(u) : u,
            ),
          };
        },
      );
      queryClient.setQueryData<{
        userProfile?: { appUserUID?: string; isActive?: boolean } | null;
      }>(["user-profile", appUserUID], (old) => {
        if (!old?.userProfile || old.userProfile.appUserUID !== appUserUID)
          return old;
        return {
          ...old,
          userProfile: flipIsActive(old.userProfile),
        };
      });

      return { previousUsers, previousProfile };
    },
    onError: (err, appUserUID, context) => {
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          if (data != null)
            queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousProfile != null) {
        queryClient.setQueryData(["user-profile", appUserUID], context.previousProfile);
      }
      options?.onError?.(err);
    },
    onSuccess: () => {
      options?.onSuccess?.();
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["mystore-users"] });
      void queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
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
