"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function shouldShowBackgroundImage(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname === "/settings" ||
    pathname === "/settings/manage-suppliers" ||
    pathname?.startsWith("/settings/manage-suppliers/")
  );
}

export function AppBackground() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get("from");

  useEffect(() => {
    const isManageSupplierDetail =
      pathname?.match(/^\/settings\/manage-suppliers\/[^/]+$/) != null;
    const noScroll =
      pathname === "/dashboard" ||
      pathname === "/settings" ||
      isManageSupplierDetail;
    if (noScroll) {
      document.documentElement.classList.add("overflow-hidden");
      document.body.classList.add("overflow-hidden");
    } else {
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("overflow-hidden");
    }

    const showImage = shouldShowBackgroundImage(pathname ?? "");
    const showBrandBackground = !showImage;

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
