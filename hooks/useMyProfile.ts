import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type {
  DeleteMyAccountResponse,
  MyProfileResponse,
  MyProfileUpdateRequest,
  MyProfileUpdateResponse,
} from "../lib/types/dashboard";

export type { MyProfileUpdateResponse } from "../lib/types/dashboard";

export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async (): Promise<MyProfileResponse> => {
      const res = await api.get<MyProfileResponse>("/my-profile");
      return res.data;
    },
  });
}

export function useMyProfileUpdate(options?: {
  onSuccess?: (data: MyProfileUpdateResponse) => void;
  onError?: (err: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options ?? {};
  return useMutation({
    mutationFn: async (payload: MyProfileUpdateRequest) => {
      const res = await api.post<MyProfileUpdateResponse>(
        "/my-profile-update",
        payload,
      );
      return res.data;
    },
    onSuccess: (data, _payload) => {
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      onSuccess?.(data);
    },
    onError,
  });
}

export function useDeleteMyAccount(options?: {
  onSuccess?: (data: DeleteMyAccountResponse) => void;
  onError?: (err: unknown) => void;
}) {
  const { onSuccess, onError } = options ?? {};
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<DeleteMyAccountResponse>("/delete-my-account");
      return res.data;
    },
    onSuccess,
    onError,
  });
}
