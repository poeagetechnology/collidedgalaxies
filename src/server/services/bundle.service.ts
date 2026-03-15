import { db } from "@/src/context/authProvider";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  where,
} from "firebase/firestore";
import {
  Bundle,
  BundleFormData,
  BundleWithProductDetails,
} from "../models/bundle.model";
import { Product } from "../models/product.model";

export const subscribeToBundles = (
  callback: (bundles: Bundle[]) => void,
): Unsubscribe => {
  const q = query(
    collection(db, "bundles"),
    where("isActive", "==", true),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    })) as Bundle[];
    callback(items);
  });
};

export const subscribeToAllBundles = (
  callback: (bundles: Bundle[]) => void,
): Unsubscribe => {
  const q = query(collection(db, "bundles"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    })) as Bundle[];
    callback(items);
  });
};

export const getBundleById = async (
  bundleId: string,
): Promise<Bundle | null> => {
  try {
    const bundleRef = doc(db, "bundles", bundleId);
    const snapshot = await getDocs(
      query(collection(db, "bundles"), where("id", "==", bundleId)),
    );

    if (snapshot.empty) {
      return null;
    }

    const bundleDoc = snapshot.docs[0];
    return {
      id: bundleDoc.id,
      ...(bundleDoc.data() as any),
    } as Bundle;
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return null;
  }
};

export const getBundleWithProductDetails = async (
  bundleId: string,
  products: Product[],
): Promise<BundleWithProductDetails | null> => {
  try {
    const bundleDocs = await getDocs(query(collection(db, "bundles")));

    let foundBundle: any = null;
    bundleDocs.forEach((doc) => {
      if (doc.id === bundleId) {
        foundBundle = {
          id: doc.id,
          ...doc.data(),
        };
      }
    });

    if (
      !foundBundle ||
      !foundBundle.products ||
      !Array.isArray(foundBundle.products)
    ) {
      return null;
    }

    // Enrich bundle products with full product details
    const enrichedProducts = foundBundle.products.map((bundleProduct: any) => {
      const productDetail = products.find(
        (p) => p.id === bundleProduct.productId,
      );
      return {
        ...bundleProduct,
        ...(productDetail || {}),
      };
    });

    return {
      ...foundBundle,
      products: enrichedProducts,
    } as BundleWithProductDetails;
  } catch (error) {
    console.error("Error fetching bundle with details:", error);
    return null;
  }
};

// ADMIN FUNCTIONS
export const addBundleAdmin = async (
  formData: BundleFormData,
): Promise<string> => {
  try {
    const bundleData = {
      ...formData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "bundles"), bundleData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding bundle:", error);
    throw error;
  }
};

export const updateBundleAdmin = async (
  bundleId: string,
  formData: BundleFormData,
): Promise<void> => {
  try {
    const bundleRef = doc(db, "bundles", bundleId);
    await updateDoc(bundleRef, {
      ...formData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating bundle:", error);
    throw error;
  }
};

export const deleteBundleAdmin = async (bundleId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "bundles", bundleId));
  } catch (error) {
    console.error("Error deleting bundle:", error);
    throw error;
  }
};

export const getBundlesForAdmin = async (): Promise<Bundle[]> => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "bundles"), orderBy("createdAt", "desc")),
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    })) as Bundle[];
  } catch (error) {
    console.error("Error fetching bundles for admin:", error);
    return [];
  }
};
