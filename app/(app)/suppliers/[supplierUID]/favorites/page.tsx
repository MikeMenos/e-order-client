"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useWishlistItemsBySupplier } from "../../../../../hooks/useWishlist";
import { useWishlistToggle } from "../../../../../hooks/useWishlistToggle";
import { useWishlistSortProducts } from "../../../../../hooks/useWishlistSortProducts";
import { useFavoritesSortable } from "../../../../../hooks/useFavoritesSortable";
import { useTranslation } from "../../../../../lib/i18n";
import { listVariants } from "../../../../../lib/motion";
import { getApiErrorMessage } from "../../../../../lib/api-error";
import type { WishlistItem } from "../../../../../lib/types/wishlist";
import toast from "react-hot-toast";
import Loading from "../../../../../components/ui/loading";
import { FavoriteRowContent } from "../../../../../components/supplier/FavoriteRowContent";
import { SortableFavoriteRow } from "../../../../../components/supplier/SortableFavoriteRow";

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

  const items: WishlistItem[] =
    wishlistQuery.data?.items ?? wishlistQuery.data?.wishLists ?? [];

  const [orderedItems, setOrderedItems] = useState<WishlistItem[]>([]);
  useEffect(() => {
    const list: WishlistItem[] =
      wishlistQuery.data?.items ?? wishlistQuery.data?.wishLists ?? [];
    setOrderedItems(list.length ? [...list] : []);
  }, [wishlistQuery.dataUpdatedAt, wishlistQuery.data]);

  const wishlistSort = useWishlistSortProducts({
    supplierUID: supplierUID ?? undefined,
    onError: (err) => {
      toast.error(getApiErrorMessage(err, t("basket_error")));
    },
  });

  const {
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeItem,
    itemIds,
  } = useFavoritesSortable(orderedItems, setOrderedItems, (payload) =>
    wishlistSort.mutate(payload)
  );

  const handleRemoveFavorite = (productUID: string) => {
    wishlistToggle.mutate(productUID);
  };

  return (
    <main className="space-y-3 text-slate-900 px-3">
      <header className="space-y-1 mb-1">
        <h1 className="text-xl font-bold text-slate-900 mt-2 text-center">
          {t("supplier_favorites")}
        </h1>
      </header>

      {wishlistQuery.isLoading && <Loading spinnerOnly />}

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            <motion.div
              className="space-y-3"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {orderedItems.map((item, index) => (
                <SortableFavoriteRow
                  key={item.productUID ?? item.id}
                  item={item}
                  index={index}
                  isRemoving={
                    wishlistToggle.isPending &&
                    wishlistToggle.variables === (item.productUID ?? item.id)
                  }
                  onRemove={handleRemoveFavorite}
                  t={t}
                />
              ))}
            </motion.div>
          </SortableContext>

          <DragOverlay>
            {activeItem ? (
              <div className="rounded-xl shadow-lg ring-1 ring-slate-200 cursor-grabbing bg-white">
                <FavoriteRowContent
                  item={activeItem}
                  isRemoving={false}
                  onRemove={() => {}}
                  t={t}
                  showDragHandle={true}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </main>
  );
}
