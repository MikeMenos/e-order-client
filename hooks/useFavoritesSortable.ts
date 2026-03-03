"use client";

import { useState, useRef } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { WishlistItem } from "@/lib/types/wishlist";

type SortPayload = {
  sortedProducts: Array<{ productUID: string; newRank: number }>;
};

export function useFavoritesSortable(
  orderedItems: WishlistItem[],
  setOrderedItems: React.Dispatch<React.SetStateAction<WishlistItem[]>>,
  onSort: (payload: SortPayload) => void
) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const lastOverIdRef = useRef<string | null>(null);
  const orderAtDragStartRef = useRef<string[]>([]);
  const orderedItemsRef = useRef<WishlistItem[]>(orderedItems);
  const onSortRef = useRef(onSort);
  orderedItemsRef.current = orderedItems;
  onSortRef.current = onSort;

  const activeItem =
    activeId != null
      ? (orderedItems.find((i) => (i.productUID ?? i.id) === activeId) ?? null)
      : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    lastOverIdRef.current = null;
    orderAtDragStartRef.current = orderedItemsRef.current.map(
      (i) => i.productUID ?? i.id ?? ""
    );
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (over == null || over.id === active.id) return;
    if (lastOverIdRef.current === over.id) return;

    lastOverIdRef.current = over.id as string;
    setOrderedItems((prev) => {
      const ids = prev.map((i) => i.productUID ?? i.id ?? "");
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);
      orderedItemsRef.current = next;
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const hadDrag = activeId != null;
    setActiveId(null);
    lastOverIdRef.current = null;

    if (!hadDrag) return;

    const prev = orderedItemsRef.current;
    let next = prev;

    if (over != null && over.id !== active.id) {
      const ids = prev.map((i) => i.productUID ?? i.id ?? "");
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        next = arrayMove(prev, oldIndex, newIndex);
        setOrderedItems(next);
        orderedItemsRef.current = next;
      }
    }

    const orderAfter = next.map((i) => i.productUID ?? i.id ?? "");
    const orderBefore = orderAtDragStartRef.current;
    const orderChanged =
      orderAfter.length !== orderBefore.length ||
      orderAfter.some((id, i) => id !== orderBefore[i]);

    if (orderChanged) {
      onSortRef.current({
        sortedProducts: next
          .map((item, rank) => ({
            productUID: item.productUID ?? item.id,
            newRank: rank,
          }))
          .filter((p): p is { productUID: string; newRank: number } =>
            Boolean(p.productUID)
          ),
      });
    }
  };

  const itemIds = orderedItems.map((item) => item.productUID ?? item.id ?? "");

  return {
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeId,
    activeItem,
    itemIds,
  };
}
