"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ergastirioStore } from "@/stores/ergastirioStore";
import { useGetFamilies } from "@/hooks/ergastirio/useGetFamilies";
import { useGetCart } from "@/hooks/ergastirio/useGetCart";
import type { IStoreInfo } from "@/lib/ergastirio-interfaces";
import { ERGASTIRIO_BASE } from "@/lib/ergastirio-constants";
import { ErgastirioLogo } from "./Logo";
import { ErgastirioMobileDrawer } from "./MobileDrawer";
import { ErgastirioProductCategoriesNav } from "./ProductCategoriesNav";
import { ErgastirioBranchSelector } from "./BranchSelector";
import { ErgastirioCartButton } from "./CartButton";
import { ErgastirioLogoutButton } from "./LogoutButton";
import { useTranslation } from "@/lib/i18n";

export default function ErgastirioHeader() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const {
    hydrated,
    setHydrated,
    vat,
    currentBranch,
    setCurrentBranch,
    setBasketId,
    clientData,
  } = ergastirioStore();

  const isSpecialAfm = vat === "999999999" || vat === "987654321";

  const { data: families, isFetching } = useGetFamilies();
  const trdr = currentBranch?.TRDR ? String(currentBranch.TRDR) : undefined;
  const branch = currentBranch?.BRANCH
    ? String(currentBranch.BRANCH)
    : undefined;
  const { data } = useGetCart({ trdr, branch });

  useEffect(() => {
    ergastirioStore.persist.rehydrate();
    setHydrated();
  }, [setHydrated]);

  const showClientsLink =
    isSpecialAfm && !pathname.startsWith(`${ERGASTIRIO_BASE}/clients`);
  const isPending = false;

  const handleBranchChange = (b: IStoreInfo) => {
    setOpen(false);
    setCurrentBranch(b);
    if (b?.BASKET_KEY && b.BASKET_KEY !== "0") {
      setBasketId(b.BASKET_KEY);
    }
    if (b.GROUP_CHAIN === "L'ARTIGIANO") {
      router.push(`${ERGASTIRIO_BASE}/products/LARTIGIANO`);
    } else {
      router.push(ERGASTIRIO_BASE);
    }
  };

  const handleLogout = async () => {
    ergastirioStore.getState().resetState();
    ergastirioStore.persist.clearStorage();
    if (typeof document !== "undefined") {
      document.cookie = "ergastirio_session=; path=/; max-age=0";
    }
    await fetch("/api/ergastirio/logout", { method: "POST" });
    router.replace("/");
  };

  if (!hydrated) return null;

  const clientDataForLogo = clientData?.length
    ? { success: true, count: clientData.length, data: clientData }
    : undefined;

  return (
    <header className="sticky top-0 z-50 w-full max-w-full overflow-x-hidden border-b border-slate-200 bg-app-card/95 shadow-sm backdrop-blur">
      <div className="flex h-16 w-full max-w-full min-w-0 items-center px-2 sm:px-4 justify-between overflow-x-hidden">
        <ErgastirioLogo pathname={pathname} clientData={clientDataForLogo} />
        {!isFetching && (
          <>
            {pathname !== `${ERGASTIRIO_BASE}/stores` && (
              <>
                <ErgastirioMobileDrawer
                  drawerOpen={drawerOpen}
                  onDrawerOpenChange={setDrawerOpen}
                  currentBranch={currentBranch}
                  clientData={clientDataForLogo}
                  isPending={isPending}
                  onBranchChange={handleBranchChange}
                  onLogout={handleLogout}
                />
                <div className="flex flex-1 min-w-0 overflow-x-auto items-center">
                  {showClientsLink && (
                    <Button
                      variant="ghost"
                      size="default"
                      className="whitespace-nowrap text-sm font-semibold px-4 py-2 hover:bg-brand-100 hover:text-brand-600 text-slate-700 rounded-lg"
                    >
                      <Link href={`${ERGASTIRIO_BASE}/clients`}>
                        {t("erg_clients_link")}
                      </Link>
                    </Button>
                  )}
                  <ErgastirioProductCategoriesNav
                    families={families}
                    shouldShow={
                      currentBranch?.GROUP_CHAIN !== "L'ARTIGIANO" &&
                      pathname !== ERGASTIRIO_BASE &&
                      !pathname.startsWith(`${ERGASTIRIO_BASE}/clients`)
                    }
                  />
                </div>
              </>
            )}

            <div className="flex items-center sm:gap-2 md:gap-4 min-w-0">
              {pathname !== `${ERGASTIRIO_BASE}/stores` &&
                !pathname.startsWith(`${ERGASTIRIO_BASE}/clients`) && (
                  <>
                    <ErgastirioBranchSelector
                      currentBranch={currentBranch}
                      clientData={clientDataForLogo}
                      isPending={isPending}
                      open={open}
                      onOpenChange={setOpen}
                      onBranchChange={handleBranchChange}
                      showOnMobile={
                        currentBranch?.GROUP_CHAIN === "L'ARTIGIANO"
                      }
                    />
                    <ErgastirioCartButton cartCount={data?.count} />
                  </>
                )}
              <ErgastirioLogoutButton
                onLogout={handleLogout}
                variant="desktop"
                pathname={pathname}
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
