"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ErgastirioProductCategories from "@/components/ergastirio/ProductCategories";
import Loading from "@/components/ui/loading";
import { ergastirioStore } from "@/stores/ergastirioStore";
import { useGetFamilies } from "@/hooks/ergastirio/useGetFamilies";
import { ERGASTIRIO_BASE } from "@/lib/ergastirio-constants";
import "../../app/globals.css";

export default function ErgastirioHomePage() {
  const router = useRouter();
  const hydrated = ergastirioStore((s) => s.hydrated);
  const currentBranch = ergastirioStore((s) => s.currentBranch);
  const clientData = ergastirioStore((s) => s.clientData);

  const { data: families, isLoading } = useGetFamilies();

  useEffect(() => {
    if (!hydrated) return;
    if (!currentBranch?.BRANCH) {
      router.replace(`${ERGASTIRIO_BASE}/stores`);
      return;
    }
    if (currentBranch.GROUP_CHAIN === "L'ARTIGIANO") {
      router.replace(`${ERGASTIRIO_BASE}/products/LARTIGIANO`);
    }
  }, [hydrated, clientData?.length, currentBranch, router]);

  if (isLoading) return <Loading />;

  return <ErgastirioProductCategories data={families} />;
}
