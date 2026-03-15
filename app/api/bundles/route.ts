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
      console.log("✅ Firebase initialized for public bundles API");
    }
    return db;
  } catch (error: any) {
    console.error("❌ Firebase initialization error:", error.message);
    throw error;
  }
}

/**
 * GET /api/bundles
 * Fetch active bundles (public endpoint)
 * Query param: ?includeInactive=true to fetch all bundles (for development)
 */
export async function GET(req: NextRequest) {
  try {
    const database = initializeFirebase();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const bundlesRef = collection(database, "bundles");

    let q: any;
    if (includeInactive) {
      console.log(
        "📦 [Bundles API] Fetching ALL bundles (includeInactive=true)",
      );
      // Fetch all bundles without orderBy to avoid composite index requirement
      q = query(bundlesRef);
    } else {
      console.log("📦 [Bundles API] Fetching ACTIVE bundles only");
      // Only use where clause, no orderBy to avoid composite index requirement
      q = query(bundlesRef, where("isActive", "==", true));
    }

    const snapshot = await getDocs(q);
    let bundles = snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        ...data,
      };
    });

    // Sort on the backend instead of using Firestore orderBy
    bundles.sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA; // Descending order
    });

    console.log(`✅ [Bundles API] Returned ${bundles.length} bundles`);
    return NextResponse.json(bundles);
  } catch (error: any) {
    console.error("❌ Error fetching bundles:", error.message);
    console.error("❌ Error code:", error.code);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bundles" },
      { status: 500 },
    );
  }
}
