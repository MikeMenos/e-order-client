import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export const useOrdersList = (page = 0, pageSize = 50) => {
  return useQuery({
    queryKey: ["orders-list", page, pageSize],
    queryFn: async () => {
      const res = await api.post("/orders", {
        page,
        pageSize,
      });
      return res.data;
    },
  });
};
