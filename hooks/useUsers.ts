import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export const useUsersForStore = (storeUID: string | null) => {
  return useQuery({
    queryKey: ["mystore-users", storeUID],
    queryFn: async () => {
      const res = await api.post("MyStore/Users_Get", null, {
        params: { StoreUID: storeUID },
      });
      return res.data;
    },
    enabled: !!storeUID,
  });
};

