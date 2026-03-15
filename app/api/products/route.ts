import { NextRequest, NextResponse } from "next/server";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only once
let db: any = null;

function initializeFirebase() {
  try {
    if (!db) {
      const apps = getApps();
      const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log("✅ Firebase initialized for products API");
    }
    return db;
  } catch (error: any) {
    console.error("❌ Firebase initialization error:", error.message);
    throw error;
  }
}

/**
 * GET /api/products
 * Fetch products by IDs
 * Query params: ?ids=id1,id2,id3
 */
export async function GET(req: NextRequest) {
  try {
    const database = initializeFirebase();
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { error: "ids parameter is required" },
        { status: 400 },
      );
    }

    const ids = idsParam.split(",").filter((id) => id.trim());

    if (ids.length === 0) {
      return NextResponse.json([]);
    }

    const productsRef = collection(database, "products");

    // Since Firestore doesn't support IN queries well with many items,
    // we fetch all and filter on the backend
    const q = query(productsRef);
    const snapshot = await getDocs(q);

    const allProducts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter to only requested IDs
    const filteredProducts = allProducts.filter((product: any) =>
      ids.includes(product.id),
    );

    console.log(
      `✅ [Products API] Returned ${filteredProducts.length} products`,
    );
    return NextResponse.json(filteredProducts);
  } catch (error: any) {
    console.error("❌ Error fetching products:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 },
    );
  }
}
