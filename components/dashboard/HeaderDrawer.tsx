"use client";

import { Drawer } from "vaul";
import { Menu, Home, Store, LogOut } from "lucide-react";
import { useTranslation } from "../../lib/i18n";
import { Button } from "../ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoHome: () => void;
  onSwitchStore: () => void;
  onLogout: () => void;
  rolesCount: number;
};

export function HeaderDrawer({
  open,
  onOpenChange,
  onGoHome,
  onSwitchStore,
  onLogout,
  rolesCount,
}: Props) {
  const { t } = useTranslation();

  return (
    <Drawer.Root direction="left" open={open} onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed left-0 top-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col border-r border-slate-200 bg-slate-50 shadow-xl outline-none data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:h-full">
          <div className="flex shrink-0 justify-center border-b border-slate-200 px-4 py-4">
            <img
              src="/assets/logo.png"
              alt="E-Order"
              className="h-20 w-h-20 object-contain"
            />
          </div>
          <div className="flex flex-col gap-2 p-4">
            <Button
              type="button"
              variant="ghost"
              className="justify-start gap-3 text-left"
              onClick={onGoHome}
            >
              <Home className="h-5 w-5 shrink-0" />
              {t("nav_home")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="justify-start gap-3 text-left"
              onClick={onSwitchStore}
              disabled={rolesCount === 0}
            >
              <Store className="h-5 w-5 shrink-0" />
              {t("nav_switch_store")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="justify-start gap-3 text-left text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {t("logout")}
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
