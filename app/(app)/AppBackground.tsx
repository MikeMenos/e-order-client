"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function shouldShowBackgroundImage(pathname: string): boolean {
  if (pathname === "/dashboard" || pathname === "/settings") return true;
  if (pathname.startsWith("/settings/manage-suppliers/")) return true;
  if (pathname === "/settings/manage-users") return true;
  return false;
}

export function AppBackground() {
  const pathname = usePathname();

  useEffect(() => {
    const show = shouldShowBackgroundImage(pathname ?? "");
    if (show) {
      document.body.classList.add("app-bg-image");
    } else {
      document.body.classList.remove("app-bg-image");
    }
    return () => document.body.classList.remove("app-bg-image");
  }, [pathname]);

  return null;
}
