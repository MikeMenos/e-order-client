"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { IProductItem } from "@/lib/ergastirio-interfaces";
import { ERGASTIRIO_BASE } from "@/lib/ergastirio-constants";
import { useTranslation } from "@/lib/i18n";

export const placeholderImage: Record<string, string> = {
  DONUT: "/categories/donuts.jpg",
  ΑΡΤΟΠΟΙΗΜΑΤΑ: "/categories/artos.jpg",
  ΣΦΟΛΙΑΤΑ: "/categories/sfol.jpg",
  ΑΛΛΟ: "/categories/allo.jpg",
};

interface ErgastirioProductCardProps {
  product: IProductItem;
  onSubmitProducts?: (
    product: IProductItem,
    qty: number,
    isDelete?: boolean
  ) => void;
  onQtyChange?: (product: IProductItem, qty: number) => void;
  isPending?: boolean;
  showWholesalePrice?: boolean;
  showCartVatPricing?: boolean;
  isPricingLoading?: boolean;
}

export default function ErgastirioProductCard({
  product,
  onSubmitProducts,
  isPending,
  onQtyChange,
  showWholesalePrice,
  showCartVatPricing,
  isPricingLoading,
}: ErgastirioProductCardProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [qty, setQty] = useState<number | "">(product.Qty2);
  const [error, setError] = useState("");
  const [isItemPending, setIsItemPending] = useState(false);
  const prevQty2Ref = useRef(product.Qty2);

  useEffect(() => {
    if (product.Qty2 !== prevQty2Ref.current) {
      prevQty2Ref.current = product.Qty2;
      setQty(product.Qty2);
    }
  }, [product.Qty2]);

  const IMAGE_BASE_URL = "https://ergastiri.oncloud.gr/s1services?filename=";
  const wholesalePrice = showWholesalePrice
    ? (() => {
        const p = parseFloat(product.PRICE_PER_MU1 || "0");
        const s = parseFloat(product.SXESI || "0");
        if (Number.isNaN(p) || Number.isNaN(s)) return null;
        return (p * s).toFixed(2);
      })()
    : null;

  const categoryKey = product.FAMILY?.trim().toUpperCase();
  const imageUrl = product.IMAGE?.trim()
    ? `${IMAGE_BASE_URL}${product.IMAGE.trim()}`
    : (placeholderImage[categoryKey] ?? "/categories/allo.jpg");

  const onAddProductToBasket = () => {
    if (typeof qty === "number" && qty <= 0) {
      setError(t("erg_quantity_error_negative"));
      return;
    }
    if (onSubmitProducts && qty) {
      setIsItemPending(true);
      Promise.resolve(onSubmitProducts(product, qty)).finally(() =>
        setIsItemPending(false)
      );
    }
  };

  const handleRemove = () => {
    if (onSubmitProducts && qty) {
      setIsItemPending(true);
      Promise.resolve(onSubmitProducts(product, qty, true)).finally(() =>
        setIsItemPending(false)
      );
    }
  };

  const handleQtyChange = (value: string, setter: (v: number | "") => void) => {
    setError("");
    const numberValue = value === "" ? "" : Number(value);
    setter(numberValue);
    if (
      pathname === `${ERGASTIRIO_BASE}/cart` &&
      onQtyChange &&
      typeof numberValue === "number"
    ) {
      onQtyChange(product, numberValue);
    }
  };

  const incrementQty = () => {
    handleQtyChange(String(Number(qty || 0) + 1), setQty);
  };

  const decrementQty = () => {
    handleQtyChange(String(Math.max(0, Number(qty || 0) - 1)), setQty);
  };

  const isCart = pathname === `${ERGASTIRIO_BASE}/cart`;
  const showItemLoading = isItemPending || isPending;

  return (
    <Card className="border border-slate-200/80 shadow-none rounded-2xl p-0 w-full max-w-4xl mx-auto mb-2 bg-app-card">
      <CardContent>
        <div
          className={`flex-1 flex flex-col text-sm p-0 mb-2 justify-center items-center ${isCart ? "hidden" : "md:hidden"}`}
        >
          <div className="font-medium text-[15px] sm:text-base text-slate-900">
            {product.TITLE || product.FULL_DESCRIPTION}
          </div>
          <div className="text-sm text-slate-500">
            {product.DESCRIPTION || product.FULL_DESCRIPTION} ({product?.SXESI})
          </div>
          {wholesalePrice != null && (
            <div className="mt-1 text-sm">
              <span className="font-bold text-slate-900">{wholesalePrice}€</span>{" "}
              <span className="text-slate-500">{t("erg_wholesale_no_vat")}</span>
            </div>
          )}
          {showCartVatPricing && (
            <div className="mt-1 text-sm space-y-0.5">
              {isPricingLoading ? (
                <>
                  <div>
                    {t("erg_price_without_vat")}{" "}
                    <span className="inline-block h-4 w-12 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div>
                    {t("erg_price_with_vat")}{" "}
                    <span className="inline-block h-4 w-12 bg-slate-200 rounded animate-pulse" />
                  </div>
                </>
              ) : (
                <>
                  {product.LINEVAL != null && (
                    <div>
                      {t("erg_price_without_vat")}{" "}
                      <span className="font-bold">{product.LINEVAL}€</span>
                    </div>
                  )}
                  {product.SXPERC != null && (
                    <div>
                      {t("erg_price_with_vat")}{" "}
                      <span className="font-bold">{product.SXPERC}€</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 sm:gap-4 items-center justify-between">
          <div
            className={`h-12 w-12 sm:h-24 sm:w-24 shrink-0 rounded-xl bg-slate-100 overflow-hidden ${isCart ? "hidden md:block" : ""}`}
          >
            <img
              src={imageUrl}
              alt={product.TITLE}
              className="h-full w-full object-cover"
            />
          </div>

          {isCart && (
            <div className="flex-1 min-w-0 md:hidden flex flex-col gap-0.5 text-sm pr-2">
              <div className="font-medium text-[15px] truncate text-slate-900">
                {product.TITLE || product.FULL_DESCRIPTION}
              </div>
              <div className="text-slate-500 text-xs line-clamp-2">
                {product.DESCRIPTION || product.FULL_DESCRIPTION} (
                {product?.SXESI})
              </div>
              {wholesalePrice != null && (
                <div className="text-xs">
                  <span className="font-bold">{wholesalePrice}€</span>{" "}
                  <span className="text-slate-500">{t("erg_wholesale_no_vat")}</span>
                </div>
              )}
              {showCartVatPricing && product.LINEVAL != null && (
                <div className="text-xs">
                  Χωρίς ΦΠΑ: <span className="font-bold">{product.LINEVAL}€</span>
                </div>
              )}
              {showCartVatPricing && product.SXPERC != null && (
                <div className="text-xs">
                  Με ΦΠΑ: <span className="font-bold">{product.SXPERC}€</span>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 md:flex flex-col gap-2 text-sm p-0 hidden">
            <div className="font-medium text-[15px] sm:text-base text-slate-900">
              {product.TITLE || product.FULL_DESCRIPTION} ({product?.SXESI})
            </div>
            <div className="text-slate-500">
              {product.DESCRIPTION || product.FULL_DESCRIPTION} (
              {product?.SXESI})
            </div>
            {wholesalePrice != null && (
              <div className="text-sm">
                <span className="font-bold">{wholesalePrice}€</span>{" "}
                <span className="text-slate-500">{t("erg_wholesale_no_vat")}</span>
              </div>
            )}
            {showCartVatPricing && (
              <div className="text-sm space-y-0.5">
                {product.LINEVAL != null && (
                  <div>
                    {t("erg_price_without_vat")}{" "}
                    <span className="font-bold">{product.LINEVAL}€</span>
                  </div>
                )}
                {product.SXPERC != null && (
                  <div>
                    {t("erg_price_with_vat")}{" "}
                    <span className="font-bold">{product.SXPERC}€</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end shrink-0">
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center justify-end gap-2">
                <div className="relative">
                  <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-white">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={decrementQty}
                      className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                      disabled={showItemLoading || Number(qty || 0) <= 0}
                      aria-label="Decrease quantity"
                    >
                      −
                    </Button>
                    <Input
                      className="w-12 min-w-12 text-center border-0 focus-visible:ring-0 text-sm font-medium tabular-nums"
                      value={qty}
                      type="number"
                      onChange={(e) => handleQtyChange(e.target.value, setQty)}
                      min={0}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={incrementQty}
                      className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                      disabled={showItemLoading}
                      aria-label="Increase quantity"
                    >
                      +
                    </Button>
                  </div>
                  {error && (
                    <p className="text-xs text-red-500 w-44 text-center mx-auto absolute top-10">
                      {error}
                    </p>
                  )}
                </div>
                {pathname !== `${ERGASTIRIO_BASE}/cart` && (
                  <Button
                    size="sm"
                    className="whitespace-nowrap gap-1 cursor-pointer bg-brand-500 hover:bg-brand-600 text-white min-w-9"
                    onClick={onAddProductToBasket}
                    disabled={showItemLoading || product.Qty2 === qty || !qty}
                  >
{showItemLoading ? (
                        <Spinner size={16} className="shrink-0" />
                      ) : (
                        <ShoppingCart className="h-4 w-4 shrink-0" />
                      )}
                  </Button>
                )}
                {showCartVatPricing &&
                  typeof qty === "number" &&
                  Number(qty) > 0 &&
                  Number(qty) !== Number(product.Qty2) && (
                    <Button
                      type="button"
                      size="sm"
                      className="whitespace-nowrap gap-1 cursor-pointer bg-brand-500 hover:bg-brand-600 text-white min-w-9"
                      onClick={onAddProductToBasket}
                      disabled={showItemLoading}
                      aria-label={t("erg_apply_quantity")}
                    >
                      {showItemLoading ? (
                        <Spinner size={16} className="shrink-0" />
                      ) : (
                        <ShoppingCart className="h-4 w-4 shrink-0" />
                      )}
                    </Button>
                  )}
                {pathname === `${ERGASTIRIO_BASE}/cart` &&
                  (!showCartVatPricing ||
                    Number(qty) === Number(product.Qty2)) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={handleRemove}
                      disabled={showItemLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
