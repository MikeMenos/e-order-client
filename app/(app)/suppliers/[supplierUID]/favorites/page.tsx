"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Loader2, GripVertical } from "lucide-react";
import { useWishlistItemsBySupplier } from "../../../../../hooks/useWishlist";
import { useWishlistToggle } from "../../../../../hooks/useWishlistToggle";
import { useWishlistSortProducts } from "../../../../../hooks/useWishlistSortProducts";
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
    wishlistQuery.data?.items ?? wishlistQuery.data?.wishLists ?? [];

  const [orderedItems, setOrderedItems] = useState<typeof items>([]);
  useEffect(() => {
    const list =
      wishlistQuery.data?.items ?? wishlistQuery.data?.wishLists ?? [];
    setOrderedItems(list.length ? [...list] : []);
  }, [wishlistQuery.dataUpdatedAt, wishlistQuery.data]);

  const wishlistSort = useWishlistSortProducts({
    supplierUID: supplierUID ?? undefined,
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });

  const handleRemoveFavorite = (productUID: string) => {
    wishlistToggle.mutate(productUID);
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.setData("application/json", JSON.stringify({ index }));
    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, overIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex == null || overIndex === draggedIndex) return;
    setOrderedItems((prev) => {
      const reordered = [...prev];
      const [removed] = reordered.splice(draggedIndex, 1);
      reordered.splice(overIndex, 0, removed);
      return reordered;
    });
    setDraggedIndex(overIndex);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex == null) {
      setDraggedIndex(null);
      return;
    }
    let finalOrder = orderedItems;
    if (draggedIndex !== dropIndex) {
      const reordered = [...orderedItems];
      const [removed] = reordered.splice(draggedIndex, 1);
      reordered.splice(dropIndex, 0, removed);
      setOrderedItems(reordered);
      finalOrder = reordered;
    }
    setDraggedIndex(null);
    wishlistSort.mutate({
      sortedProducts: finalOrder.map((item: any, rank: number) => ({
        productUID: item.productUID ?? item.id,
        newRank: rank,
      })),
    });
  };

  return (
    <main className="space-y-3 text-slate-900 px-3">
      <header className="space-y-1 mb-1">
        <h1 className="text-xl font-bold text-slate-900 mt-2">
          {t("supplier_favorites")}
        </h1>
      </header>

      {wishlistQuery.isLoading && (
        <p className="text-base text-slate-500">
          {t("config_loading_favorites") || "Loading favorites..."}
        </p>
      )}

      {wishlistQuery.error && (
        <p className="text-base text-red-400">
          {t("config_error_favorites") || "Error loading favorites"}
        </p>
      )}

      {items.length === 0 && !wishlistQuery.isLoading ? (
        <p className="text-base text-slate-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 inline-block">
          {t("config_empty_favorites") || "No favorites found"}
        </p>
      ) : (
        <motion.div
          className="space-y-3"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {orderedItems.map((item: any, index: number) => {
            const productUID = item.productUID ?? item.id;
            const isRemoving =
              wishlistToggle.isPending &&
              wishlistToggle.variables === productUID;
            const isDragging = draggedIndex === index;

            return (
              <motion.div
                layout
                key={productUID}
                variants={listItemVariants}
                data-index={index}
                data-drag-row
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className={`flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow ${
                  isDragging ? "opacity-60" : ""
                }`}
              >
                {/* Product Image */}
                {item.productImage && (
                  <div className="shrink-0">
                    <img
                      src={item.productImage}
                      alt={item.title || item.productTitle || "Product"}
                      className="h-12 w-12 rounded-lg border border-slate-200 bg-slate-50 object-cover"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 leading-tight">
                    {item.productTitle ||
                      item.title ||
                      item.productOriginalTitle ||
                      "—"}
                  </h3>
                  {item.productDescription && (
                    <p className="mt-1 text-base text-slate-500">
                      {item.productDescription}
                    </p>
                  )}
                </div>

                {/* Remove Button */}
                <div className="shrink-0 flex items-center">
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
                        stroke={
                          item.favIconColor || item.iconColor || "#9CBDFA"
                        }
                        strokeWidth={1.5}
                      />
                    )}
                  </Button>
                  {/* Drag Handle */}
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    className="shrink-0 flex items-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 touch-none"
                    aria-label={t("supplier_reorder") ?? "Reorder"}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        e.preventDefault();
                    }}
                  >
                    <GripVertical className="h-5 w-5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </main>
  );
}
