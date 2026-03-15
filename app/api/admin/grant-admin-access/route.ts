import { db } from "@/firebase";
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * POST /api/admin/grant-admin-access
 * Grant admin role to a user by email
 * Requires: Admin authentication
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Verify requester is admin (if using Firebase Auth)
    // This is a basic check - for production, use Firebase Admin SDK
    
    // Query users by email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return Response.json(
        { error: `No user found with email: ${email}` },
        { status: 404 }
      );
    }

    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    // Check if already admin
    if (userData.role === "admin") {
      return Response.json(
        { message: "User is already an admin", userId, email: userData.email },
        { status: 200 }
      );
    }

    // Update user role to admin
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: "admin",
      updatedAt: serverTimestamp(),
      adminGrantedAt: serverTimestamp()
    });

    return Response.json(
      {
        success: true,
        message: "Admin access granted successfully",
        userId,
        email: userData.email,
        name: userData.name,
        newRole: "admin"
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error granting admin access:", error);
    return Response.json(
      { error: error.message || "Failed to grant admin access" },
      { status: 500 }
    );
  }
}
