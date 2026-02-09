"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { LogOut, Menu } from "lucide-react";
import type { IStoreInfo } from "@/lib/ergastirio-interfaces";
import { BranchInfo } from "./BranchInfo";
import { useTranslation } from "@/lib/i18n";

interface MobileDrawerProps {
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  currentBranch: IStoreInfo | undefined;
  clientData: { data: IStoreInfo[] } | undefined;
  isPending: boolean;
  onBranchChange: (branch: IStoreInfo) => void;
  onLogout: () => void;
}

export function ErgastirioMobileDrawer({
  drawerOpen,
  onDrawerOpenChange,
  currentBranch,
  clientData,
  isPending,
  onBranchChange,
  onLogout,
}: MobileDrawerProps) {
  const { t } = useTranslation();
  return (
    <Drawer open={drawerOpen} onOpenChange={onDrawerOpenChange}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0 text-slate-700"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="px-4 pb-4">
          {clientData && clientData.data.length > 1 && (
            <>
              <DrawerHeader>
                <DrawerTitle>Επιλογή καταστήματος</DrawerTitle>
              </DrawerHeader>
              <nav className="flex flex-col gap-4">
                {clientData.data.map((branch) => {
                  const isActive = branch.BRANCH === currentBranch?.BRANCH;
                  return (
                    <Button
                      key={branch.BRANCH}
                      type="button"
                      variant="ghost"
                      className={`w-full justify-start ${
                        isActive
                          ? "bg-brand-500 rounded-full text-white hover:bg-brand-600 py-5"
                          : "text-slate-700"
                      }`}
                      disabled={isActive || isPending}
                      onClick={async () => {
                        onBranchChange(branch);
                        onDrawerOpenChange(false);
                      }}
                    >
                      <BranchInfo branch={branch} isActive={isActive} />
                    </Button>
                  );
                })}
              </nav>
            </>
          )}
        </div>
        <Separator />
        <DrawerFooter>
          <Button
            variant="outline"
            className="w-full bg-red-500 text-white hover:bg-red-600 hover:text-white border-red-500"
            onClick={() => {
              onDrawerOpenChange(false);
              onLogout();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("erg_logout")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
