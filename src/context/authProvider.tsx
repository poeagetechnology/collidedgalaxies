'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  User,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '@/firebase';

// Initialize Firebase safely
const canInitFirebase = typeof window !== 'undefined' && !!(firebaseConfig as any)?.apiKey;
export const isFirebaseEnabled = canInitFirebase;

let app: any = null;
if (canInitFirebase) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig as any);
}

export const auth: any = canInitFirebase ? getAuth(app) : ({} as any);
if (canInitFirebase && auth?.setPersistence) {
  auth.setPersistence(browserLocalPersistence);
}
export const db: any = canInitFirebase ? getFirestore(app) : ({} as any);

// Lazy load functions to avoid circular imports
const lazyLoad = async () => {
  const {
    signUpWithEmail,
    loginWithEmail,
    signInWithGoogleProvider,
    sendPasswordResetLink,
    handleGoogleRedirectResult,
    logoutUser,
    verifyPasswordResetCode,
    confirmPasswordReset
  } = await import('@/src/server/services/firebaseAuth.service');
  
  return {
    signUpWithEmail,
    loginWithEmail,
    signInWithGoogleProvider,
    sendPasswordResetLink,
    handleGoogleRedirectResult,
    logoutUser,
    verifyPasswordResetCode,
    confirmPasswordReset
  };
};

// Re-export for backward compatibility - use 'export type' for types
export type { AuthError } from '@/src/server/utils/auth-errors.utils';
export { isGoogleSignInPending } from '@/src/server/utils/device.utils';

interface authProviderType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<User | null>;
  login: (email: string, password: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const authProvider = createContext<authProviderType | undefined>(undefined);

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectHandled, setRedirectHandled] = useState(false);
  const [authFunctions, setAuthFunctions] = useState<Awaited<ReturnType<typeof lazyLoad>> | null>(null);

  useEffect(() => {
    // Load auth functions
    lazyLoad().then(funcs => {
      setAuthFunctions(funcs);
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (!isFirebaseEnabled || !authFunctions) {
        if (mounted) {
          if (!isFirebaseEnabled) setLoading(false);
          setRedirectHandled(true);
        }
        return;
      }

      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log('AuthProvider: Set persistence to local');

        const redirectUser = await authFunctions.handleGoogleRedirectResult();
        
        if (mounted) {
          if (redirectUser) {
            console.log('AuthProvider: User from redirect:', redirectUser.email);
            setUser(redirectUser);
          }
          setRedirectHandled(true);
        }
      } catch (error) {
        console.error('AuthProvider: Error during initialization:', error);
        if (mounted) {
          setRedirectHandled(true);
        }
      }
    };

    initAuth();

    let unsubscribe: (() => void) | undefined;
    if (isFirebaseEnabled) {
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (mounted) {
          console.log('Auth state changed:', currentUser?.email, 'UID:', currentUser?.uid);
          setUser(currentUser);
          setLoading(false);
        }
      });
    }

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [redirectHandled, authFunctions]);

  const value: authProviderType = {
    user,
    loading,
    signUp: authFunctions?.signUpWithEmail || (async () => null),
    login: authFunctions?.loginWithEmail || (async () => null),
    signInWithGoogle: authFunctions?.signInWithGoogleProvider || (async () => null),
    resetPassword: authFunctions?.sendPasswordResetLink || (async () => {}),
    logout: authFunctions?.logoutUser || (async () => {})
  };

  return <authProvider.Provider value={value}>{children}</authProvider.Provider>;
};

export const useAuth = (): authProviderType => {
  const context = useContext(authProvider);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Backward compatibility exports - use within client components
export async function signUp(email: string, password: string, name?: string) {
  const funcs = await lazyLoad();
  return funcs.signUpWithEmail(email, password, name);
}

export async function login(email: string, password: string) {
  const funcs = await lazyLoad();
  return funcs.loginWithEmail(email, password);
}

export async function signInWithGoogle() {
  const funcs = await lazyLoad();
  return funcs.signInWithGoogleProvider();
}

export async function resetPassword(email: string) {
  const funcs = await lazyLoad();
  return funcs.sendPasswordResetLink(email);
}

export async function logout() {
  const funcs = await lazyLoad();
  return funcs.logoutUser();
}

export async function verifyPasswordResetCode(code: string) {
  const funcs = await lazyLoad();
  return funcs.verifyPasswordResetCode(code);
}

export async function confirmPasswordReset(code: string, newPassword: string) {
  const funcs = await lazyLoad();
  return funcs.confirmPasswordReset(code, newPassword);
}