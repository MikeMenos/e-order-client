"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import ErgastirioProductCard from "@/components/ergastirio/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loading from "@/components/ui/loading";
import { useGetProductsPerFamily } from "@/hooks/ergastirio/useGetProductsPerFamily";
import { useGetCart } from "@/hooks/ergastirio/useGetCart";
import { useHandleOnSubmitProducts } from "@/hooks/ergastirio/useHandleOnSubmitProducts";
import { ergastirioStore } from "@/stores/ergastirioStore";
import type { IProductItem } from "@/lib/ergastirio-interfaces";
import { X } from "lucide-react";
import { ERGASTIRIO_BASE } from "@/lib/ergastirio-constants";
import { useTranslation } from "@/lib/i18n";

export default function ErgastirioProductsFamilyPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const family = decodeURIComponent(String(params?.family ?? "")).trim();
  const currentBranch = ergastirioStore((s) => s.currentBranch);
  const trdr = currentBranch?.TRDR ? String(currentBranch.TRDR) : undefined;
  const branch = currentBranch?.BRANCH
    ? String(currentBranch.BRANCH)
    : undefined;

  useEffect(() => {
    if (!family || (!currentBranch?.TRDR && !currentBranch?.BRANCH)) {
      router.replace(`${ERGASTIRIO_BASE}/stores`);
    }
  }, [family, currentBranch, router]);

  const { data, isLoading } = useGetProductsPerFamily({
    family,
    trdr,
    branch,
  });
  const { data: cartData } = useGetCart({ trdr, branch });
  const { onSubmitProducts } = useHandleOnSubmitProducts();

  const productsWithQty = useMemo((): IProductItem[] | undefined => {
    return data?.map((product) => {
      const productId = Number(product.ITEMUID);
      const matchingCartLine = cartData?.data?.find(
        (line: IProductItem) => Number(line.MTRL) === productId,
      );
      return {
        ...product,
        Qty2: matchingCartLine ? Number(matchingCartLine.Qty2) : 0,
      };
    });
  }, [data, cartData]);

  const [filter, setFilter] = useState("");

  const filteredProducts = useMemo(() => {
    if (!productsWithQty) return undefined;
    const q = filter.trim().toLowerCase();
    if (!q) return productsWithQty;
    return productsWithQty.filter((p) =>
      (p.TITLE ?? "").toLowerCase().includes(q),
    );
  }, [productsWithQty, filter]);

  if (isLoading) return <Loading />;

  const favProducts = filteredProducts?.filter((p) => p.FAV === "FAV");
  const regProducts = filteredProducts?.filter((p) => p.FAV === "REG");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-row sm:items-center mb-1">
        <Input
          placeholder={t("erg_search_placeholder")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="sm:max-w-xs border-slate-200 bg-white"
        />
        {filter && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFilter("")}
            className="text-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Card className="shadow-none rounded-2xl border-slate-200 bg-app-card">
        <CardContent className="p-0 lg:p-3 space-y-6 text-sm">
          {favProducts && favProducts.length > 0 && (
            <section>
              <div className="relative mb-3">
                <span className="inline-flex items-center rounded-full bg-brand-500 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
                  {t("erg_fav_products")}
                </span>
              </div>
              <div className="space-y-3">
                {favProducts.map((item) => (
                  <ErgastirioProductCard
                    product={item}
                    key={item.CODE}
                    onSubmitProducts={onSubmitProducts}
                  />
                ))}
              </div>
            </section>
          )}

          {regProducts && regProducts.length > 0 && (
            <section>
              <div className="mb-3">
                <span className="inline-flex items-center rounded-full bg-slate-700 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
                  {t("erg_other_products")}
                </span>
              </div>
              <div className="space-y-3">
                {regProducts.map((item) => (
                  <ErgastirioProductCard
                    product={item}
                    key={item.CODE}
                    onSubmitProducts={onSubmitProducts}
                  />
                ))}
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
