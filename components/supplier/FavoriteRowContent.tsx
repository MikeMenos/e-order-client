"use client";

import { Star, Loader2, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WishlistItem } from "@/lib/types/wishlist";

type DragHandleProps = {
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  listeners?: object;
  attributes?: object;
};

type Props = {
  item: WishlistItem;
  isRemoving: boolean;
  onRemove: (productUID: string) => void;
  t: (key: string) => string;
  showDragHandle?: boolean;
  /** When provided, the drag handle is interactive (for sortable list). */
  dragHandleProps?: DragHandleProps;
};

export function FavoriteRowContent({
  item,
  isRemoving,
  onRemove,
  t,
  showDragHandle = true,
  dragHandleProps,
}: Props) {
  const productUID = item.productUID ?? item.id ?? "";
  return (
    <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md w-full">
      {item.productImage && (
        <div className="shrink-0">
          <img
            src={item.productImage}
            alt={item.title || item.productTitle || "Product"}
            className="h-10 w-10 rounded-lg border border-slate-200 bg-slate-50 object-cover"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900 leading-tight">
          {item.productTitle ?? item.title ?? item.productOriginalTitle ?? "—"}
        </h3>
        {item.productDescription && (
          <p className="mt-l text-sm text-slate-500">
            {item.productDescription}
          </p>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(productUID)}
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
        {showDragHandle &&
          (dragHandleProps ? (
            <div
              ref={dragHandleProps.setActivatorNodeRef}
              {...dragHandleProps.listeners}
              {...dragHandleProps.attributes}
              className="shrink-0 flex items-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 touch-none p-1 -m-1"
              aria-label={t("supplier_reorder") ?? "Reorder"}
            >
              <GripHorizontal className="h-6 w-6" />
            </div>
          ) : (
            <div
              className="shrink-0 flex items-center text-slate-400 p-1 -m-1"
              aria-hidden
            >
              <GripHorizontal className="h-6 w-6" />
            </div>
          ))}
      </div>
    </div>
  );
}
