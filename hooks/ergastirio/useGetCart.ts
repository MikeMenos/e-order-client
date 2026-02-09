import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ergastirioStore } from "@/stores/ergastirioStore";
import type { ICart } from "@/lib/ergastirio-interfaces";

export function useGetCart({
  trdr,
  branch,
}: { trdr?: string; branch?: string } = {}) {
  const currentBranch = ergastirioStore((s) => s.currentBranch);
  const effectiveTrdr = trdr ?? currentBranch?.TRDR;
  const effectiveBranch = branch ?? currentBranch?.BRANCH;

  return useQuery<ICart, Error>({
    queryKey: ["ergastirio", "cart", effectiveTrdr, effectiveBranch],
    enabled: Boolean(effectiveTrdr && effectiveBranch),
    queryFn: async () => {
      const { data } = await api.post("/ergastirio/get-cart", {
        trdr: effectiveTrdr,
        branch: effectiveBranch,
      });
      return data;
    },
  });
}
