"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function shouldShowBackgroundImage(pathname: string): boolean {
  if (pathname === "/dashboard" || pathname === "/settings") return true;
  if (pathname === "/settings/manage-suppliers") return true;
  if (pathname.startsWith("/settings/manage-suppliers/")) return true;
  if (pathname === "/settings/manage-users") return true;
  return false;
}

export function AppBackground() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get("from");

  useEffect(() => {
    const noScroll =
      pathname === "/dashboard" ||
      pathname === "/settings" ||
      pathname === "/settings/manage-suppliers" ||
      pathname?.startsWith("/settings/manage-suppliers/");
    if (noScroll) {
      document.documentElement.classList.add("overflow-hidden");
      document.body.classList.add("overflow-hidden");
    } else {
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("overflow-hidden");
    }

    const showBrandBackground =
      (!!pathname?.startsWith("/suppliers/") &&
        (fromParam === "settings" ||
          (fromParam === "orders-of-the-day" &&
            pathname?.endsWith("/checkout")))) ||
      pathname === "/all-suppliers" ||
      pathname === "/settings/account" ||
      pathname === "/settings/order-schedule" ||
      pathname === "/settings/partner-suppliers" ||
      pathname === "/notifications" ||
      pathname === "/settings/manage-users" ||
      pathname === "/orders-of-the-day" ||
      pathname?.startsWith("/orders-of-the-day/");
    const showImage =
      shouldShowBackgroundImage(pathname ?? "") && !showBrandBackground;

    if (showImage) {
      document.body.classList.add("app-bg-image");
    } else {
      document.body.classList.remove("app-bg-image");
    }

    if (showBrandBackground) {
      document.body.classList.add("app-bg-brand-gradient");
    } else {
      document.body.classList.remove("app-bg-brand-gradient");
    }

    return () => {
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("overflow-hidden");
      document.body.classList.remove("app-bg-image");
      document.body.classList.remove("app-bg-brand-gradient");
    };
  }, [pathname, fromParam]);

  return null;
}
