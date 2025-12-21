'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/authProvider';
import { isAdmin } from '@/src/server/services/admin.service';
import { REDIRECT_DELAY } from '@/src/server/utils/constants';

interface AdminGuardState {
  isChecking: boolean;
  isAuthorized: boolean;
  showDenied: boolean;
}

export function useAdminGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<AdminGuardState>({
    isChecking: true,
    isAuthorized: false,
    showDenied: false,
  });

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      if (!user) {
        setState({ isChecking: false, isAuthorized: false, showDenied: true });
        setTimeout(() => router.push('/'), REDIRECT_DELAY);
        return;
      }

      const authorized = await isAdmin(user.uid);
      
      if (authorized) {
        setState({ isChecking: false, isAuthorized: true, showDenied: false });
      } else {
        setState({ isChecking: false, isAuthorized: false, showDenied: true });
        setTimeout(() => router.push('/'), REDIRECT_DELAY);
      }
    };

    checkAccess();
  }, [user, loading, router]);

  return { ...state, isLoading: loading };
}