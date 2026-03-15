import { useEffect } from 'react';
import { isGoogleSignInPending } from '@/src/context/authProvider';

export const useGoogleAuth = (
  authLoading: boolean,
  setIsRedirecting: (value: boolean) => void,
  setSuccess: (value: string) => void
) => {
  useEffect(() => {
    if (isGoogleSignInPending() && !authLoading) {
      setIsRedirecting(true);
      setSuccess('Completing Google sign-in...');
    }
  }, [authLoading, setIsRedirecting, setSuccess]);
};