"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ErgastirioProductCategories from "@/components/ergastirio/ProductCategories";
import Loading from "@/components/ui/loading";
import { ergastirioStore } from "@/stores/ergastirioStore";
import { useGetFamilies } from "@/hooks/ergastirio/useGetFamilies";
import { ERGASTIRIO_BASE } from "@/lib/ergastirio-constants";

export default function ErgastirioHomePage() {
  const router = useRouter();
  const currentBranch = ergastirioStore((s) => s.currentBranch);
  const clientData = ergastirioStore((s) => s.clientData);

  const { data: families, isLoading } = useGetFamilies();

  useEffect(() => {
    const count = clientData?.length ?? 0;
    if (count > 1 && !currentBranch?.BRANCH) {
      router.replace(`${ERGASTIRIO_BASE}/stores`);
      return;
    }
    if (currentBranch?.GROUP_CHAIN === "L'ARTIGIANO") {
      router.replace(`${ERGASTIRIO_BASE}/products/LARTIGIANO`);
      return;
    }
    if (count === 1) {
      router.replace(`${ERGASTIRIO_BASE}/stores`);
    }
  }, [clientData?.length, currentBranch, router]);

  if (isLoading) return <Loading />;

  return <ErgastirioProductCategories data={families} />;
}
