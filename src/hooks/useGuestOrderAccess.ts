'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/context/authProvider';

interface GuestOrderAccessResult {
  guestUID: string | null;
  guestName: string | null;
  guestEmail: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hash phone number to create deterministic guest account ID
 * This allows querying a specific document without needing collection queries
 */
function hashPhoneNumber(phone: string): string {
  let hash = 0;
  for (let i = 0; i < phone.length; i++) {
    const char = phone.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `guest_${Math.abs(hash).toString(16)}`;
}

/**
 * Hook to find guest account by phone number using Firestore client
 * Used to allow guest users to view their orders without logging in
 * No backend API or Firebase Admin SDK required
 */
export function useGuestOrderAccess() {
  const [result, setResult] = useState<GuestOrderAccessResult>({
    guestUID: null,
    guestName: null,
    guestEmail: null,
    isLoading: false,
    error: null,
  });

  /**
   * Find guest account by phone number using Firestore client SDK
   * Uses deterministic hashing to create guest document ID
   */
  const findGuestByPhone = async (phoneNumber: string): Promise<GuestOrderAccessResult> => {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      return {
        guestUID: null,
        guestName: null,
        guestEmail: null,
        isLoading: false,
        error: 'Please enter a valid phone number',
      };
    }

    // Normalize phone: remove all non-digits
    const normalizedPhone = phoneNumber.replace(/\D/g, '');

    if (normalizedPhone.length < 10) {
      return {
        guestUID: null,
        guestName: null,
        guestEmail: null,
        isLoading: false,
        error: 'Phone number must be at least 10 digits',
      };
    }

    setResult((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Generate deterministic guest ID from phone number
      const guestDocId = hashPhoneNumber(normalizedPhone);

      console.log(`🔍 Looking up guest account with ID: ${guestDocId}`);

      // Fetch the guest document directly using the hashed phone number
      const guestRef = doc(db, 'users', guestDocId);
      const guestSnap = await getDoc(guestRef);

      if (!guestSnap.exists()) {
        const errorMsg = 'No account found for this phone number. Please create an account or check your phone number.';
        setResult({
          guestUID: null,
          guestName: null,
          guestEmail: null,
          isLoading: false,
          error: errorMsg,
        });
        return {
          guestUID: null,
          guestName: null,
          guestEmail: null,
          isLoading: false,
          error: errorMsg,
        };
      }

      const guestData = guestSnap.data();

      // Verify this is actually a guest account
      if (!guestData.isGuest) {
        const errorMsg = 'This account is not a guest account.';
        setResult({
          guestUID: null,
          guestName: null,
          guestEmail: null,
          isLoading: false,
          error: errorMsg,
        });
        return {
          guestUID: null,
          guestName: null,
          guestEmail: null,
          isLoading: false,
          error: errorMsg,
        };
      }

      console.log(`✅ Guest account found: ${guestDocId}`);

      const successResult: GuestOrderAccessResult = {
        guestUID: guestDocId,
        guestName: guestData.name || 'Guest',
        guestEmail: guestData.email || guestData.authEmail || null,
        isLoading: false,
        error: null,
      };

      setResult(successResult);
      return successResult;
    } catch (err: any) {
      const errorMsg = 'Error retrieving account. Please try again.';
      console.error('Error in findGuestByPhone:', err);
      setResult({
        guestUID: null,
        guestName: null,
        guestEmail: null,
        isLoading: false,
        error: errorMsg,
      });
      return {
        guestUID: null,
        guestName: null,
        guestEmail: null,
        isLoading: false,
        error: errorMsg,
      };
    }
  };

  return {
    ...result,
    findGuestByPhone,
  };
}
