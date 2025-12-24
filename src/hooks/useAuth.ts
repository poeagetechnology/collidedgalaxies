import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '@/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Get auth instance from the same firebase config
      const auth = getAuth();
      
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      }, (err) => {
        setError(err.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth error');
      setLoading(false);
    }
  }, []);

  return { user, loading, error };
};
