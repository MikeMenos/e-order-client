"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface LogoutButtonProps {
  onLogout: () => void;
  variant?: "mobile" | "desktop" | "both";
  pathname?: string;
}

export function ErgastirioLogoutButton({
  onLogout,
  variant = "both",
  pathname,
}: LogoutButtonProps) {
  const { t } = useTranslation();
  const showMobile =
    variant === "mobile" || variant === "both"
      ? pathname === "/ergastirio" || pathname === "/ergastirio/stores"
      : false;
  const showDesktop = variant === "desktop" || variant === "both";

  return (
    <>
      {showMobile && (
        <Button
          variant="outline"
          size="sm"
          className="md:hidden bg-red-500 text-white hover:bg-red-600 hover:text-white border-red-500"
          onClick={onLogout}
        >
          <LogOut className="mr-1 h-4 w-4" />
          {t("erg_logout")}
        </Button>
      )}
      {showDesktop && (
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex bg-red-500 text-white hover:bg-red-600 hover:text-white border-red-500"
          onClick={onLogout}
        >
          <LogOut className="mr-1 h-4 w-4" />
          {t("erg_logout")}
        </Button>
      )}
    </>
  );
}
