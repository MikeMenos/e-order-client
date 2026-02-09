import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { ClientResponse } from "@/lib/ergastirio-interfaces";

export function useGetClientsAll(enabled?: boolean) {
  return useQuery<ClientResponse, Error>({
    queryKey: ["ergastirio", "clients-all"],
    enabled: !!enabled,
    queryFn: async () => {
      const { data } = await api.post<ClientResponse>("/ergastirio/get-clients-all");
      return data;
    },
  });
}
