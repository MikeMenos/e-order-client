import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { IFamilyCategories } from "@/lib/ergastirio-interfaces";

export function useGetFamilies() {
  return useQuery<IFamilyCategories[], Error>({
    queryKey: ["ergastirio", "families"],
    queryFn: async () => {
      const { data } = await api.post("/ergastirio/get-families");
      return data.data;
    },
  });
}
