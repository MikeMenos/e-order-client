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
  items: BasketGetItemsProduct[];
};

export type BasketGetItemsResponse = {
  statusCode?: number;
  basketsList?: BasketGetItemsBasket[];
};
