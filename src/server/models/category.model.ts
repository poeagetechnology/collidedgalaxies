export type Category = {
  id: string;
  name: string;
  imageUrl?: string;
  combosApplicable?: boolean;
  comboQuantity?: string | null;
  comboActualPrice?: string | null;
  comboDiscountedPrice?: string | null;
  products?: string[];
};