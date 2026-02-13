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
