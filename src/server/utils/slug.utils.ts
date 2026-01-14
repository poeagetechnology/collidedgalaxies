import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/src/context/authProvider";
import { slugify } from "./slugify";

export async function generateUniqueSlug(title: string, existingSlugs?: string[]): Promise<string> {
  const baseSlug = slugify(title);

  if (existingSlugs) {
    if (!existingSlugs.includes(baseSlug)) {
      return baseSlug;
    }
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${randomStr}`;
  }

  const productsRef = collection(db, "products");
  const q = query(productsRef);
  const snapshot = await getDocs(q);

  const existingDbSlugs = snapshot.docs
    .map(doc => doc.data().slug)
    .filter(Boolean);

  if (!existingDbSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomStr}`;
}