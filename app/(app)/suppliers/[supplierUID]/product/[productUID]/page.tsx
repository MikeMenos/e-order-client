"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Star, Loader2, Pencil } from "lucide-react";
import { useProductDisplay } from "@/hooks/useSupplier";
import { useTranslation } from "@/lib/i18n";
import { getApiErrorMessage } from "@/lib/api-error";
import { useWishlistToggle } from "@/hooks/useWishlistToggle";
import { usePersonalizedTextsUpdate } from "@/hooks/usePersonalizedTextsUpdate";
import { DetailSection } from "@/components/ui/detail-section";
import { DetailRow } from "@/components/ui/detail-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatOrderDate } from "@/lib/utils";

export default function SupplierProductPage() {
  const { t } = useTranslation();
  const params = useParams<{ supplierUID: string; productUID: string }>();
  const supplierUID = params.supplierUID;
  const productUID = params.productUID;
  const queryClient = useQueryClient();

  const displayQuery = useProductDisplay(productUID);
  const product = displayQuery.data?.product ?? null;
  const lastOrders = displayQuery.data?.lastOrders ?? [];

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const wishlistToggle = useWishlistToggle({
    supplierUID: supplierUID ?? undefined,
    onSuccess: (data) => {
      const msg = data?.message?.trim();
      if (msg) toast.success(msg);
      void queryClient.invalidateQueries({
        queryKey: ["product-display", productUID],
      });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });

  const personalizedUpdate = usePersonalizedTextsUpdate({
    productUID: productUID ?? undefined,
    supplierUID: supplierUID ?? undefined,
    onSuccess: (data) => {
      const msg = data?.message?.trim();
      if (msg) toast.success(msg);
      setIsEditing(false);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });

  const isFavorite = product?.isFavByShopper ?? false;
  const favIconColor = product?.favIconColor ?? "#9CBDFA";

  if (displayQuery.isLoading) {
    return (
      <main className="px-3 text-slate-900">
        <div className="mx-auto max-w-2xl py-4">
          <p className="text-base text-slate-500">
            {t("supplier_product_loading")}
          </p>
        </div>
      </main>
    );
  }

  if (displayQuery.error) {
    const errorMessage = getApiErrorMessage(
      displayQuery.error,
      t("suppliers_error"),
    );
    return (
      <main className="px-3 text-slate-900">
        <div className="mx-auto max-w-2xl py-4">
          <p className="text-base text-red-400">{errorMessage}</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="px-3 text-slate-900">
        <div className="mx-auto max-w-2xl py-4">
          <p className="text-base text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
            {t("product_not_found")}
          </p>
        </div>
      </main>
    );
  }

  const title =
    product.productTitle?.trim() || product.productOriginalTitle?.trim() || "";

  const startEditing = () => {
    setEditTitle(title);
    setIsEditing(true);
  };

  const saveTitle = () => {
    if (!supplierUID || !productUID) return;
    personalizedUpdate.mutate({
      productUID: null,
      supplierUID,
      erpCatUID: null,
      displayText: "",
      displayText2: editTitle.trim(),
      displayText3: "",
      personalNotes: "",
      remove: false,
    });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditTitle("");
  };

  return (
    <main className="px-3 text-slate-900">
      <div className="mx-auto max-w-2xl space-y-4 pb-16">
        {/* Edit button row: above title+star, aligned right */}
        {!isEditing && (
          <div className="my-4 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startEditing}
              className="gap-1.5 text-slate-600 hover:text-slate-900"
              aria-label={t("product_edit_title")}
            >
              <Pencil className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">
                {t("product_edit_title")}
              </span>
            </Button>
          </div>
        )}

        {/* Title (or edit input) + star */}
        <div className="flex items-center justify-between gap-3 mt-2">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-xl font-bold"
                  placeholder={title}
                  aria-label={t("product_edit_title")}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveTitle}
                    disabled={personalizedUpdate.isPending}
                  >
                    {personalizedUpdate.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t("product_save_title")
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEditing}
                    disabled={personalizedUpdate.isPending}
                  >
                    {t("product_cancel_edit")}
                  </Button>
                </div>
              </div>
            ) : (
              <h1 className="text-xl font-bold text-slate-900 mt-2 leading-tight text-center">
                {title}
              </h1>
            )}
          </div>
          {!isEditing && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => wishlistToggle.mutate(product.productUID)}
              disabled={wishlistToggle.isPending}
              className="shrink-0 px-2 text-slate-400 hover:text-slate-600 disabled:pointer-events-none"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              {wishlistToggle.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
              ) : (
                <Star
                  className="h-8 w-8"
                  fill={isFavorite ? favIconColor : "transparent"}
                  stroke={isFavorite ? favIconColor : "currentColor"}
                  strokeWidth={1.5}
                />
              )}
            </Button>
          )}
        </div>

        {/* Basic info */}
        <DetailSection title={t("product_details")}>
          <div className="space-y-3">
            {product.productImage ? (
              <div className="flex justify-center rounded-lg border border-slate-200 bg-white p-2">
                <img
                  src={product.productImage}
                  alt={title}
                  className="max-h-48 w-auto max-w-full object-contain"
                />
              </div>
            ) : null}
            {product.productOriginalTitle &&
            product.productOriginalTitle.trim() !== title ? (
              <DetailRow
                label={t("product_original_title")}
                value={product.productOriginalTitle}
              />
            ) : null}
            {product.productPackaging ? (
              <DetailRow
                label={t("product_packaging")}
                value={product.productPackaging}
              />
            ) : null}
            {product.productDescription ? (
              <div>
                <p className="text-slate-500">{t("product_description")}</p>
                <p className="mt-0.5 text-base text-slate-800 leading-snug">
                  {product.productDescription}
                </p>
              </div>
            ) : null}
            {product.productCategories ? (
              <DetailRow
                label={t("product_categories")}
                value={product.productCategories}
              />
            ) : null}
          </div>
        </DetailSection>

        {/* Last orders */}
        <DetailSection title={t("product_last_orders")}>
          <p className="text-sm font-medium text-slate-600 mb-3">
            {t("product_last_orders")}
          </p>
          {lastOrders.length === 0 ? (
            <p className="text-base text-slate-500">
              {t("supplier_order_history_empty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {lastOrders.map((order) => (
                <li
                  key={order.orderUID}
                  className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-base"
                >
                  <dl className="grid gap-1">
                    {order.orderCode ? (
                      <DetailRow
                        label={t("order_code")}
                        value={order.orderCode}
                      />
                    ) : null}
                    <DetailRow
                      label={t("order_date_created")}
                      value={formatOrderDate(order.orderDate)}
                    />
                    <DetailRow
                      label={t("order_item_quantity")}
                      value={String(order.qty)}
                    />
                    {order.packageInfo ? (
                      <DetailRow
                        label={t("product_packaging")}
                        value={order.packageInfo}
                      />
                    ) : null}
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </DetailSection>
      </div>
    </main>
  );
}
