export interface Product {
  id: string;
  slug?: string;
  title?: string;
  image?: string;
  images?: string[];
  discountPriceFirst10Days?: string;
  discountPriceAfter10Days?: string;
  originalPrice?: string;
  category?: string;
  description?: string;
  sizes?: string[];
  colors?: Color[];
  sizeChart?: string;
  sizeChartName?: string;
  createdAt?: any;
  hasCombos?: boolean;
  comboQuantity?: string | number;
  comboDiscountPrice?: string | number;
  comboOriginalPrice?: string | number;
}

export type Color = {
  name: string;
  hex: string;
};

export type ProductFormData = Omit<Product, "id" | "createdAt">;

export type SizeChartOption = {
  url: string;
  name: string;
};