import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { onAuthChanged, fetchUserProfile } from '@/services/firebase/auth';

export function useAuthListener() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [setUser, setLoading]);
}

export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}

export function useIsAdmin() {
  return useAuthStore((s) => s.user?.role === 'admin');
}

export function useCanScan() {
  const role = useAuthStore((s) => s.user?.role);
  return role === 'admin' || role === 'organizer' || role === 'hostess';
}
