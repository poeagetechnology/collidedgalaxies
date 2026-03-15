export interface BundleProduct {
  productId: string;
  title?: string;
  image?: string;
  quantity: number;
}

export interface Bundle {
  id: string;
  name: string;
  description?: string;
  products: BundleProduct[];
  originalTotalPrice: number; // Sum of all individual product prices
  bundlePrice: number; // Discounted bundle price
  discount?: number; // Discount percentage or amount
  image?: string; // Main bundle image
  images?: string[];
  isActive: boolean;
  category?: string;
  tags?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export type BundleFormData = Omit<Bundle, "id" | "createdAt" | "updatedAt">;

export interface BundleWithProductDetails extends Bundle {
  products: (BundleProduct & {
    originalPrice?: string;
    discountPriceFirst10Days?: string;
    discountPriceAfter10Days?: string;
    colors?: Array<{ name: string; hex: string }>;
    sizes?: string[];
    description?: string;
  })[];
}
