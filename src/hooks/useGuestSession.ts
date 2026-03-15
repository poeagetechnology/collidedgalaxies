import { useEffect, useState } from 'react';

interface GuestSessionData {
  uid: string;
  phoneNumber: string;
  name: string;
  email?: string;
  addresses?: any[];
  createdAt: string;
  expiresAt: string;
}

const GUEST_SESSION_KEY = 'guestSessionData';
const GUEST_UID_KEY = 'guestUID';
const GUEST_NAME_KEY = 'guestName';
const GUEST_PHONE_KEY = 'guestPhoneNumber';
const GUEST_ACCESS_TIME_KEY = 'lastGuestAccessTime';
const GUEST_SESSION_EXPIRY_DAYS = 30;

/**
 * Hook to manage guest session persistence
 * Stores guest data in localStorage with automatic expiration after 30 days
 */
export function useGuestSession() {
  const [sessionData, setSessionData] = useState<GuestSessionData | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  /**
   * Check if guest session has expired
   */
  const isSessionExpired = (createdAt: string): boolean => {
    const created = new Date(createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > GUEST_SESSION_EXPIRY_DAYS;
  };

  /**
   * Load guest session from localStorage
   */
  const restoreSession = (): GuestSessionData | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(GUEST_SESSION_KEY);
      if (!stored) return null;

      const parsed: GuestSessionData = JSON.parse(stored);

      // Check if session has expired
      if (isSessionExpired(parsed.createdAt)) {
        clearSession();
        return null;
      }

      setSessionData(parsed);
      return parsed;
    } catch (error) {
      console.error('Error restoring guest session:', error);
      return null;
    }
  };

  /**
   * Save guest session to localStorage
   */
  const saveSession = (data: Omit<GuestSessionData, 'expiresAt'>): void => {
    if (typeof window === 'undefined') return;

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + GUEST_SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

      const sessionData: GuestSessionData = {
        ...data,
        expiresAt: expiresAt.toISOString(),
      };

      // Save to localStorage for persistence
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(sessionData));
      localStorage.setItem(GUEST_UID_KEY, data.uid);
      localStorage.setItem(GUEST_PHONE_KEY, data.phoneNumber.replace(/\D/g, ''));
      localStorage.setItem(GUEST_NAME_KEY, data.name);
      localStorage.setItem(GUEST_ACCESS_TIME_KEY, now.toISOString());

      setSessionData(sessionData);
      setIsExpired(false);
    } catch (error) {
      console.error('Error saving guest session:', error);
    }
  };

  /**
   * Clear guest session
   */
  const clearSession = (): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(GUEST_SESSION_KEY);
      localStorage.removeItem(GUEST_UID_KEY);
      localStorage.removeItem(GUEST_PHONE_KEY);
      localStorage.removeItem(GUEST_NAME_KEY);
      localStorage.removeItem(GUEST_ACCESS_TIME_KEY);

      setSessionData(null);
      setIsExpired(false);
    } catch (error) {
      console.error('Error clearing guest session:', error);
    }
  };

  /**
   * Get remaining days until session expires
   */
  const getRemainingDays = (): number => {
    if (!sessionData) return 0;

    const created = new Date(sessionData.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, GUEST_SESSION_EXPIRY_DAYS - daysDiff);
  };

  // Initialize on mount
  useEffect(() => {
    const restored = restoreSession();
    if (restored && isSessionExpired(restored.createdAt)) {
      setIsExpired(true);
    }
  }, []);

  return {
    sessionData,
    isExpired,
    restoreSession,
    saveSession,
    clearSession,
    getRemainingDays,
  };
}
