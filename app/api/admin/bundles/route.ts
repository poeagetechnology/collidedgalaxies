import { NextRequest, NextResponse } from "next/server";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { BundleFormData } from "@/src/server/models/bundle.model";

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
      console.log("✅ Firebase initialized for bundle API");
    }
    return db;
  } catch (error: any) {
    console.error("❌ Firebase initialization error:", error.message);
    throw error;
  }
}

/**
 * GET /api/admin/bundles
 * Fetch all bundles
 */
export async function GET(req: NextRequest) {
  try {
    const database = initializeFirebase();

    const bundlesRef = collection(database, "bundles");
    // Fetch all bundles without orderBy to avoid any index issues
    const q = query(bundlesRef);
    const snapshot = await getDocs(q);

    let bundles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort on backend instead of using Firestore orderBy
    bundles.sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA; // Descending order
    });

    return NextResponse.json(bundles);
  } catch (error: any) {
    console.error("Error fetching bundles:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bundles" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/bundles
 * Create a new bundle
 */
export async function POST(req: NextRequest) {
  try {
    const database = initializeFirebase();
    const body: BundleFormData = await req.json();

    // Validate required fields
    if (!body.name || !body.products || body.products.length === 0) {
      return NextResponse.json(
        { error: "Bundle name and at least one product are required" },
        { status: 400 },
      );
    }

    if (
      body.bundlePrice === undefined ||
      body.originalTotalPrice === undefined
    ) {
      return NextResponse.json(
        { error: "Bundle price and original total price are required" },
        { status: 400 },
      );
    }

    const bundlesRef = collection(database, "bundles");
    const bundleData = {
      ...body,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(bundlesRef, bundleData);

    return NextResponse.json(
      {
        id: docRef.id,
        ...bundleData,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating bundle:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to create bundle" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/bundles?id=bundleId
 * Update a bundle
 */
export async function PUT(req: NextRequest) {
  try {
    const database = initializeFirebase();
    const { searchParams } = new URL(req.url);
    const bundleId = searchParams.get("id");

    if (!bundleId) {
      return NextResponse.json(
        { error: "Bundle ID is required" },
        { status: 400 },
      );
    }

    const body: BundleFormData = await req.json();

    const bundleRef = doc(database, "bundles", bundleId);
    const updateData = {
      ...body,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(bundleRef, updateData);

    return NextResponse.json({
      id: bundleId,
      ...updateData,
    });
  } catch (error: any) {
    console.error("Error updating bundle:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to update bundle" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/bundles?id=bundleId
 * Delete a bundle
 */
export async function DELETE(req: NextRequest) {
  try {
    const database = initializeFirebase();
    const { searchParams } = new URL(req.url);
    const bundleId = searchParams.get("id");

    if (!bundleId) {
      return NextResponse.json(
        { error: "Bundle ID is required" },
        { status: 400 },
      );
    }

    const bundleRef = doc(database, "bundles", bundleId);
    await deleteDoc(bundleRef);

    return NextResponse.json({
      message: "Bundle deleted successfully",
      id: bundleId,
    });
  } catch (error: any) {
    console.error("Error deleting bundle:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to delete bundle" },
      { status: 500 },
    );
  }
}
