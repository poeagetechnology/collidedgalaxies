import { useState, useEffect } from "react";
import { db } from "@/src/context/authProvider";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import type { Product, SizeChartOption } from "@/src/server/models/product.model";
import { extractSizeCharts } from "@/src/server/utils/product.utils";

export const useProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [previousSizeCharts, setPreviousSizeCharts] = useState<SizeChartOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Product, "id">),
      }));
      setProducts(data);
      
      const sizeChartMap = extractSizeCharts(data);
      const uniqueSizeCharts: SizeChartOption[] = Array.from(sizeChartMap.entries()).map(([url, name]) => ({
        url,
        name
      }));
      
      setPreviousSizeCharts(uniqueSizeCharts);
      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  return {
    products,
    previousSizeCharts,
    isLoading
  };
};