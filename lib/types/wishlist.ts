/** Single wishlist/favorite item (product) for display and reorder */
export type WishlistItem = {
  productUID?: string;
  id?: string;
  productImage?: string;
  title?: string;
  productTitle?: string;
  productOriginalTitle?: string;
  productDescription?: string;
  favIconColor?: string;
  iconColor?: string;
  [key: string]: unknown;
};

/** Backend response: wishLists array, each with supplierUID and items */
export type WishlistBackendResponse = {
  wishLists?: Array<{
    supplierUID?: string;
    supplierTitle?: string;
    supplierSubtitle?: string;
    supplierLogo?: string;
    items?: Array<Record<string, unknown>>;
  }>;
  statusCode?: number;
  message?: string;
};

export type WishlistToggleResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  isFavorite?: boolean;
  isFavBySupplier?: boolean;
  isFavByShopper?: boolean;
  isFavByPlatform?: boolean;
  iconColor?: string;
  iconMode?: string;
};
