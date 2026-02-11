export type SupplierProduct = {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  image: string | null;
  category: string;
  price: number;
  qty: number;
  suggestedQty: number | null;
  isFavorite: boolean;
  favIconColor: string;
  favIconMode: string;
  productPackaging: string;
};

export type SupplierSection = {
  id: string;
  label: string;
  products: SupplierProduct[];
};
