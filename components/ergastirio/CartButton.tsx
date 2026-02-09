"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { ERGASTIRIO_BASE } from "@/lib/ergastirio-constants";
import { useTranslation } from "@/lib/i18n";

interface CartButtonProps {
  cartCount?: number;
}

export function ErgastirioCartButton({ cartCount }: CartButtonProps) {
  const { t } = useTranslation();
  return (
    <Button variant="ghost" size="icon" asChild>
      <Link
        href={`${ERGASTIRIO_BASE}/cart`}
        aria-label={t("erg_cart_aria")}
        className="relative text-slate-700"
      >
        <ShoppingCart className="h-5 w-5" />
        {(cartCount ?? 0) > 0 && (
          <div className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white">
            {cartCount}
          </div>
        )}
      </Link>
    </Button>
  );
}
