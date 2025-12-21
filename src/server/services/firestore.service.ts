import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/context/authProvider';
import type { User } from 'firebase/auth';
import type { FirestoreUser } from '@/src/server/models/user.model';

export const saveUserToFirestore = async (user: User, displayName?: string): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('Creating new user document for:', user.email);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        name: displayName || user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      } as FirestoreUser);
    } else {
      console.log('User document already exists for:', user.email);
      await setDoc(userDocRef, {
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
};

export const getUserFromFirestore = async (uid: string): Promise<FirestoreUser | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as FirestoreUser;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user from Firestore:', error);
    return null;
  }
};