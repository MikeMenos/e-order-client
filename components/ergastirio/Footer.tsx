"use client";

import { usePathname } from "next/navigation";
import { ergastirioStore } from "@/stores/ergastirioStore";
import { BranchInfo } from "./BranchInfo";
import { useTranslation } from "@/lib/i18n";

export default function ErgastirioFooter() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { currentBranch } = ergastirioStore();
  const isHome = pathname === "/ergastirio";
  const isCart = pathname === "/ergastirio/cart";

  return (
    <>
      {(isHome || isCart) && currentBranch && (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-app-card/95 backdrop-blur border-t border-slate-200 shadow-sm">
          <div className="px-4 py-2">
            <BranchInfo branch={currentBranch} showLabel />
          </div>
        </div>
      )}
      <footer className="w-full h-14 bg-app-card border-t border-slate-200 flex items-center justify-center text-base text-slate-500">
        {t("erg_footer_copyright")}
      </footer>
    </>
  );
}
