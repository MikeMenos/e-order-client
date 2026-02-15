"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { IFamilyCategories } from "@/lib/ergastirio-interfaces";
import { ERGASTIRIO_BASE } from "@/lib/ergastirio-constants";

interface ProductCategoriesNavProps {
  families: IFamilyCategories[] | undefined;
  shouldShow: boolean;
}

export function ErgastirioProductCategoriesNav({
  families,
  shouldShow,
}: ProductCategoriesNavProps) {
  const pathname = usePathname();

  if (!shouldShow || !families) return null;

  return (
    <nav className="ml-4 flex items-center gap-1 md:gap-2">
      {families.map((family) => {
        const href = `${ERGASTIRIO_BASE}/products/${encodeURIComponent(family.FAMILY)}`;
        const isActive = pathname === href;
        return (
          <Button
            key={family.FAMILY}
            variant="ghost"
            size="sm"
            className={`whitespace-nowrap text-base font-medium transition-colors duration-300 ${
              isActive
                ? "bg-brand-500 font-bold text-white hover:bg-brand-600 rounded-full sm:px-4 sm:py-1"
                : "text-slate-700"
            }`}
          >
            <Link href={href}>{family.FAMILY}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
