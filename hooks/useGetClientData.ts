import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import type { ClientResponse } from "@/lib/ergastirio-interfaces";

type GetClientDataPayload = { AFM: string; PIN: string };

/**
 * Calls /api/get-client-data with AFM and PIN (e.g. username and password from login).
 * Used on the main login page to decide: if data is returned, switch to ergastirio app; else continue with normal auth.
 */
export function useGetClientData() {
  return useMutation<ClientResponse, Error, GetClientDataPayload>({
    mutationFn: async ({ AFM, PIN }) => {
      const { data } = await api.post<ClientResponse>("/get-client-data", {
        AFM,
        PIN,
      });
      return data;
    },
  });
}
