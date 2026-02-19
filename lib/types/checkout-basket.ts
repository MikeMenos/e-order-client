export type BasketGetItemsProduct = {
  basketUID: string;
  productUID: string;
  productTitle: string;
  productImage: string;
  productPackaging: string;
  productDescription: string;
  productCategories: string;
  qty: number;
  comments: string;
};

export type BasketGetItemsBasket = {
  supplierUID: string;
  supplierTitle: string;
  supplierLogo: string;
  supplierSubtitle: string;
  totalItems?: number;
  items: BasketGetItemsProduct[];
  /** Prefill delivery date when returning to this basket (from Order_TempSave). */
  desiredDeliveryDate?: string | null;
  /** Prefill comments when returning to this basket (from Order_TempSave). */
  shopperComments?: string | null;
};

export type BasketGetItemsResponse = {
  statusCode?: number;
  basketsList?: BasketGetItemsBasket[];
  totalBasketsCount?: number;
  totalBasketsCost?: number;
};
