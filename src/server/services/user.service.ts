import { db } from '@/src/context/authProvider';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, writeBatch } from 'firebase/firestore';

export interface UserData {
  name: string | null;
  role: string | null;
  email: string | null;
}

export const fetchUserData = async (uid: string, fallbackEmail?: string | null): Promise<UserData> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        name: data.name || fallbackEmail || null,
        role: data.role || null,
        email: fallbackEmail || null,
      };
    }
    return { name: fallbackEmail || null, role: null, email: fallbackEmail || null };
  } catch (error) {
    return { name: fallbackEmail || null, role: null, email: fallbackEmail || null };
  }
};

export const isUserAdmin = (role: string | null): boolean => {
  return role === 'admin';
};

/**
 * Find guest account by phone number
 * Returns the guest UID if found, null otherwise
 */
export const findGuestUserByPhone = async (phoneNumber: string): Promise<string | null> => {
  try {
    // Normalize phone: digits only
    const normalizedPhone = phoneNumber.replace(/\D/g, '');

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('phoneNumber', '==', normalizedPhone),
      where('isGuest', '==', true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    // Return the first matching guest account UID (should only be one per phone)
    return snapshot.docs[0].id;
  } catch (error) {
    console.error('Error finding guest user by phone:', error);
    return null;
  }
};

/**
 * Merge guest account data to authenticated user
 * Transfers orders and addresses from guest to authenticated user
 */
export const mergeGuestToAuthUser = async (
  guestUID: string,
  authUID: string,
  phoneNumber: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const batch = writeBatch(db);

    // Get guest user document
    const guestUserRef = doc(db, 'users', guestUID);
    const guestUserDoc = await getDoc(guestUserRef);

    if (!guestUserDoc.exists()) {
      return { success: false, message: 'Guest account not found' };
    }

    const guestData = guestUserDoc.data();

    // Get authenticated user document
    const authUserRef = doc(db, 'users', authUID);
    const authUserDoc = await getDoc(authUserRef);
    const authData = authUserDoc.exists() ? authUserDoc.data() : {};

    // Merge addresses from guest to auth user (add to existing addresses)
    const existingAddresses = authData.addresses || [];
    const guestAddresses = guestData.addresses || [];
    const mergedAddresses = [...existingAddresses];

    // Add guest addresses that don't already exist
    guestAddresses.forEach((guestAddr: any) => {
      const addressExists = existingAddresses.some(
        (ea: any) =>
          ea.streetAddress === guestAddr.streetAddress &&
          ea.pincode === guestAddr.pincode
      );
      if (!addressExists) {
        mergedAddresses.push(guestAddr);
      }
    });

    // Update authenticated user document
    batch.update(authUserRef, {
      addresses: mergedAddresses,
      phoneNumber: phoneNumber.replace(/\D/g, ''),
      linkedPhoneNumber: phoneNumber.replace(/\D/g, ''),
      linkedAt: new Date().toISOString(),
      convertedFromGuest: true,
      convertedFromGuestUID: guestUID,
    });

    // Mark guest account as converted
    batch.update(guestUserRef, {
      convertedToAuthUser: true,
      convertedToAuthUID: authUID,
      convertedAt: new Date().toISOString(),
    });

    // Get all orders belonging to guest and update them to new user
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, where('userId', '==', guestUID));
    const ordersSnapshot = await getDocs(ordersQuery);

    ordersSnapshot.forEach((orderDoc) => {
      batch.update(orderDoc.ref, {
        userId: authUID,
      });
    });

    // Commit batch
    await batch.commit();

    return { success: true, message: 'Guest account merged successfully' };
  } catch (error) {
    console.error('Error merging guest to auth user:', error);
    return { success: false, message: 'Error merging account. Please try again.' };
  }
};