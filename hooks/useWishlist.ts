import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export const useWishlistItems = () => {
  return useQuery({
    queryKey: ["wishlist-items"],
    queryFn: async () => {
      const res = await api.get("/wishlist-items", {
        params: {},
      });
      return res.data;
    },
  });
};
