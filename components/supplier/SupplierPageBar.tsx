"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "../../lib/i18n";
import { useBasketItems } from "../../hooks/useBasket";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

type SupplierInfo = {
  supplierUID?: string;
  logo?: string | null;
  title?: string | null;
  customTitle?: string | null;
  subTitle?: string | null;
  tileColorMode?: string | null;
};

type Props = {
  supplier: SupplierInfo | null;
  selectedDate?: string | null;
  mainTab?: "catalog" | "favorites";
  onMainTabChange?: (tab: "catalog" | "favorites") => void;
};

export function SupplierPageBar({ supplier, mainTab, onMainTabChange }: Props) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const supplierUID = supplier?.supplierUID;
  const fromParam = searchParams.get("from");

  const { data: basketData } = useBasketItems(
    supplierUID ? { SupplierUID: supplierUID } : undefined,
  );
  const supplierBasket =
    basketData?.basketsList?.find((b) => b.supplierUID === supplierUID) ??
    basketData?.basketsList?.[0];
  const basketItemCount = supplierBasket?.totalItems ?? 0;

  const supplierLabel = supplier?.title ?? supplier?.subTitle;

  const queryString = fromParam ? `?from=${encodeURIComponent(fromParam)}` : "";
  const checkoutHref = `/suppliers/${encodeURIComponent(supplierUID as string)}/checkout${queryString}`;

  const showProductTabs =
    typeof mainTab === "string" && typeof onMainTabChange === "function";

  return (
    <div className="flex flex-col gap-0">
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-2">
        {supplierUID ? (
          <Link
            href={`/settings/manage-suppliers/${encodeURIComponent(supplierUID)}`}
            className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-lg transition-colors hover:bg-slate-100/80 active:bg-slate-100"
            aria-label={t("supplier_manage") ?? "Manage supplier"}
          >
            {supplier?.logo && (
              <img
                src={supplier.logo}
                alt={supplierLabel ?? ""}
                className="h-10 w-10 shrink-0 rounded-full bg-slate-100 object-contain"
              />
            )}
            <div className="min-w-0 flex-1 overflow-hidden">
              <p
                className="text-base font-semibold text-slate-900"
                title={supplierLabel ?? ""}
              >
                {supplierLabel}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
            {supplier?.logo && (
              <img
                src={supplier.logo}
                alt={supplierLabel ?? ""}
                className="h-10 w-10 shrink-0 rounded-full bg-slate-100 object-contain"
              />
            )}
            <div className="min-w-0 flex-1 overflow-hidden">
              <p
                className="text-base font-semibold text-slate-900"
                title={supplierLabel ?? ""}
              >
                {supplierLabel}
              </p>
            </div>
          </div>
        )}
        <div className="flex shrink-0 items-center gap-2 text-base text-slate-500">
          <Link
            href={checkoutHref}
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100 md:h-9 md:w-9"
            aria-label={t("checkout_button")}
          >
            <ShoppingCart className="h-4 w-4 md:h-4.5 md:w-4.5" />
            {basketItemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                {basketItemCount > 99 ? "99+" : basketItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      {showProductTabs && (
        <Tabs
          value={mainTab}
          onValueChange={(v) =>
            onMainTabChange?.(v === "favorites" ? "favorites" : "catalog")
          }
          className="w-full px-4 pb-2"
        >
          <TabsList className="grid w-full grid-cols-2 rounded-lg bg-slate-100">
            <TabsTrigger
              value="favorites"
              className="rounded-md font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              {t("supplier_favorites")}
            </TabsTrigger>
            <TabsTrigger
              value="catalog"
              className="rounded-md font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              {t("supplier_catalog")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </div>
  );
}
