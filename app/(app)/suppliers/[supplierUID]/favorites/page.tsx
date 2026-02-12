"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import { useWishlistItemsBySupplier } from "../../../../../hooks/useWishlist";
import { useWishlistToggle } from "../../../../../hooks/useWishlistToggle";
import { useTranslation } from "../../../../../lib/i18n";
import { listVariants, listItemVariants } from "../../../../../lib/motion";
import { Button } from "../../../../../components/ui/button";
import { getApiErrorMessage } from "../../../../../lib/api-error";
import toast from "react-hot-toast";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const params = useParams<{ supplierUID: string }>();
  const supplierUID = params.supplierUID;

  const wishlistQuery = useWishlistItemsBySupplier(supplierUID);
  const wishlistToggle = useWishlistToggle({
    supplierUID,
    onSuccess: (data) => {
      const msg = data?.message?.trim();
      if (msg) toast.success(msg);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });

  const items =
    wishlistQuery.data?.items ?? wishlistQuery.data?.wishlistItems ?? [];

  const handleRemoveFavorite = (productUID: string) => {
    wishlistToggle.mutate(productUID);
  };

  return (
    <main className="space-y-3 text-slate-900 px-2">
      <header className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900">
          {t("supplier_favorites")}
        </h1>
        <p className="text-sm text-slate-600">
          {t("supplier_favorites_subtitle")}
        </p>
      </header>

      {wishlistQuery.isLoading && (
        <p className="text-sm text-slate-500">
          {t("config_loading_favorites") || "Loading favorites..."}
        </p>
      )}

      {wishlistQuery.error && (
        <p className="text-sm text-red-400">
          {t("config_error_favorites") || "Error loading favorites"}
        </p>
      )}

      {items.length === 0 && !wishlistQuery.isLoading ? (
        <p className="text-sm text-slate-600">
          {t("config_empty_favorites") || "No favorites found"}
        </p>
      ) : (
        <motion.div
          className="space-y-3"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {items.map((item: any) => {
            const productUID = item.productUID ?? item.id;
            const isRemoving = wishlistToggle.isPending && wishlistToggle.variables === productUID;

            return (
              <motion.div
                key={productUID}
                variants={listItemVariants}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                {item.productImage && (
                  <div className="shrink-0">
                    <img
                      src={item.productImage}
                      alt={item.title || item.productTitle || "Product"}
                      className="h-20 w-20 rounded-lg border border-slate-200 bg-slate-50 object-cover"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-slate-900 leading-tight">
                    {item.title || item.productTitle || item.productOriginalTitle || "—"}
                  </h3>
                  {(item.subTitle || item.productDescription) && (
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                      {item.subTitle || item.productDescription}
                    </p>
                  )}
                  {item.productPackaging && (
                    <p className="mt-1 text-xs text-slate-500">
                      {t("product_packaging")} {item.productPackaging}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4">
                    {typeof item.price === "number" && (
                      <p className="text-base font-bold text-slate-900">
                        {item.price.toFixed(2)} {item.currency ?? "€"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <div className="shrink-0 flex items-start">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFavorite(productUID)}
                    disabled={isRemoving}
                    className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-60"
                    aria-label={t("supplier_remove_favorite")}
                    title={t("supplier_remove_favorite")}
                  >
                    {isRemoving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Star
                        className="h-5 w-5"
                        fill={item.favIconColor || item.iconColor || "#9CBDFA"}
                        stroke={item.favIconColor || item.iconColor || "#9CBDFA"}
                        strokeWidth={1.5}
                      />
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </main>
  );
}
