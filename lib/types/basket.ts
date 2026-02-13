export type BasketItemsData = {
  basketsList?: Array<{
    supplierUID: string;
    totalItems?: number;
    items: unknown[];
  }>;
  totalBasketsCount?: number;
  totalBasketsCost?: number;
};

export type BasketAddOrUpdatePayload = {
  productUID: string;
  qty: number;
  stock: number;
  suggestedQty: number;
  comments: string;
};
