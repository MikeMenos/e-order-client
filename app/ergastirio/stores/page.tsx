"use client";

import { useRouter } from "next/navigation";
import { ergastirioStore } from "@/stores/ergastirioStore";
import type { IStoreInfo } from "@/lib/ergastirio-interfaces";
import { CardHeader, CardTitle } from "@/components/ui/card";
import ErgastirioStoreCard from "@/components/ergastirio/StoreCard";
import { ERGASTIRIO_BASE } from "@/lib/ergastirio-constants";

export default function ErgastirioStoresPage() {
  const router = useRouter();
  const { clientData, setCurrentBranch, setBasketId } = ergastirioStore();
  const stores = clientData ?? [];
  const headStore = stores[0];

  const handleBranchChange = (branch: IStoreInfo) => {
    setCurrentBranch(branch);
    if (branch.BASKET_KEY && branch.BASKET_KEY !== "0") {
      setBasketId(branch.BASKET_KEY);
    }
    if (branch.GROUP_CHAIN === "L'ARTIGIANO") {
      router.push(`${ERGASTIRIO_BASE}/products/LARTIGIANO`);
    } else {
      router.push(ERGASTIRIO_BASE);
    }
  };

  return (
    <>
      {headStore && (
        <CardHeader className="mb-4 px-0 overflow-x-hidden">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center justify-between gap-3 min-w-0">
              <CardTitle className="min-w-0 truncate text-sm md:text-xl font-semibold tracking-tight leading-tight text-slate-900">
                {(headStore.NAME ?? "").split("-")[0].trim()}
              </CardTitle>
              {headStore.AFM && (
                <span className="shrink-0 text-xs uppercase tracking-[0.16em] text-slate-500">
                  ΑΦΜ {headStore.AFM}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-2">
        {stores.map((item) => (
          <div
            key={item.KEY_CODE ?? item.BRANCH}
            onClick={() => handleBranchChange(item)}
            className="mb-4 break-inside-avoid cursor-pointer"
          >
            <ErgastirioStoreCard data={item} isPending={false} />
          </div>
        ))}
      </div>
    </>
  );
}
