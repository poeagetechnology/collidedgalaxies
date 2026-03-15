'use client';

import { 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential,
  createUserWithEmailAndPassword,
  Auth
} from 'firebase/auth';
import {
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '@/src/context/authProvider';

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;
let tempPhoneForVerification: string | null = null; // Temporary phone for OTP bypass

// Initialize RecaptchaVerifier - Fix for Next.js Fast Refresh
export const initRecaptcha = (): RecaptchaVerifier | null => {
  // Check if already initialized globally
  if ((window as any).recaptchaVerifier) {
    recaptchaVerifier = (window as any).recaptchaVerifier;
    return recaptchaVerifier;
  }

  // Check local instance
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  try {
    // Ensure container exists in DOM
    let container = document.getElementById('recaptcha-container');
    if (!container) {
      const div = document.createElement('div');
      div.id = 'recaptcha-container';
      document.body.appendChild(div);
      container = div;
    }

    console.log('🔐 Initializing reCAPTCHA v3...');
    
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: (response: string) => {
        // reCAPTCHA verified
      },
      'expired-callback': () => {
        clearRecaptcha();
      },
      'error-callback': (error: any) => {
        clearRecaptcha();
      }
    });

    // Store globally to prevent re-initialization
    (window as any).recaptchaVerifier = recaptchaVerifier;

    console.log('✅ reCAPTCHA initialized successfully');
    return recaptchaVerifier;
  } catch (error) {
    console.error('❌ Error initializing reCAPTCHA:', error);
    clearRecaptcha();
    throw new Error('Failed to initialize reCAPTCHA: ' + (error as any).message);
  }
};

// Send OTP via Firebase Phone Auth - BYPASSED (No actual OTP sent)
export const sendPhoneOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
  try {
    // Normalize phone number to international format
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    const internationalPhone = `+91${normalizedPhone}`; // +91 for India

    if (normalizedPhone.length !== 10) {
      throw new Error('Please enter a valid 10-digit phone number');
    }

    // Store phone temporarily for verification bypass
    tempPhoneForVerification = normalizedPhone;

    // Return a mock ConfirmationResult to satisfy the interface
    // The actual verification is bypassed
    const mockConfirmationResult: any = {
      verificationId: 'mock_verification_' + Date.now(),
      confirm: async (otp: string) => {
        // Accept any 6-digit code
        if (!/^\d{6}$/.test(otp.trim())) {
          throw new Error('Invalid OTP format');
        }
        
        // Create or get a mock Firebase user
        const mockUserId = 'phone_user_' + normalizedPhone + '_' + Date.now();
        
        // Create the Firestore user without Firebase Auth
        await createOrUpdateFirestoreUser(mockUserId, internationalPhone, { 
          accountType: 'phone',
          bypassOTP: true 
        });

        return {
          user: {
            uid: mockUserId,
            phoneNumber: internationalPhone,
            email: null,
            emailVerified: false,
            displayName: null,
            photoURL: null,
            isAnonymous: false,
            metadata: {},
            providerData: [],
            getIdToken: async () => 'mock_token',
            getIdTokenResult: async () => ({}),
            reload: async () => {},
            toJSON: () => ({}),
            delete: async () => {},
            getDisplayName: () => null,
            isPhoneNumberVerified: false
          } as any
        };
      }
    };

    confirmationResult = mockConfirmationResult;
    
    console.log('✅ Phone verified (OTP bypassed): +91' + normalizedPhone);

    return mockConfirmationResult;
  } catch (error: any) {
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Invalid phone number format');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please try again later.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Phone authentication is not enabled. Please contact support.');
    } else if (error.code === 'auth/invalid-app-credential') {
      throw new Error('reCAPTCHA configuration error. Please refresh the page and try again.');
    }
    
    throw error;
  }
};

// Verify OTP with Firebase - BYPASSED (Any 6-digit code accepted)
export const verifyPhoneOTP = async (otp: string): Promise<string> => {
  try {
    if (!confirmationResult) {
      throw new Error('No OTP sent. Please send OTP first.');
    }

    // Use the mock confirmation result to verify
    const result = await confirmationResult.confirm(otp);
    const user = result.user;

    // Create or update Firestore user document
    await createOrUpdateFirestoreUser(user.uid, user.phoneNumber || '');

    return user.uid;
  } catch (error: any) {
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Invalid OTP. Please try again.');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('OTP has expired. Please request a new one.');
    }

    throw error;
  }
};

// Create or update Firestore user document
export const createOrUpdateFirestoreUser = async (
  uid: string,
  phoneNumber: string,
  userDetails?: any
): Promise<string> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // User exists, just update
      await setDoc(
        userRef,
        {
          updatedAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        },
        { merge: true }
      );
    } else {
      // Create new user
      await setDoc(userRef, {
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        name: userDetails?.name || 'Guest User',
        email: userDetails?.email || null,
        addresses: userDetails?.addresses || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        accountType: userDetails?.accountType || 'phone',
        bypassOTP: userDetails?.bypassOTP || false,
        lastLogin: serverTimestamp()
      });
    }

    return uid;
  } catch (error) {
    console.error('Error creating user account:', error);
    throw new Error('Failed to create user account');
  }
};

// Get or create phone user (legacy support)
export const getOrCreatePhoneUser = async (phoneNumber: string, userDetails?: any): Promise<string> => {
  // This now just creates/updates in Firestore
  // Firebase Auth handles the user creation
  const normalizedPhone = phoneNumber.replace(/\D/g, '');
  
  // For phone-based accounts in Firestore, use the Firebase UID
  // This function is kept for compatibility but actual user is created by Firebase
  return normalizedPhone;
};

// Check if phone is verified (via Firebase Auth)
export const isPhoneVerified = (): boolean => {
  return auth.currentUser?.phoneNumber ? true : false;
};

// Mark phone as verified in session (legacy support)
export const markPhoneAsVerified = (phoneNumber: string): void => {
  if (typeof window === 'undefined') return;
  const normalizedPhone = phoneNumber.replace(/\D/g, '');
  sessionStorage.setItem(`phone_verified_${normalizedPhone}`, 'true');
};

// Get verified phone from Firebase Auth
export const getVerifiedPhone = (): string | null => {
  return auth.currentUser?.phoneNumber || null;
};

// Create temporary session for guest user
export const createGuestSession = (phoneNumber: string, userId: string): void => {
  if (typeof window === 'undefined') return;

  const normalizedPhone = phoneNumber.replace(/\D/g, '');
  sessionStorage.setItem('guest_user_id', userId);
  sessionStorage.setItem('guest_phone_number', normalizedPhone);
  sessionStorage.setItem('is_guest_checkout', 'true');
};

// Get guest user info from session
export const getGuestUserInfo = (): { userId: string; phoneNumber: string } | null => {
  if (typeof window === 'undefined') return null;

  const userId = sessionStorage.getItem('guest_user_id');
  const phoneNumber = sessionStorage.getItem('guest_phone_number');
  const isGuest = sessionStorage.getItem('is_guest_checkout');

  if (userId && phoneNumber && isGuest === 'true') {
    return { userId, phoneNumber };
  }

  return null;
};

// Clear guest session
export const clearGuestSession = (): void => {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem('guest_user_id');
  sessionStorage.removeItem('guest_phone_number');
  sessionStorage.removeItem('is_guest_checkout');
};

// Clear RecaptchaVerifier
export const clearRecaptcha = (): void => {
  try {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
      (window as any).recaptchaVerifier = null;
    }
    console.log('✅ reCAPTCHA cleared');
  } catch (error) {
    // Silently ignore errors when clearing reCAPTCHA
  }
};

