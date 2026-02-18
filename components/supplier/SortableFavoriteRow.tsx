"use client";

import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { listItemVariants } from "@/lib/motion";
import { FavoriteRowContent } from "./FavoriteRowContent";
import type { WishlistItem } from "@/lib/types/wishlist";

type Props = {
  item: WishlistItem;
  index: number;
  isRemoving: boolean;
  onRemove: (productUID: string) => void;
  t: (key: string) => string;
};

export function SortableFavoriteRow({
  item,
  isRemoving,
  onRemove,
  t,
}: Props) {
  const productUID = item.productUID ?? item.id ?? "";
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: productUID });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      variants={listItemVariants}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={
        isDragging ? "opacity-0 pointer-events-none" : ""
      }
    >
      <FavoriteRowContent
        item={item}
        isRemoving={isRemoving}
        onRemove={onRemove}
        t={t}
        showDragHandle={true}
        dragHandleProps={{
          setActivatorNodeRef,
          listeners,
          attributes,
        }}
      />
    </motion.div>
  );
}
