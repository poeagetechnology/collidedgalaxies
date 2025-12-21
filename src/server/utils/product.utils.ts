import type { Product } from "../models/product.model";

export const extractSizeCharts = (products: Product[]): Map<string, string> => {
  const sizeChartMap = new Map<string, string>();
  products.forEach(p => {
    if (p.sizeChart) {
      sizeChartMap.set(p.sizeChart, p.sizeChartName || "Unnamed Chart");
    }
  });
  return sizeChartMap;
};