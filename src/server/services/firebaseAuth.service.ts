'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User,
} from 'firebase/auth';
import { saveUserToFirestore } from './firestore.service';
import { getAuthErrorMessage, AuthError } from '@/src/server/utils/auth-errors.utils';
import { isMobileDevice, setGoogleSignInPending } from '@/src/server/utils/device.utils';

// Lazy load auth to avoid circular dependency
const getAuthInstance = () => {
  const { auth } = require('@/src/context/authProvider');
  return auth;
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  name?: string
): Promise<User | null> => {
  try {
    const auth = getAuthInstance();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await saveUserToFirestore(userCredential.user, name);
    return userCredential.user;
  } catch (error: any) {
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<User | null> => {
  try {
    const auth = getAuthInstance();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};

export const signInWithGoogleProvider = async (): Promise<User | null> => {
  try {
    const auth = getAuthInstance();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ 
      prompt: 'select_account',
      display: 'popup'
    });

    const isMobile = isMobileDevice();

    try {
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        await saveUserToFirestore(result.user);
        return result.user;
      }
    } catch (popupError: any) {
      if (
        popupError.code === 'auth/popup-blocked' ||
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request' ||
        isMobile
      ) {
        setGoogleSignInPending(true);
        await signInWithRedirect(auth, provider);
        return null;
      }
      
      throw popupError;
    }
    
    return null;
  } catch (error: any) {
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};

export const handleGoogleRedirectResult = async (): Promise<User | null> => {
  try {
    const auth = getAuthInstance();
    const result = await getRedirectResult(auth);
    
    if (result?.user) {
      await saveUserToFirestore(result.user);
      setGoogleSignInPending(false);
      return result.user;
    }
    return null;
  } catch (error: any) {
    setGoogleSignInPending(false);
    return null;
  }
};

export const sendPasswordResetLink = async (email: string): Promise<void> => {
  try {
    const auth = getAuthInstance();
    const actionCodeSettings = {
      url: `${window.location.origin}/reset-password`,
      handleCodeInApp: false,
    };
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  } catch (error: any) {
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};

export const verifyPasswordResetCode = async (code: string): Promise<string> => {
  try {
    const auth = getAuthInstance();
    const { verifyPasswordResetCode: fbVerifyPasswordResetCode } = await import('firebase/auth');
    const email = await fbVerifyPasswordResetCode(auth, code);
    return email;
  } catch (error: any) {
    console.error('Verify reset code error:', error);
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};

export const confirmPasswordReset = async (code: string, newPassword: string): Promise<void> => {
  try {
    const auth = getAuthInstance();
    const { confirmPasswordReset: fbConfirmPasswordReset } = await import('firebase/auth');
    await fbConfirmPasswordReset(auth, code, newPassword);
  } catch (error: any) {
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    const auth = getAuthInstance();
    await signOut(auth);
  } catch (error: any) {
    throw { code: error.code, message: getAuthErrorMessage(error.code) } as AuthError;
  }
};