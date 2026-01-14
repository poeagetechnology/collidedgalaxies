import { db } from '@/src/context/authProvider';
import { doc, getDoc } from 'firebase/firestore';

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
    console.error('Error fetching user data:', error);
    return { name: fallbackEmail || null, role: null, email: fallbackEmail || null };
  }
};

export const isUserAdmin = (role: string | null): boolean => {
  return role === 'admin';
};